import { NextRequest, NextResponse } from 'next/server'

// ─── Model fallback chain (gratis, van sterk naar licht) ──────────
const MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nex-agi/nex-n2-pro:free',
  'qwen/qwen3-coder:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'meta-llama/llama-3.1-8b-instruct:free',
]

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  maxTokens = 800,
  temperature = 0.7
) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
      'X-Title': 'Nuttin OS',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
  })
  return res
}

// ─── Try each model in order until one works ─────────────────────
async function callWithFallback(
  messages: { role: string; content: string }[],
  maxTokens = 800,
  temperature = 0.7
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY!

  for (const model of MODELS) {
    try {
      const res = await callOpenRouter(apiKey, model, messages, maxTokens, temperature)

      if (!res.ok) {
        const errText = await res.text()
        // 429 = rate limit, try next model
        // 503 = model unavailable, try next
        if (res.status === 429 || res.status === 503 || res.status === 502) {
          console.warn(`Model ${model} returned ${res.status}, trying next...`)
          continue
        }
        console.error(`Model ${model} error ${res.status}:`, errText)
        continue
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        console.warn(`Model ${model} returned empty content, trying next...`)
        continue
      }

      console.log(`✓ Responded with model: ${model}`)
      return content
    } catch (err) {
      console.warn(`Model ${model} threw error:`, err)
      continue
    }
  }

  throw new Error('All models failed')
}

// ─── POST /api/ai/chat ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 503 }
      )
    }

    const fullMessages = [
      { role: 'system', content: system },
      ...messages,
    ]

    const content = await callWithFallback(fullMessages, 800, 0.7)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'AI niet beschikbaar. Probeer opnieuw.' },
      { status: 502 }
    )
  }
}

// ─── GET /api/ai/chat — test welke modellen beschikbaar zijn ─────
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ configured: false })

  const results: Record<string, string> = {}

  for (const model of MODELS) {
    try {
      const res = await callOpenRouter(
        apiKey,
        model,
        [{ role: 'user', content: 'Zeg alleen: "OK"' }],
        10,
        0
      )
      results[model] = res.ok ? 'beschikbaar' : `fout ${res.status}`
    } catch {
      results[model] = 'timeout/fout'
    }
  }

  return NextResponse.json({ configured: true, models: results })
}

import { NextRequest, NextResponse } from 'next/server'

const NUTRITION_SYSTEM = `Je bent een expert voedingsdieëtist. De gebruiker beschrijft een maaltijd in het Nederlands.
Analyseer de voedingswaarden zo nauwkeurig mogelijk op basis van standaard Nederlandse porties.
Geef ALLEEN een JSON object terug zonder extra tekst.
Formaat: {"calories": nummer, "protein_g": nummer, "carbs_g": nummer, "fat_g": nummer, "fiber_g": nummer}
Wees realistisch — geen ronde getallen, gebruik decimalen waar nodig.`

// ─── Model fallback chain (gratis, van sterk naar licht) ──────────
const MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nex-agi/nex-n2-pro:free',
  'qwen/qwen3-coder:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'meta-llama/llama-3.1-8b-instruct:free',
]

async function analyzeWithFallback(food: string): Promise<Record<string, number>> {
  const apiKey = process.env.OPENROUTER_API_KEY!
  const messages = [
    { role: 'system', content: NUTRITION_SYSTEM },
    { role: 'user', content: `Analyseer de voedingswaarden van: ${food}` },
  ]

  for (const model of MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
          'X-Title': 'Nuttin OS Nutrition',
        },
        body: JSON.stringify({ model, messages, max_tokens: 150, temperature: 0.2 }),
      })

      if (!res.ok) {
        if (res.status === 429 || res.status === 503 || res.status === 502) {
          console.warn(`Nutrition model ${model} returned ${res.status}, trying next...`)
          continue
        }
        console.warn(`Nutrition model ${model} error ${res.status}, trying next...`)
        continue
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ''

      if (!content) {
        console.warn(`Nutrition model ${model} returned empty content, trying next...`)
        continue
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[^}]+\}/)
      if (jsonMatch) {
        const nutrition = JSON.parse(jsonMatch[0])
        // Validate expected keys exist
        if (typeof nutrition.calories === 'number' && typeof nutrition.protein_g === 'number') {
          console.log(`✓ Nutrition analyzed with model: ${model}`)
          return nutrition
        }
      }

      console.warn(`Nutrition model ${model} returned invalid JSON, trying next...`)
    } catch (err) {
      console.warn(`Nutrition model ${model} threw error:`, err)
    }
  }

  throw new Error('All nutrition models failed')
}

export async function POST(req: NextRequest) {
  try {
    const { food } = await req.json()
    if (!food) return NextResponse.json({ error: 'No food provided' }, { status: 400 })

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(estimateNutrition(food))
    }

    try {
      const nutrition = await analyzeWithFallback(food)
      return NextResponse.json(nutrition)
    } catch {
      // All models failed — use heuristic fallback
      console.warn('All AI models failed for nutrition, using heuristic estimate')
      return NextResponse.json(estimateNutrition(food))
    }
  } catch (error) {
    console.error('Nutrition API error:', error)
    return NextResponse.json({ error: 'Failed to analyze nutrition' }, { status: 500 })
  }
}

function estimateNutrition(food: string) {
  const words = food.toLowerCase().split(' ')
  const hasEggs = words.some(w => w.includes('ei'))
  const hasChicken = words.some(w => w.includes('kip'))
  const hasBread = words.some(w => w.includes('brood'))
  const hasRice = words.some(w => w.includes('rijst'))
  const hasMilk = words.some(w => w.includes('melk') || w.includes('kwark'))

  let calories = 300 + Math.floor(Math.random() * 300)
  let protein = 20 + Math.floor(Math.random() * 25)
  let carbs = 25 + Math.floor(Math.random() * 40)
  let fat = 8 + Math.floor(Math.random() * 15)
  let fiber = 2 + Math.floor(Math.random() * 5)

  if (hasEggs) { calories += 70; protein += 7; fat += 5 }
  if (hasChicken) { calories += 150; protein += 25; fat += 4 }
  if (hasBread) { calories += 140; carbs += 28; fiber += 3 }
  if (hasRice) { calories += 130; carbs += 28 }
  if (hasMilk) { calories += 80; protein += 8; carbs += 6 }

  return { calories, protein_g: protein, carbs_g: carbs, fat_g: fat, fiber_g: fiber }
}

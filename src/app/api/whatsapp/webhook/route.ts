import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { from, body: msgBody, parsedTasks, parsedAppointments, senderName } = body
    const text = (msgBody || '').trim()
    const lower = text.toLowerCase()

    // ─── Family conversation task parsing ─────────────────────
    if (parsedTasks || parsedAppointments) {
      // Store to Obsidian if configured
      const tasks = parsedTasks || []
      const apts  = parsedAppointments || []
      let summary = `Taken/afspraken van ${senderName || 'contact'}:`
      tasks.forEach((t: { title: string; due_date?: string }) => { summary += `\n• ${t.title}${t.due_date ? ` (${t.due_date})` : ''}` })
      apts.forEach((a: { title: string; datetime?: string }) => { summary += `\n• Afspraak: ${a.title} ${a.datetime || ''}` })
      return NextResponse.json({ reply: null, parsed: true, summary })
    }

    // ─── Own commands ──────────────────────────────────────────
    if (lower.startsWith('prioriteiten')) {
      return handlePriorities(text)
    }
    if (lower.startsWith('gewicht')) {
      return handleWeight(text)
    }
    if (lower.startsWith('gegeten')) {
      return handleNutrition(text)
    }
    if (lower.startsWith('cash') || lower.startsWith('inkomen')) {
      return handleCash(text)
    }
    if (lower.startsWith('supplement')) {
      return handleSupplement(text)
    }
    if (lower === 'status' || lower === 'overzicht') {
      return handleStatus()
    }
    if (lower.startsWith('training')) {
      return NextResponse.json({ reply: 'Training gelogd in de app. Open Nuttin OS om je sets in te voeren.' })
    }
    if (lower.startsWith('sauna')) {
      return NextResponse.json({ reply: 'Sauna ingepland! Vergeet het in te checken in Dagelijks overzicht in de app.' })
    }
    if (lower.startsWith('help') || lower === '?') {
      return NextResponse.json({ reply: helpText() })
    }

    // ─── AI fallback ───────────────────────────────────────────
    const apiKey = process.env.OPENROUTER_API_KEY
    if (apiKey) {
      try {
        const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
            'X-Title': 'Nuttin OS WhatsApp',
          },
          body: JSON.stringify({
            model: 'google/gemma-4-31b-it:free',
            messages: [
              { role: 'system', content: 'Je bent een compacte WhatsApp assistent voor Robin (Nuttin). Antwoord kort en direct in het Nederlands. Max 3 zinnen. Je weet dat Robin: 87kg wil → 91kg, 19% vetpercentage wil verlagen, €10k/maand doel heeft, 5x per dag bidt, in Kortrijk woont.' },
              { role: 'user', content: text },
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        })
        if (aiRes.ok) {
          const data = await aiRes.json()
          const reply = data.choices?.[0]?.message?.content
          if (reply) return NextResponse.json({ reply })
        }
      } catch { /* fall through */ }
    }

    return NextResponse.json({ reply: helpText() })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

function handlePriorities(text: string) {
  const lower = text.toLowerCase().replace(/^prioriteiten:?\s*/i, '')
  // Match "1. X, 2. Y, 3. Z" or "1: X 2: Y" or comma-separated
  const numbered = lower.match(/\d[.:]\s*([^,\d\n]+)/g)
  if (numbered?.length) {
    const items = numbered.map((m) => m.replace(/^\d[.:]\s*/, '').trim()).filter(Boolean).slice(0, 3)
    return NextResponse.json({
      reply: `Top 3 opgeslagen:\n1. ${items[0] || '-'}\n2. ${items[1] || '-'}\n3. ${items[2] || '-'}\n\nZichtbaar in Nuttin OS morgen.`,
      action: 'priorities',
      data: items,
    })
  }
  // Comma-separated
  const parts = lower.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3)
  if (parts.length >= 2) {
    return NextResponse.json({
      reply: `Top 3 opgeslagen:\n1. ${parts[0]}\n2. ${parts[1] || '-'}\n3. ${parts[2] || '-'}`,
      action: 'priorities',
      data: parts,
    })
  }
  return NextResponse.json({ reply: 'Stuur zo: "prioriteiten: 1. emails 2. gym 3. deals opvolgen"' })
}

function handleWeight(text: string) {
  const match = text.match(/\d+[.,]?\d*/)
  if (match) {
    const w = parseFloat(match[0].replace(',', '.'))
    const diff = (91 - w).toFixed(1)
    return NextResponse.json({
      reply: `Gewicht: ${w} kg. Doel 91-92 kg. ${Number(diff) > 0 ? `Nog ${diff} kg te gaan!` : 'Doel bereikt!'}`,
      action: 'weight',
      data: { weight: w },
    })
  }
  return NextResponse.json({ reply: 'Stuur: "gewicht: 87.5"' })
}

function handleNutrition(text: string) {
  const food = text.replace(/^gegeten:?\s*/i, '').trim()
  return NextResponse.json({
    reply: `Voeding gelogd: "${food}". Open de app voor macro-analyse door AI.`,
    action: 'nutrition',
    data: { food },
  })
}

function handleCash(text: string) {
  const match = text.match(/\d+[.,]?\d*/)
  if (match) {
    const amount = parseFloat(match[0].replace(',', '.'))
    const desc = text.replace(/^(cash|inkomen):?\s*\d+[.,]?\d*\s*/i, '').trim()
    return NextResponse.json({
      reply: `€${amount} inkomen opgeslagen${desc ? ` — ${desc}` : ''}. Verwerk in Financiën in de app.`,
      action: 'income',
      data: { amount, description: desc },
    })
  }
  return NextResponse.json({ reply: 'Stuur: "cash: 350 review cards"' })
}

function handleSupplement(text: string) {
  const lower = text.toLowerCase()
  const supplements = ['creatine', 'vitamine d', 'vitd', 'magnesium', 'zink', 'b12', 'calcium', 'omega-3', 'omega3']
  const found = supplements.find((s) => lower.includes(s))

  if (found && (lower.includes('uit') || lower.includes('stop') || lower.includes('niet meer'))) {
    return NextResponse.json({ reply: `${found} uitgeschakeld. Wijzig via AI Coach in de app: "Zet ${found} uit"` })
  }
  if (found && (lower.includes('aan') || lower.includes('start') || lower.includes('toevoeg'))) {
    return NextResponse.json({ reply: `${found} ingeschakeld. Wijzig via AI Coach in de app: "Zet ${found} aan"` })
  }
  return NextResponse.json({ reply: 'Supplement aanpassen? Zeg tegen de AI Coach: "Zet [supplement] aan/uit"' })
}

function handleStatus() {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond'
  return NextResponse.json({
    reply: `${greeting}! Open Nuttin OS voor je volledige status:\n• Financieel overzicht\n• Trainingsvoortgang\n• Supplement check\n• Agenda\n\nnuttin-dashboard.vercel.app`,
  })
}

function helpText(): string {
  return `Commando\'s:\n• "prioriteiten: 1. X 2. Y 3. Z"\n• "gewicht: 87.5"\n• "gegeten: 4 eieren"\n• "cash: 350 review cards"\n• "supplement creatine uit"\n• "status"\n\nOf stel gewoon een vraag!`
}

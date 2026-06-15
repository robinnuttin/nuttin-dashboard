import { NextRequest, NextResponse } from 'next/server'

// WhatsApp webhook — receives messages from the bot service
// The bot sends a POST here when it receives a message from the user

interface WhatsAppMessage {
  from: string  // phone number
  body: string  // message text
  timestamp: number
}

export async function POST(req: NextRequest) {
  try {
    const { from, body, timestamp }: WhatsAppMessage = await req.json()

    const text = body.trim().toLowerCase()

    // Parse commands
    if (text.startsWith('prioriteiten:') || text.startsWith('prioriteiten ')) {
      return handlePriorities(text, from)
    }

    if (text.startsWith('gewicht:') || text.startsWith('gewicht ')) {
      return handleWeight(text, from)
    }

    if (text.startsWith('gegeten:') || text.startsWith('gegeten ')) {
      return handleNutrition(body, from)
    }

    if (text.startsWith('cash:') || text.startsWith('cash ')) {
      return handleCash(text, from)
    }

    if (text === 'status' || text === 'overzicht') {
      return handleStatus(from)
    }

    // Default response
    return NextResponse.json({
      reply: 'Begrepen! Gebruik:\n• "prioriteiten: 1. X 2. Y 3. Z"\n• "gewicht: 87.5"\n• "gegeten: 4 eieren en brood"\n• "cash: 150 inboedel"\n• "status"',
    })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function handlePriorities(text: string, from: string) {
  // Extract priorities from message like "prioriteiten: 1. bellen klant 2. emails 3. gym"
  const matches = text.match(/\d\.\s*([^0-9\n]+)/g)
  if (matches && matches.length > 0) {
    const priorities = matches.map(m => m.replace(/^\d\.\s*/, '').trim())

    // In production: save to database
    // await supabase.from('daily_priorities').upsert({ date: today, priority_1: priorities[0], ... })

    return NextResponse.json({
      reply: `Top 3 prioriteiten opgeslagen voor morgen:\n1. ${priorities[0] || '-'}\n2. ${priorities[1] || '-'}\n3. ${priorities[2] || '-'}\n\nSucces morgen!`,
    })
  }

  return NextResponse.json({
    reply: 'Stuur je prioriteiten zo:\n"prioriteiten: 1. emails sturen 2. gym 3. deals opvolgen"',
  })
}

async function handleWeight(text: string, from: string) {
  const match = text.match(/\d+\.?\d*/)
  if (match) {
    const weight = parseFloat(match[0])
    // In production: save to database
    return NextResponse.json({
      reply: `Gewicht opgeslagen: ${weight} kg. Doel: 91-92 kg. Nog ${Math.max(0, 91 - weight).toFixed(1)} kg te gaan!`,
    })
  }
  return NextResponse.json({ reply: 'Stuur: "gewicht: 87.5"' })
}

async function handleNutrition(text: string, from: string) {
  // Trigger nutrition analysis
  const food = text.replace(/^gegeten:?\s*/i, '')
  return NextResponse.json({
    reply: `Voeding gelogd: "${food}"\n\nOpen de app voor de exacte macro's en dagelijkse voortgang.`,
  })
}

async function handleCash(text: string, from: string) {
  const match = text.match(/\d+/)
  if (match) {
    const amount = parseInt(match[0])
    const reason = text.replace(/cash:?\s*\d+\s*/i, '').trim()
    return NextResponse.json({
      reply: `Cash inkomsten opgeslagen: €${amount}${reason ? ` (${reason})` : ''}. Vergeet dit niet in te boeken in de app!`,
    })
  }
  return NextResponse.json({ reply: 'Stuur: "cash: 150 inboedel"' })
}

async function handleStatus(from: string) {
  // In production: fetch real data from database
  return NextResponse.json({
    reply: `📊 Status update:\n\n💶 Financieel: €4.000/€10.000 (40%)\n🤝 Deals: 2/6 gesloten\n📇 Review cards: 8 verkocht\n\n⚡ Prioriteit: 80 emails sturen vandaag`,
  })
}

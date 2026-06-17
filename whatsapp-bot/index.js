// ─── Nuttin OS WhatsApp Bot v2 ──────────────────────────────────
// Gratis WhatsApp bot via whatsapp-web.js + QR code
// Spontane vragen, gesprek-parsing, agenda-sync

import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import cron from 'node-cron'
import express from 'express'

const APP_URL  = process.env.APP_URL  || 'http://localhost:3000'
const MY_PHONE = process.env.MY_PHONE || ''
const PORT     = process.env.PORT     || 3002

// Bekende contacten waarvan gesprekken geparsed worden voor taken/afspraken
const FAMILY_CONTACTS = {
  david:    process.env.DAVID_PHONE    || '',
  mama:     process.env.MAMA_PHONE     || '',
  eleonore: process.env.ELEONORE_PHONE || '',
  vader:    process.env.VADER_PHONE    || '',
}

// ─── Express ─────────────────────────────────────────────────
const app = express()
app.use(express.json())

let qrCodeData = null
let botReady   = false

app.get('/status', (_, res) => res.json({ ready: botReady, phone: MY_PHONE }))

app.get('/whatsapp/qr', (_, res) => {
  if (botReady) return res.send('<html><body style="background:#000;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h1>Bot is verbonden!</h1></body></html>')
  if (qrCodeData) return res.send(`
    <!DOCTYPE html><html><head><title>WhatsApp QR</title><meta http-equiv="refresh" content="30">
    <style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#111;color:#fff;flex-direction:column;gap:20px} img{width:280px;height:280px;border-radius:12px} p{color:#888;text-align:center;max-width:280px}</style>
    </head><body>
    <h2>Scan met WhatsApp</h2>
    <img src="${qrCodeData}" alt="QR Code" />
    <p>Open WhatsApp → Gekoppelde apparaten → Apparaat koppelen<br>Pagina vernieuwt elke 30s</p>
    </body></html>
  `)
  res.send('<html><body style="background:#111;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh">QR code laden...<script>setTimeout(()=>location.reload(),2000)</script></body></html>')
})

app.post('/send', async (req, res) => {
  const { message } = req.body
  if (!botReady || !MY_PHONE) return res.status(503).json({ error: 'Bot niet verbonden' })
  try {
    await client.sendMessage(MY_PHONE, message)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`WhatsApp bot draait op port ${PORT}`)
  console.log(`QR code: http://localhost:${PORT}/whatsapp/qr`)
})

// ─── WhatsApp Client ──────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
})

client.on('qr', async (qr) => {
  console.log('\nScan de QR code:\n')
  qrcode.generate(qr, { small: true })
  console.log('\nOf open: http://localhost:' + PORT + '/whatsapp/qr\n')
  try {
    const { default: QRCode } = await import('qrcode')
    qrCodeData = await QRCode.toDataURL(qr)
  } catch { /* terminal only */ }
})

client.on('ready', () => {
  console.log('WhatsApp bot verbonden!')
  botReady = true
  qrCodeData = null
  if (MY_PHONE) sendMsg('Nuttin OS actief. Stuur "status" voor een overzicht.')
  scheduleAll()
})

client.on('disconnected', (reason) => {
  console.log('Verbinding verbroken:', reason)
  botReady = false
})

// ─── Inbound messages ─────────────────────────────────────────
client.on('message', async (msg) => {
  const from = msg.from
  const text = msg.body.trim()

  // Own messages — forward to webhook
  if (from === MY_PHONE || msg.fromMe) {
    try {
      const res = await fetch(`${APP_URL}/api/whatsapp/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, body: text, timestamp: Date.now() }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.reply) await sendMsg(data.reply)
      }
    } catch (err) {
      console.error('Webhook error:', err)
    }
    return
  }

  // Family contacts — parse for tasks/appointments
  const senderName = Object.entries(FAMILY_CONTACTS).find(([, phone]) => phone && from.includes(phone.replace('+','').replace('@c.us','')))?.[0]
  if (senderName) {
    console.log(`Bericht van ${senderName}, parseer voor taken...`)
    try {
      const res = await fetch(`${APP_URL}/api/google/gmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender: senderName }),
      })
      if (res.ok) {
        const { tasks, appointments } = await res.json()
        if (tasks?.length || appointments?.length) {
          let notif = `Nieuw uit gesprek met ${senderName}:\n`
          tasks?.forEach(t => { notif += `\n- Taak: ${t.title}${t.due_date ? ` (voor ${t.due_date})` : ''}` })
          appointments?.forEach(a => { notif += `\n- Afspraak: ${a.title} ${a.datetime || ''}` })
          await sendMsg(notif)
          // Also forward parsed data to agenda
          await fetch(`${APP_URL}/api/whatsapp/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, body: text, timestamp: Date.now(), parsedTasks: tasks, parsedAppointments: appointments, senderName }),
          })
        }
      }
    } catch (err) {
      console.error('Family msg parse error:', err)
    }
  }
})

// ─── Scheduled messages ───────────────────────────────────────
function scheduleAll() {
  // 07:00 — Ochtend briefing
  cron.schedule('0 7 * * *', sendMorningBrief, { timezone: 'Europe/Brussels' })

  // Spontane vragen — willekeurig verspreid over de dag
  // 09:30 — Vraag over de nacht
  cron.schedule('30 9 * * *', () => {
    const vragen = [
      'Hoe was je nacht? Optijd gaan slapen?',
      'Supplementen al genomen vanochtend?',
      'Klaar voor de dag? Prioriteiten staan in de app.',
    ]
    sendMsg(randomPick(vragen))
  }, { timezone: 'Europe/Brussels' })

  // 13:00 — Middag check-in (alleen werkdagen)
  cron.schedule('0 13 * * 1-5', () => {
    const vragen = [
      'Hoe staat het met je prioriteiten? Eerste al gedaan?',
      'Lunch gehad? Hoeveel proteïne?',
      'Nog afspraken voor vanmiddag?',
    ]
    sendMsg(randomPick(vragen))
  }, { timezone: 'Europe/Brussels' })

  // 17:00 — Avond prep
  cron.schedule('0 17 * * *', () => {
    const dag = new Date().getDay()
    // Sauna herinnering op din/don/zon
    if ([2, 4, 0].includes(dag)) {
      sendMsg('Sauna dag! Heb je al een tijd gepland? (Dinsdag, donderdag of zondag zijn je sauna-dagen)')
    } else {
      const vragen = [
        'Training al gedaan vandaag?',
        'Hoeveel calorieën tot nu toe? Genoeg proteïne?',
        'Hoe staat het met je financiële doelen vandaag?',
      ]
      sendMsg(randomPick(vragen))
    }
  }, { timezone: 'Europe/Brussels' })

  // 21:00 — Prioriteiten voor morgen
  cron.schedule('0 21 * * *', () => {
    sendMsg(
      '*Prioriteiten voor morgen*\n\nWat zijn je 3 grootste prioriteiten?\n\nAntwoord: "prioriteiten: taak1, taak2, taak3"'
    )
  }, { timezone: 'Europe/Brussels' })

  // 22:30 — Slaap herinnering
  cron.schedule('30 22 * * *', () => {
    sendMsg(
      '*Slaapherinnering*\n\nDoel: in bed voor 23:00, wakker om 08:30.\n\nMagnesium genomen? Telefoon buiten de kamer. Goede nacht!'
    )
  }, { timezone: 'Europe/Brussels' })

  // Gebedstijden ophalen en plannen
  schedulePrayerReminders()

  console.log('Dagelijkse meldingen gepland')
}

async function sendMorningBrief() {
  try {
    const res = await fetch(`${APP_URL}/api/prayer`)
    const prayerData = res.ok ? await res.json() : null
    const fajr = prayerData?.prayers?.fajr || ''
    const days = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag']
    const plans = { 1:'Push',2:'Pull',3:'Legs',4:'Rust',5:'Upper',6:'Cardio',0:'Rust' }
    const dag = new Date().getDay()
    const isSaunaDag = [2,4,0].includes(dag)

    let msg = `*Goeiemorgen — ${days[dag]}*\n\n`
    msg += `Training: ${plans[dag]}\n`
    if (fajr) msg += `Fajr: ${fajr}\n`
    if (isSaunaDag) msg += `\nSauna dag vandaag!\n`
    msg += `\nSupplementen:\n• Creatine 5g\n• Vitamine D3\n• B12\n`
    msg += `\nOpen Nuttin OS voor je volledige agenda.`
    sendMsg(msg)
  } catch (err) {
    console.error('Morning brief error:', err)
    sendMsg('Goeiemorgen! Open Nuttin OS voor je dagelijkse overzicht.')
  }
}

async function schedulePrayerReminders() {
  try {
    const res = await fetch(`${APP_URL}/api/prayer`)
    if (!res.ok) return
    const { prayers } = await res.json()
    const names = { fajr:'Fajr', dhuhr:'Dhuhr', asr:'Asr', maghrib:'Maghrib', isha:'Isha' }
    Object.entries(prayers).forEach(([name, time]) => {
      if (name === 'sunrise' || !names[name]) return
      const [h, m] = time.split(':')
      cron.schedule(`${m} ${h} * * *`, () => {
        sendMsg(`*${names[name]}* — Gebedstijd (${time})`)
      }, { timezone: 'Europe/Brussels' })
    })
  } catch (err) {
    console.error('Prayer schedule error:', err)
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function sendMsg(text) {
  if (!botReady || !MY_PHONE) return
  try { await client.sendMessage(MY_PHONE, text) }
  catch (err) { console.error('Send error:', err) }
}

// ─── Start ────────────────────────────────────────────────────
console.log('WhatsApp bot starten...')
console.log('Telefoonnummer:', MY_PHONE || '(niet ingesteld)')
client.initialize()

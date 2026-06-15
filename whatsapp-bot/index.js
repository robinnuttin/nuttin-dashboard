// ─── Nuttin OS WhatsApp Bot ────────────────────────────────────
// Gratis WhatsApp bot via whatsapp-web.js + QR code
// Draait als aparte service (port 3001 for QR, 3002 for API)

import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import cron from 'node-cron'
import express from 'express'

const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const MY_PHONE = process.env.MY_PHONE || '' // Jouw WhatsApp nummer: "32478xxxxxx@c.us"
const PORT = process.env.PORT || 3002

// ─── Express server voor QR code en status ────────────────────
const app = express()
app.use(express.json())

let qrCodeData = null
let botReady = false

app.get('/status', (req, res) => {
  res.json({ ready: botReady, phone: MY_PHONE })
})

app.get('/whatsapp/qr', (req, res) => {
  if (botReady) {
    return res.send('<h1>Bot is verbonden!</h1>')
  }
  if (qrCodeData) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsApp QR Code</title>
          <meta http-equiv="refresh" content="30">
          <style>
            body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #000; color: #fff; flex-direction: column; gap: 20px; }
            img { width: 300px; height: 300px; }
            p { color: #aaa; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Scan met WhatsApp</h1>
          <img src="${qrCodeData}" alt="QR Code" />
          <p>Open WhatsApp → Gekoppelde apparaten → Apparaat koppelen<br>Pagina vernieuwt automatisch om 30s</p>
        </body>
      </html>
    `)
  }
  res.send('<h1>QR code laden...</h1><script>setTimeout(() => location.reload(), 3000)</script>')
})

// Endpoint voor dashboard om berichten te sturen
app.post('/send', async (req, res) => {
  const { message } = req.body
  if (!botReady || !MY_PHONE) {
    return res.status(503).json({ error: 'Bot niet verbonden of telefoonnummer niet ingesteld' })
  }
  try {
    await client.sendMessage(MY_PHONE, message)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`WhatsApp bot service draait op port ${PORT}`)
  console.log(`QR code: http://localhost:${PORT}/whatsapp/qr`)
})

// ─── WhatsApp Client ──────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})

client.on('qr', async (qr) => {
  console.log('\n✅ Scan de QR code om te verbinden:\n')
  qrcode.generate(qr, { small: true })
  console.log('\nOf open: http://localhost:' + PORT + '/whatsapp/qr\n')

  // Convert to data URL for web display
  try {
    const { default: QRCode } = await import('qrcode')
    qrCodeData = await QRCode.toDataURL(qr)
  } catch {
    // qrcode not installed, just use terminal
  }
})

client.on('ready', () => {
  console.log('✅ WhatsApp bot verbonden!')
  botReady = true
  qrCodeData = null

  if (MY_PHONE) {
    sendMessage('Nuttin OS bot is verbonden en klaar! Stuur "status" voor een overzicht.')
  }

  scheduleDailyMessages()
})

client.on('disconnected', (reason) => {
  console.log('WhatsApp verbinding verbroken:', reason)
  botReady = false
})

// ─── Message Handler ──────────────────────────────────────────
client.on('message', async (msg) => {
  // Only respond to messages from yourself
  const from = msg.from
  if (MY_PHONE && from !== MY_PHONE) return

  const text = msg.body.trim()

  try {
    // Forward to dashboard API webhook
    const response = await fetch(`${APP_URL}/api/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        body: text,
        timestamp: Date.now(),
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.reply) {
        await msg.reply(data.reply)
      }
    }
  } catch (err) {
    console.error('Webhook error:', err)
    await msg.reply('Er is een fout opgetreden. Probeer opnieuw.')
  }
})

// ─── Scheduled Messages ───────────────────────────────────────
function scheduleDailyMessages() {
  // 07:00 - Goedemorgen
  cron.schedule('0 7 * * *', () => {
    sendMessage(getDayMessage())
  }, { timezone: 'Europe/Brussels' })

  // 21:00 - Prioriteiten vragen
  cron.schedule('0 21 * * *', () => {
    sendMessage(
      `🎯 *Prioriteiten voor morgen*\n\nWat zijn je 3 grootste prioriteiten voor morgen?\n\nAntwoord zo:\n"prioriteiten: 1. [actie] 2. [actie] 3. [actie]"\n\nFocus op de acties met de meeste impact!`
    )
  }, { timezone: 'Europe/Brussels' })

  // 22:30 - Slaap herinnering
  cron.schedule('30 22 * * *', () => {
    sendMessage(
      `😴 *Slaapherinnering*\n\nDoel: in bed voor 23:00, wakker om 8:00.\n\nMagnesium genomen? Telefoon op lader buiten de kamer.\n\nGoede nacht!`
    )
  }, { timezone: 'Europe/Brussels' })

  // Gebedstijden - dynamisch ophalen en plannen
  schedulePrayerReminders()

  console.log('✅ Dagelijkse meldingen gepland')
}

async function schedulePrayerReminders() {
  try {
    const response = await fetch(`${APP_URL}/api/prayer`)
    if (!response.ok) return
    const { prayers } = await response.json()

    const prayerNames = {
      fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
    }

    Object.entries(prayers).forEach(([name, time]) => {
      if (name === 'sunrise') return
      const [h, m] = time.split(':')
      cron.schedule(`${m} ${h} * * *`, () => {
        sendMessage(`🕌 *${prayerNames[name] || name}*\n\nGebedstijd is aangebroken (${time})\n\nAllahu Akbar`)
      }, { timezone: 'Europe/Brussels' })
    })
  } catch (err) {
    console.error('Prayer schedule error:', err)
  }
}

function getDayMessage() {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  const workouts = { 0: 'Rust', 1: 'Push', 2: 'Pull', 3: 'Cardio (7-10 km)', 4: 'Legs', 5: 'Upper Body', 6: 'Cardio (4-5 km)' }
  const day = new Date().getDay()
  const workout = workouts[day]

  return `🌅 *Goeiemorgen — ${days[day]}*\n\nTraining vandaag: ${workout}\n\nDoe je supplementen:\n• Creatine 5g\n• Vitamine D\n• B12\n\nOpen de app voor je volledige agenda.\n\nMaak er een goede dag van!`
}

async function sendMessage(text) {
  if (!botReady || !MY_PHONE) return
  try {
    await client.sendMessage(MY_PHONE, text)
  } catch (err) {
    console.error('Send message error:', err)
  }
}

// ─── Start ────────────────────────────────────────────────────
console.log('⏳ WhatsApp bot starten...')
console.log('Telefoonnummer:', MY_PHONE || '(niet ingesteld — stel MY_PHONE in .env in)')
client.initialize()

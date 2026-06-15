# Deployment Gids — Nuttin OS

## Stap 1: GitHub repository

```bash
cd /Users/nuttin/nuttin-dashboard
git init
git add .
git commit -m "Initial commit — Nuttin OS dashboard"
# Maak een repo aan op github.com
git remote add origin https://github.com/JOUW_USERNAME/nuttin-dashboard.git
git push -u origin main
```

## Stap 2: Vercel deployment

1. Ga naar **vercel.com** → Log in
2. Klik "Add New Project" → Import GitHub repo
3. Voeg environment variables toe:
   - `OPENROUTER_API_KEY` = jouw key van openrouter.ai
   - `GHL_API_KEY` = GoHighLevel API key
   - `GHL_LOCATION_ID` = GoHighLevel location ID
   - `NEXT_PUBLIC_APP_URL` = https://jouw-project.vercel.app
4. Klik "Deploy"
5. Je app is live op `jouw-project.vercel.app`

## Stap 3: iPhone installatie

1. Open **Safari** op iPhone (geen Chrome!)
2. Ga naar `jouw-project.vercel.app`
3. Tik op het **Deel icoon** (vierkant met pijl)
4. Scroll → **"Zet op beginscherm"**
5. Naam: **"Nuttin OS"** → Tik "Voeg toe"
6. App staat nu op je beginscherm als native app!

## Stap 4: WhatsApp Bot starten

```bash
cd /Users/nuttin/nuttin-dashboard/whatsapp-bot
cp .env.example .env
# Vul in: MY_PHONE=32478XXXXXX@c.us (jouw nummer)
npm install
npm start
```

Open http://localhost:3002/whatsapp/qr en scan de QR code.

## Stap 5: Apple Watch sync

Op iPhone:
1. Open **Shortcuts** app
2. Nieuwe shortcut: "Sync Gezondheid"
3. Acties:
   - "Find Health Samples" (Stappen — Vandaag)
   - "Find Health Samples" (Slaapanalyse)
   - "Find Health Samples" (Hartslag)
   - "Get Contents of URL":
     - URL: `https://jouw-project.vercel.app/api/health/sync`
     - Method: POST
     - Body: JSON met stappen, slaap, hartslag
4. Automatisering instellen: dagelijks om 07:30

## Stap 6: OpenRouter API key

1. Ga naar **openrouter.ai**
2. Sign up → API Keys
3. Maak gratis key aan
4. Voeg toe in Vercel environment variables
5. Gratis modellen: `meta-llama/llama-3.1-8b-instruct:free`

## Stap 7: GoHighLevel

1. GoHighLevel dashboard → Settings → API
2. Kopieer API key
3. Kopieer Location ID
4. Voeg toe in Vercel + Settings pagina van de app

## Lokaal draaien

```bash
cd /Users/nuttin/nuttin-dashboard
npm run dev
# Open http://localhost:3000
```

## Problemen?

- Build errors: `npm run build`
- TypeScript errors: `npx tsc --noEmit`
- WhatsApp verbindingsprobleem: Verwijder `.wwebjs_auth` map en herstart

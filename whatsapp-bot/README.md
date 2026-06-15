# WhatsApp Bot — Nuttin OS

## Setup

1. Installeer dependencies:
```bash
npm install
```

2. Kopieer .env:
```bash
cp .env.example .env
# Vul je telefoonnummer in: 32478123456@c.us
```

3. Start de bot:
```bash
npm start
```

4. Scan de QR code:
- Open http://localhost:3002/whatsapp/qr in je browser
- OF scan de QR in de terminal
- Open WhatsApp → Gekoppelde apparaten → Apparaat koppelen

## Berichten die je kunt sturen

| Commando | Actie |
|---------|-------|
| `prioriteiten: 1. X 2. Y 3. Z` | Sla prioriteiten op |
| `gewicht: 87.5` | Log gewicht |
| `gegeten: 4 eieren en rijst` | Log maaltijd |
| `cash: 150 inboedel` | Log cash inkomsten |
| `status` | Overzicht van dag |

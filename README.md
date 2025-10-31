# 🎵 Music Challenge Voting App

Eine vollständige Voting-Web-App für Musik-Challenges mit Next.js 15, Supabase und Vercel.

## ✨ Features

- **Magic Link Authentication** - Einfacher Login per E-Mail
- **Kategorien-basiertes Voting** - Mehrere Kategorien (04 A, 04 B, 04 C, etc.)
- **3-Schritt Voting-Prozess**:
  1. Bester Song (2 Punkte)
  2. Auch netter Song (1 Punkt)
  3. Eigener Song (zur Validierung)
- **Admin Dashboard** - Podium und vollständiges Ranking
- **Row-Level Security** - Sichere Datenbankzugriffe
- **Responsive Design** - Funktioniert auf allen Geräten

## 🚀 Lokale Installation

### 1. Repository klonen

```bash
cd /Users/mcojocaru/Documents/Projekte2024/BrainDay/challenge-app
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Konto
2. Erstelle ein neues Projekt
3. Warte, bis das Projekt bereit ist (ca. 2 Minuten)

### 4. Datenbank Schema einrichten

1. Gehe in deinem Supabase Projekt zu **SQL Editor**
2. Klicke auf **New Query**
3. Kopiere den gesamten Inhalt aus `supabase/schema.sql`
4. Füge ihn in den SQL Editor ein
5. Klicke auf **Run** (oder drücke Cmd/Ctrl + Enter)

Das Schema erstellt automatisch:
- Tabellen: `categories`, `submissions`, `votes`
- Row-Level Security Policies
- Default-Kategorien (04 A, 04 B, 04 C, 04 D, 04 E)

### 5. Umgebungsvariablen konfigurieren

1. Kopiere die Beispiel-Datei:
```bash
cp .env.local.example .env.local
```

2. Öffne `.env.local` und fülle die Werte aus:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key

# Admin Email (für Admin-Zugriff)
ADMIN_EMAIL=deine-admin-email@example.com
```

**Wo finde ich die Supabase Keys?**
- Gehe zu deinem Supabase Projekt
- Klicke auf **Settings** (Zahnrad-Symbol)
- Wähle **API**
- Kopiere:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon/public` Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` Key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Geheim halten!**

### 6. Development Server starten

```bash
npm run dev
```

Die App läuft jetzt auf [http://localhost:3000](http://localhost:3000)

## 📧 E-Mail Konfiguration (Supabase)

Für Magic Link Login musst du E-Mails konfigurieren:

### Development (Standard)
Supabase sendet E-Mails automatisch über ihren Service. Die Links erscheinen auch in der Supabase Dashboard unter **Authentication > Users**.

### Production (Optional - Custom SMTP)
1. Gehe zu **Settings > Auth > SMTP Settings**
2. Konfiguriere deinen eigenen SMTP-Server (z.B. SendGrid, Mailgun)

## 🎯 Verwendung

### Als User

1. **Anmelden**: Klicke auf "Anmelden" und gib deine E-Mail ein
2. **Magic Link**: Prüfe deine E-Mails und klicke auf den Link
3. **Song einreichen** (optional): Reiche deinen Song für eine Kategorie ein
4. **Abstimmen**: 
   - Wähle eine Kategorie
   - Schritt 1: Wähle den besten Song (2 Punkte)
   - Schritt 2: Wähle einen weiteren netten Song (1 Punkt)
   - Schritt 3: Wähle deinen eigenen Song
5. **Fertig**: Du kannst nur einmal pro Kategorie abstimmen

### Als Admin

1. Melde dich mit der Admin-E-Mail an (aus `.env.local`)
2. Gehe zu `/admin` oder klicke auf "Admin Dashboard"
3. Wähle eine Kategorie
4. Sehe das Podium (1., 2., 3. Platz) und vollständiges Ranking

## 🌐 Deployment auf Vercel

### 1. GitHub Repository erstellen (optional aber empfohlen)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/dein-username/music-challenge.git
git push -u origin main
```

### 2. Vercel Deployment

#### Option A: Mit GitHub (empfohlen)

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke auf **New Project**
3. Importiere dein GitHub Repository
4. Konfiguriere die Umgebungsvariablen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
5. Klicke auf **Deploy**

#### Option B: Mit Vercel CLI

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment starten
vercel

# Umgebungsvariablen hinzufügen
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_EMAIL

# Production Deployment
vercel --prod
```

### 3. Supabase URL Whitelist aktualisieren

1. Gehe zu deinem Supabase Projekt
2. **Authentication > URL Configuration**
3. Füge deine Vercel URL hinzu:
   - `https://deine-app.vercel.app`
   - `https://deine-app.vercel.app/**`

## 📁 Projekt-Struktur

```
challenge-app/
├── app/
│   ├── api/                    # API Routes
│   │   ├── categories/         # GET categories
│   │   ├── submissions/        # GET/POST submissions
│   │   ├── vote/              # POST vote
│   │   └── results/           # GET results (Admin)
│   ├── auth/
│   │   ├── login/             # Login Page
│   │   └── callback/          # Auth Callback
│   ├── vote/[categoryId]/     # Voting Page
│   ├── admin/                 # Admin Dashboard
│   ├── layout.tsx             # Root Layout
│   ├── page.tsx               # Home Page
│   └── globals.css            # Global Styles
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Client
│   │   └── server.ts          # Server Client
│   └── types.ts               # TypeScript Types
├── supabase/
│   └── schema.sql             # Database Schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🗄️ Datenbank Schema

### Categories
- `id` (UUID)
- `name` (Text) - z.B. "04 A"
- `created_at` (Timestamp)

### Submissions
- `id` (UUID)
- `category_id` (UUID) → categories.id
- `user_email` (Text)
- `song_name` (Text)
- `song_link` (Text)
- `created_at` (Timestamp)
- **Unique**: (category_id, user_email)

### Votes
- `id` (UUID)
- `category_id` (UUID) → categories.id
- `user_email` (Text)
- `best_song_id` (UUID) → submissions.id
- `nice_song_id` (UUID) → submissions.id
- `own_song_id` (UUID) → submissions.id
- `created_at` (Timestamp)
- **Unique**: (category_id, user_email)

## 🔒 Sicherheit (Row-Level Security)

### Categories
- ✅ Jeder kann lesen
- ❌ Nur Service Role kann schreiben

### Submissions
- ✅ Jeder kann lesen
- ✅ Eingeloggte User können ihre eigenen erstellen/bearbeiten

### Votes
- ✅ Eingeloggte User können abstimmen
- ❌ Nur Service Role kann Votes lesen (Admin-Funktion)

## 🎨 Design

- **Farben**: 
  - Primary: `#1e293b` (Dunkelblau)
  - Secondary: `#e2e8f0` (Hellgrau)
- **Framework**: TailwindCSS
- **Responsive**: Mobile-First Design

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Next.js API Routes
- **Datenbank**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Links)
- **Hosting**: Vercel (Free Tier)

## 📝 Kategorien anpassen

Um Kategorien zu ändern, bearbeite `supabase/schema.sql`:

```sql
INSERT INTO categories (name) VALUES
  ('Deine Kategorie 1'),
  ('Deine Kategorie 2'),
  ('Deine Kategorie 3')
ON CONFLICT (name) DO NOTHING;
```

Dann führe das SQL erneut in Supabase aus.

## 🐛 Troubleshooting

### "Invalid API Key"
- Prüfe, ob alle Umgebungsvariablen korrekt gesetzt sind
- Starte den Dev-Server neu: `npm run dev`

### "User not authorized"
- Prüfe, ob du angemeldet bist
- Prüfe die RLS-Policies in Supabase

### Magic Link funktioniert nicht
- Prüfe die Supabase URL Configuration
- Prüfe deine E-Mail (auch Spam-Ordner)
- In Development: Schaue in Supabase Dashboard > Auth > Users

### Votes werden nicht gespeichert
- Prüfe, ob du deinen eigenen Song ausgewählt hast
- Prüfe, ob du bereits für diese Kategorie abgestimmt hast
- Öffne die Browser Console für Fehlermeldungen

## 📄 Lizenz

Dieses Projekt ist für private Zwecke erstellt.

## 🤝 Support

Bei Fragen oder Problemen:
1. Prüfe die Supabase Logs: Dashboard > Logs
2. Prüfe die Browser Console (F12)
3. Prüfe die Vercel Logs (bei Deployment-Problemen)

---

**Viel Erfolg mit deiner Music Challenge! 🎵🏆**

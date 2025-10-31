# Multi-Week Challenge System Setup

## 🎯 Übersicht

Das System unterstützt jetzt 10 wöchentliche Challenges. Jede Woche kannst du im Admin-Dashboard zur nächsten Challenge wechseln.

## 📋 Setup-Schritte

### 1. Datenbank Migration

Gehe zu **Supabase Dashboard** → **SQL Editor** und führe das SQL aus `MIGRATION.sql` aus.

Das erstellt:
- `challenges` Tabelle mit den 10 Challenges
- `challenge_id` Spalte in `categories`
- Verknüpft existierende 04 A-K Kategorien mit Challenge 04

### 2. Kategorien für neue Challenges erstellen

Für jede Challenge (05-10) musst du die Kategorien (A-K) in Supabase erstellen:

```sql
-- Beispiel für Challenge 05
INSERT INTO categories (id, name, challenge_id, created_at) VALUES
  ('05 A', '05 A', '05', NOW()),
  ('05 B', '05 B', '05', NOW()),
  ('05 C', '05 C', '05', NOW()),
  ('05 D', '05 D', '05', NOW()),
  ('05 E', '05 E', '05', NOW()),
  ('05 F', '05 F', '05', NOW()),
  ('05 G', '05 G', '05', NOW()),
  ('05 H', '05 H', '05', NOW()),
  ('05 I', '05 I', '05', NOW()),
  ('05 J', '05 J', '05', NOW()),
  ('05 K', '05 K', '05', NOW());
```

Wiederhole das für 06, 07, 08, 09, 10.

### 3. Challenge wechseln

Im **Admin-Dashboard** (`/admin/dashboard`):
1. Siehst du die aktuelle Challenge
2. Kannst du zur nächsten Challenge wechseln
3. Alle Votes werden pro Challenge getrennt gespeichert

## 🎵 Die 10 Challenges

1. **Weihnachtssong, der gerne ab Sommer laufen darf**
2. **Eigentlich peinlich, aber ich mag den**
3. **Nachts mit Fenster unten**
4. **Keine Instrumente, trotzdem fett** ← Aktuell aktiv
5. **Ultimativer stank face groove**
6. **Build up, build up, build up, gänsehaut**
7. **Ja, der muss so langsam**
8. **Bestes Cover aller Zeiten**
9. **Totales Experiment, aber sehr gelungen**
10. **Wer nicht weint, hat kein Herz**

## 🔄 Workflow

### Woche 1-3 (bereits vorbei)
- Challenges 01-03 wurden ohne App durchgeführt
- Keine Daten in der App

### Woche 4 (jetzt)
- Challenge 04 ist aktiv
- Kategorien 04 A-K existieren bereits

### Ab Woche 5
1. **Vor der neuen Woche:**
   - Erstelle Kategorien für die neue Challenge (z.B. 05 A-K)
   
2. **Am Montag:**
   - Gehe zu `/admin/dashboard`
   - Klicke auf "Zur nächsten Challenge wechseln"
   - Die neue Challenge ist jetzt aktiv
   
3. **Während der Woche:**
   - User sehen nur die Kategorien der aktiven Challenge
   - Voting funktioniert wie gewohnt
   
4. **Ergebnisse:**
   - Jede Challenge hat eigene Ergebnisse
   - Im Admin-Dashboard kannst du zwischen Challenges wechseln

## 📊 Datenstruktur

```
challenges (10 Einträge)
├── 01: Weihnachtssong...
├── 02: Eigentlich peinlich...
├── 03: Nachts mit Fenster...
├── 04: Keine Instrumente... (aktiv)
├── 05: Ultimativer stank face...
└── ...

categories (110 Einträge = 10 Challenges × 11 Songs)
├── 04 A (challenge_id: '04')
├── 04 B (challenge_id: '04')
├── ...
├── 05 A (challenge_id: '05')
└── ...

votes (unbegrenzt)
├── Vote 1 (best: 04 A, nice: 04 B, own: 04 C)
├── Vote 2 (best: 05 A, nice: 05 B, own: 05 C)
└── ...
```

## 🎯 Features

- ✅ 10 wöchentliche Challenges
- ✅ Automatische Filterung nach aktiver Challenge
- ✅ Admin kann Challenge wechseln
- ✅ Separate Ergebnisse pro Challenge
- ✅ User sehen nur aktive Challenge
- ✅ Votes werden pro Challenge gespeichert

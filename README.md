# Codex Converters (private SSR app)

Jednoduchá server-rendered Node.js aplikace pro privátní použití: vložíš URL, backend nejdřív provede resolve (metadata + varianty), a až po výběru stáhne MP4/MP3.

> ⚠️ Používej pouze obsah, ke kterému máš právní oprávnění. Integrace platforem je neoficiální a může být nestabilní.

## 1) Implementation plan
1. Navrhnout vrstvy (routes/controllers/services/adapters/repositories/firebase/media/views/utils).
2. Připravit TypeScript strict scaffold + ESLint + Prettier.
3. Přidat adapter interface a 5 platforem (Instagram, X, TikTok, YouTube, Facebook).
4. Implementovat resolve flow (validace URL + allowlist + SSRF guard + metadata/varianty).
5. Implementovat download flow (volba MP4/MP3 + limit 500 MB + stream response).
6. Přidat Firebase Admin SDK + Firestore logování (`resolutions`, `downloads`, `history`).
7. Přidat SSR views (`/`, `/resolve`, `/download`, `/history`) + `/health`.
8. Přidat cleanup temp dat (on-stream close + scheduler + CLI script).
9. Přidat Docker + `.env.example` + provozní dokumentaci.

## 2) Architektura a zdůvodnění
- **Controller-first SSR**: jednoduché synchronní request/response bez SPA complexity.
- **Service layer**: business flow oddělený od HTTP.
- **Platform adapters**: každá platforma vlastní adapter, bez chaosu v controllerech.
- **Repository layer**: Firestore operace centralizované.
- **Media clients**: yt-dlp + ffmpeg abstrakce v samostatné vrstvě.

## 3) Struktura složek
- `src/routes`, `src/controllers`
- `src/services`
- `src/adapters`
- `src/repositories`
- `src/firebase`
- `src/media`
- `src/views`
- `src/config`, `src/utils`, `src/models`
- `scripts/cleanup.ts`

## 4) Balíčky
- `express`, `ejs`: SSR web.
- `helmet`, `express-rate-limit`: security baseline.
- `zod`: validace vstupů/env.
- `firebase-admin`: serverové Firestore operace.
- `sanitize-filename`: bezpečné názvy souborů.
- Dev: `typescript`, `tsx`, `eslint`, `prettier`.

## 5) Firestore datový model
Kolekce:
- `resolutions`
- `downloads`
- `history`

Pole (dle typu operace):
- `originalUrl`, `platform`, `title`, `author`, `duration`, `thumbnailUrl`
- `availableFormats`, `selectedOutputType`, `selectedQuality`
- `status`, `fileSize`, `errorMessage`
- `createdAt`, `updatedAt`, `expiresAt`

## 6) Firebase Admin SDK
Konfigurace přes env:
- `FIREBASE_PROJECT_ID=codex-converters`
- volitelně `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` pro service account
- fallback na Application Default Credentials

> Web Firebase config (`authDomain`, `appId`, …) se nepoužívá pro privilegované server operace.

## 7) Backend flow
### Resolve (`POST /resolve`)
1. URL validace + allowlist hostnames.
2. Adapter výběr podle hostu.
3. `yt-dlp --dump-single-json` získá metadata + varianty.
4. SSR render výsledku + log do Firestore.

### Download (`POST /download`)
1. Znovu validace vstupu.
2. Adapter download do temp adresáře.
3. MP4: přímý výstup; MP3: ffmpeg konverze.
4. Kontrola 500 MB (post-process guard).
5. Stream souboru v response + cleanup.

## 8) SSR views
- `/` homepage (URL pole)
- `/resolve` render resolved stránky (thumbnail/title/author/duration/variants)
- `/history` tabulka logů

## 9) Cleanup mechanismus
- Temp data v `TEMP_DIR` (default `/tmp/codex-converters`).
- Okamžitý cleanup po dokončení streamu.
- Periodický cleanup každou hodinu (`CleanupService`).
- Manuální cleanup: `npm run cleanup`.

## 10) Docker
```bash
docker compose up --build
```
Image obsahuje Node.js, `yt-dlp`, `ffmpeg`.

## 11) Lokální start
```bash
cp .env.example .env
npm install
npm run dev
```

## 12) Healthcheck
- `GET /health` -> `{ status: "ok", timestamp: ... }`

## 13) Známé limity a rizika
- Platformy mění ochrany/endpointy, resolve/download může přestat fungovat.
- Integrace je best-effort, ne oficiální API podpora platforem.
- Konverze MP3 závisí na dostupnosti `ffmpeg`.
- Některá média nemusí mít přesný `filesize` předem; proto je finální size guard po zpracování.

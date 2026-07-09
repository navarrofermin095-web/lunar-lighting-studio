# 🌙 Lunar Lighting Studio — Recruitment Website

A cinematic, interactive recruitment site for the Roblox studio **Lunar Lighting Studio** (owner: OG_LEO).
Built as a fast, dependency-free static frontend with a documented backend path for AI-assisted review + email.

---

## ✨ What's built (and verified working)

- **Landing page** — hero, about, compensation, process, FAQ, footer, privacy modal.
- **All 15 roles** rendered from data, with filled/total counts, progress bars, Open / Full·Waitlist badges, and filters.
- **4-step business application form**
  1. General details
  2. **Role-specific screening questions** (5 per role, shown dynamically for the selected role — 75 total)
  3. **Identity verification** — document type + image/PDF upload, with an **age gate** (guardian consent for under-18) and privacy consent
  4. Review & submit → success screen with reference code
- **Design**: "lunar + studio lighting" theme — deep navy, moonlight blue + warm glow accents, animated starfield, responsive down to mobile, respects `prefers-reduced-motion`.

> ✅ Verified end-to-end via browser automation: step validation, dynamic questions, age gate, marksheet hint, file upload preview, review panel, submit → success, role filters, and role preselect all pass. No console errors.

---

## ▶️ Run it locally

No build step. Two options:

**A. Just open it** — double-click `index.html`.
(External Google Fonts need internet; everything else is self-contained.)

**B. Local dev server (recommended)** — from this folder:
```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 4188
```
Then open <http://localhost:4188/>. (No Node/Python required — it's a tiny .NET server.)

---

## 🗂️ Structure
```
lunar-lighting-studio/
├─ index.html              # markup for every section
├─ assets/
│  ├─ css/styles.css       # design system + responsive styles
│  └─ js/
│     ├─ data.js           # ROLES + 5 questions each, age ranges, doc types  ← EDIT HERE
│     └─ app.js            # rendering, multi-step form, validation, submit
├─ api/
│  └─ apply.js             # serverless function: Gemini evaluation + Resend email
├─ package.json            # marks the project as ESM for Vercel (no dependencies)
├─ serve.ps1               # local static server for preview
└─ README.md
```

## 🔧 Customize
- **Change role counts / add roles / edit questions** → `assets/js/data.js` only. The UI, selects, and form update automatically.
- **Discord invite** → set `STUDIO.discordUrl` in `data.js`.
- **Colors / theme** → CSS variables at the top of `styles.css`.

---

## 🤖 Deploy to Vercel (automatic AI review + email — READY)

This folder is **deploy-ready as-is**: static frontend at the root + a real
serverless function at [`api/apply.js`](api/apply.js) (zero npm dependencies —
Gemini and Resend are called over plain REST). Until deployed, the form runs in
**fallback mode**: the applicant gets a "deliver your application" box
(one-click email + copy-to-clipboard) addressed to `navarrofermin095@gmail.com`.

### Steps (no local tools needed)

1. **Put the code on GitHub** — create a repository at github.com ("New repository"
   → name it `lunar-lighting-studio`), then "uploading an existing file" and drag
   in everything in this folder (you can skip `serve.ps1`).
2. **Import in Vercel** — vercel.com/new → Import your repository →
   Framework Preset: **Other** → no build command needed.
3. **Add the environment variables** (in the import screen, or later in
   *Project → Settings → Environment Variables*). **NEVER put API keys in the
   frontend or in git**; if a key was ever shared in a chat, revoke it and
   create a new one:
   - `GEMINI_API_KEY` — your Gemini API key (https://aistudio.google.com/apikey)
   - `RESEND_API_KEY` — your Resend key (https://resend.com/api-keys)
   - `RESULT_EMAIL` — `navarrofermin095@gmail.com`
4. **Deploy.** Your site goes live at `https://<project-name>.vercel.app`.
   Each submission is scored by **Gemini (`gemini-2.5-flash`)** and a verdict
   (score, strengths, red flags, recommendation + all answers) is emailed to you.

> **Resend free tier note:** emails are sent from `onboarding@resend.dev` and can
> only be delivered to the email address your Resend account is registered with —
> make sure that's `navarrofermin095@gmail.com`. Verify a domain in Resend later
> to send from your own address.

### 🔒 Identity documents — important
Per the chosen approach, verification documents are collected but must be handled through a
**secure KYC provider** (Stripe Identity / Veriff / Onfido) — see the `runKyc()` stub.
Do **not** store raw ID images in your own storage long-term and **never email them**.
The verdict email intentionally contains the evaluation + answers only, not the document images.

**Before launch:** replace the placeholder Privacy Policy with one reviewed for your jurisdiction
(GDPR / India DPDP / etc.), especially because minors and identity documents are involved.

---

## Roles included
Discord Handler · Content Creators · Video Makers · Scripters · Bug Fixers · Builders · Modelers ·
VFX · GFX · UI/UX · Animators · Clothing · SFX · Investors · Web Dev

# 🚀 JobFit AI — Resume + ATS Assistant

> An AI-powered assistant to analyze resumes, improve content, match keywords for ATS, and generate tailored suggestions.

---

## 📌 Overview

JobFit AI helps job seekers optimize resumes for applicant tracking systems (ATS) and hiring teams. The app provides automated ATS-compliance analysis, keyword matching, bullet-point enhancement, and personalized improvement insights powered by GenKit AI flows and Firebase-backed data storage.

---

## ✨ Features

- 🧾 ATS compliance analysis with suggestions for better keyword coverage
- 🔍 Resume keyword matching against job descriptions
- ✏️ Bullet-point suggestions and rewrite assistance
- 📈 Improvement insights and scoring for resumes
- 💬 AI-driven flows implemented with `genkit` for fast iteration
- 🔒 Authentication and user data via Firebase (Firestore)
- 📊 Basic analytics and history for user submissions
- 🛡 Client-side and server-side validation for uploads and inputs

---

## 🛠️ Tech Stack

| Category | Tools |
|----------|-------|
| **Frontend** | Next.js, React, TypeScript |
| **Styling** | Tailwind CSS, `tailwindcss-animate` |
| **AI / LLM** | GenKit (`genkit` + `@genkit-ai/google-genai`) |
| **Auth & DB** | Firebase (Auth, Firestore) |
| **Hosting / Config** | Vercel / Next.js tuning (see `next.config.ts`) |
| **Utilities** | react-hook-form, zod, date-fns, recharts |

---

## ⚙️ Installation

```bash
# Clone repository
git clone <repo-url>
cd JobFit-AI-main

# Install dependencies
npm install
# or
# yarn install
```

> Create a `.env.local` file (or set env vars in your hosting provider) with required keys. Example keys are listed in `env.txt` but DO NOT commit secrets to source control.

Required env examples:

- `GEMINI_API_KEY` — LLM API key (store securely)
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc. — Firebase config values

---

## 🚀 Development

```bash
# Run the Next.js dev server (port set in package.json)
npm run dev

# Start GenKit AI flows for local AI development
npm run genkit:dev
# or
npm run genkit:watch
```

Useful scripts (from `package.json`):

- `dev` — Run Next.js in development (`next dev --turbopack -p 9002`)
- `build` — Build for production (`next build`)
- `start` — Start production server (`next start`)
- `lint` — Run linter (`next lint`)
- `typecheck` — Run TypeScript typecheck (`tsc --noEmit`)

---
## 🧭 Usage

1. Start the dev server with `npm run dev` and open the app in your browser (`http://localhost:9002` by default).
2. Configure `.env.local` with your `GEMINI_API_KEY` and Firebase credentials.
3. Use the web UI to upload or paste a resume and a job description to get ATS insights and suggestions.
4. Use the GenKit flows during development to iterate on LLM prompts and behavior (`npm run genkit:dev`).

---

## 💡 Notes

- AI flows live under `src/ai/flows/` and can be extended or tuned with `genkit`.
- Firestore rules are in `firestore.rules`; review them before deploying to production.
- Avoid committing any API keys or secrets. Use environment variables or secret management in your hosting provider.

---

## 🚀 Future Improvements

- Add exportable resume templates and PDF generation
- Provide in-depth analytics and trend charts for candidate improvement
- Add user profiles and saved job matching history
- Multi-language support for resume suggestions
- Access controls and team/career-coach collaboration features

---

## 🙏 Acknowledgements

- Built with Next.js, React, and Tailwind CSS
- Powered by GenKit AI flows for LLM-driven features
- Firebase for authentication and data storage

---

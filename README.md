# MITRA — Autism Learning Companion

> A research-grounded, sensory-calm learning platform and assistive companion designed specifically for autistic children, their parents, and educators.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/anuj00018/mitra)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/anuj00018/mitra)

---

## 🌿 Core Philosophy & Sensory-Safe Design

MITRA rejects generic SaaS gamification tropes (loud bells, flashing animations, confetti explosions, neon palettes) in favor of nervous-system-first accommodations:
- **Calm Visual Palettes**: Gentle Sage (`#4B6F55`), Soft Sky (`#3C6C82`), and Warm Sand (`#B8673E`).
- **Tactile Touch Targets**: Minimum 64px physical and visual interactive buttons.
- **Pure Harmonic Audio**: Pure sine wave frequencies (440Hz / 528Hz) generated via Web Audio API, avoiding jarring buzzer effects.
- **Speech Synthesis Narration**: Adaptive pacing (0.75x–1.0x voice speed) to match individual receptive language processing.
- **Non-Distracting Feedback**: Reassuring, non-punitive guidance without countdown pressure or failure states.

---

## 🧩 The 12 Child Learning Activities

1. **Object Matching**: Dual-column functional association matching (Key/Lock, Book/Glasses, etc.).
2. **Memory Cards**: Tactile nature card flips with visual recall (4 to 8 cards across 3 tiers).
3. **Shape & Colour Sorting**: Categorization canvas with responsive sorting slots.
4. **Story Sequencing**: Temporal logic ordering narrative steps with spoken narration.
5. **Emotion Explorer**: Facial expression identification and social scenario decoding.
6. **Find the Difference**: Visual discrimination and sustained attention training.
7. **What Comes Next?**: Predictive sequencing across AB, ABC, and AAB patterns.
8. **Daily Routine Builder**: First-Then schedule structuring for everyday life transitions.
9. **Sound Match**: Pure sine frequency discrimination and melody matching.
10. **Communication Choice (AAC)**: Picture Exchange Communication strip builder with voice readback.
11. **Everyday Objects**: Household item room classification and functional understanding.
12. **Safe or Unsafe?**: Community safety, boundary discernment, and body safety scenarios.

---

## 👥 Three Specialized Roles

- **Child Experience (`/child`)**: Large tactile cards, audio cues, category filters, and a dedicated Calm Breathing Sphere.
- **Parent Portal (`/parent`)**: Sensory regulation controls (volume, font size, high-contrast, anxiety timer suppression), activity session logs, and AI companion insights.
- **Educator Console (`/educator`)**: IEP milestone tracking, student caseload progress meters, goal editor, and exportable progress reports.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti.
- **Audio Engine**: Web Audio API sine wave synthesis + Web Speech synthesis narrator.
- **Backend**: FastAPI (Python 3.13), Pydantic v2, Uvicorn, Google Gemini API for adaptive insights.
- **Database**: Supabase PostgreSQL schema with Row-Level Security (RLS).

---

## 🚀 Getting Started

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build and run production
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend Setup
```bash
# Start FastAPI backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 📄 License
MIT License. Crafted with care for inclusive education.

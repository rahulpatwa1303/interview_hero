# 🧠 Interview Hero

**Interview Hero** is an AI-powered mock interview platform that helps users practice and improve their interview skills. Powered by Google Gemini, the app generates tailored questions and provides intelligent feedback based on user responses.

---

## 🌐 Live Demo

🚧 Coming Soon: [https://your-demo-link.com](#)

---

## 📸 Screenshot

![Screenshot Placeholder](#) <!-- Replace with actual screenshot or GIF -->

---

## ✨ Features

- 🤖 **AI-Generated Interview Questions** — Personalized questions using Google Gemini.
- 🎯 **Topic & Role Selection** — Choose specific domains or roles to practice for.
- 🧠 **Answer Analysis & Feedback** — Intelligent feedback on your responses using AI.
- 📊 **Progress Tracking** *(If implemented)* — Monitor performance over time.
- 🔐 **Authentication** — User login/signup via Supabase Auth.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui  
- **Backend**: Supabase (PostgreSQL, Supabase Auth, Edge Functions)  
- **AI**: Google Gemini API (for question generation and answer analysis)

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

---

### 📦 Clone the Repository

```bash
git clone https://github.com/rahulpatwa1303/interview_hero.git
cd interview_hero
```
🔐 Setup Environment Variables
Create a .env.local file at the root of your project and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Supabase URL & Anon Key: Found in your Supabase project settings under Project → API.

Gemini API Key: Get from Google AI Studio.

📥 Install Dependencies
```bash
npm install
```

▶️ Run the App
```bash
npm run dev
```

🧪 Supabase Setup (Optional for Local Dev)
```bash
supabase login
supabase init
supabase start
supabase db push  # Run migrations if available
```

🤝 Contributing
Contributions are welcome!

1. Fork the repository

2. Create a feature branch: git checkout -b feature/your-feature-name

3. Commit your changes: git commit -m "Add your feature"

4. Push to your fork: git push origin feature/your-feature-name

5. Open a Pull Request


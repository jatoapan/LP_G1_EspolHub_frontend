# 📦 EspolHub Frontend Documentation

This is the frontend for the EspolHub marketplace platform, built with React, TypeScript, and Vite. It allows users to browse, search, and manage marketplace announcements, register/login, and manage their profiles. The app is designed to work with the EspolHub API backend.

---

## 🛠 Base Configuration
- **Frontend URL (default):** http://localhost:5173
- **Backend API URL (default):** http://localhost:3000 (set in `.env`)
- **API Version:** v1
- **Response Format:** JSON
- **Date Format:** ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

---

## 🚀 Requirements
- **Node.js** >= 18.x (LTS recommended)
- **npm** >= 9.x or **yarn** >= 1.22.x or **pnpm** >= 8.x

---

## 📦 Main Libraries & Tools
- React 18
- TypeScript 5
- Vite 4
- React Router DOM 6
- Shadcn UI (UI components)
- Lucide React (icons)
- React Hook Form + Zod (forms & validation)
- Axios (HTTP requests)
- Sonner (notifications)
- TanStack React Query (data fetching)
- TailwindCSS 3

---

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd LP_G1_EspolHub_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment (optional):**
   The `.env` file is already included. If you need to change the backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_API_VERSION=v1
   ```

---

## 🏃‍♂️ Running the Frontend

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 How to Test the Frontend
- Make sure the backend API is running at `http://localhost:3000` (or update `.env` if different).
- If the backend is unavailable, the app will use mock data for demo/testing.
- You can register, login, create/edit/delete announcements, reserve, and mark as sold.
- Login requires an institutional email (@espol.edu.ec).

---

## 📚 Useful Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build
- `npm run lint` — Lint the code

---

## ⚠️ Limitations & Notes
- Only one category and one condition can be selected per search (backend limitation).
- The profile page only shows active announcements (reserved/sold are not shown).
- If the API fails, mock data is shown for testing/demo purposes.
- Image URLs from the API are relative. The app automatically prepends the base URL.

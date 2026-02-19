# 💰 BudgetWise — React Showcase Project

A personal budget tracker built to demonstrate core React concepts in a real-world app.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:5173
```

## 🧠 Concepts Demonstrated

| Concept | Where |
|---|---|
| `useState` | TransactionForm, Login, Dashboard |
| `useEffect` | ThemeContext, AuthContext, TransactionContext, Login |
| `useContext` | Navbar, Dashboard, ProtectedRoute |
| `useReducer` | TransactionContext (ADD/DELETE/EDIT/FILTER) |
| `useMemo` | useBudget hook — totals, filtered list, category breakdown |
| `useRef` | TransactionForm & Login — auto-focus inputs |
| Two-way binding | All form inputs (value + onChange) |
| Prop drilling | Dashboard → TransactionList → TransactionCard → TransactionBadge |
| localStorage | Theme, auth user, all transactions |
| React Router | `/login`, `/dashboard`, `/summary`, `/about` + protected routes |
| axios | Motivational quote fetch on Login page |
| Custom hooks | `useBudget` extracts all logic from components |

## 📁 Project Structure

```
src/
├── context/
│   ├── ThemeContext.jsx       # Dark/light mode
│   ├── AuthContext.jsx        # Mock auth (username)
│   └── TransactionContext.jsx # useReducer state management
├── hooks/
│   └── useBudget.js           # useMemo computed values + dispatch helpers
├── pages/
│   ├── Login.jsx              # axios, useEffect, two-way binding
│   ├── Dashboard.jsx          # prop drilling root, useMemo values
│   ├── Summary.jsx            # charts, category breakdown
│   └── About.jsx              # concepts reference
├── components/
│   ├── Navbar.jsx             # useContext, NavLink, theme toggle
│   ├── SummaryCards.jsx       # prop drilling level 1
│   ├── TransactionList.jsx    # prop drilling level 1
│   ├── TransactionCard.jsx    # prop drilling level 2
│   ├── TransactionBadge.jsx   # prop drilling level 3
│   └── TransactionForm.jsx    # two-way binding, useRef
└── App.jsx                    # Router + context providers
```

## 🛠️ Tech Stack

- **React 18** — UI library
- **Tailwind CSS** — Utility-first styling
- **React Router v6** — Client-side routing
- **axios** — HTTP requests
- **Vite** — Build tool

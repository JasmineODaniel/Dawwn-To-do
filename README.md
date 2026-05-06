# DAWWN Todo

A minimalist task management application with a cloud-themed landing page, real-time updates, and persistent dark/light mode.

## Features

- Task list with search, status filters, and 10-per-page pagination
- Task detail page with edit and delete modals
- Create task modal with name, description, status, and priority fields
- Live WebSocket connection badge for real-time task change notifications
- Persistent dark and light mode toggle stored in localStorage
- Error boundary with a `/test-error` trigger route
- Custom 404 page
- Dynamic document title and meta tags per route
- Accessible markup with ARIA labels on icon-only controls
- Service worker registered for basic offline shell caching

## Tech Stack

- Vue 3 with Composition API and `<script setup lang="ts">`
- TypeScript throughout
- Vite 6
- Vue Router 4
- TanStack Vue Query 5
- Tailwind CSS 3
- Lucide Vue Next (icons)

## Project Structure

```
├── src/
│   ├── components/
│   │   └── ErrorBoundary.vue
│   ├── composables/
│   │   ├── useSEO.ts
│   │   └── useWebSocket.ts
│   ├── router/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── views/
│   │   ├── Landing.vue
│   │   ├── TodoList.vue
│   │   ├── TaskDetails.vue
│   │   ├── NotFound.vue
│   │   └── TestError.vue
│   ├── App.vue
│   ├── env.d.ts
│   ├── main.ts
│   └── style.css
├── public/
│   └── service-worker.js
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Setup

Requires Node.js 18+.

```bash
git clone https://github.com/JasmineODaniel/Dawwn-To-do.git
cd Dawwn-To-do
npm install
npm run dev
```

Open `http://localhost:5173`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## API

Base URL: `https://api.oluwasetemi.dev`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks?page=&limit=10&search=&status=` | List with pagination and filters |
| GET | `/tasks/:id` | Single task |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

WebSocket: `wss://api.oluwasetemi.dev/ws/tasks`

## Design

- Michroma font for the brand lockup
- 18px grid background in both themes
- Glassmorphism card style in dark mode
- Floating blur blob shapes on the landing page
- Consistent 10px border radius on cards and modals

## Author

Jasmine Daniel

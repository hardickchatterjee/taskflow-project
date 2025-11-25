# 📌 Kanban Realtime Task Manager

A modern **Kanban-style project management system** built with **Next.js (App Router)**, **Zustand**, **TypeScript**, **DnD-Kit**, and **Realtime Syncing via SSE**.  
Designed for **speed**, **smooth drag-and-drop**, **infinite scroll** for huge task lists, and **offline-friendly state persistence**.

---
## 🚀 Video Link
The video explaining the features of the project can be found in this link
https://vimeo.com/1140229872/40b806bf13


## 🚀 Features

- ⚡ Fast Next.js App Router structure  
- 🔄 Realtime syncing using **Server-Sent Events (SSE)**  
- 🗂️ Zustand store for global, reactive state  
- 🧲 Drag-and-drop via `@dnd-kit`  
- ♾️ Infinite scroll with `IntersectionObserver` (20 tasks at a time)  
- 📌 Task dependencies  
- 💬 Inline comments per task  
- 🗑️ Delete system  
- 🌗 Sweet UI with Tailwind + shadcn/ui  
- 🐳 Fully Dockerized 

---

## 📁 Project Structure

```
src/
  app/
    layout.tsx
    page.tsx
    projects/
      [projectId]/
        page.tsx
  components/
    KanbanBoard.tsx
    ui/
      button.tsx
      card.tsx
      input.tsx
  store/
    useTaskStore.ts
  lib/
    useSSESync.ts
    useSyncTaskStoreAcrossTabs.ts
public/
Dockerfile
docker-compose.yml
README.md
```

---

## 🛠️ Requirements

- Node 18+
- pnpm / npm / yarn / bun
- Docker (optional but recommended)

---

## 📦 Install & Run Locally

Clone the repo:

```bash
git clone https://github.com/hardickchatterjee/taskflow-project.git
cd taskflow-project
```

Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

Run development server:

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🔧 Environment Variables

Create a `.env.local` file:

```
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
GEMINI_API_KEY="AIzaSyB6eNILabOMWhs5bSJJeBXn_YSyyUrUK-Q"
GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key"
```

---

## 🐳 Run with Docker

### Build the image

```bash
docker build \                    
  --build-arg DATABASE_URL="file:./dev.db" \
  --build-arg NEXT_PUBLIC_SOCKET_URL="http://localhost:3000" \
  --build-arg GEMINI_API_KEY="AIzaSyB6eNILabOMWhs5bSJJeBXn_YSyyUrUK-Q" \
  --build-arg GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key" \
  -t taskflow-app .
```

### Run container

```bash
docker run -p 3000:3000 taskflow-app
```

Visit:

```
http://localhost:3000
```

---


## 🏗️ Build for Production

```bash
npm run build
npm run start
```

---
## 🏗️ Architecture Decisions

- **Frontend:** Next.js App Router + React Server/Client Components.  
- **State Management:** Zustand with persistence in `localStorage`. Supports undo/redo and cross-tab syncing.  
- **Drag-and-Drop:** `@dnd-kit` for precise, accessible, and performant task reordering.  
- **Realtime Sync:** SSE (Server-Sent Events) with in-memory global queue for broadcasting updates.  
- **Infinite Scroll:** IntersectionObserver for large task lists (lazy loading in batches of 20).  

---

## 🔄 How Sync Works

1. **Cross-tab Sync:** Uses `localStorage` events to merge state changes across tabs.
2. **Realtime Collaboration:** SSE endpoint `/api/events` streams batched updates (tasks/comments) to all clients.  
3. **Queue System:** Server maintains an in-memory event queue, filters by project, sends events every 100ms.  
4. **Client Handling:** React hook `useSSESync` listens for SSE messages and updates Zustand store instantly.  

---

## 📈 Scaling the System

- **Current Tradeoff:** In-memory queue is simple but won’t persist across server restarts or scale horizontally.  
- **Scaling Ideas:**  
  - Move event queue to Redis Pub/Sub for horizontal scaling.  
  - Implement WebSocket-based channels for lower latency.  
  - Split projects across microservices for very large teams.  
  - Use database persistence with event sourcing for durability.  

---

## ⚖ Tradeoffs

- **Simplicity vs Durability:** In-memory SSE queue is lightweight but volatile.  
- **Realtime vs Complexity:** SSE chosen over WebSocket for simplicity; limited bidirectional messaging.  
- **Frontend-heavy State:** Zustand handles optimistic updates and undo/redo, but may increase memory usage for huge task sets.  

---

## 🛠 Technology Choices & Justifications

- **Next.js (App Router):** Server Components + client interactivity for hybrid rendering.  
- **Zustand:** Lightweight, reactive, and supports local persistence.  
- **TypeScript:** Type safety across tasks, comments, and state actions.  
- **DnD-Kit:** Flexible, accessible drag-and-drop solution.  
- **Tailwind + shadcn/ui:** Rapid UI development and responsive design.  
- **SSE:** Simple, low-overhead realtime updates.  

---

## 🔁 Data Flow & Synchronization Strategy

1. **User adds/updates a task or comment** → Zustand updates store → optionally broadcasts via `/api/events/broadcast`.  
2. **SSE clients receive batch updates** → `useSSESync` updates local state in realtime.  
3. **Cross-tab changes** → `localStorage` events merge tasks safely.  
4. **Deleted tasks** are soft-deleted (`deletedAt`) and removed from Kanban view.  
5. **Dependencies and comments** are merged carefully to avoid overwrites.  

This ensures **fast, collaborative, and consistent state** across tabs and users while keeping the system simple and extendable.  

---
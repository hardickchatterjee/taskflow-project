# 📌 Kanban Realtime Task Manager

A modern **Kanban-style project management system** built with **Next.js (App Router)**, **Zustand**, **TypeScript**, **DnD-Kit**, and **Realtime Syncing via SSE**.  
Designed for **speed**, **smooth drag-and-drop**, **infinite scroll** for huge task lists, and **offline-friendly state persistence**.

---

## 🚀 Features

- ⚡ Fast Next.js App Router structure  
- 🔄 Realtime syncing using **Server-Sent Events (SSE)**  
- 🗂️ Zustand store for global, reactive state  
- 🧲 Drag-and-drop via `@dnd-kit`  
- ♾️ Infinite scroll with `IntersectionObserver` (20 tasks at a time)  
- 📌 Task dependencies  
- 💬 Inline comments per task  
- 🗑️ Soft delete system  
- 🌗 Sweet UI with Tailwind + shadcn/ui  
- 🐳 Fully Dockerized for production  

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
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
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
NEXT_PUBLIC_API_URL=http://localhost:3000
SSE_URL=http://localhost:3000/api/events
NODE_ENV=development
```

---

## 🐳 Run with Docker

### Build the image

```bash
docker build -t kanban-app .
```

### Run container

```bash
docker run -p 3000:3000 kanban-app
```

Visit:

```
http://localhost:3000
```

---

## 🐳 Docker Compose (Recommended)

`docker-compose.yml` example:

```yaml
version: '3.9'

services:
  web:
    build: .
    container_name: kanban-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
```

Run:

```bash
docker-compose up --build
```

Stop:

```bash
docker-compose down
```

---

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

---

## 🔥 Key System Highlights

### ✔ Drag-and-drop (DnD-Kit)

Uses:

```ts
DndContext
SortableContext
PointerSensor
useSortable
```

Smooth reordering + reactive Zustand updates.

---

### ✔ Infinite Scroll (Handles 1000+ tasks smoothly)

Events:

```ts
tasks.slice(0, visibleCount)
IntersectionObserver → visibleCount += 20
```

---

### ✔ Real-Time Syncing via SSE

- Clients connect to `/api/events?projectId=xyz`
- Server streams updates in batches every 100ms
- Lightweight alternative to WebSockets

---

### ✔ Cross-Tab Syncing

`useSyncTaskStoreAcrossTabs.ts` listens for `localStorage` updates:

- Tab A changes instantly show in Tab B  
- Tasks, comments, dependencies merge safely  

---

## 🧪 Testing

```bash
npm run test
```

---

## 🌎 Deploy on Vercel

```bash
vercel
```

Or visit: [https://vercel.com/new](https://vercel.com/new)

---

## 🤝 Contributing

PRs welcome! Open issues or feature requests are encouraged.

---

## 📄 License

MIT License.

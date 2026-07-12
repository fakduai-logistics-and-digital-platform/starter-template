# Wellness — Full-Stack Template

Template สำหรับน้องนักศึกษาที่อยากเรียนรู้การพัฒนา Full-Stack Web Application ตั้งแต่ต้น  
ใช้เป็นฐานในการต่อยอดโปรเจกต์ได้เลย

**Tech Stack:**
- **Backend** — [Hono](https://hono.dev/) + [Cloudflare Workers](https://workers.cloudflare.com/) (D1 Database + KV Cache)
- **Frontend** — [Vue 3](https://vuejs.org/) + [Vuetify](https://vuetifyjs.com/) + [Pinia](https://pinia.vuejs.org/)
- **Deploy** — Cloudflare Workers (backend) + Cloudflare Pages (frontend)

---

## โครงสร้างโปรเจกต์

```
wellness/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml   # CI/CD สำหรับ backend
│       └── deploy-frontend.yml  # CI/CD สำหรับ frontend
├── backend/                     # Hono API (Cloudflare Workers)
└── frontend/                    # Vue 3 + Vuetify SPA
```

---

## Zero to Hero — ตั้งค่าตั้งแต่เริ่มต้น

### สิ่งที่ต้องมีก่อน

| เครื่องมือ | เวอร์ชัน | ติดตั้ง |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 8.6.2 | `npm i -g pnpm@8.6.2` |
| Wrangler CLI | 4+ | `npm i -g wrangler` |
| Cloudflare account | — | https://dash.cloudflare.com/sign-up |

---

## Backend

### 1. ติดตั้ง dependencies

```bash
cd backend
npm install
```

### 2. Login Cloudflare

```bash
npx wrangler login
```

### 3. สร้าง D1 Database

```bash
npx wrangler d1 create wellness-db
```

จะได้ output ประมาณนี้:
```
✅ Successfully created DB 'wellness-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**สำหรับ Local Dev** — แทนค่าใน `backend/wrangler.jsonc`:
```jsonc
"database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**สำหรับ GitHub Actions** — เพิ่ม Secret ชื่อ `D1_DATABASE_ID` ค่าคือ `database_id` ที่ได้  
(workflow จะ inject ให้อัตโนมัติก่อน deploy)

### 4. สร้าง KV Namespace

```bash
npx wrangler kv namespace create CACHE
```

จะได้ output ประมาณนี้:
```
✅ Successfully created KV namespace 'CACHE'
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**สำหรับ Local Dev** — แทนค่าใน `backend/wrangler.jsonc`:
```jsonc
"id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**สำหรับ GitHub Actions** — เพิ่ม Secret ชื่อ `KV_NAMESPACE_ID` ค่าคือ `id` ที่ได้

### 5. รัน migration สร้าง tables

```bash
# local (สำหรับ dev)
npm run db:migrate:local

# remote (สำหรับ production)
npm run db:migrate:remote
```

### 6. รัน dev server

```bash
npm run dev
# → http://localhost:8787
# → API Docs: http://localhost:8787/docs
```

### คำสั่งอื่นๆ

```bash
npm run typecheck      # ตรวจ TypeScript
npm run deploy         # deploy ขึ้น Cloudflare Workers
npm run build:lambda   # build สำหรับ AWS Lambda
```

---

## Frontend

### 1. ติดตั้ง dependencies

```bash
cd frontend
pnpm install
```

### 2. ตั้งค่า environment

```bash
cp .env.example .env
```

แก้ไข `.env`:

```env
VITE_BACKEND_URL=http://localhost:8787   # ชี้ไปที่ backend (dev)
```

### 3. รัน dev server

```bash
pnpm dev
# → http://localhost:5173
```

### คำสั่งอื่นๆ

```bash
pnpm typecheck    # ตรวจ TypeScript
pnpm build        # build สำหรับ production (output: dist/)
pnpm preview      # preview build ที่ port 5050
pnpm lint         # ตรวจ ESLint
```

---

## โครงสร้าง Backend

```
backend/
├── migrations/                          # SQL migrations (เรียงตามเลข)
│   ├── 0001_create_users.sql
│   ├── 0002_create_health_logs.sql
│   └── 0003_create_goals.sql
└── src/
    ├── domain/                          # ชั้นใน — ไม่ขึ้นกับ framework ใดๆ
    │   ├── entities/                    # TypeScript interfaces ของ data model
    │   │   ├── user.ts
    │   │   ├── health-log.ts
    │   │   └── goal.ts
    │   ├── repositories/                # interface ของการเข้าถึงข้อมูล
    │   │   ├── user-repository.ts
    │   │   ├── health-log-repository.ts
    │   │   └── goal-repository.ts
    │   └── errors.ts                    # AppError, NotFoundError, ConflictError, ValidationError
    │
    ├── infrastructure/                  # การ implement repository จริง
    │   ├── d1/                          # ใช้ D1 (Cloudflare SQLite)
    │   │   ├── d1-user-repository.ts
    │   │   ├── d1-health-log-repository.ts
    │   │   └── d1-goal-repository.ts
    │   ├── kv/                          # ใช้ KV (Cloudflare cache)
    │   │   └── kv-cache-repository.ts
    │   └── memory/                      # ใช้ RAM (สำหรับ Lambda / test)
    │       ├── memory-user-repository.ts
    │       ├── memory-health-log-repository.ts
    │       └── memory-goal-repository.ts
    │
    ├── services/                        # Business logic — รับ repository, throw domain errors
    │   ├── user-service.ts
    │   ├── health-log-service.ts
    │   └── goal-service.ts
    │
    ├── handlers/                        # รับ HTTP request → เรียก service → return JSON
    │   ├── user-handler.ts
    │   ├── health-log-handler.ts
    │   └── goal-handler.ts
    │
    ├── schemas/                         # Zod schemas สำหรับ validate request + generate OpenAPI
    │   ├── user-schemas.ts
    │   ├── health-log-schemas.ts
    │   └── goal-schemas.ts
    │
    ├── routers/                         # กำหนด routes + OpenAPI metadata
    │   ├── index.ts                     # mount routers ทั้งหมดที่ /api/v1
    │   ├── user-router.ts
    │   ├── health-log-router.ts
    │   └── goal-router.ts
    │
    ├── di/
    │   └── container.ts                 # Dependency Injection — wire ทุกอย่างเข้าด้วยกัน
    │
    ├── app.ts                           # สร้าง Hono app (runtime-agnostic)
    ├── server.ts                        # Cloudflare Workers entrypoint (ใช้ D1 + KV)
    ├── lambda.ts                        # AWS Lambda entrypoint (ใช้ memory repos)
    └── types.ts                         # Bindings, AppEnv types
```

### Architecture Flow

```
Request
  └── Router (validate schema)
        └── Handler (parse input)
              └── Service (business logic)
                    └── Repository Interface
                          └── Implementation (D1 / KV / Memory)
```

**กฎสำคัญ:** ชั้นในไม่รู้จักชั้นนอก — `domain` ไม่ import `hono`, `service` ไม่รู้จัก D1

### API Endpoints

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/docs` | Scalar API Docs UI |
| GET | `/api/v1/users` | รายการ users ทั้งหมด |
| POST | `/api/v1/users` | สร้าง user |
| GET | `/api/v1/users/:id` | ดู user (cached 5 นาที) |
| PATCH | `/api/v1/users/:id` | แก้ไข user |
| DELETE | `/api/v1/users/:id` | ลบ user |
| GET | `/api/v1/health-logs` | รายการ health logs ทั้งหมด |
| POST | `/api/v1/health-logs` | บันทึก health log รายวัน |
| GET | `/api/v1/health-logs/user/:userId` | health logs ของ user |
| GET | `/api/v1/health-logs/:id` | ดู health log |
| PATCH | `/api/v1/health-logs/:id` | แก้ไข health log |
| DELETE | `/api/v1/health-logs/:id` | ลบ health log |
| GET | `/api/v1/goals` | รายการ goals ทั้งหมด |
| POST | `/api/v1/goals` | สร้าง goal |
| GET | `/api/v1/goals/user/:userId` | goals ของ user |
| GET | `/api/v1/goals/:id` | ดู goal |
| PATCH | `/api/v1/goals/:id` | อัปเดต goal / เปลี่ยน status |
| DELETE | `/api/v1/goals/:id` | ลบ goal |

### เพิ่ม Resource ใหม่ (เช่น `meals`)

ทำตามลำดับนี้:

1. `src/domain/entities/meal.ts` — interface
2. `src/domain/repositories/meal-repository.ts` — interface
3. `src/infrastructure/d1/d1-meal-repository.ts` + `src/infrastructure/memory/memory-meal-repository.ts`
4. `src/services/meal-service.ts`
5. `src/handlers/meal-handler.ts`
6. `src/schemas/meal-schemas.ts` + `src/routers/meal-router.ts`
7. `migrations/0004_create_meals.sql`
8. เพิ่มใน `src/di/container.ts`, `src/routers/index.ts`, `src/server.ts`, `src/lambda.ts`
9. `npm run db:migrate:local`

---

## โครงสร้าง Frontend

```
frontend/src/
├── pages/                    # File-based routing (vite-plugin-vue-router)
│   ├── index.vue             # / → Dashboard
│   ├── health-log-page.vue   # /health-log-page
│   ├── goal-page.vue         # /goal-page
│   ├── user-page.vue         # /user-page
│   ├── login.vue             # /login
│   └── [...error].vue        # 404
│
├── apis/                     # HTTP client functions (fetch wrapper)
│   ├── health-log-api.ts
│   ├── goal-api.ts
│   └── user-api.ts
│
├── stores/                   # Pinia stores (state management)
│   ├── use-health-log-store.ts
│   ├── use-goal-store.ts
│   ├── use-user-store.ts
│   ├── use-notification-store.ts
│   ├── use-loading-overlay-store.ts
│   └── use-alert-dialog-store.ts
│
├── models/                   # TypeScript interfaces ของ data
│   ├── health-log.ts
│   ├── goal.ts
│   ├── user.ts
│   └── index.ts              # re-export ทั้งหมด
│
├── components/               # Reusable components
│   ├── ui/                   # Base UI components (UiButton, UiCard, ...)
│   └── dialogs/              # Dialog components
│
├── composables/              # Vue composables (useSEO, useApi, ...)
├── layouts/                  # Layout templates (default, blank)
├── navigation/               # เมนู sidebar (vertical/horizontal)
│   └── vertical/index.ts     # กำหนดรายการเมนูซ้าย
├── plugins/                  # Vue plugins (router, vuetify, pinia, ...)
├── utils/                    # Helper functions
└── design-tokens/            # Design system tokens
```

### Data Flow

```
Page (Vue SFC)
  └── Store (Pinia)
        └── API (fetch)
              └── Backend /api/v1/...
```

### เพิ่มหน้าใหม่ (เช่น `meals`)

1. `src/models/meal.ts` — TypeScript interface
2. `src/apis/meal-api.ts` — fetch functions
3. `src/stores/use-meal-store.ts` — Pinia store
4. `src/pages/meal-page.vue` — หน้า Vue (route สร้างอัตโนมัติจากชื่อไฟล์)
5. เพิ่มเมนูใน `src/navigation/vertical/index.ts`

---

## Deploy ขึ้น Production

### Backend → Cloudflare Workers

```bash
cd backend

# ครั้งแรก: apply migrations ขึ้น remote
npm run db:migrate:remote

# deploy
npm run deploy
```

### Frontend → Cloudflare Pages

```bash
cd frontend

# build
pnpm build

# deploy ครั้งแรก (สร้าง project ใหม่)
npx wrangler pages deploy dist --project-name=wellness-frontend

# deploy ครั้งถัดไป
npx wrangler pages deploy dist --project-name=wellness-frontend --branch=main
```

---

## GitHub Actions — ตั้งค่า Secrets

ไปที่ **GitHub repo → Settings → Secrets and variables → Actions** แล้วเพิ่ม:

| Secret | วิธีหาค่า | ใช้ใน |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) → Create Token → ต้องมี permission: Workers Scripts, D1, Pages | ทั้งคู่ |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → มุมขวาบนของหน้า Workers | ทั้งคู่ |
| `D1_DATABASE_ID` | รัน `npx wrangler d1 create wellness-db` → คัดลอก `database_id` | backend |
| `KV_NAMESPACE_ID` | รัน `npx wrangler kv namespace create CACHE` → คัดลอก `id` | backend |
| `VITE_BACKEND_URL` | URL ของ Workers หลัง deploy เช่น `https://wellness-backend.yourname.workers.dev` | frontend |

> **หมายเหตุ:** `D1_DATABASE_ID` และ `KV_NAMESPACE_ID` จะถูก inject เข้า `wrangler.jsonc` อัตโนมัติตอน deploy  
> ไม่ต้องแก้ไข `wrangler.jsonc` ด้วยมือ — ใน repo จะเก็บเป็น placeholder `<REPLACE_WITH_...>` ไว้

Workflow จะ trigger อัตโนมัติเมื่อ push ไป `main`:
- แก้ไขไฟล์ใน `backend/**` → รัน `deploy-backend.yml`
- แก้ไขไฟล์ใน `frontend/**` → รัน `deploy-frontend.yml`

---

## Resources

- [Hono Docs](https://hono.dev/docs/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vue 3 Docs](https://vuejs.org/guide/)
- [Vuetify Docs](https://vuetifyjs.com/en/getting-started/installation/)
- [Pinia Docs](https://pinia.vuejs.org/introduction.html)

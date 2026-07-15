# Wellness — Full-Stack Template

Template สำหรับนักศึกษาที่อยากเรียนรู้การพัฒนา Full-Stack Web Application ตั้งแต่ต้น
ใช้เป็นฐานในการต่อยอดโปรเจกต์ได้เลย ระบบตัวอย่างคือ Health Logs + Goals Tracking

**Tech Stack**

| | |
|---|---|
| **Backend** | [Hono](https://hono.dev/) + [Cloudflare Workers](https://workers.cloudflare.com/) + D1 (SQLite) + KV (Cache) |
| **Frontend** | [Vue 3](https://vuejs.org/) + [Vuetify](https://vuetifyjs.com/) + [Pinia](https://pinia.vuejs.org/) |
| **Deploy** | Cloudflare Workers (backend) + Cloudflare Pages (frontend) |
| **CI/CD** | GitHub Actions — typecheck → build → deploy อัตโนมัติ |

---

## โครงสร้างโปรเจกต์

```
starter-template/
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD pipeline รวม backend + frontend
├── backend/                 # Hono API (Cloudflare Workers)
└── frontend/                # Vue 3 + Vuetify SPA
```

---

## สิ่งที่ต้องมีก่อนเริ่ม

| เครื่องมือ | เวอร์ชัน |
|---|---|
| [Node.js](https://nodejs.org) | 22+ |
| [pnpm](https://pnpm.io) | `npm i -g pnpm@8.6.2` |
| [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) | `npm i -g wrangler` |
| [Cloudflare Account](https://dash.cloudflare.com/sign-up) | ฟรี |

---

## เริ่มต้น Local Development

### Backend

```bash
cd backend
npm install

# login Cloudflare
npx wrangler login

# สร้าง D1 database ใน local
npm run db:migrate:local

# รัน dev server → http://localhost:8787
# API Docs → http://localhost:8787/docs
npm run dev
```

### Frontend

```bash
cd frontend
pnpm install

# ตั้งค่า environment
cp .env.example .env
# แก้ VITE_BACKEND_URL=http://localhost:8787

# รัน dev server → http://localhost:5173
pnpm dev
```

---

## GitHub Actions — ตั้งค่า CI/CD

Workflow จะ trigger อัตโนมัติเมื่อ push ไป `main` และรันตามลำดับนี้:

```
push to main
    ├── build-backend ──────────────────────────┐
    │                                           ↓
    └── build-frontend ──→ deploy-backend ──→ deploy-frontend
```

ต้องตั้งค่า **GitHub Secrets 6 ตัว** ก่อน workflow ถึงจะทำงานได้

**GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

---

### Secret 1 — `CLOUDFLARE_API_TOKEN`

1. ไปที่ [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. กด **Create Token** → เลือก **Create Custom Token**
3. ตั้งชื่อ เช่น `starter-deploy`
4. เพิ่ม Permissions ดังนี้:

   | Scope | Resource | Permission |
   |---|---|---|
   | Account | Cloudflare Pages | Edit |
   | Account | Workers Scripts | Edit |
   | Account | Workers KV Storage | Edit |
   | Account | D1 | Edit |

5. Account Resources → **Include → All accounts**
6. กด **Continue to summary** → **Create Token**
7. **คัดลอก token ทันที** — แสดงครั้งเดียวเท่านั้น

---

### Secret 2 — `CLOUDFLARE_ACCOUNT_ID`

1. ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**
2. มองขวาบน จะเห็น **Account ID** (32 ตัวอักษร)
3. คัดลอกมาใส่

---

### Secret 3 — `D1_DATABASE_ID`

```bash
npx wrangler d1 create starter-db
```

Output:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← คัดลอกอันนี้
```

> Workflow จะ inject ค่านี้เข้า `wrangler.jsonc` อัตโนมัติก่อน deploy

---

### Secret 4 — `KV_NAMESPACE_ID`

```bash
npx wrangler kv namespace create CACHE
```

Output:
```
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  ← คัดลอกอันนี้
```

> Workflow จะ inject ค่านี้เข้า `wrangler.jsonc` อัตโนมัติก่อน deploy

---

### Secret 5 — `PAGES_PROJECT_NAME`

ชื่อ Cloudflare Pages project ของคุณ — ตั้งชื่อที่ unique เป็นของตัวเอง

- ตัวอย่าง: `john-wellness-app`, `my-health-tracker`
- URL ที่ได้: `https://<PAGES_PROJECT_NAME>.pages.dev`

> ชื่อต้อง **unique ทั่วโลก** เพราะ `pages.dev` เป็น domain ที่ใช้ร่วมกัน ถ้าซ้ำจะ deploy ไม่ได้

---

### Secret 6 — `VITE_BACKEND_URL`

URL ของ backend Workers ที่ deploy แล้ว รู้ได้หลัง deploy-backend สำเร็จครั้งแรก

1. Push code ขึ้น `main` และรอให้ `deploy-backend` job ผ่าน
2. ดู log ของ workflow จะเห็น:
   ```
   ✅ Backend deployed to https://starter-backend.yourname.workers.dev
   ```
3. คัดลอก URL นั้น → เพิ่มเป็น Secret `VITE_BACKEND_URL`
4. Push อีกครั้งเพื่อให้ frontend build ด้วย URL ที่ถูกต้อง

---

### สรุป Secrets

| Secret | ใช้ใน | ค่าที่ต้องใส่ |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | backend + frontend | API Token จาก Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | backend + frontend | Account ID จาก Dashboard |
| `D1_DATABASE_ID` | backend | database_id จาก `wrangler d1 create` |
| `KV_NAMESPACE_ID` | backend | id จาก `wrangler kv namespace create` |
| `PAGES_PROJECT_NAME` | frontend | ชื่อ Pages project ที่ตั้งเอง |
| `VITE_BACKEND_URL` | frontend | URL ของ backend Workers หลัง deploy |

---

## Deploy ด้วยมือ (ไม่ผ่าน GitHub Actions)

### Backend

```bash
cd backend

# ครั้งแรก: copy config และใส่ ID จริง
cp wrangler.example.jsonc wrangler.jsonc
# แก้ database_id และ kv id ใน wrangler.jsonc

# apply migrations ขึ้น remote
npm run db:migrate:remote

# deploy
npm run deploy
```

### Frontend

```bash
cd frontend

pnpm build

npx wrangler pages deploy dist \
  --project-name=<PAGES_PROJECT_NAME> \
  --branch=main
```

---

## โครงสร้าง Backend

```
backend/
├── migrations/              # SQL migration files (เรียงตามเลข)
└── src/
    ├── domain/              # ชั้นในสุด — ไม่รู้จัก Hono, D1, หรือ framework ใดๆ
    │   ├── entities/        # TypeScript interfaces (User, HealthLog, Goal)
    │   ├── repositories/    # Repository interfaces
    │   └── errors.ts        # AppError, NotFoundError, ConflictError, ValidationError
    │
    ├── infrastructure/      # Implement repository จริง
    │   ├── d1/              # Cloudflare D1 (SQLite)
    │   ├── kv/              # Cloudflare KV (cache)
    │   └── memory/          # In-memory (สำหรับ Lambda / test)
    │
    ├── services/            # Business logic — รับ repository interface, throw domain errors
    ├── handlers/            # HTTP layer — รับ request, เรียก service, return JSON
    ├── schemas/             # Zod schemas — validate request + generate OpenAPI docs
    ├── routers/             # Route definitions + OpenAPI metadata
    │   └── index.ts         # mount ทุก router ที่ /api/v1
    ├── di/
    │   └── container.ts     # Dependency Injection — wire ทุกอย่างเข้าด้วยกัน
    ├── app.ts               # Hono app factory (runtime-agnostic)
    ├── server.ts            # Cloudflare Workers entrypoint
    └── lambda.ts            # AWS Lambda entrypoint
```

### Architecture

```
Request → Router (validate) → Handler (parse) → Service (logic) → Repository ← Implementation
                                                                   (interface)     (D1/KV/Memory)
```

กฎ: **ชั้นในไม่รู้จักชั้นนอก** — `domain` ไม่ import `hono`, `service` ไม่รู้จัก `D1Database`

### API Endpoints

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/docs` | Scalar API Docs UI |
| GET | `/openapi.json` | OpenAPI spec |
| GET | `/api/v1/users` | รายการ users |
| POST | `/api/v1/users` | สร้าง user |
| GET | `/api/v1/users/:id` | ดู user (cached 5 นาที) |
| PATCH | `/api/v1/users/:id` | แก้ไข user |
| DELETE | `/api/v1/users/:id` | ลบ user |
| GET | `/api/v1/health-logs` | รายการ health logs |
| POST | `/api/v1/health-logs` | บันทึก health log รายวัน |
| GET | `/api/v1/health-logs/user/:userId` | health logs ของ user |
| GET | `/api/v1/health-logs/:id` | ดู health log |
| PATCH | `/api/v1/health-logs/:id` | แก้ไข health log |
| DELETE | `/api/v1/health-logs/:id` | ลบ health log |
| GET | `/api/v1/goals` | รายการ goals |
| POST | `/api/v1/goals` | สร้าง goal |
| GET | `/api/v1/goals/user/:userId` | goals ของ user |
| GET | `/api/v1/goals/:id` | ดู goal |
| PATCH | `/api/v1/goals/:id` | อัปเดต goal / เปลี่ยน status |
| DELETE | `/api/v1/goals/:id` | ลบ goal |

### เพิ่ม Resource ใหม่ (เช่น `meals`)

ทำตามลำดับนี้:

1. `src/domain/entities/meal.ts`
2. `src/domain/repositories/meal-repository.ts`
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
├── pages/             # File-based routing (vite-plugin-vue-router)
│   ├── index.vue      # / → Dashboard
│   ├── health-log-page.vue
│   ├── goal-page.vue
│   ├── user-page.vue
│   ├── login.vue
│   └── [...error].vue
├── apis/              # Fetch wrapper functions
├── stores/            # Pinia state management
├── models/            # TypeScript interfaces
├── components/        # Reusable Vue components
├── composables/       # Vue composables
├── layouts/           # Layout templates (default, blank)
└── navigation/
    └── vertical/
        └── index.ts   # เมนู sidebar
```

### Data Flow

```
Page (Vue SFC) → Store (Pinia) → API function (fetch) → Backend /api/v1/...
```

### เพิ่มหน้าใหม่ (เช่น `meals`)

1. `src/models/meal.ts` — TypeScript interfaces
2. `src/apis/meal-api.ts` — fetch functions
3. `src/stores/use-meal-store.ts` — Pinia store
4. `src/pages/meal-page.vue` — route สร้างอัตโนมัติจากชื่อไฟล์
5. เพิ่มเมนูใน `src/navigation/vertical/index.ts`

---

## คำสั่งที่ใช้บ่อย

### Backend

```bash
npm run dev              # dev server → http://localhost:8787
npm run typecheck        # ตรวจ TypeScript
npm run db:migrate:local # สร้าง tables ใน local
npm run db:migrate:remote# apply migrations ขึ้น Cloudflare
npm run deploy           # deploy ขึ้น Cloudflare Workers
npm run build:lambda     # build สำหรับ AWS Lambda
```

### Frontend

```bash
pnpm dev         # dev server → http://localhost:5173
pnpm typecheck   # ตรวจ TypeScript
pnpm build       # build production (output: dist/)
pnpm lint        # ตรวจ ESLint
```

---

## Resources

- [Hono Docs](https://hono.dev/docs/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Vue 3](https://vuejs.org/guide/)
- [Vuetify](https://vuetifyjs.com/)
- [Pinia](https://pinia.vuejs.org/)

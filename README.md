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
| Node.js | 22+ | https://nodejs.org |
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

**สำหรับ GitHub Actions** — เพิ่ม Secret ชื่อ `D1_DATABASE_ID` ค่าคือ `database_id` ที่ได้

### 4. สร้าง KV Namespace

```bash
npx wrangler kv namespace create CACHE
```

จะได้ output ประมาณนี้:
```
✅ Successfully created KV namespace 'CACHE'
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**สำหรับ GitHub Actions** — เพิ่ม Secret ชื่อ `KV_NAMESPACE_ID` ค่าคือ `id` ที่ได้

### 5. สร้าง wrangler.jsonc จาก template

`wrangler.jsonc` ถูก gitignore ไว้ (เพื่อป้องกัน ID จริงหลุดขึ้น repo) ต้อง copy จาก example ก่อนเสมอ:

```bash
cp wrangler.example.jsonc wrangler.jsonc
```

**สำหรับ Local Dev เท่านั้น** — ไม่ต้องใส่ค่าอะไรเพิ่ม ใช้ placeholder ได้เลย  
เพราะ `wrangler dev` จำลอง D1 และ KV ไว้ใน `.wrangler/state/` ในเครื่องให้อัตโนมัติ ไม่ได้ต่อ Cloudflare จริง

**สำหรับ Deploy Remote** — แก้ไข `wrangler.jsonc` ใส่ ID จริงที่ได้จากขั้นตอน 3-4:
```jsonc
"database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",   // ← จากขั้นตอน 3
"id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"                   // ← จากขั้นตอน 4
```

> GitHub Actions จะ generate `wrangler.jsonc` เองจาก Secrets ก่อน deploy — ไม่ต้องทำอะไรเพิ่ม

### 6. รัน migration สร้าง tables

```bash
# local (สำหรับ dev)
npm run db:migrate:local

# remote (สำหรับ production)
npm run db:migrate:remote
```

### 7. รัน dev server

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

# deploy
npx wrangler pages deploy dist --project-name=wellness-template-app --branch=main
```

URL หลัง deploy: `https://wellness-template-app.pages.dev`

---

## GitHub Actions — ตั้งค่า Secrets

Workflow (`.github/workflows/deploy.yml`) จะ trigger อัตโนมัติเมื่อ push ไป `main` และรันตามลำดับ:

1. **build-backend** และ **build-frontend** รันพร้อมกัน (parallel)
2. **deploy-backend** รอ build-backend เสร็จก่อน
3. **deploy-frontend** รอทั้ง build-frontend **และ** deploy-backend เสร็จก่อน

> **สำคัญ:** ต้อง [create Cloudflare Pages project](#frontend--cloudflare-pages) ก่อน 1 ครั้ง มิฉะนั้น deploy-frontend จะ error `Project not found`

ต้องตั้งค่า Secrets ทั้งหมด **6 ตัว** ที่ GitHub repo ก่อน deploy ถึงจะทำงานได้

### วิธีเพิ่ม Secret ใน GitHub

**GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

---

### Secret 1 — `CLOUDFLARE_API_TOKEN`

ใช้ใน: ทั้ง backend และ frontend

1. ไปที่ [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. คลิก **Create Token**
3. เลื่อนลงมาด้านล่าง คลิก **Get started** ใต้หัวข้อ **Create Custom Token**
4. ตั้งชื่อ Token เช่น `wellness-deploy`
5. ในส่วน **Permissions** คลิก **Add more** แล้วเพิ่มทีละบรรทัดดังนี้:

<div alight="center">
<img height="727" alt="image" src="https://github.com/user-attachments/assets/5407855d-2edd-475e-b05f-5c8c895deef5" />
</div>

   ```
   Account  |  Cloudflare Pages       |  Edit
   Account  |  Workers Scripts        |  Edit
   Account  |  Workers KV Storage     |  Edit
   Account  |  D1                     |  Edit
   ```

   > วิธีเพิ่มแต่ละบรรทัด: dropdown แรกเลือก `Account` → dropdown กลางพิมพ์ชื่อ เช่น `Pages` → dropdown ขวาเลือก `Edit`

7. ในส่วน **Account Resources** เลือก **Include** → **All accounts** (หรือเลือก account ที่ต้องการ)
8. คลิก **Continue to summary**
9. ตรวจสอบ permissions แล้วคลิก **Create Token**
10. **คัดลอก token ทันที** — Cloudflare จะแสดงครั้งเดียวเท่านั้น ถ้าปิดหน้าไปแล้วต้องสร้างใหม่
11. เพิ่มเป็น Secret ชื่อ `CLOUDFLARE_API_TOKEN`

---

### Secret 2 — `CLOUDFLARE_ACCOUNT_ID`

ใช้ใน: ทั้ง backend และ frontend

1. ไปที่ [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. คลิก **Workers & Pages** จากเมนูซ้าย
3. มองขวาบน จะเห็น **Account ID** (32 ตัวอักษร)
4. คัดลอก → เพิ่มเป็น Secret ชื่อ `CLOUDFLARE_ACCOUNT_ID`

---

### Secret 3 — `D1_DATABASE_ID`

ใช้ใน: backend

รันคำสั่งนี้ใน terminal (ต้อง login wrangler ก่อน):

```bash
npx wrangler d1 create wellness-db
```

Output:
```
✅ Successfully created DB 'wellness-db'

[[d1_databases]]
binding = "DB"
database_name = "wellness-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   ← คัดลอกอันนี้
```

คัดลอก `database_id` → เพิ่มเป็น Secret ชื่อ `D1_DATABASE_ID`

> Workflow จะ inject ค่านี้เข้า `wrangler.jsonc` อัตโนมัติก่อน deploy  
> ไม่ต้องแก้ไขไฟล์ใน repo ด้วยมือ

---

### Secret 4 — `KV_NAMESPACE_ID`

ใช้ใน: backend

```bash
npx wrangler kv namespace create CACHE
```

Output:
```
✅ Successfully created KV namespace 'CACHE'

[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"   ← คัดลอกอันนี้
```

คัดลอก `id` → เพิ่มเป็น Secret ชื่อ `KV_NAMESPACE_ID`

> Workflow จะ inject ค่านี้เข้า `wrangler.jsonc` อัตโนมัติก่อน deploy

---

### Secret 5 — `PAGES_PROJECT_NAME`

ใช้ใน: frontend

ชื่อ Cloudflare Pages project — ตั้งชื่อที่ unique เป็นของตัวเอง เช่น `my-wellness-app`

URL ที่ได้: `https://<PAGES_PROJECT_NAME>.pages.dev`

> ชื่อนี้ต้อง unique ทั่วโลก (ไม่ใช่แค่ในบัญชีของคุณ) ถ้าชื่อซ้ำจะ deploy ไม่ได้

---

### Secret 6 — `VITE_BACKEND_URL`

ใช้ใน: frontend

ค่านี้จะรู้ได้หลังจาก deploy backend สำเร็จครั้งแรก

1. รัน `npm run deploy` ใน folder `backend/` หรือรอให้ workflow ทำงานสำเร็จ
2. Cloudflare จะแสดง URL ของ Workers เช่น:
   ```
   https://wellness-backend.yourname.workers.dev
   ```
3. คัดลอก URL นั้น → เพิ่มเป็น Secret ชื่อ `VITE_BACKEND_URL`

---

### สรุป Secrets ทั้งหมด

| Secret | ใช้ใน |
|---|---|
| `CLOUDFLARE_API_TOKEN` | backend + frontend |
| `CLOUDFLARE_ACCOUNT_ID` | backend + frontend |
| `D1_DATABASE_ID` | backend |
| `KV_NAMESPACE_ID` | backend |
| `PAGES_PROJECT_NAME` | frontend |
| `VITE_BACKEND_URL` | frontend |

---

## Resources

- [Hono Docs](https://hono.dev/docs/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vue 3 Docs](https://vuejs.org/guide/)
- [Vuetify Docs](https://vuetifyjs.com/en/getting-started/installation/)
- [Pinia Docs](https://pinia.vuejs.org/introduction.html)

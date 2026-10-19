# RentFlow — Hệ thống quản lý phòng trọ

MVP quản lý phòng trọ cho chủ nhà: phòng, người thuê, chỉ số điện nước, hóa đơn (kèm xuất PDF tiếng Việt có dấu) và thanh toán, cùng dashboard tổng **quan**.

**Backend:** FastAPI + MongoDB (Motor) + Pydantic v2 + JWT
**Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind + TanStack Query + React Hook Form + Zod
**Database:** MongoDB (Atlas cho production, Docker cho local dev)

Toàn bộ code trong gói này đã được **build và test thật**: backend có 21 automated test (pytest) chạy qua toàn bộ luồng nghiệp vụ, frontend đã `tsc --noEmit` sạch và `next build` thành công cho cả 11 route.

---

## 1. Cấu trúc thư mục

```
rentflow/
├── docker-compose.yml      # MongoDB local cho dev (tùy chọn)
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app + CORS + router
│   │   ├── core/           # config (env), JWT, bcrypt
│   │   ├── db/             # kết nối MongoDB (Motor) + index
│   │   ├── models/         # Pydantic models (Create/Update/Public) từng entity
│   │   ├── api/routes/     # auth, rooms, tenants, meters, pricing, bills, payments, users, audit, issues, portal
│   │   ├── services/       # billing.py (tính hóa đơn), pdf.py (xuất PDF tiếng Việt)
│   │   └── assets/fonts/   # Noto Sans (Regular + Bold) — hỗ trợ đầy đủ dấu tiếng Việt trong PDF
│   ├── scripts/seed.py     # tạo tài khoản chủ trọ đầu tiên
│   ├── tests/              # 21 test (pytest) — auth, rooms, tenants, billing, payments, dashboard
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── app/                # Next.js App Router
    |   ├── register/
    │   ├── login/
    │   └── (dashboard)/    # layout bảo vệ + dashboard, rooms, tenants, meters, billing, payments, settings
    ├── components/
    │   ├── ui/             # Button, Input, Dialog, Table, Tabs, DropdownMenu... (kiểu shadcn/ui)
    │   ├── layout/         # Sidebar, Header, Providers (React Query + Toaster)
    │   └── {rooms,tenants,meters,billing,payments,dashboard}/
    ├── hooks/              # React Query hooks cho từng entity
    ├── schemas/            # Zod validation
    ├── types/              # TypeScript types khớp với response backend
    ├── lib/                # api-client (fetch + JWT), auth (lưu token), utils
    └── .env
```

---

## 2. Chạy local

### Yêu cầu

- Python 3.11+
- Node.js 20+
- Docker (nếu muốn chạy MongoDB local thay vì dùng Atlas ngay)

### Bước 1 — MongoDB

Nếu dùng Docker

- Mở

```bash
sudo docker compose up -d
```

- Tắt

```bash
sudo docker compose down
```

Hoặc bỏ qua bước này và dùng thẳng connection string MongoDB Atlas ở bước 2.

### Bước 2 — Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Sửa MONGODB_URI trong .env nếu dùng Atlas thay vì Docker

python scripts/seed.py        # tạo tài khoản chủ trọ đầu tiên
uvicorn app.main:app --reload --port 8000
```

Backend chạy tại `http://localhost:8000`, tài liệu API tự động tại `http://localhost:8000/docs`.

Tài khoản mặc định (đổi ngay sau khi đăng nhập lần đầu, hoặc set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` trong `.env` trước khi chạy seed):

```
Email: admin@rentflow.app
Mật khẩu: ChangeMe123!
```

### Bước 3 — Frontend

```bash
cd frontend
npm install   # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Mở `http://localhost:3000`.

### Chạy test backend

```bash
cd backend
pip install -r requirements-dev.txt
PYTHONPATH=. pytest tests/ -v
```

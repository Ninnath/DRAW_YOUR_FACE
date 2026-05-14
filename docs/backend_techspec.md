# Backend Tech Spec — Draw Your Face

> **Phase note:** Backend is not built in the prototype phase. This spec defines the planned API once frontend prototype is validated.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | FastAPI (Python 3.11+) | Async-native, auto OpenAPI docs, Pydantic validation built-in |
| Language | Python 3.11+ | Matches ML/CV ecosystem if hand tracking ever moves server-side |
| Database | PostgreSQL | Reliable, open-source, good async support via `asyncpg` |
| ORM / queries | SQLAlchemy 2 (async) + Alembic | Async query support; Alembic handles migrations |
| Auth | JWT via `python-jose` | Stateless; access + refresh token pattern |
| Validation | Pydantic v2 | Native to FastAPI; strict schema enforcement |
| File storage | Local filesystem (dev) / S3 (prod) via `boto3` | PNG blobs stay out of the DB |
| CORS | `fastapi.middleware.cors` | Allows Next.js dev server (`:3000`) to call API (`:8000`) |

---

## Directory Structure

```
server/
├── app/
│   ├── main.py                  # FastAPI app, middleware, router registration
│   ├── config.py                # settings via pydantic-settings (.env)
│   ├── database.py              # async SQLAlchemy engine + session
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── auth/
│   │   ├── router.py            # /auth endpoints
│   │   ├── service.py           # register, login, token logic
│   │   └── dependencies.py      # get_current_user dependency
│   ├── drawings/
│   │   ├── router.py            # /drawings endpoints
│   │   ├── service.py           # save, list, delete logic
│   │   └── storage.py           # local / S3 PNG write/read
│   └── migrations/
│       └── versions/
├── .env.example
├── requirements.txt
└── alembic.ini
```

---

## Database Schema

```sql
-- via Alembic migration

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,              -- bcrypt hash
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE drawings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  storage_key TEXT NOT NULL,             -- relative path or S3 object key
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON drawings (user_id, created_at DESC);
```

---

## API Endpoints

Base URL: `/api/v1`  
Auth-required routes expect `Authorization: Bearer <accessToken>`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Returns access + refresh tokens |
| POST | `/auth/refresh` | — | Rotate access token (refresh token in httpOnly cookie) |

**POST `/auth/register`**
```json
// request
{ "email": "user@example.com", "password": "hunter2" }

// 201
{ "id": "uuid", "email": "user@example.com" }
```

**POST `/auth/login`**
```json
// 200
{ "access_token": "eyJ...", "token_type": "bearer" }
// refresh token set as httpOnly cookie: refresh_token=eyJ...
```

---

### Drawings

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/drawings` | Required | List user's drawings |
| POST | `/drawings` | Required | Save a new drawing |
| GET | `/drawings/{id}` | Required | Get metadata + image URL |
| DELETE | `/drawings/{id}` | Required | Delete drawing |

**POST `/drawings`**
```json
// request
{ "title": "My Face", "image_data": "data:image/png;base64,iVBORw..." }

// 201
{ "id": "uuid", "title": "My Face", "created_at": "2026-05-14T10:00:00Z" }
```

**GET `/drawings`**
```json
// 200
{
  "drawings": [
    { "id": "uuid", "title": "My Face", "created_at": "..." }
  ]
}
```

**GET `/drawings/{id}`**
```json
// 200
{ "id": "uuid", "title": "My Face", "url": "https://...", "created_at": "..." }
// url = presigned S3 URL (prod) or /static/<key> (dev)
```

---

## Pydantic Schemas (`schemas.py`)

```python
class DrawingCreate(BaseModel):
    title: str | None = None
    image_data: str                  # base64 data URL

class DrawingOut(BaseModel):
    id: UUID
    title: str | None
    created_at: datetime

class DrawingDetail(DrawingOut):
    url: str                         # presigned or static URL

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

---

## Auth Flow

```
Client                          FastAPI
  │── POST /auth/login ────────▶│
  │◀── { access_token }  ───────│  access token:  15 min JWT
  │    + Set-Cookie: refresh    │  refresh token: 30 day JWT (httpOnly cookie)
  │                             │
  │── GET /drawings ───────────▶│  Authorization: Bearer <access_token>
  │   (Bearer header)           │  Depends(get_current_user) verifies JWT
  │◀── drawings list ───────────│
  │                             │
  │── POST /auth/refresh ──────▶│  reads httpOnly cookie automatically
  │◀── { access_token } ────────│  new 15-min token issued
```

### `dependencies.py`

```python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    payload = decode_access_token(token)   # raises HTTPException 401 on failure
    user = await db.get(User, payload["sub"])
    if not user:
        raise HTTPException(status_code=401)
    return user
```

---

## Storage Strategy

### Development (local)

```python
# storage.py
STORAGE_PATH = Path(settings.storage_local_path) / "drawings"

async def save_png(key: str, data: bytes) -> None:
    (STORAGE_PATH / key).write_bytes(data)
```

Served via `app.mount("/static", StaticFiles(directory=settings.storage_local_path))`.

### Production (S3)

```python
import boto3

s3 = boto3.client("s3")

async def save_png(key: str, data: bytes) -> None:
    s3.put_object(Bucket=settings.aws_bucket, Key=key, Body=data, ContentType="image/png")

def get_url(key: str) -> str:
    return s3.generate_presigned_url("get_object",
        Params={"Bucket": settings.aws_bucket, "Key": key}, ExpiresIn=900)
```

Base64 decode before storage:

```python
import base64, re

def decode_image_data(data_url: str) -> bytes:
    raw = re.sub(r"^data:image/png;base64,", "", data_url)
    return base64.b64decode(raw)
```

---

## `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.drawings.router import router as drawings_router

app = FastAPI(title="Draw Your Face API")

app.add_middleware(CORSMiddleware,
    allow_origins=[settings.client_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,     prefix="/api/v1/auth",     tags=["auth"])
app.include_router(drawings_router, prefix="/api/v1/drawings",  tags=["drawings"])
```

---

## Environment Variables (`.env`)

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/draw_your_face
JWT_SECRET=<random 256-bit string>
JWT_REFRESH_SECRET=<different random 256-bit string>
STORAGE_DRIVER=local          # "local" | "s3"
STORAGE_LOCAL_PATH=./storage
AWS_BUCKET=draw-your-face
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
CLIENT_ORIGIN=http://localhost:3000
```

---

## `requirements.txt`

```
fastapi>=0.111
uvicorn[standard]>=0.29
sqlalchemy[asyncio]>=2.0
asyncpg>=0.29
alembic>=1.13
pydantic[email]>=2.7
pydantic-settings>=2.2
python-jose[cryptography]>=3.3
passlib[bcrypt]>=1.7
boto3>=1.34
python-multipart>=0.0.9
```

---

## Dev Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

---

## Request Size Limit

A full canvas PNG at 1280×720 ≈ 500 KB–2 MB base64-encoded. Set uvicorn / nginx accordingly (default uvicorn limit is fine; set nginx `client_max_body_size 5m` in prod).

---

## Rate Limiting (production)

Use `slowapi` (FastAPI-compatible wrapper around `limits`):

- `POST /drawings`: 20 / hour per user
- `POST /auth/login`: 10 / 15 min per IP

---

## Non-Goals (v1)

- Video processing on the server (MediaPipe stays client-side)
- WebSocket / real-time collaboration
- Social features (sharing, galleries)
- Mobile push notifications

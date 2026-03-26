# 🌸 BLOOM Chatbot — Backend API

A neuroaffirming AI chat backend built with Node.js, Express, TypeScript, and the Vercel AI SDK.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| AI | Vercel AI SDK v6 (`anthropic/claude-sonnet-4.6`) |
| Primary DB | PostgreSQL via Prisma |
| Secondary DB | MongoDB via Mongoose |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.IO |
| Logging | Winston + Morgan |
| Validation | Joi |
| Testing | Jest + Supertest |

---

## Project Structure

```
bloomchat/
├── prisma/
│   └── schema.prisma          # PostgreSQL schema
├── src/
│   ├── main.ts                # Entry point + graceful shutdown
│   ├── app.ts                 # Express + Socket.IO setup
│   ├── config/
│   │   ├── environment.ts     # Validated environment variables
│   │   └── database.ts        # Prisma + Mongoose connections
│   ├── routes/                # Route definitions
│   ├── controllers/           # Request/response handlers
│   ├── services/              # Business logic + AI calls
│   ├── models/                # Mongoose schemas
│   ├── middleware/            # Auth, error handling, rate limiting
│   ├── utils/                 # Logger, error classes, response helpers
│   └── types/                 # Shared TypeScript types
├── tests/
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── .env.example
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### 1. Prerequisites

- Node.js >= 18
- PostgreSQL database
- MongoDB database

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bloomchat
MONGODB_URI=mongodb://localhost:27017/bloomchat
JWT_SECRET=your_32_char_minimum_secret_here
JWT_REFRESH_SECRET=your_32_char_minimum_refresh_secret
```

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the server

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

Server starts at `http://localhost:5000/api/v1`

---

## API Reference

### Health

```
GET /api/v1/health
```

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current user |

**Register**
```json
POST /api/v1/auth/register
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "securepassword"
}
```

**Login**
```json
POST /api/v1/auth/login
{
  "email": "alex@example.com",
  "password": "securepassword"
}
```

All protected routes require:
```
Authorization: Bearer <accessToken>
```

### Chat Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chat/sessions` | List sessions |
| POST | `/api/v1/chat/sessions` | Create session |
| GET | `/api/v1/chat/sessions/:id` | Get session |
| DELETE | `/api/v1/chat/sessions/:id` | Archive session |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chat/sessions/:id/messages` | Get history |
| POST | `/api/v1/chat/sessions/:id/messages` | Send message |
| POST | `/api/v1/chat/sessions/:id/stream` | Stream response (SSE) |

**Send message**
```json
POST /api/v1/chat/sessions/:id/messages
{
  "content": "Can you help me break this task into smaller steps?"
}
```

**Stream response (SSE)**
```
POST /api/v1/chat/sessions/:id/stream
Content-Type: text/event-stream

data: {"chunk": "Sure,"}
data: {"chunk": " here"}
data: {"chunk": " are..."}
data: [DONE]
```

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/profile` | Get profile |
| PATCH | `/api/v1/users/profile` | Update profile |
| DELETE | `/api/v1/users/account` | Delete account |

**Update profile**
```json
PATCH /api/v1/users/profile
{
  "name": "Alex",
  "preferences": {
    "theme": "dark",
    "fontSize": "large",
    "reduceMotion": true,
    "highContrast": false
  }
}
```

---

## Real-time (Socket.IO)

Connect at `ws://localhost:5000` with path `/socket.io`.

```js
const socket = io('http://localhost:5000', {
  auth: { token: '<accessToken>' }
});

// Join a chat session room
socket.emit('join:session', sessionId);
```

---

## Scripts

```bash
npm run dev             # Start dev server with hot reload
npm run build           # Compile TypeScript
npm start               # Start production server
npm test                # Run all tests
npm run test:coverage   # Run tests with coverage report
npm run prisma:studio   # Open Prisma DB browser
npm run prisma:migrate  # Run pending migrations
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `PORT` | No | `5000` | HTTP port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Min 32 chars |
| `JWT_EXPIRES_IN` | No | `7d` | Access token lifetime |
| `JWT_REFRESH_SECRET` | Yes | — | Min 32 chars |
| `JWT_REFRESH_EXPIRES_IN` | No | `30d` | Refresh token lifetime |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated CORS origins |
| `RATE_LIMIT_MAX` | No | `100` | Requests per window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Window in ms (15 min) |
| `LOG_LEVEL` | No | `debug` | `error` / `warn` / `info` / `debug` |
| `AI_MODEL` | No | `anthropic/claude-sonnet-4.6` | AI Gateway model string |
| `VERCEL_OIDC_TOKEN` | No | — | Auto-provisioned by `vercel env pull` |

---

## BLOOM AI Principles

The assistant is tuned to be neuroaffirming by default:

- Clear, direct, and unambiguous language
- No idioms, sarcasm, or figurative speech
- Complex tasks broken into small steps
- Choices offered rather than directives
- Calm, non-urgent tone — no alarming language
- Effort and progress celebrated, not just outcomes

---

## License

MIT

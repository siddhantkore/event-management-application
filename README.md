# Event Management Application

**Event Management Application** is a Node.js + Express backend for creating, managing and registering users for events. The project includes user authentication, event management, registrations, payment integration (Razorpay placeholders), email/SMS notifications (Nodemailer + Twilio), reporting, caching (Redis), logging, and basic CI/CD and containerization setup (Docker, Docker Compose, Kubernetes manifests). 

---

##  Key Features

- User authentication (signup/login/logout) with JWT
- Event creation, update, listing, search, categories and attendee management
- Event registration and registration management
- Payment initiation and verification (Razorpay integration hooks)
- Email and SMS notifications (Nodemailer + Twilio)
- Reporting and export utilities (Excel/PDF helpers present)
- Redis support for caching
- Logging with Pino/Winston and request logging middleware
- Docker & Docker Compose for local containerized development
- Jenkinsfile (basic pipeline) and example Kubernetes manifests

---

## Tech Stack

- Node.js (v18+)
- Express
- MongoDB (Mongoose)
- Redis (optional, for caching)
- Nodemailer, Twilio, Razorpay (integrations)
- Docker, Docker Compose
- ESLint (code linting)

---

## Quick Start (Local Development)

1. Clone the repo

```bash
git clone <repo-url>
cd Event-Management-Application
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

- Copy `.env.example` to `env/.env.development` (or to the root as `.env` if you prefer) and fill values.

4. Run the app in development

```bash
npm run dev
```

- The server defaults to `http://localhost:3000` (changeable via `PORT` env var).

---

## 🐳 Docker (Development)

The repo includes a `Dockerfile` and `docker-compose.yml` for a quick local stack with MongoDB and Redis.

```bash
# Build and run (development mode)
docker-compose up --build
```

Note: `docker-compose.yml` sets `MONGO_URI`, `REDIS_HOST`, and `REDIS_PORT`. The app uses `REDIS_URL` in code—see Known Issues below.

---

## Kubernetes

There are example manifests in `kubernetes/` (deployment, service, ingress). They are illustrative and need corrections before use in production (e.g. `apiVersion`, `replica` vs `replicas`, selectors). Use them as a starting point.

---

## 🧩 Environment Variables

Create `env/.env.development` (or `.env.production`) from `.env.example`. Some important variables used in the code:

- NODE_ENV, PORT
- MONGO_URI
- REDIS_URL (or REDIS_HOST and REDIS_PORT used in Docker Compose)
- JWT_SECRET, JWT_EXPIRES_IN
- EMAIL_USER, EMAIL_PASSWORD (for Gmail via Nodemailer)
- TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

---

## 📚 API Overview (Core Routes)

Base path: `/api`

- Auth: `/api/auth`
  - POST `/signup` — register
  - POST `/login` — login
  - GET `/logout` — logout

- Events: `/api/events`
  - GET `/` — list events
  - GET `/featured` — featured
  - GET `/:id` — event details
  - POST `/` — create event (protected)
  - PUT `/:id` — update event (protected + owner)
  - DELETE `/:id` — delete event (protected + owner)

- Users: `/api/users`
  - GET `/profile`, PUT `/profile`, DELETE `/profile` (protected)
  - Admin user management endpoints (protected + admin)

- Registration: `/api/registration`
  - POST `/` — create registration
  - GET `/my-registrations` — user registrations
  - GET `/event/:eventId` — event registrations (organizer)

- Payments: `/api/payments`
  - POST `/initiate` — start payment
  - POST `/verify` — verify payment
  - GET `/history` — user payments

- Reports: `/api/reports`
- Analytics: `/api/analytics`
- Health: `/api/health`

For details, consult the controllers in `controllers/` and route definitions in `routes/`.

---

## ✅ Scripts

- `npm run dev` — start dev server with nodemon
- `npm start` — production start (NODE_ENV=production)
- `npm run check-paths` — (helper) search for certain require patterns
- `npm test` — placeholder (no tests configured yet)

---

## ✅ Logging & Monitoring

- Request logging via `pino` middleware
- App logs using `pino` (config in `utils/logger.js`)

---

## 🧪 Tests

No tests are configured yet (see `tests/info.txt` recommending Jest). You can add tests (Jest/Mocha + Supertest) and update `package.json` `test` script.

---

## ⚠️ TODOs & Known Issues 

- Inconsistency between Redis env vars: code expects `REDIS_URL`, while `docker-compose.yml` sets `REDIS_HOST`/`REDIS_PORT`. Consider unifying to `REDIS_URL` or update `initializeCache.js` to construct URL from host/port.
- `env/` folder referenced in code (`env/.env.development`, `env/.env.production`) is not included — create these from `.env.example` and ensure `.gitignore` excludes secrets.
- Kubernetes manifests in `kubernetes/` are placeholders and need fixes before production deployment.
- Tests are missing — add unit/integration tests and update `npm test` script.

---

## 🙌 Contributing

Contributions are welcome! Please open an issue or submit a pull request. Add tests for new features and follow existing code style (ESLint configured).

---

## 📬 Contact

[Siddhant Kore(Email)](mailto:siddhskore@gmail.com)

---

## License

This project is licensed under the ISC License.

---
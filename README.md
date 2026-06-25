# SwiftURL

A URL shortener I built with Node.js, Express, PostgreSQL and Drizzle ORM. Has a dark-themed SPA frontend with auth, link management, custom short codes, etc.

## Stack

- **Backend:** Node.js + Express
- **DB:** PostgreSQL (hosted on Neon) + Drizzle ORM
- **Auth:** JWT
- **Validation:** Zod
- **Frontend:** Vanilla JS/HTML/CSS (no framework)

## Setup

```bash
git clone <your-repo-url>
cd SwiftURL
npm install
```

Create a `.env` in the root:

```
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your_jwt_secret_key
PORT=8000
```

Push the DB schema:

```bash
npm run db:push
```

Run it:

```bash
npm run dev
```

Then open http://localhost:8000

## API

### Auth

| Method | Endpoint | What it does |
| --- | --- | --- |
| POST | `/user/signup` | Create account |
| POST | `/user/login` | Get JWT token |

### URLs (need JWT)

| Method | Endpoint | What it does |
| --- | --- | --- |
| POST | `/shorten` | Shorten a URL (optional custom code) |
| GET | `/urls` | List your URLs |
| DELETE | `/urls/:id` | Delete a URL |
| GET | `/:shortcode` | Redirect (no auth needed) |

## Deploying

I used Railway + Neon for this:

1. Set up a Postgres DB on [Neon](https://neon.tech) and grab the connection string
2. Run `npm run db:push` locally to create the tables
3. Push to GitHub
4. On [Railway](https://railway.app), deploy from your repo and set these env vars:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — some random secret
   - `PORT` — `8000`
5. Generate a domain in Railway's settings and you're live

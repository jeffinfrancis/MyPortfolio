# MyPortfolio API

## Authentication

Set `MONGODB_URI` and `JWT_SECRET` in `.env` before starting the server. Use a
unique, randomly generated `JWT_SECRET` with at least 32 characters; do not use
the placeholder value in `.env.example` in production. Copy `.env.example` as a
starting point if needed.

Authentication endpoints:

- `POST /api/auth/signup` — JSON body: `{ "firstName", "lastName", "email",
  "password" }`. Passwords must be at least 8 characters. Returns a JWT and
  the public user.
- `POST /api/auth/signin` — JSON body: `{ "email", "password" }`. Returns a
  JWT and the public user.
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`. Returns the
  authenticated public user.

Access tokens use HS256 and expire after one hour. Store tokens securely on the
client and send them in the `Authorization` header for protected requests.

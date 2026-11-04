# Found-Link Kenya frontend

React and Vite frontend for the Found-Link Kenya document recovery API.

## Local setup

Install dependencies and create `.env.local` if it does not already exist:

```sh
npm install
test -f .env.local || cp .env.example .env.local
```

Set the Firebase web app configuration in `.env.local`. The Firebase client
configuration is public; never put Firebase service-account credentials or
database passwords in the frontend. `.env.local` is ignored by Git.

Set `VITE_API_URL` to the Django base URL, normally
`http://127.0.0.1:8000`, then start the frontend:

```sh
npm run dev
```

Enable Google and Email/Password sign-in in Firebase Authentication and add
`localhost` and `127.0.0.1` to its authorized domains.

Start Django separately from `backend/` if it is not already running:

```sh
cd ../backend
source venv/bin/activate
python manage.py runserver
```

## Authentication and Supabase database

Firebase handles Google and email/password authentication. New email/password
accounts must verify their email before using the protected dashboard.
`src/lib/api.js` sends the signed-in user's Firebase ID token to Django as a
bearer token.

Django verifies the token using Firebase's public signing certificates and
creates or updates the user's profile in its configured database. The backend
uses the `FIREBASE_PROJECT_ID` setting (defaults to `found-link-kenya`), so no
Firebase service-account key is needed for token verification. When
`DATABASE_URL` in the backend `.env` points to Supabase PostgreSQL, profile
details and application records are stored in that Supabase database. Users
and profiles are separate: authentication credentials remain in Firebase; the
backend-owned profile stores the Firebase UID, email, name, and application
role in Postgres. Never write directly to protected application tables from
the browser.

Grant officer or administrator roles only through Django admin or another
trusted backend process.

The dashboard loads `/api/documents/`. Document registration, search,
pickup-point, and detail routes are placeholders for subsequent work.

## Checks

```sh
npm run build
npm run lint
```

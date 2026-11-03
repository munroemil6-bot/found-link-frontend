# Found-Link Kenya frontend

React and Vite frontend for the Found-Link Kenya document recovery API.

## Local setup

Install dependencies and create the local environment file if it does not
already exist:

```sh
npm install
test -f .env.local || cp .env.example .env.local
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` using the
Supabase project's API settings. The anon/publishable key is intended for
browser use; never use a service-role key in the frontend. Keep `.env.local`
untracked. Set `VITE_API_URL` to the Django base URL (the default local backend
is `http://127.0.0.1:8000`). Restart Vite after changing environment variables.

Enable Email provider (and Google if using Google sign-in) in Supabase
Authentication. Add `http://localhost:5173/login`,
`http://127.0.0.1:5173/login`, and the password-reset URL to Supabase's allowed
redirect URLs. Configure the Google OAuth provider in Supabase if needed.

Start the frontend:

```sh
npm run dev
```

Start Django separately from `backend/` if it is not already running:

```sh
cd ../backend
source ../venv/bin/activate
python manage.py runserver
```

## Authentication and API

Supabase Google and email/password sign-in protect the dashboard routes. The
login page also supports email account creation and password reset. New
email/password accounts receive a verification email and cannot access the
dashboard until verified. `src/lib/api.js` attaches the signed-in user's
Supabase access token as a bearer token to every API request. Django verifies
that token with Supabase; the frontend does not create a Django session. The
signed-in profile must also have the appropriate backend role for write
operations.

Configure Django with `SUPABASE_URL` and `SUPABASE_ANON_KEY` as well. Email
verification links and password reset links are sent through Supabase's
configured email templates.

The dashboard currently loads `/api/documents/` and shows counts based on the
records returned by that endpoint. The document registration, search, pickup
point, and detail routes are present as placeholders for subsequent work.

## Checks

```sh
npm run build
npm run lint
```

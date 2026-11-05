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

The dashboard loads database-aggregated counts and the five latest entries from
`/api/documents/summary/`. The found-documents page fetches 20 records at a
time from `/api/documents/` and loads subsequent pages on demand; search is
debounced and performed by the backend. The registration form posts new
records to `/api/documents/`, and the pickup-points page loads
`/api/pickup-points/`. Selecting a document opens `/documents/:id`, which
retrieves and displays that record from `/api/documents/:id/`. The dedicated
search route is a placeholder for subsequent work.

## Checks

```sh
npm run build
npm run lint
```

## Deploy to Cloudflare Pages

This frontend is a static Vite app and can be deployed from GitHub with
Cloudflare Pages:

1. In Cloudflare, open **Workers & Pages → Create application → Pages →
   Connect to Git** and select the `found-link-frontend` repository.
2. Set the production branch to `main`.
3. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | React (Vite) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` |

4. In the Pages project settings, add the following build-time environment
   variables for both Production and Preview deployments:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (optional)
   - `VITE_API_URL` — set to `https://found-link-backend.onrender.com`

   Use the web app values from Firebase Project settings. These Firebase web
   configuration values are public client settings; never add a Firebase
   service-account key or database password to frontend variables.
5. In Firebase Authentication, enable the Google and Email/Password providers
   and add the deployed `*.pages.dev` hostname and any custom domain under
   **Authorized domains**.
6. In the Render backend's `CORS_ALLOWED_ORIGINS` environment setting, add the
   exact production Pages origin (for example, `https://your-project.pages.dev`)
   and any custom frontend domain, then redeploy the backend. Preview deployment
   origins must also be explicitly allowed before they can call the API.

Pages serves the SPA entry point for client-side routes such as `/login` and
`/documents` by default, so direct navigation and refresh work without a
custom redirect rule. Pushing to `main` triggers a production deployment when
the Git integration is enabled.

# Found-Link Kenya frontend

React and Vite frontend for the Found-Link Kenya document recovery API.

## Local setup

Install dependencies and create the local environment file if it does not
already exist (this preserves any Firebase values already configured locally):

```sh
npm install
test -f .env.local || cp .env.example .env.local
```

Set the Firebase web app values in `.env.local`. The Firebase project is
`found-link-kenya`; keep `.env.local` untracked. Set `VITE_API_URL` to the
Django base URL (the default local backend is `http://127.0.0.1:8000`).
Restart Vite after changing environment variables.

Enable Google as a sign-in provider in Firebase Authentication and add the
frontend's local hostname to Firebase's authorized domains. The frontend uses
Firebase web configuration only. Never put service-account credentials or
database passwords in this project.

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

Firebase Google sign-in protects the dashboard routes. `src/lib/api.js`
attaches the signed-in user's Firebase ID token as a bearer token to every API
request. Django verifies the token; the frontend does not create a Django
session. The signed-in profile must also have the appropriate backend role for
write operations.

The dashboard currently loads `/api/documents/` and shows counts based on the
records returned by that endpoint. The document registration, search, pickup
point, and detail routes are present as placeholders for subsequent work.

## Checks

```sh
npm run build
npm run lint
```

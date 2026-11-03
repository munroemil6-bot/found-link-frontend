# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Firebase Google sign-in

Copy `.env.example` to `.env.local` and fill in the Firebase web app values and
the Django API base URL. `.env.local` is ignored by Git. Enable Google as a
sign-in provider in the Firebase console and add your local development host to
the authorized domains. The Google login sends a Firebase ID token to
`/api/auth/firebase/`; the backend must verify that token before trusting it.
Firebase web configuration is public client configuration. Never put Firebase
service-account credentials in this frontend.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

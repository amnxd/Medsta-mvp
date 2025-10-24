## Medsta MVP

A Vite + React app with Tailwind, Firebase (Auth + Firestore), and a small Zustand store.

### Quick start
1) Install deps
```bash
npm install
```
2) Configure Firebase (required)
	 - Copy `.env.local.example` to `.env.local` and fill your Web App config from Firebase Console → Project settings → General → Your apps → Web app → Config.
	 - Required keys:
		 - `VITE_FIREBASE_API_KEY`
		 - `VITE_FIREBASE_AUTH_DOMAIN`
		 - `VITE_FIREBASE_PROJECT_ID`
		 - `VITE_FIREBASE_STORAGE_BUCKET`
		 - `VITE_FIREBASE_MESSAGING_SENDER_ID`
		 - `VITE_FIREBASE_APP_ID`
	 - Optional: `VITE_API_BASE_URL` (if you add a backend later)

3) Run the dev server
```bash
npm run dev
```

### Useful scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview build locally
- `npm run lint` — run ESLint
- `npm run firebase:login` — login to Firebase CLI
- `npm run deploy:rules` — deploy Firestore rules from `firestore.rules`

### Project layout (high level)
- `src/Services/` — firebase.js (env-based), phone.service.js, api.js (Axios)
- `src/Stores/` — authStore.js (Zustand)
- `src/Pages/` — pages (Login, Signup, Dashboards, etc.)
- `src/Components/` — UI and utilities (e.g., OtpModal, AddressPicker)
- `src/Components/router/ProtectedRoute.jsx` — auth/role guard
- `public/` — static assets

### Firebase notes
- Create Firestore and enable authentication providers you use (Email/Password; Phone if linking phone numbers).
- Authorized domains should include localhost/127.0.0.1 for local dev.
- Default project in `.firebaserc` is set to `medsta` (change if needed).

### Troubleshooting
- `auth/invalid-api-key` or `[Firebase] Missing required env values` → check `.env.local` keys and restart `npm run dev`.
- Permission errors → ensure Firestore is created and rules are deployed: `npm run deploy:rules`.

### Pull latest
```bash
git pull
npm install
npm run dev
```
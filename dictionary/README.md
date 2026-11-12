# Dictionary

## Firebase bookmarks

Bookmarks are stored in Cloud Firestore under each user's Firebase Auth ID.
To enable them in the Firebase project:

1. Enable **Authentication → Sign-in method → Anonymous** and **Google**.
2. Create a Cloud Firestore database.
3. Publish the rules from [`firestore.rules`](./firestore.rules) in the Firestore
   Rules tab.
4. Add the app's local and deployed domains to Firebase Authentication's
   authorized domains.

The app starts with an anonymous session so bookmarks work before login. Choose
**Sign in with Google** to link that session to your Google account and keep its
bookmarks. If the Google account already has an account in this app, the app
signs into it and copies across guest bookmarks that are not already saved.
Signing out returns to a new anonymous session.

The Firebase web configuration is in `src/firebase.ts`. Firebase web API keys
identify the project and should also be restricted to the app's domains in
Google Cloud Console. Before linking a Google account, guest bookmarks are
specific to the browser's anonymous account; clearing its site data may create
a different account.

## Development

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Build the app with `npm run build`.

import { useCallback, useEffect, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
  signInWithPopup,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { Link, Routes, Route } from "react-router";
import './App.css';
import Bookmarks from "./components/Bookmarks";
import Home from "./components/Home";
import { auth, db } from "./firebase";
import { useBookmarks } from "./hooks/useBookmarks";

async function copyGuestBookmarks(
  userId: string,
  guestBookmarks: QueryDocumentSnapshot<DocumentData>[],
) {
  if (!guestBookmarks.length) {
    return;
  }

  const destination = await getDocs(collection(db, "users", userId, "bookmarks"));
  const existingIds = new Set(destination.docs.map((bookmark) => bookmark.id));
  const missingBookmarks = guestBookmarks.filter((bookmark) => !existingIds.has(bookmark.id));

  for (let start = 0; start < missingBookmarks.length; start += 450) {
    const batch = writeBatch(db);
    missingBookmarks.slice(start, start + 450).forEach((bookmark) => {
      batch.set(doc(db, "users", userId, "bookmarks", bookmark.id), bookmark.data());
    });
    await batch.commit();
  }
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const signInStarted = useRef(false);
  const userId = user?.uid ?? null;
  const { bookmarks, loading, error, toggleBookmark, pendingWords } = useBookmarks(userId);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
      signInStarted.current = false;
      setAuthError(null);
      return;
    }

    setUser(null);
    if (signInStarted.current) {
      return;
    }

    signInStarted.current = true;
    signInAnonymously(auth).catch((cause: unknown) => {
      console.error("Could not sign in to Firebase.", cause);
      setAuthError("Could not connect to Firebase. Please try again later.");
      signInStarted.current = false;
    });
  }), []);

  const handleGoogleSignIn = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);

    try {
      const currentUser = auth.currentUser;
      if (currentUser?.isAnonymous) {
        const guestBookmarks = await getDocs(
          collection(db, "users", currentUser.uid, "bookmarks"),
        );

        try {
          await linkWithPopup(currentUser, new GoogleAuthProvider());
        } catch (cause) {
          if (!(cause instanceof FirebaseError) || cause.code !== "auth/credential-already-in-use") {
            throw cause;
          }

          const credential = GoogleAuthProvider.credentialFromError(cause);
          if (!credential) {
            throw cause;
          }

          const result = await signInWithCredential(auth, credential);
          try {
            await copyGuestBookmarks(result.user.uid, guestBookmarks.docs);
          } catch (migrationError) {
            console.error("Google sign-in succeeded, but guest bookmarks could not be copied.", migrationError);
            setAuthError("You are signed in, but some guest bookmarks could not be transferred.");
          }
        }
      } else {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }
    } catch (cause) {
      console.error("Could not sign in with Google.", cause);
      if (cause instanceof FirebaseError && cause.code === "auth/popup-closed-by-user") {
        return;
      }
      setAuthError("Could not sign in with Google. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (cause) {
      console.error("Could not sign out.", cause);
      setAuthError("Could not sign out. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const savedWords = new Set(bookmarks.map((bookmark) => bookmark.word.toLowerCase()));
  const appError = authError ?? error;
  const isGoogleUser = Boolean(user && !user.isAnonymous);

  return (
    <>
      <nav className="app-nav" aria-label="Main navigation">
        <Link className="app-brand" to="/">Dictionary</Link>
        <div className="app-nav-links">
          <Link to="/">Search</Link>
          <Link to="/bookmarks">Bookmarks</Link>
        </div>
        <div className="auth-controls">
          {isGoogleUser ? (
            <>
              <span className="account-label">{user?.displayName ?? user?.email}</span>
              <button className="auth-button" type="button" disabled={authBusy} onClick={() => void handleSignOut()}>
                {authBusy ? "Please wait..." : "Sign out"}
              </button>
            </>
          ) : (
            <button className="auth-button" type="button" disabled={authBusy} onClick={() => void handleGoogleSignIn()}>
              {authBusy ? "Please wait..." : "Sign in with Google"}
            </button>
          )}
        </div>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              bookmarks={savedWords}
              pendingWords={pendingWords}
              error={appError}
              onToggleBookmark={toggleBookmark}
            />
          }
        />
        <Route
          path="/search"
          element={
            <Home
              bookmarks={savedWords}
              pendingWords={pendingWords}
              error={appError}
              onToggleBookmark={toggleBookmark}
            />
          }
        />
        <Route
          path="/bookmarks"
          element={
            <Bookmarks
              entries={bookmarks}
              loading={!authError && (loading || !userId)}
              pendingWords={pendingWords}
              error={appError}
              onToggleBookmark={toggleBookmark}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;

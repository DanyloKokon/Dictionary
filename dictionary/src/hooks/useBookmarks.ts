import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import type { DictionaryEntry } from "../components/api";
import { db } from "../firebase";

export type BookmarkedEntry = DictionaryEntry & {
  id: string;
  savedAt?: Timestamp | null;
};

type UseBookmarksResult = {
  bookmarks: BookmarkedEntry[];
  loading: boolean;
  error: string | null;
  pendingWords: Set<string>;
  toggleBookmark: (entry: DictionaryEntry) => Promise<void>;
};

const wordKey = (word: string) => word.trim().toLowerCase();

export function useBookmarks(userId: string | null): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<BookmarkedEntry[]>([]);
  const [initializedUserId, setInitializedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingWords, setPendingWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      return;
    }

    const bookmarksRef = collection(db, "users", userId, "bookmarks");
    return onSnapshot(bookmarksRef, (snapshot) => {
      const entries = snapshot.docs.map((bookmark) => ({
        ...bookmark.data(),
        id: bookmark.id,
      })) as BookmarkedEntry[];
      entries.sort((a, b) => (b.savedAt?.toMillis() ?? 0) - (a.savedAt?.toMillis() ?? 0));
      setBookmarks(entries);
      setInitializedUserId(userId);
      setError(null);
    }, (cause: Error) => {
      console.error("Could not load bookmarks from Firebase.", cause);
      setError("Could not load bookmarks. Please check your Firebase configuration.");
      setInitializedUserId(userId);
    });
  }, [userId]);

  const toggleBookmark = useCallback(async (entry: DictionaryEntry) => {
    if (!userId) {
      setError("Bookmarks are unavailable until Firebase sign-in completes.");
      return;
    }

    const key = wordKey(entry.word);
    setPendingWords((current) => new Set(current).add(key));
    setError(null);

    try {
      const bookmarkRef = doc(db, "users", userId, "bookmarks", encodeURIComponent(key));
      if (bookmarks.some((bookmark) => wordKey(bookmark.word) === key)) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          word: entry.word,
          meanings: entry.meanings ?? [],
          savedAt: serverTimestamp(),
        });
      }
    } catch (cause) {
      console.error("Could not update bookmark in Firebase.", cause);
      setError("Could not save your bookmark. Please try again.");
    } finally {
      setPendingWords((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  }, [bookmarks, userId]);

  return {
    bookmarks: userId === initializedUserId ? bookmarks : [],
    loading: Boolean(userId && userId !== initializedUserId),
    error,
    pendingWords,
    toggleBookmark,
  };
}

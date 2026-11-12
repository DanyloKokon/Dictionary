import { IoBookmarksOutline } from "react-icons/io5";
import type { DictionaryEntry } from "./api";
import type { BookmarkedEntry } from "../hooks/useBookmarks";
import Info from "./Infor";

type BookmarksProps = {
  entries: BookmarkedEntry[];
  loading: boolean;
  pendingWords: Set<string>;
  error: string | null;
  onToggleBookmark: (entry: DictionaryEntry) => Promise<void>;
};

function Bookmarks({ entries, loading, pendingWords, error, onToggleBookmark }: BookmarksProps) {
  const savedWords = new Set(entries.map((entry) => entry.word.toLowerCase()));

  return (
    <main className="dictionary-page">
      <section className="bookmark-panel">
        <div className="bookmark-title">
          <IoBookmarksOutline aria-hidden="true" />
          <div>
            <p className="eyebrow">Your collection</p>
            <h1>Bookmarked words</h1>
          </div>
        </div>
        <p className="bookmark-count">
          {entries.length} {entries.length === 1 ? "word" : "words"} saved
        </p>
      </section>

      <section className="results">
        {error && <div className="error-state" role="alert">{error}</div>}
        {loading ? (
          <div className="empty-state">Loading your bookmarks...</div>
        ) : entries.length ? (
          <Info
            res={entries}
            bookmarks={savedWords}
            pendingWords={pendingWords}
            onToggleBookmark={onToggleBookmark}
            collapsible
          />
        ) : (
          <div className="empty-state">No bookmarked words yet. Search for a word and save it here.</div>
        )}
      </section>
    </main>
  );
}

export default Bookmarks;

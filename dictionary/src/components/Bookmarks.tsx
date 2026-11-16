import { IoBookmarksOutline } from "react-icons/io5";
import { useState } from "react";
import type { DictionaryEntry } from "./api";
import type { BookmarkedEntry } from "../hooks/useBookmarks";
import Info from "./Infor";

type BookmarksProps = {
  entries: BookmarkedEntry[];
  loading: boolean;
  pendingWords: Set<string>;
  error: string | null;
  onToggleBookmark: (entry: DictionaryEntry) => Promise<void>;
  onSetCategory: (word: string, category: string) => Promise<void>;
};

function Bookmarks({
  entries,
  loading,
  pendingWords,
  error,
  onToggleBookmark,
  onSetCategory,
}: BookmarksProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const savedWords = new Set(entries.map((entry) => entry.word.toLowerCase()));
  const categories = [...new Set(entries.map((entry) => entry.category?.trim() || "Uncategorized"))]
    .sort((a, b) => a.localeCompare(b));
  const selectedCategory = activeCategory === "All" || categories.includes(activeCategory)
    ? activeCategory
    : "All";
  const visibleEntries = selectedCategory === "All"
    ? entries
    : entries.filter((entry) => (entry.category?.trim() || "Uncategorized") === selectedCategory);

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
          <>
            <div className="bookmark-categories" aria-label="Filter bookmarks by category">
              {["All", ...categories].map((category) => (
                <button
                  className={selectedCategory === category ? "is-active" : ""}
                  type="button"
                  key={category}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                  {category === "All" && <span>{entries.length}</span>}
                  {category !== "All" && (
                    <span>{entries.filter((entry) => (entry.category?.trim() || "Uncategorized") === category).length}</span>
                  )}
                </button>
              ))}
            </div>
            <Info
              res={visibleEntries}
              bookmarks={savedWords}
              pendingWords={pendingWords}
              onToggleBookmark={onToggleBookmark}
              categories={categories}
              categoryForWord={(word) => entries.find((entry) => entry.word.toLowerCase() === word.toLowerCase())?.category?.trim() || "Uncategorized"}
              onSetCategory={onSetCategory}
              collapsible
            />
          </>
        ) : (
          <div className="empty-state">No bookmarked words yet. Search for a word and save it here.</div>
        )}
      </section>
    </main>
  );
}

export default Bookmarks;

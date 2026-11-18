import { useId, useState, type FormEvent } from "react";
import type { DictionaryEntry } from "./api";
import { IoBookmarks, IoBookmarksOutline, IoChevronDown } from "react-icons/io5";

type InfoProps = {
    res: DictionaryEntry[];
    bookmarks: Set<string>;
    pendingWords: Set<string>;
    onToggleBookmark: (entry: DictionaryEntry) => Promise<void>;
    categories?: string[];
    categoryForWord?: (word: string) => string;
    onSetCategory?: (word: string, category: string) => Promise<void>;
    collapsible?: boolean;
    className?: string;
};

function CategoryControl({
    word,
    category,
    categories,
    disabled,
    onSetCategory,
}: {
    word: string;
    category: string;
    categories: string[];
    disabled: boolean;
    onSetCategory: (word: string, category: string) => Promise<void>;
}) {
    const [newCategory, setNewCategory] = useState("");

    const addCategory = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = newCategory.trim();
        if (!value) {
            return;
        }
        void onSetCategory(word, value);
        setNewCategory("");
    };

    return (
        <div className="entry-category">
            <label>
                Category
                <select
                    value={category}
                    disabled={disabled}
                    onChange={(event) => void onSetCategory(word, event.target.value)}
                >
                    {categories.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
            </label>
            <form onSubmit={addCategory}>
                <input
                    aria-label={`New category for ${word}`}
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    placeholder="New category"
                    disabled={disabled}
                />
                <button type="submit" disabled={disabled || !newCategory.trim()}>Add</button>
            </form>
        </div>
    );
}

function Info({
    res,
    bookmarks,
    pendingWords,
    onToggleBookmark,
    categories = [],
    categoryForWord,
    onSetCategory,
    collapsible = false,
    className,
}: InfoProps) {
    const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());
    const detailsId = useId();

    if (!res.length) {
        return null;
    }

    return (
        <div className={className}>
            {res.map((entry, index) => {
                const wordKey = entry.word.toLowerCase();
                const isBookmarked = bookmarks.has(wordKey);
                const isExpanded = expandedWords.has(wordKey);
                const entryDetailsId = `${detailsId}-${index}`;

                return (
                    <section className="dictionary-entry" key={`${entry.word}-${index}`}>
                        <div className="entry-heading">
                            <div className="entry-title">
                                <h2>{entry.word}</h2>
                                {collapsible && (
                                    <button
                                        className={`details-toggle ${isExpanded ? "is-expanded" : ""}`}
                                        type="button"
                                        aria-label={`${isExpanded ? "Hide" : "Show"} details for ${entry.word}`}
                                        aria-expanded={isExpanded}
                                        aria-controls={entryDetailsId}
                                        onClick={() => {
                                            setExpandedWords((current) => {
                                                const next = new Set(current);
                                                if (next.has(wordKey)) {
                                                    next.delete(wordKey);
                                                } else {
                                                    next.add(wordKey);
                                                }
                                                return next;
                                            });
                                        }}
                                    >
                                        <IoChevronDown aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <button
                                className={`bookmark-button ${isBookmarked ? "is-bookmarked" : ""}`}
                                type="button"
                                aria-label={`${isBookmarked ? "Remove" : "Add"} ${entry.word} ${isBookmarked ? "from" : "to"} bookmarks`}
                                aria-pressed={isBookmarked}
                                disabled={pendingWords.has(wordKey)}
                                onClick={() => void onToggleBookmark(entry)}
                            >
                                {isBookmarked ? <IoBookmarks /> : <IoBookmarksOutline />}
                                {isBookmarked ? "Saved" : "Bookmark"}
                            </button>
                        </div>
                        {onSetCategory && (
                            <CategoryControl
                                word={entry.word}
                                category={categoryForWord?.(entry.word) ?? "Uncategorized"}
                                categories={categories}
                                disabled={pendingWords.has(wordKey)}
                                onSetCategory={onSetCategory}
                            />
                        )}
                        <div
                            className={`entry-details ${!collapsible || isExpanded ? "is-visible" : ""}`}
                            id={entryDetailsId}
                        >
                            {entry.meanings?.map((meaning, meaningIndex) => (
                                <div className="meaning-block" key={`${meaning.partOfSpeech ?? "meaning"}-${meaningIndex}`}>
                                    <p><strong>{meaning.partOfSpeech ?? "Definition"}</strong></p>
                                    <ul className="definition-list">
                                        {meaning.definitions?.map((definition, definitionIndex) => (
                                            <li key={`${definition.definition ?? "definition"}-${definitionIndex}`}>
                                                {definition.definition}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export default Info;
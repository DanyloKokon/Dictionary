import type { DictionaryEntry } from "./api";
import { IoBookmarks, IoBookmarksOutline } from "react-icons/io5";

type InfoProps = {
    res: DictionaryEntry[];
    bookmarks: Set<string>;
    pendingWords: Set<string>;
    onToggleBookmark: (entry: DictionaryEntry) => Promise<void>;
};

function Info({ res, bookmarks, pendingWords, onToggleBookmark }: InfoProps) {
    if (!res.length) {
        return null;
    }

    return (
        <div>
            {res.map((entry, index) => {
                const wordKey = entry.word.toLowerCase();
                const isBookmarked = bookmarks.has(wordKey);

                return (
                    <section className="dictionary-entry" key={`${entry.word}-${index}`}>
                        <div className="entry-heading">
                            <h2>{entry.word}</h2>
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
                    </section>
                );
            })}
        </div>
    );
}

export default Info;
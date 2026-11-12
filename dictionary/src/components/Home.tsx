import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { fetchData, type DictionaryEntry } from "./api";
import Info from "./Infor";

type HomeProps = {
    bookmarks: Set<string>;
    pendingWords: Set<string>;
    error: string | null;
    onToggleBookmark: (entry: DictionaryEntry) => Promise<void>;
};

function Home({ bookmarks, pendingWords, error, onToggleBookmark }: HomeProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [inp, setInp] = useState<string>(searchParams.get("word") ?? "");
    const [result, setResult] = useState<DictionaryEntry[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const word = inp.trim();
        if (!word) {
            setResult([]);
            return;
        }

        setSearchParams({ word });
        setSearching(true);
        try {
            const response = await fetchData(word);
            setResult(response);
        } finally {
            setSearching(false);
            setInp('')
        }
    };

    return (
        <main className="dictionary-page">
            <section className="search-panel">
                <p className="eyebrow">Dictionary</p>
                <h1>Find the meaning of any word</h1>

                <form className="dictionary-form" onSubmit={handleSubmit}>
                    <input
                        className="search-input"
                        value={inp}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInp(value);
                            setSearchParams({ word: value });
                        }}
                        type="text"
                        placeholder="Type a word..."
                        aria-label="Search word"
                    />
                    <button className="search-button" type="submit" disabled={searching}>
                        {searching ? "Searching..." : "Search"}
                    </button>
                </form>
            </section>

            <section className="results">
                {error && <div className="error-state" role="alert">{error}</div>}
                {result.length > 0 ? (
                    <Info
                        res={result}
                        bookmarks={bookmarks}
                        pendingWords={pendingWords}
                        onToggleBookmark={onToggleBookmark}
                    />
                ) : (
                    <div className="empty-state">
                        {searching ? "Looking up your word..." : "Search for a word to see definitions."}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Home;
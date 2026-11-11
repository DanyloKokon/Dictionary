import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { fetchData } from "./api";
import Info from "./Infor";

function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [inp, setInp] = useState<string>(searchParams.get("word") ?? "");
    const [result, setResult] = useState<any[]>([]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const word = inp.trim();
        if (!word) {
            setResult([]);
            return;
        }

        setSearchParams({ word });
        const response = await fetchData(word);
        setResult(response);
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
                    <button className="search-button" type="submit">Search</button>
                </form>
            </section>

            <section className="results">
                {result.length > 0 ? <Info res={result} /> : <div className="empty-state">Search for a word to see definitions.</div>}
            </section>
        </main>
    );
}

export default Home;
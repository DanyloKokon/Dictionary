import type { DictionaryEntry } from "./api";

type InfoProps = {
    res: DictionaryEntry[];
};

function Info({ res }: InfoProps) {
    if (!res.length) {
        return null;
    }

    return (
        <div>
            {res.map((entry, index) => (
                <section className="dictionary-entry" key={`${entry.word}-${index}`}>
                    <h2>{entry.word}</h2>
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
            ))}
        </div>
    );
}

export default Info;
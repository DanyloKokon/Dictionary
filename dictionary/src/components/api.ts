export type DictionaryEntry = {
    word: string;
    meanings?: Array<{
        partOfSpeech?: string;
        definitions?: Array<{
            definition?: string;
        }>;
    }>;
};

export const fetchData = async (word: string): Promise<DictionaryEntry[]> => {
    if (!word.trim()) {
        return [];
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
        if (!response.ok) {
            throw new Error(`API error! Status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? (data as DictionaryEntry[]) : [];
    } catch (error) {
        console.error(error);
        return [];
    }
};
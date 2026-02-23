const STORAGE_KEY = 'pos_daily_token';

interface TokenStore {
    date: string; // YYYY-MM-DD
    token: number;
}

function getTodayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Increments and returns today's token number.
 * Automatically resets to 1 if the stored date is not today.
 */
export function getNextToken(): number {
    const today = getTodayString();
    const raw = localStorage.getItem(STORAGE_KEY);

    let store: TokenStore = { date: today, token: 0 };

    if (raw) {
        try {
            const parsed: TokenStore = JSON.parse(raw);
            if (parsed.date === today) {
                store = parsed;
            }
            // else: date mismatch → reset (store stays at token: 0)
        } catch {
            // corrupt data → reset
        }
    }

    store.token += 1;
    store.date = today;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store.token;
}

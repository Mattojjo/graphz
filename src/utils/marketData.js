// In the browser, requests go through Vite's dev proxy (/yf → query1.finance.yahoo.com)
// which adds the missing CORS headers. In Node/test environments hit Yahoo directly.
const YF_BASE = typeof window !== 'undefined' ? '/yf' : 'https://query1.finance.yahoo.com';

const YF_PARAMS = {
    '1m':  { interval: '1m',  range: '1d' },
    '3m':  { interval: '1m',  range: '2d',  aggregate: 3 },
    '5m':  { interval: '5m',  range: '5d' },
    '15m': { interval: '15m', range: '60d' },
    '1h':  { interval: '60m', range: '60d' },
    '2h':  { interval: '60m', range: '60d', aggregate: 2 },
    '4h':  { interval: '60m', range: '60d', aggregate: 4 },
    '1D':  { interval: '1d',  range: '2y' },
    // '1s' is not supported by Yahoo; caller handles this
};

const aggregateCandles = (candles, n) => {
    const result = [];
    for (let i = 0; i < candles.length; i += n) {
        const bucket = candles.slice(i, i + n);
        if (bucket.length === 0) continue;
        result.push({
            time:   bucket[0].time,
            open:   bucket[0].open,
            high:   Math.max(...bucket.map(c => c.high)),
            low:    Math.min(...bucket.map(c => c.low)),
            close:  bucket[bucket.length - 1].close,
            volume: bucket.reduce((s, c) => s + c.volume, 0),
        });
    }
    return result;
};

/**
 * Fetch OHLCV candles from Yahoo Finance for a given symbol + timeframe.
 * Returns array of { time (unix seconds), open, high, low, close, volume }.
 * Returns null for '1s' timeframe (not supported).
 * Throws on network error or unexpected response shape.
 */
export const fetchCandles = async (symbol, timeframe) => {
    const params = YF_PARAMS[timeframe];
    if (!params) return null;

    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${params.interval}&range=${params.range}&includePrePost=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Yahoo Finance ${res.status}`);

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result?.timestamp) throw new Error('No chart data returned');

    const { timestamp, indicators: { quote: [q] } } = result;

    let candles = timestamp
        .map((t, i) => ({
            time:   t,
            open:   q.open[i],
            high:   q.high[i],
            low:    q.low[i],
            close:  q.close[i],
            volume: q.volume[i] ?? 0,
        }))
        .filter(c => c.open != null && c.close != null && !isNaN(c.open));

    const seen = new Set();
    candles = candles.filter(c => !seen.has(c.time) && seen.add(c.time));

    if (params.aggregate) candles = aggregateCandles(candles, params.aggregate);

    return candles;
};

/**
 * Batch-fetch current quotes for multiple symbols using the chart meta endpoint.
 * The /v7/finance/quote endpoint now requires auth; chart meta doesn't.
 * Returns { AAPL: { price, change, changePercent }, ... }
 */
export const fetchQuotes = async (symbols) => {
    const settled = await Promise.allSettled(
        symbols.map(async (symbol) => {
            const res = await fetch(`${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const meta = json?.chart?.result?.[0]?.meta;
            if (!meta?.regularMarketPrice) throw new Error('no price');
            const price = meta.regularMarketPrice;
            const prev = meta.chartPreviousClose ?? price;
            const change = price - prev;
            return { symbol, price, change, changePercent: prev ? (change / prev) * 100 : 0 };
        })
    );
    return settled.reduce((acc, r) => {
        if (r.status === 'fulfilled') {
            const { symbol, ...rest } = r.value;
            acc[symbol] = rest;
        }
        return acc;
    }, {});
};

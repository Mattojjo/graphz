const YF_BASE = 'https://query1.finance.yahoo.com';

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
 * Batch-fetch current quotes for multiple symbols.
 * Returns { AAPL: { price, change, changePercent }, ... }
 */
export const fetchQuotes = async (symbols) => {
    const url = `${YF_BASE}/v7/finance/quote?symbols=${symbols.join(',')}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Yahoo Finance ${res.status}`);
    const json = await res.json();
    const results = json?.quoteResponse?.result ?? [];
    return results.reduce((acc, q) => {
        acc[q.symbol] = {
            price:         q.regularMarketPrice ?? null,
            change:        q.regularMarketChange ?? 0,
            changePercent: q.regularMarketChangePercent ?? 0,
        };
        return acc;
    }, {});
};

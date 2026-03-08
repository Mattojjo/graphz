import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useTradingContext } from '../context/TradingContext';
import { formatCurrency, formatVolume } from '../utils/format';

const CHART_CONFIG = {
    padding: { top: 10, right: 70, bottom: 80, left: 50 },
    volumeHeight: 60,
    gridLines: 8,
    candleMinWidth: 2,
    candleMaxWidth: 12,
    ma20Period: 20,
    // colors will be read from CSS vars where possible
    backgroundColor: 'var(--card-bg)',
    gridColor: 'var(--chart-grid)',
    textColor: 'var(--chart-text)',
    font: '11px "SF Mono", Consolas, monospace',
    greenColor: 'var(--success)',
    redColor: 'var(--danger)',
    maColor: 'var(--accent)',
};

const prepareCanvas = (canvas) => {
    const ctx = canvas.getContext && canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    if (!ctx) {
        // Provide a no-op stub for server-side / JSDOM environments where canvas isn't implemented
        const noop = () => {};
        const stub = {
            setTransform: noop,
            fillRect: noop,
            beginPath: noop,
            moveTo: noop,
            lineTo: noop,
            stroke: noop,
            fillText: noop,
            measureText: () => ({ width: 0 }),
            clearRect: noop,
            fill: noop,
            strokeRect: noop,
            closePath: noop,
            arc: noop,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: 'left',
            textBaseline: 'middle'
        };
        return { ctx: stub, width, height };
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
};

const readCssColors = () => {
    try {
        const css = getComputedStyle(document.documentElement);
        return {
            backgroundColor: css.getPropertyValue('--card-bg').trim() || CHART_CONFIG.backgroundColor,
            gridColor: css.getPropertyValue('--chart-grid').trim() || CHART_CONFIG.gridColor,
            textColor: css.getPropertyValue('--chart-text').trim() || CHART_CONFIG.textColor,
            greenColor: css.getPropertyValue('--success').trim() || CHART_CONFIG.greenColor,
            redColor: css.getPropertyValue('--danger').trim() || CHART_CONFIG.redColor,
            maColor: css.getPropertyValue('--accent').trim() || CHART_CONFIG.maColor,
        };
    } catch (e) {
        return {};
    }
};

const getPriceStats = (data) => {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);
    const minPrice = Math.min(...lows);
    const maxPrice = Math.max(...highs);
    const priceRange = maxPrice - minPrice || 1;
    const maxVolume = Math.max(...volumes);
    return { minPrice, maxPrice, priceRange, maxVolume };
};

const getScales = (width, height, dataLength, priceRange) => {
    const { padding, volumeHeight, candleMinWidth, candleMaxWidth } = CHART_CONFIG;
    const chartHeight = height - padding.top - padding.bottom - volumeHeight;
    const chartWidth = width - padding.left - padding.right;
    const candleWidth = Math.max(candleMinWidth, Math.min(candleMaxWidth, chartWidth / dataLength - 2));
    const xScale = chartWidth / dataLength;
    const yScale = chartHeight / priceRange;
    const volumeY = height - volumeHeight - 10;
    return { chartHeight, chartWidth, candleWidth, xScale, yScale, volumeY };
};

const calculateMA = (data, period) => {
    return data.map((_, i) => {
        if (i < period - 1) return null;
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
        return sum / period;
    });
};

const drawBackground = (ctx, width, height) => {
    ctx.fillStyle = CHART_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, width, height);
};

const drawGrid = (ctx, width, height, padding, chartHeight, minPrice, maxPrice, priceRange) => {
    ctx.strokeStyle = CHART_CONFIG.gridColor;
    ctx.lineWidth = 1;

    for (let i = 0; i <= CHART_CONFIG.gridLines; i++) {
        const y = padding.top + (chartHeight / CHART_CONFIG.gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        const price = maxPrice - (priceRange / CHART_CONFIG.gridLines) * i;
        ctx.fillStyle = CHART_CONFIG.textColor;
        ctx.font = CHART_CONFIG.font;
        ctx.textAlign = 'right';
        ctx.fillText(price.toFixed(2), padding.left - 8, y + 3);
    }
};

const drawTimeLabels = (ctx, data, padding, chartHeight, xScale, candleWidth, volumeHeight, height) => {
    const timeInterval = Math.max(1, Math.floor(data.length / 10));
    for (let i = 0; i < data.length; i += timeInterval) {
        const x = padding.left + i * xScale + candleWidth / 2;

        ctx.strokeStyle = CHART_CONFIG.gridColor;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();

        ctx.fillStyle = CHART_CONFIG.textColor;
        ctx.font = '10px "SF Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(data[i].time, x, height - volumeHeight - 5);
    }
};

const drawMovingAverage = (ctx, data, ma20, padding, xScale, candleWidth, chartHeight, minPrice, yScale) => {
    ctx.strokeStyle = CHART_CONFIG.maColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;

    data.forEach((_, i) => {
        if (ma20[i] !== null) {
            const x = padding.left + i * xScale + candleWidth / 2;
            const y = padding.top + chartHeight - (ma20[i] - minPrice) * yScale;
            if (!started) {
                ctx.moveTo(x, y);
                started = true;
            } else {
                ctx.lineTo(x, y);
            }
        }
    });
    ctx.stroke();
};

const drawCandlestick = (ctx, candle, i, padding, xScale, candleWidth, chartHeight, minPrice, yScale, hoveredPoint) => {
    const x = padding.left + i * xScale;
    const centerX = x + candleWidth / 2;

    const openY = padding.top + chartHeight - (candle.open - minPrice) * yScale;
    const closeY = padding.top + chartHeight - (candle.close - minPrice) * yScale;
    const highY = padding.top + chartHeight - (candle.high - minPrice) * yScale;
    const lowY = padding.top + chartHeight - (candle.low - minPrice) * yScale;

    const isGreen = candle.close >= candle.open;
    const color = isGreen ? CHART_CONFIG.greenColor : CHART_CONFIG.redColor;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, highY);
    ctx.lineTo(centerX, lowY);
    ctx.stroke();

    const bodyHeight = Math.abs(closeY - openY) || 1;
    const bodyY = Math.min(openY, closeY);
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, bodyY, candleWidth - 2, bodyHeight);

    if (hoveredPoint === i) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, bodyY - 1, candleWidth, bodyHeight + 2);
    }
};

const drawVolumeBar = (ctx, candle, i, padding, xScale, candleWidth, volumeY, maxVolume, volumeHeight) => {
    const x = padding.left + i * xScale;
    const barHeight = (candle.volume / maxVolume) * (volumeHeight - 10);
    const isGreen = candle.close >= candle.open;
    ctx.fillStyle = isGreen ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)';
    ctx.fillRect(x + 1, volumeY - barHeight, candleWidth - 2, barHeight);
};

const drawCrosshair = (ctx, candle, i, padding, xScale, candleWidth, chartHeight, minPrice, yScale, width) => {
    const x = padding.left + i * xScale + candleWidth / 2;
    const y = padding.top + chartHeight - (candle.close - minPrice) * yScale;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.setLineDash([]);

    const priceText = candle.close.toFixed(2);
    const textWidth = ctx.measureText(priceText).width;
    ctx.fillStyle = '#333';
    ctx.fillRect(width - padding.right + 2, y - 10, textWidth + 10, 20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "SF Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(priceText, width - padding.right + 7, y + 4);
};

const drawChart = (canvas, data, hoveredPoint, orders = []) => {
    const prepared = prepareCanvas(canvas);
    const { ctx, width, height } = prepared;
    const { minPrice, maxPrice, priceRange, maxVolume } = getPriceStats(data);
    const { padding, volumeHeight } = CHART_CONFIG;
    const { chartHeight, candleWidth, xScale, yScale, volumeY } = getScales(width, height, data.length, priceRange);

    ctx.clearRect(0, 0, width, height);
    // read theme colors and apply to config
    const cssColors = readCssColors();
    CHART_CONFIG.backgroundColor = cssColors.backgroundColor || CHART_CONFIG.backgroundColor;
    CHART_CONFIG.gridColor = cssColors.gridColor || CHART_CONFIG.gridColor;
    CHART_CONFIG.textColor = cssColors.textColor || CHART_CONFIG.textColor;
    CHART_CONFIG.greenColor = cssColors.greenColor || CHART_CONFIG.greenColor;
    CHART_CONFIG.redColor = cssColors.redColor || CHART_CONFIG.redColor;
    CHART_CONFIG.maColor = cssColors.maColor || CHART_CONFIG.maColor;

    drawBackground(ctx, width, height);
    drawGrid(ctx, width, height, padding, chartHeight, minPrice, maxPrice, priceRange);
    drawTimeLabels(ctx, data, padding, chartHeight, xScale, candleWidth, volumeHeight, height);

    const ma20 = calculateMA(data, CHART_CONFIG.ma20Period);
    drawMovingAverage(ctx, data, ma20, padding, xScale, candleWidth, chartHeight, minPrice, yScale);

    data.forEach((candle, i) => {
        drawCandlestick(ctx, candle, i, padding, xScale, candleWidth, chartHeight, minPrice, yScale, hoveredPoint);
    });

    data.forEach((candle, i) => {
        drawVolumeBar(ctx, candle, i, padding, xScale, candleWidth, volumeY, maxVolume, volumeHeight);
    });

    // draw order lines for this symbol
    if (orders && orders.length) {
        orders.forEach(order => {
            if (!order || typeof order.price !== 'number') return;
            const y = padding.top + chartHeight - (order.price - minPrice) * yScale;
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = order.side === 'buy' ? 'rgba(95,184,120,0.9)' : 'rgba(228,114,111,0.9)';
            ctx.setLineDash(order.status === 'pending' ? [6, 4] : []);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // draw small label box on the right
            ctx.fillStyle = 'rgba(20,20,20,0.85)';
            ctx.font = '11px "SF Mono", Consolas, monospace';
            const label = `${order.side.toUpperCase()} ${order.type} ${order.quantity}@${order.price.toFixed(2)}`;
            const textWidth = ctx.measureText(label).width;
            const boxX = width - padding.right + 6;
            const boxY = y - 10;
            const boxW = textWidth + 12;
            const boxH = 18;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, boxX + 6, y);
            ctx.restore();
        });
    }

    ctx.fillStyle = CHART_CONFIG.textColor;
    ctx.font = '10px "SF Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Volume', padding.left, volumeY - volumeHeight + 15);

    if (hoveredPoint !== null && data[hoveredPoint]) {
        drawCrosshair(ctx, data[hoveredPoint], hoveredPoint, padding, xScale, candleWidth, chartHeight, minPrice, yScale, width);
    }
};

const StockChart = () => {
    const { selectedStock, createOrder, orders } = useTradingContext();
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [overlay, setOverlay] = useState(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!selectedStock || !canvasRef.current) return;
        const data = selectedStock.historicalData;
        if (!data.length) return;
        const ordersForSymbol = orders ? orders.filter(o => o.symbol === selectedStock.symbol) : [];
        drawChart(canvasRef.current, data, hoveredPoint, ordersForSymbol);
    }, [selectedStock, hoveredPoint, orders]);

    const handleMouseMove = (e) => {
        if (!selectedStock || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        const { padding } = CHART_CONFIG;
        const chartWidth = rect.width - padding.left - padding.right;
        const xScale = chartWidth / selectedStock.historicalData.length;
        const index = Math.floor((x - padding.left) / xScale);

        if (index >= 0 && index < selectedStock.historicalData.length) {
            setHoveredPoint(index);
        }
    };

    const handleMouseLeave = () => {
        setHoveredPoint(null);
    };

    const handleCanvasClick = (e) => {
        if (!selectedStock || !canvasRef.current || !containerRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const y = e.clientY - canvasRect.top;
        const data = selectedStock.historicalData;
        const { minPrice, maxPrice, priceRange } = getPriceStats(data);
        const chartHeight = canvasRect.height - CHART_CONFIG.padding.top - CHART_CONFIG.padding.bottom - CHART_CONFIG.volumeHeight;
        const price = maxPrice - ((y - CHART_CONFIG.padding.top) / chartHeight) * priceRange;
        const clampedPrice = Math.max(minPrice, Math.min(maxPrice, price));
        setOverlay({ x: e.clientX - containerRect.left, y: e.clientY - containerRect.top, price: Number(clampedPrice.toFixed(2)), side: 'buy', type: 'limit', quantity: 1 });
    };

    useEffect(() => {
        const onKey = (ev) => {
            if (ev.key === 'Escape') setOverlay(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Ensure overlay is positioned within the chart container after render
    useLayoutEffect(() => {
        if (!overlay || !overlayRef.current || !containerRef.current) return;
        const ov = overlayRef.current.getBoundingClientRect();
        const container = containerRef.current.getBoundingClientRect();
        let newX = overlay.x;
        let newY = overlay.y;

        // If overlay would overflow the right edge of the container, position it to the left of the click
        if (newX + ov.width > container.width - 8) {
            newX = Math.max(8, newX - ov.width - 8);
        }

        // If overlay would overflow the bottom edge of the container, shift it up
        if (newY + ov.height > container.height - 8) {
            newY = Math.max(8, container.height - ov.height - 8);
        }

        // Prevent negative positions
        newX = Math.max(8, newX);
        newY = Math.max(8, newY);

        if (newX !== overlay.x || newY !== overlay.y) {
            setOverlay(prev => ({ ...prev, x: newX, y: newY }));
        }
    }, [overlay]);

    const handleCreateOrder = () => {
        if (!overlay || !selectedStock) return;
        const q = Math.max(1, parseInt(overlay.quantity, 10) || 1);
        const price = overlay.type === 'market' ? undefined : Number(overlay.price);
        createOrder({ symbol: selectedStock.symbol, side: overlay.side, type: overlay.type, price, quantity: q });
        setOverlay(null);
    };

    if (!selectedStock) {
        return (
            <div className="relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-[calc(100vh-280px)] min-h-[400px]">
                <p className="flex h-full items-center justify-center text-lg italic text-zinc-500">Select a stock to view chart</p>
            </div>
        );
    }

    const currentData = selectedStock.historicalData[selectedStock.historicalData.length - 1];
    const hoveredData = hoveredPoint !== null ? selectedStock.historicalData[hoveredPoint] : null;

    return (
        <>
            <div className="mb-5 flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <div>
                    <h2 className="m-0 mb-1 text-2xl font-semibold text-zinc-200">{selectedStock.symbol}</h2>
                    <span className="text-xs text-zinc-500">{selectedStock.name}</span>
                </div>
                <div className="text-right">
                    {hoveredData ? (
                        <div className="flex items-center gap-4 font-mono text-sm text-zinc-200">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-zinc-500">O</span>
                                <span>{formatCurrency(hoveredData.open)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-zinc-500">H</span>
                                <span>{formatCurrency(hoveredData.high)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-zinc-500">L</span>
                                <span>{formatCurrency(hoveredData.low)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-zinc-500">C</span>
                                <span>{formatCurrency(hoveredData.close)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-zinc-500">Vol</span>
                                <span>{formatVolume(hoveredData.volume)}</span>
                            </div>
                            <div className="self-center border-l border-white/10 pl-4 text-xs text-zinc-500">{hoveredData.time}</div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-1 text-2xl font-medium text-zinc-200 border border-green-300 inline-block px-2 py-0.5 rounded">{formatCurrency(currentData.close)}</div>
                            <div
                                className={`inline-block rounded-md px-3 py-1 text-sm font-medium transition-colors duration-300 ${
                                    selectedStock.changePercent >= 0
                                        ? 'bg-[rgba(95,184,120,0.12)] text-[#5fb878] hover:bg-[rgba(95,184,120,0.18)] hover:shadow-[0_0_15px_rgba(95,184,120,0.2)]'
                                        : 'bg-[rgba(228,114,111,0.12)] text-[#e4726f] hover:bg-[rgba(228,114,111,0.18)] hover:shadow-[0_0_15px_rgba(228,114,111,0.2)]'
                                }`}
                            >
                                {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div ref={containerRef} className="relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-[calc(100vh-280px)] min-h-[400px]">
                <div className="relative flex-1 min-h-0">
                    <canvas
                        ref={canvasRef}
                        className="h-full w-full cursor-crosshair transition-opacity duration-300 hover:opacity-95"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleCanvasClick}
                    />

                    {overlay && (
                        <div ref={overlayRef} style={{ left: overlay.x, top: overlay.y }} className="absolute z-50 w-64 rounded-md border border-green-300 bg-white/5 p-3 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-sm">Quick Order</div>
                                <button onClick={() => setOverlay(null)} className="text-xs px-2 py-1">✕</button>
                            </div>

                            <div className="mb-2">
                                <div className="flex gap-2">
                                    <button onClick={() => setOverlay(prev => ({ ...prev, side: 'buy' }))} className={`flex-1 rounded px-2 py-1 text-sm ${overlay.side === 'buy' ? 'bg-green-500 text-white' : 'bg-white/10'}`}>Buy</button>
                                    <button onClick={() => setOverlay(prev => ({ ...prev, side: 'sell' }))} className={`flex-1 rounded px-2 py-1 text-sm ${overlay.side === 'sell' ? 'bg-red-500 text-white' : 'bg-white/10'}`}>Sell</button>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-xs text-zinc-400">Type</label>
                                <select value={overlay.type} onChange={(e) => setOverlay(prev => ({ ...prev, type: e.target.value }))} className="w-full rounded mt-1 p-1 bg-white/10">
                                    <option value="market">Market</option>
                                    <option value="limit">Limit</option>
                                    <option value="stop">Stop</option>
                                </select>
                            </div>

                            <div className="mb-2">
                                <label className="text-xs text-zinc-400">Price</label>
                                <input type="number" value={overlay.price} onChange={(e) => setOverlay(prev => ({ ...prev, price: e.target.value }))} disabled={overlay.type === 'market'} className="w-full rounded mt-1 p-1 bg-white/10" />
                            </div>

                            <div className="mb-3">
                                <label className="text-xs text-zinc-400">Quantity</label>
                                <input type="number" value={overlay.quantity} onChange={(e) => setOverlay(prev => ({ ...prev, quantity: e.target.value }))} className="w-full rounded mt-1 p-1 bg-white/10" />
                            </div>

                            <div className="flex gap-2">
                                <button onClick={handleCreateOrder} className="flex-1 rounded bg-green-500 text-white px-3 py-2 text-sm">Place</button>
                                <button onClick={() => setOverlay(null)} className="flex-1 rounded border px-3 py-2 text-sm">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StockChart;

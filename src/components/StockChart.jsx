import { useEffect, useRef, useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import { formatCurrency, formatVolume } from '../utils/format';

const StockChart = () => {
    const { selectedStock } = useTradingContext();
    const canvasRef = useRef(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    useEffect(() => {
        if (!selectedStock || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas.getBoundingClientRect();

        // Set canvas resolution
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const data = selectedStock.historicalData;
        if (data.length === 0) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate scales
        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);
        const volumes = data.map(d => d.volume);
        const minPrice = Math.min(...lows);
        const maxPrice = Math.max(...highs);
        const priceRange = maxPrice - minPrice || 1;
        const maxVolume = Math.max(...volumes);

        const padding = { top: 10, right: 70, bottom: 80, left: 50 };
        const volumeHeight = 60;
        const chartHeight = height - padding.top - padding.bottom - volumeHeight;
        const chartWidth = width - padding.left - padding.right;

        const candleWidth = Math.max(2, Math.min(12, chartWidth / data.length - 2));
        const xScale = chartWidth / data.length;
        const yScale = chartHeight / priceRange;

        // Draw background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Draw horizontal grid lines
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        const gridLines = 8;

        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Price labels
            const price = maxPrice - (priceRange / gridLines) * i;
            ctx.fillStyle = '#666';
            ctx.font = '11px "SF Mono", Consolas, monospace';
            ctx.textAlign = 'right';
            ctx.fillText(price.toFixed(2), padding.left - 8, y + 3);
        }

        // Draw vertical grid lines and time labels
        const timeInterval = Math.max(1, Math.floor(data.length / 10));
        for (let i = 0; i < data.length; i += timeInterval) {
            const x = padding.left + i * xScale + candleWidth / 2;

            ctx.strokeStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.stroke();

            // Time labels
            ctx.fillStyle = '#666';
            ctx.font = '10px "SF Mono", Consolas, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(data[i].time, x, height - volumeHeight - 5);
        }

        // Calculate moving average (20-period SMA)
        const ma20 = [];
        for (let i = 0; i < data.length; i++) {
            if (i < 19) {
                ma20.push(null);
            } else {
                const sum = data.slice(i - 19, i + 1).reduce((acc, d) => acc + d.close, 0);
                ma20.push(sum / 20);
            }
        }

        // Draw moving average line
        ctx.strokeStyle = '#8b9dc3';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let maStarted = false;
        data.forEach((point, i) => {
            if (ma20[i] !== null) {
                const x = padding.left + i * xScale + candleWidth / 2;
                const y = padding.top + chartHeight - (ma20[i] - minPrice) * yScale;
                if (!maStarted) {
                    ctx.moveTo(x, y);
                    maStarted = true;
                } else {
                    ctx.lineTo(x, y);
                }
            }
        });
        ctx.stroke();

        // Draw candlesticks
        data.forEach((candle, i) => {
            const x = padding.left + i * xScale;
            const centerX = x + candleWidth / 2;

            const openY = padding.top + chartHeight - (candle.open - minPrice) * yScale;
            const closeY = padding.top + chartHeight - (candle.close - minPrice) * yScale;
            const highY = padding.top + chartHeight - (candle.high - minPrice) * yScale;
            const lowY = padding.top + chartHeight - (candle.low - minPrice) * yScale;

            const isGreen = candle.close >= candle.open;
            const color = isGreen ? '#26a69a' : '#ef5350';

            // Draw wick
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, highY);
            ctx.lineTo(centerX, lowY);
            ctx.stroke();

            // Draw body
            const bodyHeight = Math.abs(closeY - openY) || 1;
            const bodyY = Math.min(openY, closeY);

            if (isGreen) {
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, bodyY, candleWidth - 2, bodyHeight);
            } else {
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, bodyY, candleWidth - 2, bodyHeight);
            }

            // Highlight hovered candle
            if (hoveredPoint === i) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, bodyY - 1, candleWidth, bodyHeight + 2);
            }
        });

        // Draw volume bars
        const volumeY = height - volumeHeight - 10;
        data.forEach((candle, i) => {
            const x = padding.left + i * xScale;
            const barHeight = (candle.volume / maxVolume) * (volumeHeight - 10);
            const isGreen = candle.close >= candle.open;

            ctx.fillStyle = isGreen ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)';
            ctx.fillRect(x + 1, volumeY - barHeight, candleWidth - 2, barHeight);
        });

        // Volume label
        ctx.fillStyle = '#666';
        ctx.font = '10px "SF Mono", Consolas, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Volume', padding.left, volumeY - volumeHeight + 15);

        // Crosshair on hover
        if (hoveredPoint !== null && data[hoveredPoint]) {
            const candle = data[hoveredPoint];
            const x = padding.left + hoveredPoint * xScale + candleWidth / 2;
            const y = padding.top + chartHeight - (candle.close - minPrice) * yScale;

            // Vertical line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.stroke();

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Price tag on right axis
            const priceText = candle.close.toFixed(2);
            const textWidth = ctx.measureText(priceText).width;
            ctx.fillStyle = '#333';
            ctx.fillRect(width - padding.right + 2, y - 10, textWidth + 10, 20);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px "SF Mono", Consolas, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(priceText, width - padding.right + 7, y + 4);
        }

    }, [selectedStock, hoveredPoint]);

    const handleMouseMove = (e) => {
        if (!selectedStock || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        const padding = { left: 10, right: 60 };
        const chartWidth = rect.width - padding.left - padding.right;
        const xScale = chartWidth / (selectedStock.historicalData.length - 1);

        const index = Math.round((x - padding.left) / xScale);

        if (index >= 0 && index < selectedStock.historicalData.length) {
            setHoveredPoint(index);
        }
    };

    const handleMouseLeave = () => {
        setHoveredPoint(null);
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
                            <div className="mb-1 text-2xl font-medium text-zinc-200">{formatCurrency(currentData.close)}</div>
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
            <div className="relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-[calc(100vh-280px)] min-h-[400px]">
                <div className="relative flex-1 min-h-0">
                    <canvas
                        ref={canvasRef}
                        className="h-full w-full cursor-crosshair transition-opacity duration-300 hover:opacity-95"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />
                </div>
            </div>
        </>
    );
};

export default StockChart;

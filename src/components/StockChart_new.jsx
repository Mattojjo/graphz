import { useEffect, useRef, useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import './StockChart.css';

const CHART_CONFIG = {
    padding: { top: 10, right: 70, bottom: 80, left: 50 },
    volumeHeight: 60,
    gridLines: 8,
    candleMinWidth: 2,
    candleMaxWidth: 12,
    ma20Period: 20,
    backgroundColor: '#0a0a0a',
    gridColor: '#1a1a1a',
    textColor: '#666',
    font: '11px "SF Mono", Consolas, monospace',
    greenColor: '#26a69a',
    redColor: '#ef5350',
    maColor: '#8b9dc3',
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const formatVolume = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
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

const StockChart = () => {
    const { selectedStock } = useTradingContext();
    const canvasRef = useRef(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    useEffect(() => {
        if (!selectedStock || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas.getBoundingClientRect();

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const data = selectedStock.historicalData;
        if (data.length === 0) return;

        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);
        const volumes = data.map(d => d.volume);
        const minPrice = Math.min(...lows);
        const maxPrice = Math.max(...highs);
        const priceRange = maxPrice - minPrice || 1;
        const maxVolume = Math.max(...volumes);

        const { padding, volumeHeight, candleMinWidth, candleMaxWidth } = CHART_CONFIG;
        const chartHeight = height - padding.top - padding.bottom - volumeHeight;
        const chartWidth = width - padding.left - padding.right;

        const candleWidth = Math.max(candleMinWidth, Math.min(candleMaxWidth, chartWidth / data.length - 2));
        const xScale = chartWidth / data.length;
        const yScale = chartHeight / priceRange;

        ctx.clearRect(0, 0, width, height);
        drawBackground(ctx, width, height);
        drawGrid(ctx, width, height, padding, chartHeight, minPrice, maxPrice, priceRange);
        drawTimeLabels(ctx, data, padding, chartHeight, xScale, candleWidth, volumeHeight, height);

        const ma20 = calculateMA(data, CHART_CONFIG.ma20Period);
        drawMovingAverage(ctx, data, ma20, padding, xScale, candleWidth, chartHeight, minPrice, yScale);

        data.forEach((candle, i) => {
            drawCandlestick(ctx, candle, i, padding, xScale, candleWidth, chartHeight, minPrice, yScale, hoveredPoint);
        });

        const volumeY = height - volumeHeight - 10;
        data.forEach((candle, i) => {
            drawVolumeBar(ctx, candle, i, padding, xScale, candleWidth, volumeY, maxVolume, volumeHeight);
        });

        ctx.fillStyle = CHART_CONFIG.textColor;
        ctx.font = '10px "SF Mono", Consolas, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Volume', padding.left, volumeY - volumeHeight + 15);

        if (hoveredPoint !== null && data[hoveredPoint]) {
            drawCrosshair(ctx, data[hoveredPoint], hoveredPoint, padding, xScale, candleWidth, chartHeight, minPrice, yScale, width);
        }

    }, [selectedStock, hoveredPoint]);

    const handleMouseMove = (e) => {
        if (!selectedStock || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        const padding = CHART_CONFIG.padding;
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

    if (!selectedStock) {
        return (
            <div className="stock-chart">
                <p className="no-selection">Select a stock to view chart</p>
            </div>
        );
    }

    const currentData = selectedStock.historicalData[selectedStock.historicalData.length - 1];
    const hoveredData = hoveredPoint !== null ? selectedStock.historicalData[hoveredPoint] : null;

    return (
        <>
            <div className="chart-header-section">
                <div className="chart-title">
                    <h2>{selectedStock.symbol}</h2>
                    <span className="stock-name">{selectedStock.name}</span>
                </div>
                <div className="chart-info">
                    {hoveredData ? (
                        <div className="ohlc-data">
                            <div className="ohlc-item">
                                <span className="ohlc-label">O</span>
                                <span className="ohlc-value">{formatCurrency(hoveredData.open)}</span>
                            </div>
                            <div className="ohlc-item">
                                <span className="ohlc-label">H</span>
                                <span className="ohlc-value">{formatCurrency(hoveredData.high)}</span>
                            </div>
                            <div className="ohlc-item">
                                <span className="ohlc-label">L</span>
                                <span className="ohlc-value">{formatCurrency(hoveredData.low)}</span>
                            </div>
                            <div className="ohlc-item">
                                <span className="ohlc-label">C</span>
                                <span className="ohlc-value">{formatCurrency(hoveredData.close)}</span>
                            </div>
                            <div className="ohlc-item">
                                <span className="ohlc-label">Vol</span>
                                <span className="ohlc-value">{formatVolume(hoveredData.volume)}</span>
                            </div>
                            <div className="time-display">{hoveredData.time}</div>
                        </div>
                    ) : (
                        <>
                            <div className="price-display">{formatCurrency(currentData.close)}</div>
                            <div className={`change-display ${selectedStock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                                {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="stock-chart">
                <div className="chart-container">
                    <canvas
                        ref={canvasRef}
                        className="chart-canvas"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />
                </div>
            </div>
        </>
    );
};

export default StockChart;

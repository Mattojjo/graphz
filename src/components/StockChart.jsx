import { useEffect, useRef, useState } from 'react';
import { useTradingContext } from '../context/TradingContext';
import './StockChart.css';

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
        const prices = data.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1;

        const padding = { top: 20, right: 60, bottom: 30, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const xScale = chartWidth / (data.length - 1);
        const yScale = chartHeight / priceRange;

        // Draw grid lines
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Price labels
            const price = maxPrice - (priceRange / 5) * i;
            ctx.fillStyle = '#888';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`$${price.toFixed(2)}`, width - padding.right + 5, y + 4);
        }

        // Draw gradient area under line
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);

        const basePrice = selectedStock.basePrice;
        const currentPrice = data[data.length - 1].price;
        const isPositive = currentPrice >= basePrice;

        if (isPositive) {
            gradient.addColorStop(0, 'rgba(0, 200, 83, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 200, 83, 0.02)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 82, 82, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 82, 82, 0.02)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);

        data.forEach((point, i) => {
            const x = padding.left + i * xScale;
            const y = padding.top + chartHeight - (point.price - minPrice) * yScale;

            if (i === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.lineTo(padding.left + (data.length - 1) * xScale, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Draw line
        ctx.strokeStyle = isPositive ? '#00c853' : '#ff5252';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, i) => {
            const x = padding.left + i * xScale;
            const y = padding.top + chartHeight - (point.price - minPrice) * yScale;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points on hover
        if (hoveredPoint !== null && data[hoveredPoint]) {
            const x = padding.left + hoveredPoint * xScale;
            const y = padding.top + chartHeight - (data[hoveredPoint].price - minPrice) * yScale;

            ctx.fillStyle = isPositive ? '#00c853' : '#ff5252';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
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
            <div className="stock-chart">
                <p className="no-selection">Select a stock to view chart</p>
            </div>
        );
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const currentData = selectedStock.historicalData[selectedStock.historicalData.length - 1];
    const hoveredData = hoveredPoint !== null ? selectedStock.historicalData[hoveredPoint] : null;

    return (
        <div className="stock-chart">
            <div className="chart-header">
                <div className="chart-title">
                    <h2>{selectedStock.symbol}</h2>
                    <span className="stock-name">{selectedStock.name}</span>
                </div>
                <div className="chart-info">
                    {hoveredData ? (
                        <>
                            <div className="price-display">{formatCurrency(hoveredData.price)}</div>
                            <div className="time-display">{hoveredData.time}</div>
                        </>
                    ) : (
                        <>
                            <div className="price-display">{formatCurrency(currentData.price)}</div>
                            <div className={`change-display ${selectedStock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                                {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="chart-container">
                <canvas
                    ref={canvasRef}
                    className="chart-canvas"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />
            </div>
        </div>
    );
};

export default StockChart;

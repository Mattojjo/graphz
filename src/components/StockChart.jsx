import React, { useEffect, useRef, useCallback } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { useTradingContext } from '../context/TradingContext';
import { useUI } from '../context/UIContext';

const calculateMA = (data, period = 20) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
        result.push({ time: data[i].time, value: avg });
    }
    return result;
};

const StockChart = ({ onHoverChange }) => {
    const { selectedStock, timeframe, drawingTool, chartLines, addChartLine, isChartLoading } = useTradingContext();
    const { ui } = useUI();

    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const candleSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const maSeriesRef = useRef(null);
    const priceLineMapRef = useRef(new Map());
    const isInitializedRef = useRef(false);
    const lastSymbolRef = useRef(null);
    const lastTimeframeRef = useRef(null);
    const drawingToolRef = useRef(drawingTool);
    const addChartLineRef = useRef(addChartLine);

    useEffect(() => { drawingToolRef.current = drawingTool; }, [drawingTool]);
    useEffect(() => { addChartLineRef.current = addChartLine; }, [addChartLine]);

    // Initialize chart on mount
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: { color: '#131722' },
                textColor: '#d1d4dc',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: 'rgba(42,46,57,0.5)' },
                horzLines: { color: 'rgba(42,46,57,0.5)' },
            },
            crosshair: { mode: 1 },
            rightPriceScale: {
                borderColor: '#2a2e39',
                scaleMargins: { top: 0.1, bottom: 0.2 },
            },
            timeScale: {
                borderColor: '#2a2e39',
                timeVisible: true,
                secondsVisible: true,
            },
            handleScroll: true,
            handleScale: true,
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceScaleId: 'volume',
            color: '#26a69a',
        });
        chart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
            drawTicks: false,
            borderVisible: false,
        });

        const maSeries = chart.addSeries(LineSeries, {
            color: '#2962ff',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;
        maSeriesRef.current = maSeries;

        // Click handler for drawing tool
        chart.subscribeClick((param) => {
            if (drawingToolRef.current === 'hline' && param.point) {
                const price = candleSeriesRef.current.coordinateToPrice(param.point.y);
                if (price != null) {
                    addChartLineRef.current(price);
                }
            }
        });

        // Crosshair hover handler
        chart.subscribeCrosshairMove((param) => {
            if (!param.time || !param.seriesData) {
                if (onHoverChange) onHoverChange(null);
                return;
            }
            const candle = param.seriesData.get(candleSeries);
            if (candle && onHoverChange) {
                onHoverChange({
                    time: param.time,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                });
            }
        });

        // ResizeObserver
        let ro = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => {
                if (containerRef.current) {
                    chart.applyOptions({
                        width: containerRef.current.clientWidth,
                        height: containerRef.current.clientHeight,
                    });
                }
            });
            ro.observe(containerRef.current);
        }

        return () => {
            if (ro) ro.disconnect();
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
            maSeriesRef.current = null;
            isInitializedRef.current = false;
        };
    }, []);

    // Load / update chart data when selectedStock changes
    useEffect(() => {
        if (!candleSeriesRef.current || !selectedStock?.historicalData?.length) return;

        const symbol = selectedStock.symbol;
        const tf = timeframe;
        const isNewStock = symbol !== lastSymbolRef.current;
        const isNewTimeframe = tf !== lastTimeframeRef.current;

        if (isNewStock || isNewTimeframe || !isInitializedRef.current) {
            // Full reload
            const candles = selectedStock.historicalData.map(d => ({
                time: d.time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }));
            const volumes = selectedStock.historicalData.map(d => ({
                time: d.time,
                value: d.volume,
                color: d.close >= d.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
            }));
            const maData = calculateMA(selectedStock.historicalData);

            candleSeriesRef.current.setData(candles);
            volumeSeriesRef.current.setData(volumes);
            maSeriesRef.current.setData(maData);
            chartRef.current.timeScale().scrollToRealTime();

            lastSymbolRef.current = symbol;
            lastTimeframeRef.current = tf;
            isInitializedRef.current = true;
        } else {
            // Incremental update: only update last bar
            const d = selectedStock.historicalData[selectedStock.historicalData.length - 1];
            candleSeriesRef.current.update({
                time: d.time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            });
            volumeSeriesRef.current.update({
                time: d.time,
                value: d.volume,
                color: d.close >= d.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
            });
            // Update MA for last point if enough data
            const hist = selectedStock.historicalData;
            if (hist.length >= 20) {
                const last20 = hist.slice(-20);
                const avg = last20.reduce((s, c) => s + c.close, 0) / 20;
                maSeriesRef.current.update({ time: d.time, value: avg });
            }
        }
    }, [selectedStock, timeframe]);

    // Sync chart lines (price lines on candleSeries)
    useEffect(() => {
        if (!candleSeriesRef.current) return;
        const series = candleSeriesRef.current;
        const map = priceLineMapRef.current;

        const currentIds = new Set(chartLines.map(l => l.id));

        // Remove lines no longer in state
        for (const [id, priceLine] of map.entries()) {
            if (!currentIds.has(id)) {
                series.removePriceLine(priceLine);
                map.delete(id);
            }
        }

        // Add new lines
        for (const line of chartLines) {
            if (!map.has(line.id)) {
                const pl = series.createPriceLine({
                    price: line.price,
                    color: line.color || '#e4d354',
                    lineWidth: 1,
                    lineStyle: 2,
                    axisLabelVisible: true,
                    title: line.label || '',
                });
                map.set(line.id, pl);
            }
        }
    }, [chartLines]);

    // Toggle MA visibility
    useEffect(() => {
        if (!maSeriesRef.current) return;
        maSeriesRef.current.applyOptions({ visible: ui.showMA });
    }, [ui.showMA]);

    // Toggle volume visibility
    useEffect(() => {
        if (!volumeSeriesRef.current) return;
        volumeSeriesRef.current.applyOptions({ visible: ui.showVolume });
    }, [ui.showVolume]);

    return (
        <div
            ref={containerRef}
            data-testid="chart-container"
            style={{ width: '100%', height: '100%', position: 'relative' }}
        >
            {!selectedStock && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', fontSize: '14px',
                }}>
                    Select a stock to view chart
                </div>
            )}
            {isChartLoading && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(19,23,34,0.7)',
                    zIndex: 10, fontSize: '13px', color: 'var(--text-muted)',
                }}>
                    Loading market data…
                </div>
            )}
        </div>
    );
};

export default StockChart;

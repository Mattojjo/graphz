import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { useUI } from '../context/UIContext';
import { TIMEFRAMES } from '../utils/stockData';

const ChartToolbar = () => {
    const { timeframe, setTimeframe, isChartLoading, dataSource } = useTradingContext();
    const { ui, toggleOption } = useUI();

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '0 8px',
                height: '36px',
                background: 'var(--panel-bg)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            {TIMEFRAMES.map(tf => (
                <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{
                        height: '28px',
                        padding: '0 8px',
                        fontSize: '12px',
                        fontWeight: timeframe === tf ? 600 : 400,
                        background: timeframe === tf ? '#2962ff' : 'transparent',
                        color: timeframe === tf ? '#ffffff' : 'var(--text-muted)',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                        if (timeframe !== tf) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    }}
                    onMouseLeave={e => {
                        if (timeframe !== tf) e.currentTarget.style.background = 'transparent';
                    }}
                >
                    {tf}
                </button>
            ))}

            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

            <button
                onClick={() => toggleOption('showMA')}
                style={{
                    height: '28px',
                    padding: '0 8px',
                    fontSize: '12px',
                    fontWeight: ui.showMA ? 600 : 400,
                    background: ui.showMA ? 'rgba(41,98,255,0.2)' : 'transparent',
                    color: ui.showMA ? '#2962ff' : 'var(--text-muted)',
                    border: ui.showMA ? '1px solid rgba(41,98,255,0.4)' : '1px solid transparent',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                }}
            >
                MA
            </button>

            <button
                onClick={() => toggleOption('showVolume')}
                style={{
                    height: '28px',
                    padding: '0 8px',
                    fontSize: '12px',
                    fontWeight: ui.showVolume ? 600 : 400,
                    background: ui.showVolume ? 'rgba(41,98,255,0.2)' : 'transparent',
                    color: ui.showVolume ? '#2962ff' : 'var(--text-muted)',
                    border: ui.showVolume ? '1px solid rgba(41,98,255,0.4)' : '1px solid transparent',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                }}
            >
                Vol
            </button>

            <div style={{ flex: 1 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isChartLoading ? (
                    <>
                        <span style={{
                            display: 'inline-block',
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            animation: 'spin 1s linear infinite',
                        }}>⟳</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Loading…</span>
                    </>
                ) : dataSource === 'real' ? (
                    <>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: '#26a69a', display: 'inline-block', flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '10px', color: '#26a69a', letterSpacing: '0.04em' }}>LIVE DATA</span>
                    </>
                ) : (
                    <>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: 'var(--text-muted)', display: 'inline-block', flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>SIMULATED</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChartToolbar;

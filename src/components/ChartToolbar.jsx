import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { useUI } from '../context/UIContext';
import { TIMEFRAMES } from '../utils/stockData';

const SPEEDS = ['5s', '1m', '5m', '15m'];
const SPEED_LABELS = { '5s': '5 sec/candle', '1m': '1 min/candle', '5m': '5 min/candle', '15m': '15 min/candle' };

const ToolBtn = ({ active, onClick, children, title }) => (
    <button
        title={title}
        onClick={onClick}
        style={{
            height: '28px',
            padding: '0 8px',
            fontSize: '12px',
            fontWeight: active ? 600 : 400,
            background: active ? 'rgba(41,98,255,0.2)' : 'transparent',
            color: active ? '#2962ff' : 'var(--text-muted)',
            border: active ? '1px solid rgba(41,98,255,0.4)' : '1px solid transparent',
            borderRadius: '3px',
            cursor: 'pointer',
            fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
        {children}
    </button>
);

const Divider = () => (
    <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />
);

const ChartToolbar = () => {
    const {
        timeframe, setTimeframe,
        isChartLoading, dataSource,
        playbackSpeed, setPlaybackSpeed,
    } = useTradingContext();
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
                overflowX: 'auto',
            }}
        >
            {/* Timeframe buttons */}
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
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (timeframe !== tf) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { if (timeframe !== tf) e.currentTarget.style.background = 'transparent'; }}
                >
                    {tf}
                </button>
            ))}

            <Divider />

            {/* Indicator toggles */}
            <ToolBtn active={ui.showMA} onClick={() => toggleOption('showMA')}>MA</ToolBtn>
            <ToolBtn active={ui.showVolume} onClick={() => toggleOption('showVolume')}>Vol</ToolBtn>

            <Divider />

            {/* Playback speed selector */}
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '4px', flexShrink: 0, letterSpacing: '0.04em' }}>
                SPEED
            </span>
            {SPEEDS.map(sp => (
                <button
                    key={sp}
                    title={SPEED_LABELS[sp]}
                    onClick={() => setPlaybackSpeed(sp)}
                    style={{
                        height: '28px',
                        padding: '0 7px',
                        fontSize: '11px',
                        fontWeight: playbackSpeed === sp ? 700 : 400,
                        background: playbackSpeed === sp ? 'rgba(38,166,154,0.18)' : 'transparent',
                        color: playbackSpeed === sp ? '#26a69a' : 'var(--text-muted)',
                        border: playbackSpeed === sp ? '1px solid rgba(38,166,154,0.4)' : '1px solid transparent',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (playbackSpeed !== sp) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { if (playbackSpeed !== sp) e.currentTarget.style.background = 'transparent'; }}
                >
                    {sp}
                </button>
            ))}

            <div style={{ flex: 1 }} />

            {/* Data source badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                {isChartLoading ? (
                    <>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }}>⟳</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Loading…</span>
                    </>
                ) : dataSource === 'real' ? (
                    <>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#26a69a', display: 'inline-block' }} />
                        <span style={{ fontSize: '10px', color: '#26a69a', letterSpacing: '0.04em' }}>LIVE DATA</span>
                    </>
                ) : (
                    <>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>SIMULATED</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChartToolbar;

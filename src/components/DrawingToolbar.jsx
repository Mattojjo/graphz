import React from 'react';
import { useTradingContext } from '../context/TradingContext';

const iconStyle = (active) => ({
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'rgba(41,98,255,0.2)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.1s, color 0.1s',
    fontFamily: 'inherit',
});

const DrawingToolbar = () => {
    const { drawingTool, setDrawingTool, clearChartLines } = useTradingContext();

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4px',
                gap: '2px',
                width: '40px',
                background: 'var(--panel-bg)',
                borderRight: '1px solid var(--border)',
            }}
        >
            <button
                title="Cursor"
                onClick={() => setDrawingTool('cursor')}
                style={iconStyle(drawingTool === 'cursor')}
                onMouseEnter={e => { if (drawingTool !== 'cursor') e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (drawingTool !== 'cursor') e.currentTarget.style.background = 'transparent'; }}
            >
                ↖
            </button>

            <button
                title="Horizontal Line"
                onClick={() => setDrawingTool('hline')}
                style={iconStyle(drawingTool === 'hline')}
                onMouseEnter={e => { if (drawingTool !== 'hline') e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (drawingTool !== 'hline') e.currentTarget.style.background = 'transparent'; }}
            >
                —
            </button>

            <div style={{ width: '24px', height: '1px', background: 'var(--border)', margin: '2px 0' }} />

            <button
                title="Clear all lines"
                onClick={clearChartLines}
                style={iconStyle(false)}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,83,80,0.15)'; e.currentTarget.style.color = '#ef5350'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
                🗑
            </button>
        </div>
    );
};

export default DrawingToolbar;

import React, { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';

const Notification = ({ notifications }) => {
    const ctxNotification = useTradingContext().notification;
    const [items, setItems] = useState(notifications ?? (ctxNotification ? [ctxNotification] : []));

    if (!items || items.length === 0) return null;

    const baseClasses = 'fixed top-5 right-5 px-5 py-3 rounded-lg font-medium text-sm z-[1000] animate-slide-in shadow-[0_6px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.08)] border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.12)]';

    const variantClasses = {
        success: 'bg-gradient-to-br from-[rgba(95,184,120,0.92)] to-[rgba(110,194,130,0.92)] text-white border-[#6ec282] hover:shadow-[0_10px_32px_rgba(95,184,120,0.35)] bg-green-100',
        error: 'bg-gradient-to-br from-[rgba(228,114,111,0.92)] to-[rgba(232,134,131,0.92)] text-white border-[#e88683] hover:shadow-[0_10px_32px_rgba(228,114,111,0.35)] bg-red-100',
        info: 'bg-gradient-to-br from-[rgba(139,157,195,0.92)] to-[rgba(155,143,181,0.92)] text-white border-[#9b8fb5] hover:shadow-[0_10px_32px_rgba(139,157,195,0.35)]',
    };

    const dismiss = (id) => setItems(prev => prev.filter(i => i.id !== id));

    return (
        <div>
            {items.map(item => (
                <div key={item.id} className={`${baseClasses} ${variantClasses[item.type] || ''}`}>
                    <span>{item.message}</span>
                    <button aria-label={`close-${item.id}`} onClick={() => dismiss(item.id)} className="ml-3">×</button>
                </div>
            ))}
        </div>
    );
};

export default Notification;

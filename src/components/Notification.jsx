import React, { useState } from 'react';
import { useTradingContext } from '../context/TradingContext';

const Notification = ({ notifications }) => {
    const ctxNotification = useTradingContext().notification;
    const [items, setItems] = useState(notifications ?? (ctxNotification ? [ctxNotification] : []));

    if (!items || items.length === 0) return null;

    const baseClasses = 'fixed top-5 right-5 px-5 py-3 rounded-lg font-medium text-sm z-[1000] animate-slide-in shadow cursor-pointer transition-all duration-300 hover:-translate-y-0.5';

    const variantClasses = {
        success: 'bg-green-100',
        error: 'bg-red-100',
        info: 'bg-blue-100',
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

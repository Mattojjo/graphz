import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

const DEFAULT_UI = {
    showNotifications: true,
    showVolume: true,
    showMA: true,
    animatePortfolio: true,
    showPortfolio: false,
};

const safeLocalStorage = {
    getItem: (key) => {
        try { return localStorage.getItem(key); } catch { return null; }
    },
    setItem: (key, value) => {
        try { localStorage.setItem(key, value); } catch {}
    }
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) return { ui: DEFAULT_UI, setOption: () => {}, toggleOption: () => {}, togglePortfolio: () => {} };
    return context;
};

export const UIProvider = ({ children }) => {
    const stored = safeLocalStorage.getItem('graphz-ui');
    const initial = stored ? { ...DEFAULT_UI, ...JSON.parse(stored) } : DEFAULT_UI;
    const [ui, setUI] = useState(initial);

    const setOption = (key, value) => {
        setUI(prev => {
            const next = { ...prev, [key]: value };
            safeLocalStorage.setItem('graphz-ui', JSON.stringify(next));
            return next;
        });
    };

    const toggleOption = (key) => setOption(key, !ui[key]);

    const togglePortfolio = () => toggleOption('showPortfolio');

    return (
        <UIContext.Provider value={{ ui, setOption, toggleOption, togglePortfolio }}>
            {children}
        </UIContext.Provider>
    );
};

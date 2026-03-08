import React, { createContext, useContext, useEffect, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const ctx = useContext(UIContext);
  // return safe defaults when used outside provider (helps tests and incremental adoption)
  if (!ctx) return {
    ui: {
      showNotifications: true,
      showVolume: true,
      showMA: true,
      showPortfolio: true,
    },
    setOption: () => {},
    toggleOption: () => {},
  };
  return ctx;
};

const DEFAULTS = {
  showNotifications: true,
  showVolume: true,
  showMA: true,
  showPortfolio: true,
  animatePortfolio: true,
};

export const UIProvider = ({ children, initialState = {} }) => {
  const [ui, setUi] = useState(() => {
    try {
      const raw = localStorage.getItem('graphz_ui');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return { ...DEFAULTS, ...initialState };
  });

  useEffect(() => {
    try {
      localStorage.setItem('graphz_ui', JSON.stringify(ui));
    } catch (e) {
      // ignore
    }
  }, [ui]);

  const setOption = (key, value) => setUi(prev => ({ ...prev, [key]: value }));
  const toggleOption = (key) => setUi(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <UIContext.Provider value={{ ui, setOption, toggleOption }}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;

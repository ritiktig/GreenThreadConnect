import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');
  const [exchangeRates, setExchangeRates] = useState({
    INR: 1,
    USD: 0.012, 
    EUR: 0.011, 
    GBP: 0.0095, 
    JPY: 1.80
  });

  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    JPY: '¥'
  };

  // Load saved currency on mount
  useEffect(() => {
    const saved = localStorage.getItem('appCurrency_v2');
    if (saved && exchangeRates[saved]) {
      setCurrency(saved);
    }
  }, []);

  const changeCurrency = (code) => {
    if (exchangeRates[code]) {
      setCurrency(code);
      localStorage.setItem('appCurrency_v2', code);
    }
  };

  const formatPrice = (amountInUSD) => {
    if (amountInUSD === null || amountInUSD === undefined) return '';
    const rate = exchangeRates[currency] || 1;
    const converted = amountInUSD * rate;
    
    // Formatting options
    const options = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };

    try {
        return new Intl.NumberFormat(undefined, options).format(converted);
    } catch (e) {
        return `${currencySymbols[currency] || currency} ${converted.toFixed(2)}`;
    }
  };

  // Helper to get raw converted value (e.g. for charts)
  const convertPrice = (amountInUSD) => {
      const rate = exchangeRates[currency] || 1;
      return parseFloat((amountInUSD * rate).toFixed(2));
  };

  const value = {
    currency,
    symbol: currencySymbols[currency],
    exchangeRates,
    changeCurrency,
    formatPrice,
    convertPrice
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

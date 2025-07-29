import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { exchangeRateAPI } from '../services/api';

const CurrencyContext = createContext();

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        const saved = localStorage.getItem('preferredCurrency');
        return saved || 'USD';
    });

    const [exchangeRate, setExchangeRate] = useState(null);
    const [rateLoading, setRateLoading] = useState(false);
    const [rateError, setRateError] = useState(null);
    const [lastRateUpdate, setLastRateUpdate] = useState(null);

    // Fetch exchange rate
    const fetchExchangeRate = useCallback(async () => {
        try {
            setRateLoading(true);
            setRateError(null);
            const data = await exchangeRateAPI.getCurrentRate();

            // Use the correct field name from the API response
            const rate = data.usd_to_ves;

            if (rate) {
                setExchangeRate(rate);
                setLastRateUpdate(new Date());
            } else {
                console.error('No rate found in response:', data);
                setRateError('Invalid exchange rate response');
            }
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            setRateError('Failed to fetch exchange rate');
        } finally {
            setRateLoading(false);
        }
    }, []);

    // Convert amount between currencies
    const convertAmount = useCallback(async (amount, fromCurrency = 'USD', toCurrency = currency) => {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        if (fromCurrency === 'USD' && toCurrency === 'VES' && exchangeRate) {
            return amount * exchangeRate;
        }

        if (fromCurrency === 'VES' && toCurrency === 'USD' && exchangeRate) {
            return amount / exchangeRate;
        }

        // Fallback to API conversion if rate not available
        try {
            const response = await exchangeRateAPI.convertAmount(amount, fromCurrency, toCurrency);
            return response.converted_amount || response.amount;
        } catch (error) {
            console.error('Error converting amount:', error);
            return amount; // Return original amount as fallback
        }
    }, [currency, exchangeRate]);

    // Format price based on currency
    const formatPrice = useCallback((amount, targetCurrency = currency) => {
        if (targetCurrency === 'VES') {
            return `Bs. ${amount.toLocaleString('es-VE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        } else {
            return `$${amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    }, [currency]);

    // Update currency preference
    const updateCurrency = useCallback((newCurrency) => {
        setCurrency(newCurrency);
        localStorage.setItem('preferredCurrency', newCurrency);
    }, []);

    // Auto-refresh exchange rate every 30 minutes
    useEffect(() => {
        const fetchRate = () => {
            fetchExchangeRate();
        };

        // Initial fetch
        fetchRate();

        // Set up interval for auto-refresh (30 minutes)
        const interval = setInterval(fetchRate, 30 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchExchangeRate]);

    const value = {
        currency,
        exchangeRate,
        rateLoading,
        rateError,
        lastRateUpdate,
        convertAmount,
        formatPrice,
        updateCurrency,
        fetchExchangeRate
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}; 
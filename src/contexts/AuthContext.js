import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({ user: null, isAuthenticated: false });

export const useAuth = () => useContext(AuthContext);

/** Thin reactive wrapper around authService (which stays the owner of the session). */
export const AuthProvider = ({ children }) => {
    const read = () => ({
        user: authService.isUserAuthenticated() ? authService.getCurrentUser() : null,
        isAuthenticated: authService.isUserAuthenticated(),
    });
    const [state, setState] = useState(read);

    useEffect(() => {
        const sync = () => setState(read());
        window.addEventListener('auth:changed', sync);
        return () => window.removeEventListener('auth:changed', sync);
    }, []);

    return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

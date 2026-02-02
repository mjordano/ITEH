import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authAPI.getMe();
                    setUser(userData);
                } catch (err) {
                    console.error('Token nije validan:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            const data = await authAPI.login(username, password);
            localStorage.setItem('token', data.access_token);

            const userData = await authAPI.getMe();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.detail || 'Greška pri prijavi';
            setError(message);
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            await authAPI.register(userData);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.detail || 'Greška pri registraciji';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Greška pri odjavi:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const isAdmin = user?.super_korisnik === true;
    const isAuthenticated = !!user;
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth mora biti korišćen unutar AuthProvider-a');
    }
    return context;
}

export default AuthContext;

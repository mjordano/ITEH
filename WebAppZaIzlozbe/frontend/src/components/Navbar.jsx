import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiHome, FiImage, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import CustomButton from './ui/CustomButton';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { path: '/', label: 'Početna', icon: FiHome },
        { path: '/izlozbe', label: 'Izložbe', icon: FiImage },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 bg-luxury-black/90 backdrop-blur-md border-b border-luxury-gray">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-display font-bold text-white tracking-wider">
                            GALERIJA
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                                    ? 'text-white'
                                    : 'text-luxury-silver hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-luxury-silver hover:text-white transition-colors">
                                        <FiUser className="w-5 h-5" />
                                        <span className="text-sm">{user?.username}</span>
                                    </button>

                                    <div className="absolute right-0 top-full mt-2 w-48 bg-luxury-dark border border-luxury-gray opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <Link
                                            to="/profil"
                                            className="flex items-center px-4 py-3 text-sm text-luxury-silver hover:text-white hover:bg-luxury-gray transition-colors"
                                        >
                                            <FiGrid className="w-4 h-4 mr-2" />
                                            Moj profil
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center px-4 py-3 text-sm text-luxury-silver hover:text-white hover:bg-luxury-gray transition-colors"
                                            >
                                                <FiSettings className="w-4 h-4 mr-2" />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-3 text-sm text-luxury-silver hover:text-white hover:bg-luxury-gray transition-colors border-t border-luxury-gray"
                                        >
                                            <FiLogOut className="w-4 h-4 mr-2" />
                                            Odjava
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <CustomButton variant="ghost" size="sm">
                                        Prijava
                                    </CustomButton>
                                </Link>
                                <Link to="/register">
                                    <CustomButton variant="primary" size="sm">
                                        Registracija
                                    </CustomButton>
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-luxury-silver hover:text-white"
                    >
                        {mobileMenuOpen ? (
                            <FiX className="w-6 h-6" />
                        ) : (
                            <FiMenu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden bg-luxury-dark border-t border-luxury-gray animate-slide-up">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-medium ${isActive(link.path)
                                    ? 'text-white bg-luxury-gray'
                                    : 'text-luxury-silver hover:text-white hover:bg-luxury-gray'
                                    }`}
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profil"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-4 py-3 text-sm text-luxury-silver hover:text-white hover:bg-luxury-gray"
                                >
                                    <FiGrid className="w-5 h-5 mr-3" />
                                    Moj profil
                                </Link>

                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center px-4 py-3 text-sm text-luxury-silver hover:text-white hover:bg-luxury-gray"
                                    >
                                        <FiSettings className="w-5 h-5 mr-3" />
                                        Admin Panel
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-sm text-luxury-silver hover:text-white hover:bg-luxury-gray border-t border-luxury-gray mt-2"
                                >
                                    <FiLogOut className="w-5 h-5 mr-3" />
                                    Odjava
                                </button>
                            </>
                        ) : (
                            <div className="pt-4 space-y-2 border-t border-luxury-gray">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <CustomButton variant="outline" fullWidth>
                                        Prijava
                                    </CustomButton>
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <CustomButton variant="primary" fullWidth>
                                        Registracija
                                    </CustomButton>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

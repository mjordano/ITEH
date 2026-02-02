import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/ui/CustomButton';
import InputField from '../components/ui/InputField';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        lozinka: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const from = location.state?.from || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.lozinka) {
            setError('Molimo unesite korisničko ime i lozinku');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await login(formData.username, formData.lozinka);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-8">
                        <span className="text-3xl font-display font-bold text-white tracking-wider">
                            GALERIJA
                        </span>
                    </Link>
                    <h1 className="text-2xl font-display font-semibold text-white mb-2">
                        Dobrodošli nazad
                    </h1>
                    <p className="text-luxury-silver">
                        Prijavite se na svoj nalog
                    </p>
                </div>

                <div className="card-luxury p-8 animate-fade-in">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-start p-4 bg-red-900/20 border border-red-800 text-red-400 text-sm">
                                <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <InputField
                            label="Korisničko ime"
                            name="username"
                            type="text"
                            placeholder="Unesite korisničko ime"
                            value={formData.username}
                            onChange={handleChange}
                            icon={FiUser}
                            required
                        />

                        <InputField
                            label="Lozinka"
                            name="lozinka"
                            type="password"
                            placeholder="Unesite lozinku"
                            value={formData.lozinka}
                            onChange={handleChange}
                            icon={FiLock}
                            required
                        />

                        <CustomButton
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                        >
                            Prijavi se
                        </CustomButton>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-luxury-gray"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-luxury-dark text-luxury-silver">
                                Nemate nalog?
                            </span>
                        </div>
                    </div>

                    <Link to="/register">
                        <CustomButton variant="outline" fullWidth>
                            Registrujte se
                        </CustomButton>
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-luxury-silver text-sm mb-2">Demo nalozi:</p>
                    <div className="text-xs text-luxury-silver space-y-1">
                        <p>Admin: <span className="text-white">admin / admin123</span></p>
                        <p>Korisnik: <span className="text-white">marko / marko123</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

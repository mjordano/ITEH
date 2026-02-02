import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/ui/CustomButton';
import InputField from '../components/ui/InputField';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        lozinka: '',
        lozinkaConfirm: '',
        ime: '',
        prezime: '',
        telefon: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let timer;
        if (success && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (success && countdown === 0) {
            navigate('/login');
        }
        return () => clearInterval(timer);
    }, [success, countdown, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Korisničko ime mora imati najmanje 3 karaktera';
        }

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Unesite validnu email adresu';
        }

        if (!formData.lozinka || formData.lozinka.length < 6) {
            newErrors.lozinka = 'Lozinka mora imati najmanje 6 karaktera';
        }

        if (formData.lozinka !== formData.lozinkaConfirm) {
            newErrors.lozinkaConfirm = 'Lozinke se ne poklapaju';
        }

        if (!formData.ime) {
            newErrors.ime = 'Ime je obavezno';
        }

        if (!formData.prezime) {
            newErrors.prezime = 'Prezime je obavezno';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setError(null);

        const { lozinkaConfirm, ...rawRegisterData } = formData;


        const registerData = {
            ...rawRegisterData,
            username: rawRegisterData.username.trim(),
            email: rawRegisterData.email.trim(),
            ime: rawRegisterData.ime.trim(),
            prezime: rawRegisterData.prezime.trim(),
            telefon: rawRegisterData.telefon ? rawRegisterData.telefon.trim() : '',
        };

        const result = await register(registerData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-8">
                        <span className="text-3xl font-display font-bold text-white tracking-wider">
                            GALERIJA
                        </span>
                    </Link>
                    <h1 className="text-2xl font-display font-semibold text-white mb-2">
                        Kreirajte nalog
                    </h1>
                    <p className="text-luxury-silver">
                        Pridružite se zajednici ljubitelja umetnosti
                    </p>
                </div>

                {success ? (
                    <div className="card-luxury p-8 animate-fade-in text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-900/50 rounded-full flex items-center justify-center">
                            <FiCheck className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl text-white font-bold mb-2">Uspešna registracija!</h2>
                        <p className="text-luxury-silver mb-6">
                            Bićete prebačeni na login stranicu za <span className="text-white font-bold text-xl px-2">{countdown}</span> {countdown === 1 ? 'sekundu' : 'sekunde'}...
                        </p>
                        <div className="spinner mx-auto" />
                    </div>
                ) : (
                    <div className="card-luxury p-8 animate-fade-in">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="flex items-start p-4 bg-red-900/20 border border-red-800 text-red-400 text-sm">
                                    <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Ime"
                                    name="ime"
                                    type="text"
                                    placeholder="Vaše ime"
                                    value={formData.ime}
                                    onChange={handleChange}
                                    error={errors.ime}
                                    required
                                />
                                <InputField
                                    label="Prezime"
                                    name="prezime"
                                    type="text"
                                    placeholder="Vaše prezime"
                                    value={formData.prezime}
                                    onChange={handleChange}
                                    error={errors.prezime}
                                    required
                                />
                            </div>

                            <InputField
                                label="Korisničko ime"
                                name="username"
                                type="text"
                                placeholder="Odaberite korisničko ime"
                                value={formData.username}
                                onChange={handleChange}
                                icon={FiUser}
                                error={errors.username}
                                required
                            />

                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="vas@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                icon={FiMail}
                                error={errors.email}
                                required
                            />

                            <InputField
                                label="Telefon"
                                name="telefon"
                                type="tel"
                                placeholder="+381 60 123 4567"
                                value={formData.telefon}
                                onChange={handleChange}
                                icon={FiPhone}
                                helper="Opciono"
                            />

                            <InputField
                                label="Lozinka"
                                name="lozinka"
                                type="password"
                                placeholder="Najmanje 6 karaktera"
                                value={formData.lozinka}
                                onChange={handleChange}
                                icon={FiLock}
                                error={errors.lozinka}
                                required
                            />

                            <InputField
                                label="Potvrdite lozinku"
                                name="lozinkaConfirm"
                                type="password"
                                placeholder="Ponovite lozinku"
                                value={formData.lozinkaConfirm}
                                onChange={handleChange}
                                icon={FiCheck}
                                error={errors.lozinkaConfirm}
                                required
                            />

                            <CustomButton
                                type="submit"
                                variant="gold"
                                fullWidth
                                loading={loading}
                            >
                                Registruj se
                            </CustomButton>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-luxury-gray"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-luxury-dark text-luxury-silver">
                                    Već imate nalog?
                                </span>
                            </div>
                        </div>

                        <Link to="/login">
                            <CustomButton variant="outline" fullWidth>
                                Prijavite se
                            </CustomButton>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

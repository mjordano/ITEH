import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { izlozbeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExhibitionCard from '../components/ExhibitionCard';
import CustomButton from '../components/ui/CustomButton';

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExhibitions = async () => {
            try {
                setLoading(true);
                const params = {
                    page: 1,
                    per_page: 3,
                    objavljeno: true,
                };

                const data = await izlozbeAPI.getAll(params);
                setExhibitions(data.items || []);
            } catch (err) {
                console.error('Greška pri dohvatanju izložbi:', err);
                setError('Nije moguće učitati izložbe');
            } finally {
                setLoading(false);
            }
        };

        fetchExhibitions();
    }, []);

    return (
        <div className="min-h-screen bg-luxury-black">
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=1920&auto=format&fit=crop"
                        alt="Hero background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-black/80 to-luxury-black" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-wide">
                        Otkrijte Umetnost
                    </h1>
                    <p className="text-xl md:text-2xl text-luxury-silver mb-8 font-light">
                        Ekskluzivne izložbe fotografija na jednom mestu
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/izlozbe">
                            <CustomButton variant="primary" size="lg" icon={FiArrowRight} iconPosition="right">
                                Pregledaj izložbe
                            </CustomButton>
                        </Link>
                        {!isAuthenticated && (
                            <Link to="/register">
                                <CustomButton variant="outline" size="lg">
                                    Pridruži se
                                </CustomButton>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-luxury-silver rounded-full flex items-start justify-center p-2">
                        <div className="w-1 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">
                            Aktuelne Izložbe
                        </h2>
                        <p className="text-luxury-silver max-w-2xl mx-auto">
                            Otkrijte najnovije izložbe u galerijama širom Srbije
                        </p>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="spinner" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {exhibitions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {exhibitions.map((exhibition, index) => (
                                        <div
                                            key={exhibition.id_izlozba}
                                            className="animate-slide-up"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <ExhibitionCard exhibition={exhibition} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-luxury-silver text-lg">
                                        Nema pronađenih izložbi
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {!loading && exhibitions.length > 0 && (
                        <div className="text-center mt-12">
                            <Link to="/izlozbe">
                                <CustomButton variant="outline" icon={FiArrowRight} iconPosition="right">
                                    Pogledaj sve izložbe
                                </CustomButton>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-20 px-4 bg-luxury-dark">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8 border border-luxury-gray hover:border-white transition-colors duration-300">
                            <div className="w-16 h-16 mx-auto mb-6 border border-accent-gold flex items-center justify-center">
                                <span className="text-3xl">🖼️</span>
                            </div>
                            <h3 className="text-xl font-display font-semibold text-white mb-3">
                                Ekskluzivne Izložbe
                            </h3>
                            <p className="text-luxury-silver text-sm">
                                Pristup najboljim izložbama fotografija u regionu
                            </p>
                        </div>

                        <div className="text-center p-8 border border-luxury-gray hover:border-white transition-colors duration-300">
                            <div className="w-16 h-16 mx-auto mb-6 border border-accent-gold flex items-center justify-center">
                                <span className="text-3xl">🎫</span>
                            </div>
                            <h3 className="text-xl font-display font-semibold text-white mb-3">
                                QR Karte
                            </h3>
                            <p className="text-luxury-silver text-sm">
                                Jednostavna prijava i digitalne karte sa QR kodom
                            </p>
                        </div>

                        <div className="text-center p-8 border border-luxury-gray hover:border-white transition-colors duration-300">
                            <div className="w-16 h-16 mx-auto mb-6 border border-accent-gold flex items-center justify-center">
                                <span className="text-3xl">📧</span>
                            </div>
                            <h3 className="text-xl font-display font-semibold text-white mb-3">
                                Email Potvrde
                            </h3>
                            <p className="text-luxury-silver text-sm">
                                Automatska potvrda prijave sa svim detaljima
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

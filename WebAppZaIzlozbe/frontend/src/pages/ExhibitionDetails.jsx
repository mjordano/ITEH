
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { izlozbeAPI, prijaveAPI, slikeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';
import CustomButton from '../components/ui/CustomButton';
import InputField from '../components/ui/InputField';
import Modal from '../components/ui/Modal';

export default function ExhibitionDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [exhibition, setExhibition] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [showModal, setShowModal] = useState(false);
    const [ticketCount, setTicketCount] = useState(1);
    const [registering, setRegistering] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [registerError, setRegisterError] = useState(null);
    const [qrData, setQrData] = useState(null);


    useEffect(() => {
        const fetchExhibition = async () => {
            try {
                setLoading(true);
                const data = await izlozbeAPI.getBySlug(slug);
                setExhibition(data);


                if (data.slike && data.slike.length > 0) {
                    setImages(data.slike);
                } else {

                    const articData = await slikeAPI.getFromArtic({ limit: 8 });
                    setImages(articData.items || []);
                }
            } catch (err) {
                console.error('Greška:', err);
                setError('Izložba nije pronađena');
            } finally {
                setLoading(false);
            }
        };

        fetchExhibition();
    }, [slug]);


    const handleRegisterClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/izlozbe/${slug}` } });
            return;
        }
        setShowModal(true);
    };

    const handleRegister = async () => {
        try {
            setRegistering(true);
            setRegisterError(null);

            const response = await prijaveAPI.create({
                id_izlozba: exhibition.id_izlozba,
                broj_karata: ticketCount,
            });

            setQrData(response.slika_qr);
            setRegisterSuccess(true);
        } catch (err) {
            setRegisterError(err.response?.data?.detail || 'Greška pri prijavi');
        } finally {
            setRegistering(false);
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('sr-Latn-RS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-luxury-black flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (error || !exhibition) {
        return (
            <div className="min-h-screen bg-luxury-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error || 'Izložba nije pronađena'}</p>
                    <CustomButton onClick={() => navigate('/')}>Nazad na početnu</CustomButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-luxury-black pt-20">

            <div className="relative h-[50vh] overflow-hidden">
                <img
                    src={exhibition.thumbnail || exhibition.slika_naslovna?.slika ||
                        'https://images.unsplash.com/photo-1493397212122-2b85def82824?q=80&w=1920&auto=format&fit=crop'}
                    alt={exhibition.naslov}
                    className="w-full h-full object-cover opacity-50"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1493397212122-2b85def82824?q=80&w=1920&auto=format&fit=crop'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/50 to-transparent" />


                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-8 flex items-center text-white hover:text-luxury-light transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5 mr-2" />
                    Nazad
                </button>
            </div>


            <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 animate-fade-in">
                            {exhibition.naslov}
                        </h1>

                        {exhibition.osmislio && (
                            <p className="text-accent-gold text-lg mb-6">
                                Kustos: {exhibition.osmislio}
                            </p>
                        )}


                        <div className="flex flex-wrap gap-6 mb-8 text-luxury-silver">
                            <div className="flex items-center">
                                <FiCalendar className="w-5 h-5 mr-2 text-accent-gold" />
                                {formatDate(exhibition.datum_pocetka)} - {formatDate(exhibition.datum_zavrsetka)}
                            </div>
                            {exhibition.lokacija && (
                                <div className="flex items-center">
                                    <FiMapPin className="w-5 h-5 mr-2 text-accent-gold" />
                                    {exhibition.lokacija.naziv}, {exhibition.lokacija.grad}
                                </div>
                            )}
                            <div className="flex items-center">
                                <FiUsers className="w-5 h-5 mr-2 text-accent-gold" />
                                {exhibition.preostali_kapacitet || exhibition.kapacitet} slobodnih mesta
                            </div>
                        </div>


                        <div className="prose prose-invert max-w-none">
                            <p className="text-luxury-light text-lg leading-relaxed">
                                {exhibition.opis || exhibition.kratak_opis || 'Nema opisa za ovu izložbu.'}
                            </p>
                        </div>


                        <div className="mt-12">
                            <h2 className="text-2xl font-display font-semibold text-white mb-6">
                                Galerija
                            </h2>
                            <ImageGallery images={images} />
                        </div>
                    </div>


                    <div className="lg:col-span-1">
                        <div className="sticky top-24 card-luxury p-6">
                            <h3 className="text-xl font-display font-semibold text-white mb-4">
                                Rezervacija
                            </h3>

                            {exhibition.preostali_kapacitet > 0 ? (
                                <>
                                    <div className="mb-4">
                                        <label className="text-luxury-silver text-sm block mb-2">
                                            Broj karata
                                        </label>
                                        <select
                                            value={ticketCount}
                                            onChange={(e) => setTicketCount(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gray text-white focus:border-white focus:outline-none"
                                        >
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <option key={num} value={num}>
                                                    {num} {num === 1 ? 'karta' : num < 5 ? 'karte' : 'karata'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <CustomButton
                                        variant="gold"
                                        fullWidth
                                        onClick={handleRegisterClick}
                                    >
                                        Prijavi se
                                    </CustomButton>
                                </>
                            ) : (
                                <p className="text-red-500 text-center py-4">
                                    Nema slobodnih mesta
                                </p>
                            )}


                            {exhibition.lokacija && (
                                <div className="mt-6 pt-6 border-t border-luxury-gray">
                                    <h4 className="text-sm font-medium text-white mb-2">Lokacija</h4>
                                    <p className="text-luxury-silver text-sm">
                                        {exhibition.lokacija.naziv}
                                    </p>
                                    <p className="text-luxury-silver text-sm">
                                        {exhibition.lokacija.adresa}
                                    </p>
                                    <p className="text-luxury-silver text-sm">
                                        {exhibition.lokacija.grad}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setRegisterSuccess(false);
                    setRegisterError(null);
                    setQrData(null);
                }}
                title={registerSuccess ? 'Uspešna prijava!' : 'Potvrda prijave'}
                size="md"
            >
                {registerSuccess ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-900/50 rounded-full flex items-center justify-center">
                            <FiCheck className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-white text-lg mb-2">
                            Uspešno ste se prijavili za izložbu!
                        </p>
                        <p className="text-accent-gold font-medium mb-4">
                            Karta sa QR kodom je poslata na vaš email{user?.email ? `: ${user.email}` : ''}
                        </p>
                        <p className="text-luxury-silver text-sm mb-6">
                            Proverite svoje sanduče i pokažite QR kod na ulazu.
                        </p>


                        {qrData && (
                            <div className="mb-6">
                                <img
                                    src={qrData}
                                    alt="QR kod"
                                    className="w-48 h-48 mx-auto border border-luxury-gray"
                                />
                                <p className="text-xs text-luxury-silver mt-2">
                                    Sačuvajte ovaj QR kod
                                </p>
                            </div>
                        )}

                        <CustomButton onClick={() => navigate('/profil')}>
                            Idi na profil
                        </CustomButton>
                    </div>
                ) : (
                    <>
                        <p className="text-luxury-silver mb-4">
                            Da li želite da rezervišete <strong className="text-white">{ticketCount}</strong> {ticketCount === 1 ? 'kartu' : 'karte'} za izložbu <strong className="text-white">{exhibition.naslov}</strong>?
                        </p>

                        {registerError && (
                            <p className="text-red-500 text-sm mb-4">{registerError}</p>
                        )}

                        <Modal.Footer>
                            <CustomButton
                                variant="ghost"
                                onClick={() => setShowModal(false)}
                            >
                                Otkaži
                            </CustomButton>
                            <CustomButton
                                variant="gold"
                                onClick={handleRegister}
                                loading={registering}
                            >
                                Potvrdi
                            </CustomButton>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </div>
    );
}

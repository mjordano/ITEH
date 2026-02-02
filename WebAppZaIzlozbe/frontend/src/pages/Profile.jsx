
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiTrash2, FiDownload, FiCheck, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { prijaveAPI, korisniciAPI } from '../services/api';
import CustomButton from '../components/ui/CustomButton';
import Modal from '../components/ui/Modal';
import InputField from '../components/ui/InputField';

export default function Profile() {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();

    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);


    const [editProfileModal, setEditProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({
        telefon: user?.telefon || '',
        grad: user?.grad || '',
        adresa: user?.adresa || ''
    });

    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    const [qrModal, setQrModal] = useState({ open: false, data: null });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/profil' } });
        }
    }, [isAuthenticated, navigate]);


    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                setLoading(true);
                const data = await prijaveAPI.getMoje();
                setRegistrations(data);
            } catch (err) {
                console.error('Greška:', err);
                setError('Nije moguće učitati prijave');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchRegistrations();
        }
    }, [isAuthenticated]);


    const handleDelete = async () => {
        try {
            setDeleting(true);
            await prijaveAPI.delete(deleteModal.id);
            setRegistrations((prev) => prev.filter((r) => r.id_prijava !== deleteModal.id));
            setDeleteModal({ open: false, id: null });
        } catch (err) {
            console.error('Greška pri brisanju:', err);
        } finally {
            setDeleting(false);
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

    if (authLoading) {
        return (
            <div className="min-h-screen bg-luxury-black flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-luxury-black pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4">

                <div className="mb-12">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Moj Profil
                    </h1>
                    <p className="text-luxury-silver">
                        Dobrodošli, {user?.ime} {user?.prezime}
                    </p>
                    <div className="mt-4">
                        <CustomButton variant="outline" size="sm" onClick={() => setEditProfileModal(true)}>
                            Izmeni Profil
                        </CustomButton>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="card-luxury p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-luxury-silver text-sm">Ukupno prijava</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {registrations.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-accent-gold/20 flex items-center justify-center">
                                <FiCalendar className="w-6 h-6 text-accent-gold" />
                            </div>
                        </div>
                    </div>

                    <div className="card-luxury p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-luxury-silver text-sm">Aktivne prijave</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {registrations.filter((r) => !r.validirano).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-900/30 flex items-center justify-center">
                                <FiClock className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>


                <div>
                    <h2 className="text-2xl font-display font-semibold text-white mb-6">
                        Moje prijave
                    </h2>

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

                    {!loading && !error && registrations.length === 0 && (
                        <div className="text-center py-12 card-luxury">
                            <p className="text-luxury-silver text-lg mb-4">
                                Nemate nijednu prijavu
                            </p>
                            <Link to="/izlozbe">
                                <CustomButton>Pregledaj izložbe</CustomButton>
                            </Link>
                        </div>
                    )}

                    {!loading && !error && registrations.length > 0 && (
                        <div className="space-y-4">
                            {registrations.map((registration) => (
                                <div
                                    key={registration.id_prijava}
                                    className="card-luxury p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >

                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">

                                            {registration.izlozba?.thumbnail && (
                                                <img
                                                    src={registration.izlozba.thumbnail}
                                                    alt={registration.izlozba?.naslov}
                                                    className="w-20 h-20 object-cover hidden sm:block"
                                                />
                                            )}

                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {registration.izlozba?.naslov || 'Izložba'}
                                                </h3>

                                                <div className="flex flex-wrap gap-4 text-sm text-luxury-silver">
                                                    <span className="flex items-center">
                                                        <FiCalendar className="w-4 h-4 mr-1 text-accent-gold" />
                                                        {formatDate(registration.datum_registracije)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <FiUsers className="w-4 h-4 mr-1 text-accent-gold" />
                                                        {registration.broj_karata} karta
                                                    </span>
                                                    {registration.izlozba?.lokacija && (
                                                        <span className="flex items-center">
                                                            <FiMapPin className="w-4 h-4 mr-1 text-accent-gold" />
                                                            {registration.izlozba.lokacija.grad}
                                                        </span>
                                                    )}
                                                </div>


                                                <div className="mt-2">
                                                    {registration.validirano ? (
                                                        <span className="badge-luxury bg-green-900/50 text-green-400 border-green-800">
                                                            <FiCheck className="w-3 h-3 mr-1" />
                                                            Validirana
                                                        </span>
                                                    ) : (
                                                        <span className="badge-gold">
                                                            <FiClock className="w-3 h-3 mr-1" />
                                                            Aktivna
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex items-center gap-2">

                                        {registration.slika_qr && (
                                            <CustomButton
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setQrModal({ open: true, data: registration })}
                                            >
                                                <FiDownload className="w-4 h-4 mr-1" />
                                                QR Kod
                                            </CustomButton>
                                        )}


                                        {!registration.validirano && (
                                            <CustomButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteModal({ open: true, id: registration.id_prijava })}
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </CustomButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                title="Potvrda otkazivanja"
                size="sm"
            >
                <p className="text-luxury-silver mb-4">
                    Da li ste sigurni da želite da otkažete ovu prijavu?
                </p>
                <Modal.Footer>
                    <CustomButton
                        variant="ghost"
                        onClick={() => setDeleteModal({ open: false, id: null })}
                    >
                        Ne
                    </CustomButton>
                    <CustomButton
                        variant="danger"
                        onClick={handleDelete}
                        loading={deleting}
                    >
                        Da, otkaži
                    </CustomButton>
                </Modal.Footer>
            </Modal>


            <Modal
                isOpen={qrModal.open}
                onClose={() => setQrModal({ open: false, data: null })}
                title="QR kod za ulaz"
                size="sm"
            >
                {qrModal.data && (
                    <div className="text-center">
                        <img
                            src={qrModal.data.slika_qr}
                            alt="QR kod"
                            className="w-48 h-48 mx-auto mb-4 border border-luxury-gray"
                        />
                        <p className="text-white font-semibold mb-1">
                            {qrModal.data.izlozba?.naslov}
                        </p>
                        <p className="text-luxury-silver text-sm">
                            {qrModal.data.broj_karata} karta
                        </p>
                        <p className="text-xs text-luxury-silver mt-4">
                            Pokažite ovaj kod na ulazu
                        </p>
                    </div>
                )}
            </Modal>


            <Modal
                isOpen={editProfileModal}
                onClose={() => setEditProfileModal(false)}
                title="Izmeni Profil"
            >
                <div className="space-y-4">
                    <p className="text-sm text-yellow-500 mb-4">
                        Napomena: Ime, prezime i email ne možete menjati.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Ime"
                            value={user?.ime}
                            disabled
                        />
                        <InputField
                            label="Prezime"
                            value={user?.prezime}
                            disabled
                        />
                    </div>

                    <InputField
                        label="Email"
                        value={user?.email}
                        disabled
                    />

                    <InputField
                        label="Grad"
                        value={profileData.grad}
                        onChange={(e) => setProfileData({ ...profileData, grad: e.target.value })}
                        placeholder="Vaš grad"
                    />
                    <InputField
                        label="Adresa"
                        value={profileData.adresa}
                        onChange={(e) => setProfileData({ ...profileData, adresa: e.target.value })}
                        placeholder="Vaša adresa"
                    />
                    <InputField
                        label="Telefon"
                        value={profileData.telefon}
                        onChange={(e) => setProfileData({ ...profileData, telefon: e.target.value })}
                        placeholder="Telefon"
                    />
                </div>
                <Modal.Footer>
                    <CustomButton variant="ghost" onClick={() => setEditProfileModal(false)}>
                        Otkaži
                    </CustomButton>
                    <CustomButton
                        variant="gold"
                        loading={updatingProfile}
                        onClick={async () => {
                            try {
                                setUpdatingProfile(true);
                                const updatedUser = await korisniciAPI.update(user.id_korisnik, profileData);
                                updateUser(updatedUser);
                                setEditProfileModal(false);
                                setSuccessModal(true);
                            } catch (err) {
                                console.error(err);
                                alert("Greška pri ažuriranju profila");
                            } finally {
                                setUpdatingProfile(false);
                            }
                        }}
                    >
                        Sačuvaj
                    </CustomButton>
                </Modal.Footer>
            </Modal>
            <Modal
                isOpen={successModal}
                onClose={() => setSuccessModal(false)}
                title="Uspešna izmena"
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-900/50 rounded-full flex items-center justify-center">
                        <FiCheck className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-white text-lg mb-2">
                        Uspešno ste izmenili podatke!
                    </p>
                    <CustomButton onClick={() => setSuccessModal(false)}>
                        U redu
                    </CustomButton>
                </div>
            </Modal>
        </div>
    );
}

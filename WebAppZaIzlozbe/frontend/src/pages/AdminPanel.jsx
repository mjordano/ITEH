import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUsers, FiImage, FiMapPin, FiCalendar, FiPlus, FiEdit2,
    FiTrash2, FiCheck, FiX, FiEye
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { izlozbeAPI, lokacijeAPI, korisniciAPI, prijaveAPI } from '../services/api';
import CustomButton from '../components/ui/CustomButton';
import Modal from '../components/ui/Modal';
import InputField from '../components/ui/InputField';
import { slugify } from '../utils/helpers';

export default function AdminPanel() {
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState('izlozbe');
    const [loading, setLoading] = useState(true);

    const [exhibitions, setExhibitions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);
    const [registrations, setRegistrations] = useState([]);

    const [stats, setStats] = useState({
        exhibitions: 0,
        locations: 0,
        users: 0,
        registrations: 0,
    });

    const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null });
    const [deleting, setDeleting] = useState(false);

    const [exhibitionModal, setExhibitionModal] = useState({ open: false, mode: 'create', data: null });
    const [locationModal, setLocationModal] = useState({ open: false, mode: 'create', data: null });
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const exhibitionsData = await izlozbeAPI.getAll({ per_page: 50 });
                setExhibitions(exhibitionsData.items || []);

                const locationsData = await lokacijeAPI.getAll();
                setLocations(locationsData);

                let usersData = [];
                if (isAdmin) {
                    usersData = await korisniciAPI.getAll();
                    setUsers(usersData);
                }

                const registrationsData = await prijaveAPI.getAll({ limit: 100 });
                setRegistrations(registrationsData);

                setStats({
                    exhibitions: exhibitionsData.total || exhibitionsData.items?.length || 0,
                    locations: locationsData.length,
                    users: isAdmin && usersData ? usersData.length : 0,
                    registrations: registrationsData.length,
                });

            } catch (err) {
                console.error('Greška:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && isAdmin) {
            fetchData();
        }
    }, [isAuthenticated, isAdmin]);

    const handleDelete = async () => {
        try {
            setDeleting(true);

            switch (deleteModal.type) {
                case 'izlozba':
                    await izlozbeAPI.delete(deleteModal.id);
                    setExhibitions((prev) => prev.filter((e) => e.id_izlozba !== deleteModal.id));
                    break;
                case 'lokacija':
                    await lokacijeAPI.delete(deleteModal.id);
                    setLocations((prev) => prev.filter((l) => l.id_lokacija !== deleteModal.id));
                    break;
                case 'korisnik':
                    await korisniciAPI.delete(deleteModal.id);
                    setUsers((prev) => prev.filter((u) => u.id_korisnik !== deleteModal.id));
                    break;
            }

            setDeleteModal({ open: false, type: '', id: null });
        } catch (err) {
            console.error('Greška pri brisanju:', err);
        } finally {
            setDeleting(false);
        }
    }
    const handleExhibitionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setErrors({});

        try {
            const form = e.target;
            const formDataRaw = new FormData(form);
            const formDataToSend = new FormData();

            console.log("Submitting form...", Object.fromEntries(formDataRaw));

            const newErrors = {};
            const naslov = formDataRaw.get('naslov');
            const id_lokacija = formDataRaw.get('id_lokacija');
            const datum_pocetka = formDataRaw.get('datum_pocetka');
            const datum_zavrsetka = formDataRaw.get('datum_zavrsetka');
            const kapacitet = formDataRaw.get('kapacitet');
            const osmislio = formDataRaw.get('osmislio');

            const thumbnailInput = form.querySelector('input[name="thumbnail_file"]');
            const thumbnailFile = thumbnailInput?.files?.[0];

            if (!naslov?.trim()) newErrors.naslov = 'Naslov je obavezan';
            if (!id_lokacija) newErrors.id_lokacija = 'Lokacija je obavezna';
            if (!datum_pocetka) newErrors.datum_pocetka = 'Datum početka je obavezan';
            if (!datum_zavrsetka) newErrors.datum_zavrsetka = 'Datum završetka je obavezan';
            if (!kapacitet || parseInt(kapacitet) < 1) newErrors.kapacitet = 'Kapacitet mora biti pozitivan broj';
            if (!osmislio?.trim()) newErrors.osmislio = 'Ovo polje je obavezno';

            const start = new Date(datum_pocetka);
            const end = new Date(datum_zavrsetka);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (exhibitionModal.mode === 'create' && start < today) {
                newErrors.datum_pocetka = 'Datum početka ne može biti u prošlosti';
            }
            if (datum_pocetka && end < start) {
                newErrors.datum_zavrsetka = 'Datum završetka mora biti nakon datuma početka';
            }

            if (exhibitionModal.mode === 'create' && !thumbnailFile) {
                newErrors.thumbnail_file = 'Thumbnail slika je obavezna';
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setMessage({ type: 'error', text: 'Molimo proverite uneta polja.' });
                setLoading(false);
                return;
            }
            formDataToSend.append('naslov', naslov);

            let slug = formDataRaw.get('slug');
            if (!slug || slug.trim() === '') {
                slug = slugify(naslov);
            }
            formDataToSend.append('slug', slug);

            formDataToSend.append('id_lokacija', id_lokacija);
            formDataToSend.append('datum_pocetka', datum_pocetka);
            formDataToSend.append('datum_zavrsetka', datum_zavrsetka);
            formDataToSend.append('kapacitet', kapacitet);
            formDataToSend.append('opis', formDataRaw.get('opis') || '');
            formDataToSend.append('kratak_opis', formDataRaw.get('kratak_opis') || '');
            formDataToSend.append('osmislio', osmislio);

            formDataToSend.append('aktivan', formDataRaw.get('aktivan') === 'on');
            formDataToSend.append('objavljeno', formDataRaw.get('objavljeno') === 'on');

            if (thumbnailFile) {
                formDataToSend.append('thumbnail_file', thumbnailFile);
            }

            const galleryFiles = form.slike_files.files;
            if (galleryFiles && galleryFiles.length > 0) {
                for (let i = 0; i < galleryFiles.length; i++) {
                    formDataToSend.append('slike_files', galleryFiles[i]);
                }
            }

            if (exhibitionModal.mode === 'create') {
                await izlozbeAPI.create(formDataToSend);
                setMessage({ type: 'success', text: 'Izložba uspešno kreirana' });
            } else {
                await izlozbeAPI.update(exhibitionModal.data.id_izlozba, formDataToSend);
                setMessage({ type: 'success', text: 'Izložba uspešno ažurirana' });
            }

            const refreshData = await izlozbeAPI.getAll({ per_page: 50 });
            setExhibitions(refreshData.items || []);
            setExhibitionModal({ open: false, mode: 'create', data: null });
        } catch (err) {
            console.error(err);
            let errorMsg = 'Došlo je do greške';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMsg = detail.map(e => `${e.loc ? e.loc[e.loc.length - 1] : 'Greška'}: ${e.msg}`).join(', ');
                } else {
                    errorMsg = detail;
                }
            } else if (err.message) {
                errorMsg = err.message;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            if (locationModal.mode === 'create') {
                const newLoc = await lokacijeAPI.create(data);
                setLocations((prev) => [...prev, newLoc]);
                setMessage('Lokacija uspešno kreirana');
            } else {
                const updated = await lokacijeAPI.update(locationModal.data.id_lokacija, data);
                setLocations((prev) => prev.map((l) => l.id_lokacija === updated.id_lokacija ? updated : l));
                setMessage('Lokacija uspešno ažurirana');
            }

            setLocationModal({ open: false, mode: 'create', data: null });
        } catch (err) {
            console.error(err);
            setMessage('Došlo je do greške');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('sr-Latn-RS');
    };

    const tabs = [
        { id: 'izlozbe', label: 'Izložbe', icon: FiImage },
        { id: 'lokacije', label: 'Lokacije', icon: FiMapPin },
        { id: 'prijave', label: 'Prijave', icon: FiCalendar },
        ...(isAdmin ? [{ id: 'korisnici', label: 'Korisnici', icon: FiUsers }] : []),
    ];

    if (!isAuthenticated || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-luxury-black pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2">
                            Admin Panel
                        </h1>
                        <p className="text-luxury-silver">
                            Upravljanje sadržajem
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card-luxury p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-accent-gold/20 flex items-center justify-center mr-3">
                                <FiImage className="w-5 h-5 text-accent-gold" />
                            </div>
                            <div>
                                <p className="text-luxury-silver text-xs">Izložbe</p>
                                <p className="text-2xl font-bold text-white">{stats.exhibitions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-luxury p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-900/30 flex items-center justify-center mr-3">
                                <FiMapPin className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-luxury-silver text-xs">Lokacije</p>
                                <p className="text-2xl font-bold text-white">{stats.locations}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-luxury p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-900/30 flex items-center justify-center mr-3">
                                <FiCalendar className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-luxury-silver text-xs">Prijave</p>
                                <p className="text-2xl font-bold text-white">{stats.registrations}</p>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="card-luxury p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-900/30 flex items-center justify-center mr-3">
                                    <FiUsers className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-luxury-silver text-xs">Korisnici</p>
                                    <p className="text-2xl font-bold text-white">{stats.users}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex border-b border-luxury-gray mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'text-white border-b-2 border-white'
                                : 'text-luxury-silver hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="card-luxury overflow-hidden">
                        {activeTab === 'izlozbe' && (
                            <div className="p-0">
                                <div className="p-4 flex justify-end border-b border-luxury-gray">
                                    <CustomButton
                                        variant="gold"
                                        icon={FiPlus}
                                        onClick={() => setExhibitionModal({ open: true, mode: 'create', data: null })}
                                    >
                                        Nova Izložba
                                    </CustomButton>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-luxury-gray">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Naslov</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Lokacija</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Datum</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-luxury-silver uppercase">Akcije</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-luxury-gray">
                                            {exhibitions.map((exhibition) => (
                                                <tr key={exhibition.id_izlozba} className="hover:bg-luxury-gray/50">
                                                    <td className="px-4 py-3 text-white">{exhibition.naslov}</td>
                                                    <td className="px-4 py-3 text-luxury-silver">{exhibition.lokacija?.naziv || '-'}</td>
                                                    <td className="px-4 py-3 text-luxury-silver">{formatDate(exhibition.datum_pocetka)}</td>
                                                    <td className="px-4 py-3">
                                                        {exhibition.objavljeno ? (
                                                            <span className="inline-flex items-center text-xs text-green-400">
                                                                <FiCheck className="w-3 h-3 mr-1" /> Objavljeno
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-xs text-yellow-400">
                                                                <FiX className="w-3 h-3 mr-1" /> Draft
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/izlozbe/${exhibition.slug || exhibition.id_izlozba}`)}
                                                                className="p-2 text-luxury-silver hover:text-white transition-colors"
                                                                title="Pregledaj"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setExhibitionModal({ open: true, mode: 'edit', data: exhibition })}
                                                                className="p-2 text-luxury-silver hover:text-accent-gold transition-colors"
                                                                title="Izmeni"
                                                            >
                                                                <FiEdit2 className="w-4 h-4" />
                                                            </button>
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => setDeleteModal({ open: true, type: 'izlozba', id: exhibition.id_izlozba })}
                                                                    className="p-2 text-luxury-silver hover:text-red-400 transition-colors"
                                                                    title="Obriši"
                                                                >
                                                                    <FiTrash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lokacije' && (
                            <div className="p-0">
                                <div className="p-4 flex justify-end border-b border-luxury-gray">
                                    <CustomButton
                                        variant="gold"
                                        icon={FiPlus}
                                        onClick={() => setLocationModal({ open: true, mode: 'create', data: null })}
                                    >
                                        Nova Lokacija
                                    </CustomButton>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-luxury-gray">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Naziv</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Grad</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Adresa</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-luxury-silver uppercase">Akcije</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-luxury-gray">
                                            {locations.map((location) => (
                                                <tr key={location.id_lokacija} className="hover:bg-luxury-gray/50">
                                                    <td className="px-4 py-3 text-white">{location.naziv}</td>
                                                    <td className="px-4 py-3 text-luxury-silver">{location.grad}</td>
                                                    <td className="px-4 py-3 text-luxury-silver">{location.adresa}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setLocationModal({ open: true, mode: 'edit', data: location })}
                                                                className="p-2 text-luxury-silver hover:text-accent-gold transition-colors"
                                                                title="Izmeni"
                                                            >
                                                                <FiEdit2 className="w-4 h-4" />
                                                            </button>
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => setDeleteModal({ open: true, type: 'lokacija', id: location.id_lokacija })}
                                                                    className="p-2 text-luxury-silver hover:text-red-400 transition-colors"
                                                                    title="Obriši"
                                                                >
                                                                    <FiTrash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'prijave' && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-luxury-gray">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Izložba</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Karata</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Datum</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-luxury-gray">
                                        {registrations.map((reg) => (
                                            <tr key={reg.id_prijava} className="hover:bg-luxury-gray/50">
                                                <td className="px-4 py-3 text-white">#{reg.id_prijava}</td>
                                                <td className="px-4 py-3 text-luxury-silver">{reg.izlozba?.naslov || '-'}</td>
                                                <td className="px-4 py-3 text-luxury-silver">{reg.broj_karata}</td>
                                                <td className="px-4 py-3 text-luxury-silver">{formatDate(reg.datum_registracije)}</td>
                                                <td className="px-4 py-3">
                                                    {reg.validirano ? (
                                                        <span className="inline-flex items-center text-xs text-green-400">
                                                            <FiCheck className="w-3 h-3 mr-1" /> Validirana
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs text-yellow-400">
                                                            Aktivna
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'korisnici' && isAdmin && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-luxury-gray">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Korisnik</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Email</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Uloga</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-luxury-silver uppercase">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-luxury-silver uppercase">Akcije</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-luxury-gray">
                                        {users.map((u) => (
                                            <tr key={u.id_korisnik} className="hover:bg-luxury-gray/50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-white">{u.ime} {u.prezime}</p>
                                                        <p className="text-luxury-silver text-xs">@{u.username}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-luxury-silver">{u.email}</td>
                                                <td className="px-4 py-3">
                                                    {u.super_korisnik ? (
                                                        <span className="badge-gold">Admin</span>
                                                    ) : (
                                                        <span className="text-luxury-silver text-xs">Korisnik</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {u.aktivan ? (
                                                        <span className="text-green-400 text-xs">Aktivan</span>
                                                    ) : (
                                                        <span className="text-red-400 text-xs">Neaktivan</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, type: 'korisnik', id: u.id_korisnik })}
                                                        className="p-2 text-luxury-silver hover:text-red-400 transition-colors"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, type: '', id: null })}
                title="Potvrda brisanja"
                size="sm"
            >
                <p className="text-luxury-silver mb-4">
                    Da li ste sigurni da želite da obrišete ovu stavku? Ova akcija se ne može poništiti.
                </p>
                <Modal.Footer>
                    <CustomButton
                        variant="ghost"
                        onClick={() => setDeleteModal({ open: false, type: '', id: null })}
                    >
                        Otkaži
                    </CustomButton>
                    <CustomButton
                        variant="danger"
                        onClick={handleDelete}
                        loading={deleting}
                    >
                        Obriši
                    </CustomButton>
                </Modal.Footer>
            </Modal>

            <Modal
                isOpen={exhibitionModal.open}
                onClose={() => {
                    setExhibitionModal({ open: false, mode: 'create', data: null });
                    setErrors({});
                }}
                title={exhibitionModal.mode === 'create' ? 'Nova Izložba' : 'Izmeni Izložbu'}
                size="lg"
            >
                <form onSubmit={handleExhibitionSubmit} className="space-y-6">
                    <div className="bg-luxury-black/30 p-4 rounded-lg border border-luxury-gray/50">
                        <h3 className="text-lg font-medium text-accent-gold mb-4 border-b border-accent-gold/20 pb-2">
                            Osnovne Informacije
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Naslov"
                                name="naslov"
                                defaultValue={exhibitionModal.data?.naslov}
                                onChange={(e) => {
                                    if (exhibitionModal.mode === 'create') {
                                        const slugInput = document.getElementsByName('slug')[0];
                                        if (slugInput) slugInput.value = e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                    }
                                    setErrors(prev => ({ ...prev, naslov: null }));
                                }}
                                error={errors.naslov}
                                required
                            />
                            <InputField
                                label="Slug (URL)"
                                name="slug"
                                defaultValue={exhibitionModal.data?.slug}
                                placeholder="naziv-izlozbe"
                                error={errors.slug}
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-luxury-light mb-2">
                                Lokacija <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="id_lokacija"
                                className={`w-full bg-luxury-dark border text-white p-3 rounded transition-colors focus:outline-none focus:border-white ${errors.id_lokacija ? 'border-red-500' : 'border-luxury-gray'}`}
                                defaultValue={exhibitionModal.data?.id_lokacija}
                                onChange={() => setErrors(prev => ({ ...prev, id_lokacija: null }))}
                            >
                                <option value="">Izaberite lokaciju...</option>
                                {locations.map(loc => (
                                    <option key={loc.id_lokacija} value={loc.id_lokacija}>
                                        {loc.naziv} ({loc.grad})
                                    </option>
                                ))}
                            </select>
                            {errors.id_lokacija && <p className="mt-1 text-sm text-red-500">{errors.id_lokacija}</p>}
                        </div>

                        <div className="mt-4">
                            <InputField
                                label="Opis"
                                name="opis"
                                defaultValue={exhibitionModal.data?.opis}
                                textarea
                                rows={3}
                                required
                                error={errors.opis}
                                onChange={() => setErrors(prev => ({ ...prev, opis: null }))}
                            />
                        </div>
                    </div>

                    <div className="bg-luxury-black/30 p-4 rounded-lg border border-luxury-gray/50">
                        <h3 className="text-lg font-medium text-accent-gold mb-4 border-b border-accent-gold/20 pb-2">
                            Detalji Događaja
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Datum početka"
                                name="datum_pocetka"
                                type="date"
                                defaultValue={exhibitionModal.data?.datum_pocetka?.split('T')[0]}
                                error={errors.datum_pocetka}
                                required
                                onChange={() => setErrors(prev => ({ ...prev, datum_pocetka: null }))}
                            />
                            <InputField
                                label="Datum završetka"
                                name="datum_zavrsetka"
                                type="date"
                                defaultValue={exhibitionModal.data?.datum_zavrsetka?.split('T')[0]}
                                error={errors.datum_zavrsetka}
                                required
                                onChange={() => setErrors(prev => ({ ...prev, datum_zavrsetka: null }))}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField
                                label="Kapacitet"
                                name="kapacitet"
                                type="number"
                                defaultValue={exhibitionModal.data?.kapacitet}
                                error={errors.kapacitet}
                                required
                                onChange={() => setErrors(prev => ({ ...prev, kapacitet: null }))}
                            />
                            <InputField
                                label="Autor / Kustos"
                                name="osmislio"
                                defaultValue={exhibitionModal.data?.osmislio}
                                error={errors.osmislio}
                                required
                                onChange={() => setErrors(prev => ({ ...prev, osmislio: null }))}
                            />
                        </div>
                    </div>

                    <div className="bg-luxury-black/30 p-4 rounded-lg border border-luxury-gray/50">
                        <h3 className="text-lg font-medium text-accent-gold mb-4 border-b border-accent-gold/20 pb-2">
                            Media (Slike)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-luxury-light mb-2">
                                    Thumbnail Slika {exhibitionModal.mode === 'create' && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="file"
                                    name="thumbnail_file"
                                    accept="image/*"
                                    className={`w-full px-4 py-3 bg-luxury-dark border text-white rounded focus:outline-none ${errors.thumbnail_file ? 'border-red-500' : 'border-luxury-gray'}`}
                                    onChange={() => setErrors(prev => ({ ...prev, thumbnail_file: null }))}
                                />
                                {errors.thumbnail_file && <p className="mt-1 text-sm text-red-500">{errors.thumbnail_file}</p>}
                                {exhibitionModal.data?.thumbnail && (
                                    <div className="mt-2 text-xs text-luxury-silver">
                                        Trenutna: <a href={exhibitionModal.data.thumbnail} target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">{exhibitionModal.data.thumbnail}</a>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-luxury-light mb-2">
                                    Galerija Slika (opciono)
                                </label>
                                <input
                                    type="file"
                                    name="slike_files"
                                    multiple
                                    accept="image/*"
                                    className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gray text-white rounded focus:outline-none focus:border-white"
                                />
                                <p className="mt-1 text-xs text-luxury-silver">Možete izabrati više slika odjednom.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 p-4 bg-luxury-black/30 rounded-lg border border-luxury-gray/50">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    name="objavljeno"
                                    defaultChecked={exhibitionModal.mode === 'create' ? true : exhibitionModal.data?.objavljeno}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-luxury-gray bg-luxury-dark checked:border-accent-gold checked:bg-accent-gold transition-all"
                                />
                                <FiCheck className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100" />
                            </div>
                            <span className="text-luxury-silver group-hover:text-white transition-colors">Javno Objavljeno</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    name="aktivan"
                                    defaultChecked={exhibitionModal.data?.aktivan ?? true}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-luxury-gray bg-luxury-dark checked:border-accent-gold checked:bg-accent-gold transition-all"
                                />
                                <FiCheck className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100" />
                            </div>
                            <span className="text-luxury-silver group-hover:text-white transition-colors">Aktivno (Prijave omogućene)</span>
                        </label>
                    </div>

                    <Modal.Footer className="flex-col !items-stretch gap-4">
                        {message && message.type === 'error' && (
                            <div className="bg-red-900/50 text-red-200 px-4 py-2 rounded text-sm text-center">
                                {message.text}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <CustomButton variant="ghost" type="button" onClick={() => {
                                setExhibitionModal({ open: false, mode: 'create', data: null });
                                setErrors({});
                                setMessage(null);
                            }}>
                                Otkaži
                            </CustomButton>
                            <CustomButton type="submit" variant="gold" loading={loading}>
                                Sačuvaj Izložbu
                            </CustomButton>
                        </div>
                    </Modal.Footer>
                </form>
            </Modal>
            <Modal
                isOpen={locationModal.open}
                onClose={() => setLocationModal({ open: false, mode: 'create', data: null })}
                title={locationModal.mode === 'create' ? 'Nova Lokacija' : 'Izmeni Lokaciju'}
                size="md"
            >
                <form onSubmit={handleLocationSubmit} className="space-y-4">
                    <InputField
                        label="Naziv lokacije"
                        name="naziv"
                        defaultValue={locationModal.data?.naziv}
                        placeholder="npr. Galerija Moderna"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Grad"
                            name="grad"
                            defaultValue={locationModal.data?.grad}
                            placeholder="npr. Beograd"
                            required
                        />
                        <InputField
                            label="Adresa"
                            name="adresa"
                            defaultValue={locationModal.data?.adresa}
                            placeholder="npr. Knez Mihailova 12"
                            required
                        />
                    </div>
                    <InputField
                        label="Opis"
                        name="opis"
                        defaultValue={locationModal.data?.opis}
                        textarea
                        rows={3}
                        placeholder="Kratak opis lokacije..."
                    />

                    <Modal.Footer>
                        <CustomButton variant="ghost" onClick={() => setLocationModal({ open: false, mode: 'create', data: null })}>
                            Otkaži
                        </CustomButton>
                        <CustomButton type="submit" variant="gold" loading={loading}>
                            Sačuvaj
                        </CustomButton>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}


import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi';
import { izlozbeAPI, lokacijeAPI } from '../services/api';
import ExhibitionCard from '../components/ExhibitionCard';
import InputField from '../components/ui/InputField';

export default function Exhibitions() {
    const [searchParams, setSearchParams] = useSearchParams();


    const [exhibitions, setExhibitions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);


    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [city, setCity] = useState(searchParams.get('grad') || '');


    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await lokacijeAPI.getAll();

                const cities = [...new Set(data.map(l => l.grad))];
                setLocations(cities);
            } catch (err) {
                console.error('Greška pri učitavanju lokacija', err);
            }
        };
        fetchLocations();
    }, []);


    useEffect(() => {
        const fetchExhibitions = async () => {
            try {
                setLoading(true);
                const params = {
                    objavljeno: true,
                    limit: 50
                };
                if (search) params.search = search;
                if (city) params.grad = city;

                const data = await izlozbeAPI.getAll(params);
                const items = data.items || [];

                setExhibitions(items);
            } catch (err) {
                console.error('Greška', err);
            } finally {
                setLoading(false);
            }
        };


        const timeoutId = setTimeout(fetchExhibitions, 300);
        return () => clearTimeout(timeoutId);
    }, [search, city]);


    useEffect(() => {
        const params = {};
        if (search) params.q = search;
        if (city) params.grad = city;
        setSearchParams(params);
    }, [search, city, setSearchParams]);

    return (
        <div className="min-h-screen bg-luxury-black pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 animate-fade-in">
                        Aktuelne Izložbe
                    </h1>
                    <p className="text-luxury-silver text-lg max-w-2xl mx-auto">
                        Istražite našu kolekciju umetničkih događaja širom zemlje
                    </p>
                </div>


                <div className="bg-luxury-dark/50 p-6 backdrop-blur-sm border border-luxury-gray/30 mb-12 animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="md:col-span-2">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxury-silver" />
                                <input
                                    type="text"
                                    placeholder="Pretraži po nazivu..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-luxury-black border border-luxury-gray text-white focus:border-white focus:outline-none transition-colors"
                                />
                            </div>
                        </div>


                        <div className="relative">
                            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxury-silver" />
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-luxury-black border border-luxury-gray text-white focus:border-white focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Svi gradovi</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-luxury-silver pointer-events-none" />
                        </div>
                    </div>
                </div>


                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="spinner" />
                    </div>
                ) : exhibitions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {exhibitions.map((exhibition, index) => (
                            <div
                                key={exhibition.id_izlozba}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <ExhibitionCard exhibition={exhibition} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-luxury-silver text-xl">
                            Nema izložbi koje odgovaraju vašim kriterijumima.
                        </p>
                        <button
                            onClick={() => { setSearch(''); setCity(''); }}
                            className="mt-4 text-accent-gold hover:text-white transition-colors"
                        >
                            Poništi filtere
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

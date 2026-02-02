
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';

export default function ExhibitionCard({ exhibition }) {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('sr-Latn-RS', {
            day: 'numeric',
            month: 'short',
        });
    };


    const getStatus = () => {
        const today = new Date();
        const start = new Date(exhibition.datum_pocetka);
        const end = new Date(exhibition.datum_zavrsetka);

        if (today < start) return { text: 'Uskoro', class: 'badge-gold' };
        if (today > end) return { text: 'Završeno', class: 'badge-luxury' };
        return { text: 'Aktivno', class: 'bg-green-900/50 text-green-400 border-green-800' };
    };

    const status = getStatus();
    const thumbnail = (exhibition.thumbnail && exhibition.thumbnail.trim() !== '')
        ? exhibition.thumbnail
        : (exhibition.slika_naslovna?.thumbnail || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop');

    const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop';
    return (
        <Link
            to={`/izlozbe/${exhibition.slug || exhibition.id_izlozba}`}
            className="group block card-luxury overflow-hidden"
        >

            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={thumbnail}
                    alt={exhibition.naslov}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_THUMBNAIL; }}
                />


                <div className="image-overlay flex items-end p-4">
                    <span className="text-sm text-luxury-light">Pogledaj detalje →</span>
                </div>


                <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium border ${status.class}`}>
                        {status.text}
                    </span>
                </div>


                {exhibition.preostali_kapacitet !== undefined && (
                    <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-black/70 text-white">
                            <FiUsers className="w-3 h-3 mr-1" />
                            {exhibition.preostali_kapacitet} mesta
                        </span>
                    </div>
                )}
            </div>


            <div className="p-5">

                <h3 className="text-lg font-display font-semibold text-white mb-2 line-clamp-2 group-hover:text-luxury-light transition-colors">
                    {exhibition.naslov}
                </h3>


                {exhibition.kratak_opis && (
                    <p className="text-sm text-luxury-silver mb-4 line-clamp-2">
                        {exhibition.kratak_opis}
                    </p>
                )}


                <div className="space-y-2 text-sm text-luxury-silver">

                    <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-2 text-accent-gold" />
                        <span>
                            {formatDate(exhibition.datum_pocetka)} - {formatDate(exhibition.datum_zavrsetka)}
                        </span>
                    </div>


                    {exhibition.lokacija && (
                        <div className="flex items-center">
                            <FiMapPin className="w-4 h-4 mr-2 text-accent-gold" />
                            <span className="truncate">
                                {exhibition.lokacija.naziv}, {exhibition.lokacija.grad}
                            </span>
                        </div>
                    )}
                </div>


                {exhibition.osmislio && (
                    <div className="mt-4 pt-4 border-t border-luxury-gray">
                        <p className="text-xs text-luxury-silver">
                            Kustos: <span className="text-white">{exhibition.osmislio}</span>
                        </p>
                    </div>
                )}
            </div>
        </Link>
    );
}

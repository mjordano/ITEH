
import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn } from 'react-icons/fi';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop';

export default function ImageGallery({ images = [] }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;

            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentIndex]);

    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [lightboxOpen]);

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        setIsZoomed(false);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setIsZoomed(false);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setIsZoomed(false);
    };

    const toggleZoom = (e) => {
        e.stopPropagation();
        setIsZoomed(!isZoomed);
    };

    if (!images || images.length === 0) {
        return (
            <div className="text-center py-12 text-luxury-silver">
                Nema dostupnih slika
            </div>
        );
    }

    return (
        <>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <button
                        key={image.id_slika || index}
                        onClick={() => openLightbox(index)}
                        className="group relative aspect-square overflow-hidden bg-luxury-dark border border-luxury-gray hover:border-white transition-all duration-300"
                    >
                        <img
                            src={image.thumbnail || image.slika || FALLBACK_IMAGE}
                            alt={image.naslov || `Slika ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                            referrerPolicy="no-referrer"
                        />

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <FiZoomIn className="w-8 h-8 text-white" />
                        </div>

                        {image.istaknuta && (
                            <div className="absolute top-2 right-2">
                                <span className="bg-accent-gold text-black text-xs px-2 py-1 font-medium">
                                    Istaknuto
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 z-10 p-3 text-white hover:bg-white/10 transition-colors"
                    >
                        <FiX className="w-8 h-8" />
                    </button>

                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:bg-white/10 transition-colors"
                        >
                            <FiChevronLeft className="w-10 h-10" />
                        </button>
                    )}

                    <div
                        className={`relative max-w-5xl max-h-[85vh] mx-auto transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                        onClick={toggleZoom}
                    >
                        <img
                            src={images[currentIndex]?.slika || FALLBACK_IMAGE}
                            alt={images[currentIndex]?.naslov || `Slika ${currentIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain animate-fade-in"
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                            referrerPolicy="no-referrer"
                        />

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                            <h3 className="text-xl font-display text-white mb-1">
                                {images[currentIndex]?.naslov || 'Bez naslova'}
                            </h3>
                            {images[currentIndex]?.fotograf && (
                                <p className="text-luxury-silver">
                                    {images[currentIndex]?.fotograf}
                                </p>
                            )}
                            {images[currentIndex]?.opis && (
                                <p className="text-sm text-luxury-silver mt-2 line-clamp-2">
                                    {images[currentIndex]?.opis}
                                </p>
                            )}
                            <p className="text-xs text-luxury-silver mt-3">
                                {currentIndex + 1} / {images.length}
                            </p>
                        </div>
                    </div>

                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:bg-white/10 transition-colors"
                        >
                            <FiChevronRight className="w-10 h-10" />
                        </button>
                    )}
                </div>
            )}
        </>
    );
}

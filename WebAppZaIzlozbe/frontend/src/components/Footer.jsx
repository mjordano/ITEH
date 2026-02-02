import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-luxury-black border-t border-luxury-gray">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <Link to="/" className="inline-block">
                            <span className="text-2xl font-display font-bold text-white tracking-wider">
                                GALERIJA
                            </span>
                        </Link>
                        <p className="mt-4 text-luxury-silver text-sm max-w-md">
                            Ekskluzivne izložbe fotografija na jednom mestu.
                            Otkrijte remek-dela svetske umetnosti i prijavite se
                            za nezaboravno kulturno iskustvo.
                        </p>

                        <div className="mt-6 flex space-x-4">
                            <a href="#" className="p-2 text-luxury-silver hover:text-white hover:bg-luxury-gray transition-all">
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 text-luxury-silver hover:text-white hover:bg-luxury-gray transition-all">
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 text-luxury-silver hover:text-white hover:bg-luxury-gray transition-all">
                                <FiTwitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Navigacija</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-luxury-silver hover:text-white transition-colors text-sm">
                                    Početna
                                </Link>
                            </li>
                            <li>
                                <Link to="/izlozbe" className="text-luxury-silver hover:text-white transition-colors text-sm">
                                    Izložbe
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-luxury-silver hover:text-white transition-colors text-sm">
                                    Prijava
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-luxury-silver hover:text-white transition-colors text-sm">
                                    Registracija
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Kontakt</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center text-luxury-silver text-sm">
                                <FiMapPin className="w-4 h-4 mr-2 text-accent-gold" />
                                Beograd, Srbija
                            </li>
                            <li className="flex items-center text-luxury-silver text-sm">
                                <FiMail className="w-4 h-4 mr-2 text-accent-gold" />
                                info@galerija.rs
                            </li>
                            <li className="flex items-center text-luxury-silver text-sm">
                                <FiPhone className="w-4 h-4 mr-2 text-accent-gold" />
                                +381 11 123 4567
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-luxury-gray">
                    <p className="text-center text-luxury-silver text-sm">
                        © {currentYear} Galerija Izložbi. Sva prava zadržana.
                    </p>
                </div>
            </div>
        </footer>
    );
}

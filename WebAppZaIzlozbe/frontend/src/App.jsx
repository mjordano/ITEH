import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Exhibitions from './pages/Exhibitions';
import ExhibitionDetails from './pages/ExhibitionDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function Layout({ children, showNavbar = true, showFooter = true }) {
    return (
        <div className="min-h-screen flex flex-col bg-luxury-black">
            {showNavbar && <Navbar />}
            <main className="flex-1">{children}</main>
            {showFooter && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/*str koje vide svi korisnici*/}
                    <Route
                        path="/"
                        element={
                            <Layout showNavbar={false}>
                                <Navbar />
                                <Home />
                            </Layout>
                        }
                    />
                    {/*login i registr str*/}
                    <Route
                        path="/izlozbe"
                        element={
                            <Layout>
                                <Exhibitions />
                            </Layout>
                        }
                    />

                    <Route
                        path="/izlozbe/:slug"
                        element={
                            <Layout showNavbar={false}>
                                <Navbar />
                                <ExhibitionDetails />
                            </Layout>
                        }
                    />

                    {/* Auth stranice - bez footer-a */}
                    <Route
                        path="/login"
                        element={
                            <Layout showNavbar={false} showFooter={false}>
                                <Login />
                            </Layout>
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <Layout showNavbar={false} showFooter={false}>
                                <Register />
                            </Layout>
                        }
                    />

                    {/*str nije pronadjena*/}
                    <Route
                        path="/profil"
                        element={
                            <Layout>
                                <Profile />
                            </Layout>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <Layout>
                                <AdminPanel />
                            </Layout>
                        }
                    />

                    {/* 404 */}
                    <Route
                        path="*"
                        element={
                            <Layout>
                                <div className="min-h-[60vh] flex items-center justify-center">
                                    <div className="text-center">
                                        <h1 className="text-6xl font-display font-bold text-white mb-4">404</h1>
                                        <p className="text-luxury-silver mb-8">Stranica nije pronađena</p>
                                        <a href="/" className="btn-luxury inline-block">
                                            Nazad na početnu
                                        </a>
                                    </div>
                                </div>
                            </Layout>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

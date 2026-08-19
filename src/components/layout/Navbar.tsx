import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  BookOpen,
  Gamepad2,
  Newspaper,
  Bookmark,
  Shield,
  User as UserIcon,
  Search,
  LogOut,
  Smartphone,
  Globe,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { OziLogo } from '../common/OziLogo';

export const Navbar: React.FC<{ onOpenAuthModal?: () => void }> = ({ onOpenAuthModal }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    isAdmin,
    logout,
    mobilePreviewMode,
    setMobilePreviewMode,
    searchQuery,
    setSearchQuery,
    setSelectedWorkId,
    setSelectedChapterId,
  } = useOzi();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleNavClick = (view: any) => {
    setActiveView(view);
    setIsMobileNavOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* ZONE 1: BRAND */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('app_catalogue')}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <OziLogo size="sm" showText={true} />
            </button>

            {/* Quick Context Badges */}
            {activeView === 'admin' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300">
                <Shield className="w-3 h-3" /> Back-Office
              </span>
            )}
            {activeView === 'landing' && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Site Public
              </span>
            )}
          </div>

          {/* ZONE 2: NAV LINKS (Max 5 items, single-line) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('app_catalogue')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'app_catalogue' || activeView === 'app_work_detail' || activeView === 'app_reader'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Catalogue
            </button>

            <button
              onClick={() => handleNavClick('app_games')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeView === 'app_games'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Jeux OZI
            </button>

            <button
              onClick={() => handleNavClick('app_articles')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeView === 'app_articles'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              Carnets & Actus
            </button>

            <button
              onClick={() => handleNavClick('app_library')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeView === 'app_library'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Bibliothèque
            </button>

            <button
              onClick={() => handleNavClick('landing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeView === 'landing'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Landing Page
            </button>
          </nav>

          {/* ZONE 3: ACTIONS & PROFILE */}
          <div className="flex items-center gap-2.5">
            {/* Search Input in Catalogue */}
            {(activeView === 'app_catalogue' || isSearchExpanded) && (
              <div className="relative hidden sm:block w-44 lg:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un manga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Mobile Simulator Toggle */}
            <button
              onClick={() => setMobilePreviewMode(!mobilePreviewMode)}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                mobilePreviewMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Aperçu du format Mobile App Flutter"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{mobilePreviewMode ? 'Vue Mobile ON' : 'Vue App'}</span>
            </button>

            {/* Admin Switcher (Strictly for isAdmin) */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick(activeView === 'admin_dashboard' ? 'app_catalogue' : 'admin_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  activeView === 'admin_dashboard'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{activeView === 'admin_dashboard' ? 'Quitter Admin' : 'Back-Office'}</span>
              </button>
            )}

            {/* User Profile or Login button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500/50"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-slate-200 truncate max-w-[100px]">
                    {currentUser.username}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.username}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-800 text-[10px] font-mono text-amber-400 rounded">
                        {isAdmin ? 'Administrateur' : 'Lecteur OZI'}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          handleNavClick('admin_dashboard');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-purple-300 hover:text-white hover:bg-purple-900/30 flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        Tableau de bord Admin
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleNavClick('app_profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      Mon Profil & Compte
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('app_library');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      Mes Favoris ({currentUser.bookmarks?.length || 0})
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal();
                  else setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                Connexion
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-1.5 text-slate-400 hover:text-white md:hidden cursor-pointer"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Rechercher une série..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleNavClick('app_catalogue')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              Catalogue Mangas & Webtoons
            </button>
            <button
              onClick={() => handleNavClick('app_games')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              Espace Jeux Arcade
            </button>
            <button
              onClick={() => handleNavClick('app_articles')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4 text-emerald-400" />
              Carnets de création & Actus
            </button>
            <button
              onClick={() => handleNavClick('app_library')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              Ma Bibliothèque
            </button>
            <button
              onClick={() => handleNavClick('landing')}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              Landing Page Promotionnelle
            </button>
          </div>
        )}
      </header>

      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

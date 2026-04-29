import { useState, useEffect } from 'react';
import { FunctionComponent } from 'react';
import  Link  from 'next/link';

interface MenuItem {
  name: string;
  link: string;
}

interface NavigationProps {
  isSticky?: boolean;
  logoRef?: HTMLDivElement | null;
}

const Navigation: FunctionComponent<NavigationProps> = ({ isSticky = false, logoRef = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fecha o menu quando clicar fora ou mudar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen && 
          !(e.target as HTMLElement).closest('.side-menu') && 
          !(e.target as HTMLElement).closest('.hamburger-btn')) {
        setIsMenuOpen(false);
      }
    };

    // Prevenir rolagem quando o menu estiver aberto
    const handleBodyScroll = () => {
      document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Aplicar efeito de scroll quando o menu mudar
    handleBodyScroll();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, logoRef]);

  // Menu items para evitar repetição
  const menuItems: MenuItem[] = [
    { name: 'Início', link: '/' },
    { name: 'Partidas', link: '/partidas' },
    { name: 'Rankings', link: '/rankings' },
    { name: 'Notícias', link: '/noticias' }
  ];

  return (
    <nav className={`py-2 transition-all duration-300`}>
      {/* Menu desktop */}
      <ul className="hidden md:flex justify-center gap-8 text-rcs-sec text-base">
        {menuItems.map(item => (
          <li key={item.name} className={`hover:text-rcs-cta cursor-pointer transition-colors duration-200 font-medium ${isSticky ? 'text-white' : ''} `}>
            <Link href={item.link} className="block">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      
      {/* Botão do menu mobile */}
      <div className="md:hidden flex justify-end pr-4">
        <button 
          className="hamburger-btn z-50 flex flex-col justify-center items-center p-2 focus:outline-none"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Menu"
        >
          <span className={`w-6 h-0.5 mb-1 transition-transform duration-300 ${isMenuOpen ? 'transform rotate-45 translate-y-1.5' : ''} ${isSticky ? 'bg-white' : 'bg-rcs-sec'}`}></span>
          <span className={`w-6 h-0.5 ${isSticky ? 'bg-white' : 'bg-rcs-sec'} mb-1 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 ${isSticky ? 'bg-white' : 'bg-rcs-sec'} transition-transform duration-300 ${isMenuOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>
      
      {/* Overlay escuro quando o menu estiver aberto */}
      <div 
        className={`md:hidden fixed inset-0 bg-black z-40 transition-opacity duration-300 ${ 
          isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Menu lateral direito para mobile */}
      <div 
        className={`side-menu md:hidden fixed top-0 right-0 h-screen w-3/4 max-w-xs bg-base-100 z-50 shadow-lg 
                    transform transition-transform duration-300 ease-in-out ${
                      isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
      >
        <div className="flex flex-col !h-full">
          <div className="p-4 border-b border-rcs-sec-400">
            <h3 className="text-xl font-bold text-white">Menu</h3>
          </div>
          
          <ul className="flex-1 p-4 text-rcs-sec">
            {menuItems.map(item => (
              <li key={item.name} className="py-3 border-b border-base-200 hover:text-rcs-cta transition-colors duration-200">
                <Link href={item.link} className="block font-medium text-white">{item.name}</Link>
              </li>
            ))}
          </ul>
          
          <div className="p-4 border-t border-rcs-sec-400">
            <div className="flex gap-2">
              <button className="flex-1 btn btn-sm btn-outline border-rcs-cta text-rcs-cta hover:bg-rcs-cta hover:text-white transition-all duration-200">
                Login
              </button>
              <button className="flex-1 btn btn-sm bg-rcs-cta border-rcs-cta text-white hover:bg-rcs-cta-dark transition-all duration-200">
                Assinar
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

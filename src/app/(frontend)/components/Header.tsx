'use client';

import { useRef, useState, useEffect } from 'react';
import { FunctionComponent } from 'react';
import Navigation from "./Navigation";

export const Header: FunctionComponent = () => {
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);

  // Monitorar o scroll para alterar o estado do header para sticky
  useEffect(() => {
    const header = headerRef.current;
    const logoHeight = logoRef.current?.offsetHeight || 0;
    let headerOffset = header ? header.offsetTop + logoHeight : 0;
    
    const handleScroll = () => {
      if (!header) return;
      
      if (window.scrollY > headerOffset) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    const handleResize = () => {
      if (header && logoRef.current) {
        headerOffset = header.offsetTop + logoRef.current.offsetHeight;
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Chamar uma vez para configurar o estado inicial
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header ref={headerRef} className="relative z-40">
      {/* Container para o conteúdo do header */}
      <div className={`w-full transition-all duration-300 ${isSticky ? 'bg-base-100 shadow-md' : ''}`}>
        <div className="container mx-auto px-4">
          <div className={`flex items-center transition-all duration-300 ease-out ${isSticky ? 'py-2 justify-between' : 'py-3 justify-between'}`}>
            <div 
              ref={logoRef} 
              className={`transition-all duration-300 ease-out mx-auto ${isSticky ? 'w-32 md:w-40' : 'w-56 md:w-64'}`}
            >
              <img className="w-full" src="/logo.png" alt="RCS X" />
            </div>

          </div>
          <Navigation isSticky={false} logoRef={logoRef.current} />
        </div>
      </div>
      
      {/* Espaçador para evitar salto de conteúdo quando header fica sticky */}
      {isSticky && <div className="h-[72px]"></div>}
      
      {/* Header sticky */}
      <div 
        className={`fixed top-0 left-0 right-0 bg-base-100 shadow-md transform transition-transform duration-300 z-40 ${
          isSticky ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="w-32 md:w-40 transition-all duration-300">
              <img className="w-full invert" src="/logo.png" alt="RCS X" />
            </div>
            <div className="flex justify-end">
              <Navigation isSticky={true} logoRef={null} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

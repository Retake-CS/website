interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) => {
  // Função para gerar array de páginas a serem exibidas
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Se temos poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas com ellipsis
      if (currentPage <= 3) {
        // Início: 1, 2, 3, 4, ..., last
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Final: 1, ..., last-3, last-2, last-1, last
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center" aria-label="Paginação">
      <div className="flex items-center space-x-1">
        {/* Botão Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            currentPage === 1
              ? 'text-rcs-sec-300 cursor-not-allowed'
              : 'text-rcs-sec-600 hover:text-rcs-cta hover:bg-rcs-cta/10 hover:shadow-sm'
          }`}
          aria-label="Página anterior"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números das páginas */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-rcs-sec-400 text-sm">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 !rounded-lg text-sm font-bold transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-rcs-cta text-rcs-bg shadow-lg'
                      : 'text-rcs-sec-600 hover:text-rcs-cta hover:bg-rcs-cta/10 hover:shadow-sm'
                  }`}
                  aria-label={`Página ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? 'text-rcs-sec-300 cursor-not-allowed'
              : 'text-rcs-sec-600 hover:text-rcs-cta hover:bg-rcs-cta/10 hover:shadow-sm'
          }`}
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próximo</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Informações da página atual */}
      <div className="ml-6 text-sm text-rcs-sec-500 hidden md:block group">
        Página <span className="font-bold text-rcs-sec-700 group-hover:text-rcs-cta transition-colors duration-300">{currentPage}</span> de{' '}
        <span className="font-bold text-rcs-sec-700 group-hover:text-rcs-cta transition-colors duration-300">{totalPages}</span>
      </div>
    </nav>
  );
};

export default Pagination;

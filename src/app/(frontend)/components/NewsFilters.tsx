interface NewsFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

export const NewsFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalResults
}: NewsFiltersProps) => {
  const sortOptions = [
    { value: "date", label: "Mais Recentes" },
    { value: "title", label: "Título A-Z" },
    { value: "category", label: "Categoria" }
  ];

  return (
    <div className="bg-rcs-sec rounded-lg shadow-sm border border-rcs-sec-400/50 p-3 mb-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Filtros de categoria compactos */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2 text-rcs-bg flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filtrar por Categoria
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-rcs-cta text-white shadow-sm'
                    : 'bg-rcs-sec-500/30 text-rcs-bg border border-rcs-sec-400/50 hover:bg-rcs-sec-500/60 hover:text-rcs-cta'
                }`}
              >
                <span className="truncate">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ordenação e resultados compactos */}
        <div className="flex flex-col sm:flex-row md:items-center gap-2 md:gap-4">
          {/* Contador de resultados */}
          <div className="text-xs flex items-center text-rcs-bg/80 bg-rcs-sec-500/20 px-2.5 py-1.5 rounded">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold">{totalResults}</span>
            <span className="ml-1">
              {totalResults === 1 ? 'notícia encontrada' : 'notícias encontradas'}
            </span>
          </div>

          {/* Seletor de ordenação */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-semibold whitespace-nowrap text-rcs-bg/80">
              Ordenar por:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange((e.target as HTMLSelectElement).value)}
              className="px-2.5 py-1.5 border border-rcs-sec-400/50 rounded text-xs bg-rcs-sec text-rcs-bg focus:outline-none focus:ring-2 focus:ring-rcs-cta focus:border-transparent transition-all duration-300"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indicador de filtro ativo compacto */}
      {selectedCategory !== "Todas" && (
        <div className="mt-3 pt-3 border-t border-rcs-sec-400/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-rcs-bg/80 flex-wrap">
              <span className="font-medium">Filtrando por:</span>
              <span className="px-2 py-0.5 bg-rcs-cta/20 text-rcs-cta rounded font-medium">
                {selectedCategory}
              </span>
            </div>
            <button
              onClick={() => onCategoryChange("Todas")}
              className="text-xs text-rcs-bg/70 hover:text-rcs-cta transition-colors duration-300 flex items-center group px-2 py-1 rounded hover:bg-rcs-sec-500/20"
            >
              <span>Limpar filtros</span>
              <svg className="w-3 h-3 ml-1 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFilters;

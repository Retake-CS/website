interface CSMatchFiltersProps {
  tournaments: string[];
  selectedTournament: string;
  onTournamentChange: (tournament: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  totalMatches: number;
}

export const CSMatchFilters = ({
  tournaments,
  selectedTournament,
  onTournamentChange,
  statusFilter,
  onStatusChange,
  totalMatches
}: CSMatchFiltersProps) => {
  const statusOptions = [
    { value: "all", label: "Todas" },
    { value: "live", label: "Ao Vivo" },
    { value: "upcoming", label: "Próximas" },
    { value: "completed", label: "Finalizadas" }
  ];

  return (
    <div className="bg-rcs-sec rounded-lg shadow-sm border border-rcs-sec-400/50 p-3 mb-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Filtros de torneio compactos */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2 text-rcs-bg flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filtrar por Torneio
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tournaments.map(tournament => (
              <button
                key={tournament}
                onClick={() => onTournamentChange(tournament)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-300 ${
                  selectedTournament === tournament
                    ? 'bg-rcs-cta text-white shadow-sm'
                    : 'bg-rcs-sec-500/30 text-rcs-bg border border-rcs-sec-400/50 hover:bg-rcs-sec-500/60 hover:text-rcs-cta'
                }`}
              >
                <span className="truncate">{tournament}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status e contador compactos */}
        <div className="flex flex-col sm:flex-row md:items-center gap-2 md:gap-4">
          {/* Contador de resultados */}
          <div className="text-xs flex items-center text-rcs-bg/80 bg-rcs-sec-500/20 px-2.5 py-1.5 rounded">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            <span className="font-semibold">{totalMatches}</span>
            <span className="ml-1">
              {totalMatches === 1 ? 'partida' : 'partidas'}
            </span>
          </div>

          {/* Seletor de status */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-select" className="text-xs font-semibold whitespace-nowrap text-rcs-bg/80">
              Status:
            </label>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => onStatusChange((e.target as HTMLSelectElement).value)}
              className="px-2.5 py-1.5 border border-rcs-sec-400/50 rounded text-xs bg-rcs-sec text-rcs-bg focus:outline-none focus:ring-2 focus:ring-rcs-cta focus:border-transparent transition-all duration-300"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indicador de filtro ativo compacto */}
      {(selectedTournament !== "Todos" || statusFilter !== "all") && (
        <div className="mt-3 pt-3 border-t border-rcs-sec-400/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-rcs-bg/80 flex-wrap">
              <span className="font-medium">Filtros:</span>
              {selectedTournament !== "Todos" && (
                <span className="px-2 py-0.5 bg-rcs-cta/20 text-rcs-cta rounded font-medium">
                  {selectedTournament}
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="px-2 py-0.5 bg-rcs-cta/20 text-rcs-cta rounded font-medium">
                  {statusOptions.find(opt => opt.value === statusFilter)?.label}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                onTournamentChange("Todos");
                onStatusChange("all");
              }}
              className="text-xs text-rcs-bg/70 hover:text-rcs-cta transition-colors duration-300 flex items-center group px-2 py-1 rounded hover:bg-rcs-sec-500/20"
            >
              <span>Limpar</span>
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

export default CSMatchFilters;

export default function Sobre() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-rcs-sec mb-6">Sobre o RCS</h1>
      <div className="prose max-w-4xl">
        <p className="text-lg mb-4">
          O RCS (Retake Counter-Strike) é o portal brasileiro dedicado ao Counter-Strike 2,
          oferecendo notícias, rankings, estatísticas e cobertura completa do cenário competitivo.
        </p>
        <p className="mb-4">
          Nossa missão é manter a comunidade brasileira informada sobre tudo que acontece
          no mundo do CS2, desde torneios internacionais até equipes locais.
        </p>
        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">O que oferecemos:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Notícias atualizadas sobre o cenário competitivo</li>
          <li>Rankings e estatísticas em tempo real</li>
          <li>Cobertura completa de torneios e eventos</li>
          <li>Análises e previsões de partidas</li>
          <li>Perfil de jogadores e equipes</li>
        </ul>
      </div>
    </div>
  );
}

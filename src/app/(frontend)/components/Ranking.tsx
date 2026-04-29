import { useEffect, useState } from "react";

// Definindo a interface para o time
interface Team {
  position: number;
  name: string;
  points: number;
  trend: 'up' | 'down' | 'stable';
}

export const Ranking = () => {
  const [topTeams, setTopTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch('/api/rankings?limit=8&sort=position');
        if (!response.ok) {
          throw new Error('Failed to fetch rankings');
        }
        const result = await response.json();
        const teams = result.docs.map((ranking: any) => ({
          position: ranking.position,
          name: ranking.team?.name || 'Unknown Team',
          points: ranking.points,
          trend: ranking.trend,
        }));
        setTopTeams(teams);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        // Fallback to mock data
        setTopTeams([
          { position: 1, name: "Time Alpha", points: 1025 },
          { position: 2, name: "Time Beta", points: 980 },
          { position: 3, name: "Time Gamma", points: 840 },
          { position: 4, name: "Time Delta", points: 790 },
          { position: 5, name: "Time Epsilon", points: 720 },
          { position: 6, name: "Time Zeta", points: 685 },
          { position: 7, name: "Time Theta", points: 650 },
          { position: 8, name: "Time Omega", points: 615 },
        ]);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="card !rounded-lg w-full bg-rcs-sec shadow-sm !h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="card-body p-3 lg:p-4">
        <div className="card-title border-b border-rcs-sec-400 pb-2 flex items-center justify-between text-rcs-bg">
          <h3 className="font-semibold text-lg">RANKING VALVE</h3>
          <button className="btn btn-sm btn-outline hover:bg-rcs-cta ">Ver tudo</button>
        </div>

        <div className="mt-2 overflow-y-auto max-h-[264px] md:max-h-[300px] lg:max-h-[324px] xl:max-h-[344px]">
          <table className="table table-zebra text-sm text-rcs-bg w-full">
            <thead>
              <tr className="bg-rcs-sec-500">
                <th className="py-2 px-2 w-8">#</th>
                <th className="py-2">Time</th>
                <th className="py-2 px-2 text-right w-14">Pts</th>
              </tr>
            </thead>
            <tbody>
              {topTeams.map((team) => (
                <tr key={team.position}>
                  <td className="py-1.5 px-2">
                    <a
                      className="cursor-pointer"
                      onMouseEnter={(e) => e.currentTarget.closest("tr")?.classList.add("text-rcs-cta")}
                      onMouseLeave={(e) => e.currentTarget.closest("tr")?.classList.remove("text-rcs-cta")}
                    >
                      {team.position}
                    </a>
                  </td>
                  <td className="py-1.5">
                    <a
                      className="cursor-pointer"
                      onMouseEnter={(e) => e.currentTarget.closest("tr")?.classList.add("text-rcs-cta")}
                      onMouseLeave={(e) => e.currentTarget.closest("tr")?.classList.remove("text-rcs-cta")}
                    >
                      {team.name}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <span>{team.points}</span>
                      {team.trend === 'up' && <span className="text-green-500 text-[10px]">▲</span>}
                      {team.trend === 'down' && <span className="text-red-500 text-[10px]">▼</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ranking;

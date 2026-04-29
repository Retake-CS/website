interface GameCardProps {
	team1: string;
	team2: string;
	score1: string;
	score2: string;
	live: boolean;
	championship?: string;
	time?: string;
	maxTeamNameLength?: number;
}

const truncateText = (text: string, maxLength: number) => {
	if (text.length <= maxLength) return text;
	return `${text.substring(0, maxLength)}...`;
};

export const GameCard = ({
	team1,
	team2,
	score1,
	score2,
	live,
	championship = "Brasileiro",
	time = "19:00",
	maxTeamNameLength = 14
}: GameCardProps) => (
	<div className={`${live ? "border-rcs-cta" : "border-base-300"} bg-base-200 hover:shadow-md transition-all overflow-hidden shadow-sm h-full cursor-pointer !rounded-lg hover:opacity-90 !transition-all group`}>
		<div className="border-b border-base-300/50 text-xs px-2 py-1 flex justify-between bg-base-300/30 transition-colors">
			<span className="truncate font-medium text-base-content/80 transition-colors" title={championship}>
				{truncateText(championship, 15)}
			</span>
			<div className="flex items-center gap-1.5">
				<span className="text-xs text-base-content/80 group-hover:text-base-content transition-colors">{time}</span>
				{live && <span className="w-2 h-2 rounded-full bg-[red] animate-pulse group-hover:scale-125 transition-transform"></span>}
			</div>
		</div>
		
		<div className="px-2 py-1.5 text-sm group-hover:pl-3 transition-all duration-300">
			<div className="flex items-center justify-between py-0.5">
				<div className="truncate font-medium transition-colors group-hover:translate-x-0.5 transform transition-transform duration-200" title={team1}>{truncateText(team1, maxTeamNameLength)}</div>
				<div className="font-bold ml-2 min-w-[1.5rem] text-center group-hover:scale-110 transition-transform">{score1}</div>
			</div>
			<div className="flex items-center justify-between py-0.5">
				<div className="truncate font-medium transition-colors group-hover:translate-x-0.5 transform transition-transform duration-200" title={team2}>{truncateText(team2, maxTeamNameLength)}</div>
				<div className="font-bold ml-2 min-w-[1.5rem] text-center group-hover:scale-110 transition-transform">{score2}</div>
			</div>
		</div>
	</div>
);

export default GameCard;

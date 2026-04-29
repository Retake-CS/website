interface NewsCardProps {
	title: string;
	image: string;
	description?: string;
	author?: string;
	date?: string;
	id?: number;
	category?: string;
	slug?: string;
}

export const NewsCard = ({ title, image, description, author, date, id = 1, category, slug }: NewsCardProps) => (
	<div className="card !rounded-lg overflow-hidden h-[220px] sm:h-[240px] md:h-[220px] lg:h-[240px] hover:shadow-2xl transition-all cursor-pointer hover:translate-y-[-3px] transform duration-300 group relative">
		<a href={`/noticias/${slug || id}`} className="relative h-full">
			<div 
				className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-90 transition-all duration-300 group-hover:scale-105 transform"
				style={{backgroundImage: `url('${image}')`}}>
			</div>
			<div className="absolute inset-0 bg-gradient-to-t from-rcs-sec-900 via-rcs-sec-900/80 to-transparent"></div>
			
			<div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-rcs-sec-900/80 to-transparent">
				{category && (
					<span className="text-xs font-bold text-rcs-cta bg-rcs-sec-900/50 rounded-full px-2.5 py-0.5 inline-block mb-2 group-hover:bg-rcs-cta/20 transition-all">
						{category.toUpperCase()}
					</span>
				)}
				<h3 className="font-semibold text-base text-rcs-bg transition-colors transform group-hover:translate-x-1 duration-300">{title.toUpperCase()}</h3>
			</div>
			
			<div className="absolute inset-x-0 bottom-0 p-3">
				{description && (
					<p className="text-sm mb-2 line-clamp-2 text-rcs-bg-200 group-hover:text-rcs-bg-100 transition-colors">
						{description}
					</p>
				)}
				
				<div className="flex justify-between items-center">
					<button className="px-2.5 py-1 text-xs font-medium text-rcs-bg bg-rcs-cta/10 border rounded-sm hover:bg-rcs-cta group-hover:bg-rcs-cta transition-all transform group-hover:scale-105 flex items-center">
						<span>Ler mais</span>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
						</svg>
					</button>
					
					{(author || date) && (
						<div className="flex items-center text-xs text-rcs-bg-300 opacity-70 group-hover:opacity-100 transition-opacity">
							{author && (
								<>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<span>{author}</span>
								</>
							)}
							{date && <span className="ml-1 text-[10px] group-hover:text-rcs-cta-200 transition-colors">• {date}</span>}
						</div>
					)}
				</div>
			</div>
		</a>
	</div>
);

export default NewsCard;

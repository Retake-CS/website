import { useEffect, useState } from "react";

interface MainNewsProps {
	title: string;
	image: string;
	description?: string;
	author?: string;
	date?: string;
}

export const MainNews = ({
	title = "Título da notícia principal em destaque que aparece no site",
	image = "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
	description = "Resumo breve da notícia que aparece na primeira tela para chamar atenção do leitor.",
	author = "Redator RCS",
	date = "01/01/2022"
}: Partial<MainNewsProps>) => {
	const [featuredNews, setFeaturedNews] = useState<any>(null);

	useEffect(() => {
		const fetchFeaturedNews = async () => {
			try {
				const response = await fetch('/api/posts?featured=true&limit=1');
				if (!response.ok) {
					throw new Error('Failed to fetch featured news');
				}
				const result = await response.json();
				if (result.docs.length > 0) {
					setFeaturedNews(result.docs[0]);
				}
			} catch (error) {
				console.error('Error fetching featured news:', error);
			}
		};

		fetchFeaturedNews();
	}, []);

	const news = featuredNews || { title, image, description, author, date };

	return (
		<a href={`/noticias/${news.slug || news.id}`} className="block">
			<div className="card w-full h-[320px] lg:h-[380px] xl:h-[500px] overflow-hidden bg-rcs-sec shadow-sm hover:shadow-lg transition-shadow !rounded-lg group">
				<div className="card-body p-0 relative h-full cursor-pointer">
					<div
						className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-75 transition-all duration-500 transform group-hover:scale-105"
						style={{ backgroundImage: `url('${news.heroImage?.url || image}')` }}>
					</div>
					<div className="absolute inset-x-0 bottom-0 p-4 lg:p-5 bg-gradient-to-t-rcs">
						<div className="flex items-center gap-1.5 mb-1">
							<h3 className="!text-xs font-bold text-rcs-bg-300 bg-rcs-cta rounded-full px-2 p-1 mb-1 group-hover:bg-rcs-cta-600 group-hover:scale-105 transition-all duration-300">DESTAQUE</h3>
						</div>
						<h2 className="text-xl lg:text-2xl font-bold text-rcs-bg transition-colors transform group-hover:translate-x-1 duration-300">{(news.title || title).toUpperCase()}</h2>

						{(news.meta?.description || description) && (
							<p className="text-sm mt-2 line-clamp-2 text-rcs-bg-200 max-w-xl group-hover:text-rcs-bg-100 transition-colors">{news.meta?.description || description}</p>
						)}

						<div className="mt-3 flex justify-between items-center">
							<button className="btn btn-sm btn-outline hover:btn-outline text-rcs-bg group-hover:bg-rcs-cta group-hover:scale-105 transition-all hover:bg-rcs-cta relative overflow-hidden">
								<span className="z-10 relative">Ler mais</span>
								<span className="absolute inset-0 w-0 bg-rcs-cta-700 transition-all duration-300 transform group-hover:w-full"></span>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300 z-10 relative" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
								</svg>
							</button>

							{(news.populatedAuthors?.[0]?.name || author) && (
								<div className="flex items-center text-xs text-rcs-bg-300 opacity-60 group-hover:opacity-90 transition-opacity">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 group-hover:text-rcs-cta transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<span>{news.populatedAuthors?.[0]?.name || author}</span>
									{(news.publishedAt || date) && <span className="ml-1 text-[10px] group-hover:text-rcs-cta-200 transition-colors">• {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('pt-BR') : date}</span>}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</a>
	);
};

export default MainNews;

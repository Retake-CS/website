import { useEffect, useState } from "react";
import NewsListItem from "./NewsListItem";

export const NewsListSection = () => {
	const [news, setNews] = useState<any[]>([]);
	const [featuredPost, setFeaturedPost] = useState<any>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch featured post
				const featuredResponse = await fetch('/api/posts?featured=true&limit=1');
				if (featuredResponse.ok) {
					const featuredResult = await featuredResponse.json();
					if (featuredResult.docs.length > 0) {
						setFeaturedPost(featuredResult.docs[0]);
					}
				}

				// Fetch recent news
				const response = await fetch('/api/posts?limit=6'); // Fetch one extra
				if (!response.ok) {
					throw new Error('Failed to fetch news');
				}
				const result = await response.json();
				let recentNews = result.docs;

				// Exclude featured post from recent news
				if (featuredPost) {
					recentNews = recentNews.filter((post: any) => post.id !== featuredPost.id);
				}

				// Take only 5 recent news
				setNews(recentNews.slice(0, 5));
			} catch (error) {
				console.error("Error fetching news:", error);
			}
		};

		fetchData();
	}, []);

	return (
		<section className="w-full">
			<h2 className="text-xl font-bold text-rcs-sec mb-3 flex items-center group cursor-pointer">
				<span className="w-3 h-3 bg-rcs-cta rounded-full mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:bg-rcs-cta-700"></span>
				NOTÍCIAS
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5 ml-2 text-rcs-cta opacity-0 transform -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
						clipRule="evenodd"
					/>
				</svg>
			</h2>

			<div className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
				{news.length > 0 ? (
					news.map((item) => (
						<NewsListItem
							key={item.id}
							id={item.id}
							slug={item.slug}
							title={item.title}
							category={
								item.categories && item.categories.length > 0
									? item.categories[0].title
									: "Geral"
							}
							image={
								item.heroImage?.url ||
								"https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
							}
						/>
					))
				) : (
					<>
						<NewsListItem
							id={1}
							title="Red Canids avança para as semifinais após vitória impressionante"
							category="CS2"
							image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
						/>
						<NewsListItem
							id={2}
							title="Novo patch de atualização traz mudanças significativas para os atiradores"
							category="Valorant"
							image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
						/>
						<NewsListItem
							id={3}
							title="Copa RCS anuncia aumento na premiação para próxima temporada"
							category="Torneios"
							image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
						/>
						<NewsListItem
							id={4}
							title="Entrevista exclusiva com o capitão da equipe campeã do último split"
							category="Entrevistas"
							image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
						/>
						<NewsListItem
							id={5}
							title="As cinco melhores jogadas da semana na liga profissional"
							category="Highlights"
							image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
						/>
					</>
				)}
			</div>
		</section>
	);
};

export default NewsListSection;

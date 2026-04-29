import { FunctionComponent, useEffect, useState } from "react";

const MobileNewsHighlights: FunctionComponent = () => {
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
				const response = await fetch('/api/posts?limit=3'); // Fetch one extra
				if (!response.ok) {
					throw new Error('Failed to fetch news');
				}
				const result = await response.json();
				let recentNews = result.docs;

				// Exclude featured post from recent news
				if (featuredPost) {
					recentNews = recentNews.filter((post: any) => post.id !== featuredPost.id);
				}

				// Take only 2 recent news
				setNews(recentNews.slice(0, 2));
			} catch (error) {
				console.error("Error fetching news:", error);
			}
		};

		fetchData();
	}, []);

	const displayNews = news.length > 0 ? news : [
		{
			id: 1,
			slug: '1',
			title: "Novas estratégias dominam competição em CS2",
			categories: [{ title: "Tático" }],
			heroImage: { url: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg" },
			publishedAt: "2024-09-10",
		},
		{
			id: 2,
			slug: '2',
			title: "Entrevista exclusiva com pro player revela segredos",
			categories: [{ title: "Bastidores" }],
			heroImage: { url: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg" },
			publishedAt: "2024-09-12",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-3">
			{displayNews.map((item) => (
				<a
					key={item.id}
					href={`/noticias/${item.slug || item.id}`}
					className="block bg-rcs-sec-800/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group relative h-[150px]"
				>
					<div
						className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-85 transition-all duration-300"
						style={{ backgroundImage: `url('${item.heroImage?.url || item.image}')` }}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-rcs-sec-900 via-rcs-sec-900/70 to-transparent"></div>

					<div className="absolute inset-x-0 top-2 left-2">
						<span className="text-[10px] font-bold text-rcs-cta bg-rcs-sec-900/50 rounded-full px-1.5 py-0.5 inline-block">
							{item.categories && item.categories.length > 0 ? item.categories[0].title : item.category}
						</span>
					</div>

					<div className="absolute inset-x-0 bottom-0 p-2">
						<h3 className="text-xs font-semibold text-rcs-bg-200 group-hover:text-rcs-cta transition-colors duration-200 line-clamp-2">
							{item.title.toUpperCase()}
						</h3>

						<div className="flex items-center mt-1 text-[10px] text-rcs-bg-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-2.5 w-2.5 mr-1 opacity-70"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
									clipRule="evenodd"
								/>
							</svg>
							<span>{new Date(item.publishedAt).toLocaleDateString("pt-BR")}</span>
						</div>
					</div>
				</a>
			))}
		</div>
	);
};

export default MobileNewsHighlights;

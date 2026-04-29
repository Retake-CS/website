import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";

export const NewsGrid = () => {
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
        const response = await fetch('/api/posts?limit=4'); // Fetch one extra to account for featured
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const result = await response.json();
        let recentNews = result.docs;

        // Exclude featured post from recent news
        if (featuredPost) {
          recentNews = recentNews.filter((post: any) => post.id !== featuredPost.id);
        }

        // Take only 3 recent news
        setNews(recentNews.slice(0, 3));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="container mx-auto px-4 py-4 !pt-0">
      <h2 className="text-xl font-bold text-rcs-sec mb-4 md:mb-6 flex items-center group cursor-pointer">
        <span className="w-3 h-3 bg-rcs-cta rounded-full mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:bg-rcs-cta-600"></span>
        NOTÍCIAS RECENTES
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-rcs-cta opacity-0 transform translate-x-[-8px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length > 0 ? news.map((item) => (
          <NewsCard
            key={item.id}
            id={item.id}
            slug={item.slug}
            title={item.title}
            image={item.heroImage?.url || "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"}
            author={item.populatedAuthors && item.populatedAuthors.length > 0 ? item.populatedAuthors[0].name : "Redator RCS"}
            date={new Date(item.publishedAt).toLocaleDateString('pt-BR')}
            description={item.meta?.description || "Resumo breve da notícia que aparece na primeira tela para chamar atenção do leitor."}
            category={item.categories && item.categories.length > 0 ? item.categories[0].title : ""}
          />
        )) : (
          <>
            <NewsCard
              id={1}
              title="Título da primeira notícia"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              author="Redator RCS"
              date="01/01/2022"
              description="Resumo breve da notícia que aparece na primeira tela para chamar atenção do leitor."
            />
            <NewsCard
              id={2}
              title="Título da segunda notícia"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              author="Redator RCS"
              date="02/01/2022"
              description="Resumo breve da notícia que aparece na primeira tela para chamar atenção do leitor."
            />
            <NewsCard
              id={3}
              title="Título da terceira notícia"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              author="Redator RCS"
              date="03/01/2022"
              description="Resumo breve da notícia que aparece na primeira tela para chamar atenção do leitor."
            />
          </>
        )}
      </div>
    </section>
  );
};

export default NewsGrid;

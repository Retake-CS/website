interface RelatedNewsProps {
  currentNewsId: string;
  category?: string;
}

export const RelatedNews = ({ currentNewsId: _, category: _category }: RelatedNewsProps) => {
  // Normalmente você buscaria notícias relacionadas baseadas na categoria ou tags
  // Aqui estou usando dados estáticos para exemplo
  const relatedNews = [
    {
      id: "2",
      title: "Análise tática: como a Red Canids superou adversários na ESL Pro League",
      image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
      date: "14/09/2024",
      category: "CS2"
    },
    {
      id: "3",
      title: "Entrevista exclusiva com o capitão da equipe vencedora da última temporada",
      image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
      date: "12/09/2024",
      category: "Entrevistas"
    },
    {
      id: "4",
      title: "Confira o cronograma das próximas partidas das semifinais",
      image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
      date: "15/09/2024",
      category: "Torneios"
    }
  ];
  
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-rcs-sec mb-4 flex items-center group cursor-pointer">
        <span className="w-3 h-3 bg-rcs-cta rounded-full mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:bg-rcs-cta-600"></span>
        NOTÍCIAS RELACIONADAS
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedNews.map(news => (
          <a 
            href={`/news/${news.id}`} 
            key={news.id}
            className="bg-rcs-sec/80 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all group"
          >
            <div className="relative h-40 overflow-hidden">
              <img 
                src={news.image} 
                alt={news.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rcs-sec to-transparent opacity-80"></div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-rcs-cta">{news.category}</span>
                <span className="text-xs text-rcs-bg-300">{news.date}</span>
              </div>
              <h3 className="font-medium text-rcs-sec group-hover:text-rcs-cta transition-colors">
                {news.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default RelatedNews;

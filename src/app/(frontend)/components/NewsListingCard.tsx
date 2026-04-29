import { useRef, useEffect } from "react";

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  tags: string[];
}

interface NewsListingCardProps {
  news: NewsArticle;
  featured?: boolean;
  animate?: boolean;
  delay?: number;
}

export const NewsListingCard = ({ 
  news, 
  featured = false, 
  animate = false, 
  delay = 0 
}: NewsListingCardProps) => {
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (animate && cardRef.current) {
      cardRef.current.style.opacity = "0";
      cardRef.current.style.transform = "translateY(20px)";
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
          cardRef.current.style.opacity = "1";
          cardRef.current.style.transform = "translateY(0)";
        }
      }, delay);
    }
  }, [animate, delay]);

  if (featured) {
    // Card principal - EXATAMENTE igual ao MainNews da homepage
    return (
      <div className="card w-full h-[320px] lg:h-[380px] xl:h-[500px] overflow-hidden bg-rcs-sec shadow-sm hover:shadow-lg transition-shadow !rounded-lg group">
        <div className="card-body p-0 relative h-full cursor-pointer">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-75 transition-all duration-500 transform group-hover:scale-105"
            style={{ backgroundImage: `url('${news.image}')` }}
          ></div>
          <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5 bg-gradient-to-t-rcs">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="!text-xs font-bold text-rcs-bg-300 bg-rcs-cta rounded-full px-2 p-1 mb-1 group-hover:bg-rcs-cta-600 group-hover:scale-105 transition-all duration-300">DESTAQUE</h3>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-rcs-bg transition-colors transform group-hover:translate-x-1 duration-300">{news.title.toUpperCase()}</h2>
            
            {news.excerpt && (
              <p className="text-sm mt-2 line-clamp-2 text-rcs-bg-200 max-w-xl group-hover:text-rcs-bg-100 transition-colors">{news.excerpt}</p>
            )}
            
            <div className="mt-3 flex justify-between items-center">
              <button className="btn btn-sm btn-outline hover:btn-outline text-rcs-bg group-hover:bg-rcs-cta group-hover:scale-105 transition-all hover:bg-rcs-cta relative overflow-hidden">
                <span className="z-10 relative">Ler mais</span>
                <span className="absolute inset-0 w-0 bg-rcs-cta-700 transition-all duration-300 transform group-hover:w-full"></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300 z-10 relative" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {news.author && (
                <div className="flex items-center text-xs text-rcs-bg-300 opacity-60 group-hover:opacity-90 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 group-hover:text-rcs-cta transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{news.author}</span>
                  {news.date && <span className="ml-1 text-[10px] group-hover:text-rcs-cta-200 transition-colors">• {news.date}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cards da listagem - EXATAMENTE igual ao NewsCard da homepage
  return (
    <div 
      ref={cardRef}
      className="card !rounded-lg overflow-hidden h-[220px] sm:h-[240px] md:h-[220px] lg:h-[240px] hover:shadow-2xl transition-all cursor-pointer hover:translate-y-[-3px] transform duration-300 group relative"
    >
      <a href={`/noticia/${news.id}`} className="relative h-full">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-90 transition-all duration-300 group-hover:scale-105 transform"
          style={{backgroundImage: `url('${news.image}')`}}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-rcs-sec-900 via-rcs-sec-900/80 to-transparent"></div>
        
        <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-rcs-sec-900/80 to-transparent">
          {news.category && (
            <span className="text-xs font-bold text-rcs-cta bg-rcs-sec-900/50 rounded-full px-2.5 py-0.5 inline-block mb-2 group-hover:bg-rcs-cta/20 transition-all">
              {news.category.toUpperCase()}
            </span>
          )}
          <h3 className="font-semibold text-base text-rcs-bg group-hover:text-rcs-cta transition-colors transform group-hover:translate-x-1 duration-300">{news.title.toUpperCase()}</h3>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 p-3">
          {news.excerpt && (
            <p className="text-sm mb-2 line-clamp-2 text-rcs-bg-200 group-hover:text-rcs-bg-100 transition-colors">
              {news.excerpt}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <button className="px-2.5 py-1 text-xs font-medium text-rcs-bg bg-rcs-cta/10 border rounded-sm hover:bg-rcs-cta group-hover:bg-rcs-cta transition-all transform group-hover:scale-105 flex items-center">
              <span>Ler mais</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {(news.author || news.date) && (
              <div className="flex items-center text-xs text-rcs-bg-300 opacity-70 group-hover:opacity-100 transition-opacity">
                {news.author && (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{news.author}</span>
                  </>
                )}
                {news.date && <span className="ml-1 text-[10px] group-hover:text-rcs-cta-200 transition-colors">• {news.date}</span>}
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
};

export default NewsListingCard;
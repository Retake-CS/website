import { useState, useEffect } from "react";
import Header from "../components/Header";
import LiveGames from "../components/LiveGames";
import Footer from "../components/Footer";
import Ranking from "../components/Ranking";
import NewsListingCard from "../components/NewsListingCard";
import NewsFilters from "../components/NewsFilters";
import Pagination from "../components/Pagination";

// Interface para os dados das notícias
interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  tags: string[];
}

// Dados de exemplo das notícias
const newsData: NewsArticle[] = [
  {
    id: 1,
    title: "Red Canids avança para as semifinais após vitória impressionante contra Complexity",
    excerpt: "A equipe brasileira conseguiu uma vitória dominante na ESL Pro League Season 20, mostrando por que são considerados um dos times mais fortes da América Latina.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "CS2",
    author: "Redator RCS",
    date: "13/09/2024",
    readTime: "3 min",
    featured: true,
    tags: ["Red Canids", "ESL Pro League", "CS2", "coldzera"]
  },
  {
    id: 2,
    title: "Novo patch de Valorant traz mudanças significativas para os atiradores",
    excerpt: "Riot Games anuncia alterações importantes no meta dos atiradores que podem revolucionar o cenário competitivo do jogo.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "Valorant",
    author: "Ana Silva",
    date: "12/09/2024",
    readTime: "5 min",
    featured: false,
    tags: ["Valorant", "Patch", "Atiradores", "Meta"]
  },
  {
    id: 3,
    title: "Copa RCS anuncia aumento na premiação para próxima temporada",
    excerpt: "O torneio nacional de esports terá um prize pool 40% maior, atraindo mais equipes e elevando o nível da competição brasileira.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "Torneios",
    author: "Carlos Mendes",
    date: "11/09/2024",
    readTime: "4 min",
    featured: true,
    tags: ["Copa RCS", "Premiação", "Torneios", "Brasil"]
  },
  {
    id: 4,
    title: "Entrevista exclusiva com o capitão da equipe campeã do último split",
    excerpt: "Conversamos com o líder da equipe vencedora sobre estratégias, preparação mental e os desafios enfrentados durante a temporada.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "Entrevistas",
    author: "Marina Costa",
    date: "10/09/2024",
    readTime: "8 min",
    featured: false,
    tags: ["Entrevista", "Capitão", "Estratégia", "Mental"]
  },
  {
    id: 5,
    title: "As cinco melhores jogadas da semana na liga profissional",
    excerpt: "Selecionamos os momentos mais impressionantes das partidas desta semana, com plays que ficaram marcados na história.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "Highlights",
    author: "Pedro Santos",
    date: "09/09/2024",
    readTime: "6 min",
    featured: false,
    tags: ["Highlights", "Jogadas", "Liga", "Semana"]
  },
  {
    id: 6,
    title: "Análise tática: como as equipes europeias dominam o cenário internacional",
    excerpt: "Um estudo aprofundado sobre as estratégias e metodologias que colocam as equipes europeias no topo do cenário mundial.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "Análise",
    author: "Roberto Lima",
    date: "08/09/2024",
    readTime: "10 min",
    featured: true,
    tags: ["Análise", "Tática", "Europa", "Internacional"]
  },
  {
    id: 7,
    title: "Mercado de transferências: principais movimentações da temporada",
    excerpt: "Acompanhe as principais contratações e transferências que estão moldando o cenário competitivo para a próxima temporada.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "Mercado",
    author: "Juliana Ferreira",
    date: "07/09/2024",
    readTime: "7 min",
    featured: false,
    tags: ["Transferências", "Mercado", "Contratações", "Temporada"]
  },
  {
    id: 8,
    title: "Tecnologia e esports: como a IA está revolucionando os treinos",
    excerpt: "Descubra como a inteligência artificial está sendo utilizada para aprimorar o desempenho dos jogadores profissionais.",
    content: "Conteúdo completo da notícia...",
    image: "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: "Tecnologia",
    author: "Lucas Oliveira",
    date: "06/09/2024",
    readTime: "9 min",
    featured: false,
    tags: ["IA", "Tecnologia", "Treinos", "Inovação"]
  }
];

export const NewsListing = () => {
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>(newsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [sortBy, setSortBy] = useState<string>("date");
  const [isLoading, setIsLoading] = useState(false);
  
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  
  // Categorias disponíveis
  const categories = ["Todas", ...Array.from(new Set(newsData.map(news => news.category)))];
  
  // Função para filtrar notícias
  const filterNews = (category: string, sort: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = category === "Todas" 
        ? newsData 
        : newsData.filter(news => news.category === category);
      
      // Ordenação
      filtered = filtered.sort((a, b) => {
        switch (sort) {
          case "date":
            return new Date(b.date.split('/').reverse().join('-')).getTime() - 
                   new Date(a.date.split('/').reverse().join('-')).getTime();
          case "title":
            return a.title.localeCompare(b.title);
          case "category":
            return a.category.localeCompare(b.category);
          default:
            return 0;
        }
      });
      
      setFilteredNews(filtered);
      setCurrentPage(1);
      setIsLoading(false);
    }, 300);
  };
  
  // Efeito para filtrar quando categoria ou ordenação mudam
  useEffect(() => {
    filterNews(selectedCategory, sortBy);
  }, [selectedCategory, sortBy]);
  
  // Calcular notícias da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <div className="bg-rcs-bg bg-cover bg-center min-h-screen">
      <Header />
      <LiveGames />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-rcs-sec-400 mb-6" aria-label="Breadcrumb">
          <a href="/" className="hover:text-rcs-cta transition-colors hover:underline">Início</a>
          <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-rcs-sec-600 font-medium">Notícias</span>
        </nav>
        
        {/* Cabeçalho da página */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-rcs-sec mb-4 flex items-center group">
            <span className="w-3 h-3 bg-rcs-cta rounded-full mr-2 group-hover:scale-125 transition-transform duration-300"></span>
            TODAS AS NOTÍCIAS
          </h1>
          <p className="text-rcs-sec-600 text-sm md:text-base max-w-2xl">
            Fique por dentro de tudo que acontece no mundo dos esports. 
            Notícias, análises, entrevistas e muito mais.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Área principal de conteúdo */}
          <div className="lg:col-span-3">
            {/* Filtros */}
            <NewsFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalResults={filteredNews.length}
            />
            
            {/* Lista de notícias */}
            {isLoading ? (
              // Loading skeleton
              <div>
                {/* Skeleton para notícia principal */}
                {currentPage === 1 && (
                  <div className="animate-pulse mb-8">
                    <div className="bg-rcs-sec-100 !rounded-lg h-[320px] lg:h-[380px] xl:h-[500px]">
                      <div className="w-full h-full bg-rcs-sec-200 !rounded-lg"></div>
                    </div>
                  </div>
                )}
                
                {/* Skeleton para grid de notícias */}
                {/* Skeleton para lista de notícias */}
                <div className="rounded-xl shadow-lg overflow-hidden divide-y divide-rcs-sec-400/10">
                  {[...Array(currentPage === 1 ? 5 : 6)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center gap-3 md:gap-5 px-2 sm:px-3 md:px-5 py-2.5 md:py-4">
                      <div className="w-[56px] h-[42px] xs:w-[64px] xs:h-[48px] md:w-[88px] md:h-[64px] bg-rcs-sec-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex flex-col min-w-0 flex-1 space-y-2">
                        <div className="h-3 bg-rcs-sec-200 rounded w-16"></div>
                        <div className="h-4 bg-rcs-sec-200 rounded w-3/4"></div>
                      </div>
                      <div className="w-5 h-5 bg-rcs-sec-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentNews.length > 0 ? (
              <div>
                {/* Primeira notícia em destaque (apenas na primeira página) */}
                {currentPage === 1 && currentNews.length > 0 && (
                  <div className="mb-8">
                    <NewsListingCard
                      key={currentNews[0].id}
                      news={currentNews[0]}
                      featured={true}
                      animate={true}
                      delay={0}
                    />
                  </div>
                )}
                
                {/* Demais notícias em grid */}
                {/* Seção de notícias em lista - igual à homepage */}
                <div className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {currentNews.slice(currentPage === 1 ? 1 : 0).map((news, index) => (
                    <a
                      key={news.id}
                      href={`/noticia/${news.id}`}
                      className={`group flex items-center gap-3 md:gap-5 px-2 sm:px-3 md:px-5 py-2.5 md:py-4 transition-all duration-300 hover:bg-rcs-sec-700/60 hover:shadow-lg focus:shadow-lg focus:bg-rcs-sec-700/70 outline-none focus:outline-rcs-cta focus:outline-offset-[-2px] rounded-sm`}
                      style={{ 
                        opacity: 0,
                        transform: 'translateY(16px) scale(0.98)',
                        animation: `fadeInUp 0.4s cubic-bezier(.4,0,.2,1) ${(index + (currentPage === 1 ? 1 : 0)) * 60}ms forwards`
                      }}
                      tabIndex={0}
                    >
                      {news.image && (
                        <div className="overflow-hidden rounded-lg w-[56px] h-[42px] xs:w-[64px] xs:h-[48px] md:w-[88px] md:h-[64px] flex-shrink-0 bg-rcs-bg-200 shadow transition-shadow duration-300 group-hover:shadow-md">
                          <div
                            className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110 group-focus:scale-110 group-focus:brightness-110"
                            style={{ backgroundImage: `url('${news.image}')` }}
                          ></div>
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        {news.category && (
                          <span className="text-[10px] font-bold text-rcs-cta mb-0.5 tracking-wide uppercase transition-colors duration-200 group-hover:text-rcs-cta-700 group-focus:text-rcs-cta-700">
                            {news.category}
                          </span>
                        )}
                        <h3 className="font-semibold text-base md:text-lg text-rcs-sec transition-all duration-200 group-hover:text-rcs-cta group-focus:text-rcs-cta transform-gpu group-hover:translate-x-0.5 group-focus:translate-x-0.5">
                          {news.title.toUpperCase()}
                        </h3>
                      </div>
                      <div className="ml-auto self-center opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-focus:opacity-100 group-focus:translate-x-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rcs-cta" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-rcs-sec-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform duration-300">
                  <svg className="w-8 h-8 text-rcs-sec-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-rcs-sec-600 mb-2">Nenhuma notícia encontrada</h3>
                <p className="text-rcs-sec-400">Tente ajustar os filtros para encontrar mais conteúdo.</p>
              </div>
            )}
            
            {/* Paginação */}
            {totalPages > 1 && !isLoading && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
          
          {/* Sidebar direita */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Ranking Valve */}
              <div className="bg-white !rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <Ranking />
              </div>
              
              {/* Seção de Anúncio */}
              <div className="bg-rcs-cta !rounded-lg overflow-hidden p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-rcs-cta-400/20 hover:scale-105">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-2 h-2 bg-rcs-bg rounded-full mr-2 group-hover:scale-125 transition-transform duration-300"></div>
                    <h3 className="font-bold text-rcs-bg text-base tracking-wide">ANUNCIE AQUI</h3>
                  </div>
                  <p className="text-sm text-rcs-bg-100 mb-4 max-w-xs mx-auto leading-relaxed">
                    Impulsione sua marca para milhares de fãs de esports no Brasil! 
                    Alcance seu público-alvo com nossa audiência engajada.
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-center space-x-2 text-xs text-rcs-bg-200">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1 hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        +50k visualizações/mês
                      </span>
                    </div>
                    <a 
                      href="/contato" 
                      className="inline-flex items-center px-6 py-3 bg-rcs-bg text-rcs-cta font-bold !rounded-lg transition-all duration-300 hover:bg-rcs-bg-100 hover:shadow-lg hover:scale-105 group"
                    >
                      <span>Fale Conosco</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Newsletter */}
              <div className="bg-rcs-sec !rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <h3 className="font-bold text-rcs-bg text-base mb-2 flex items-center justify-center group">
                    <svg className="w-5 h-5 mr-2 text-rcs-cta group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    NEWSLETTER
                  </h3>
                  <p className="text-sm text-rcs-bg-300 mb-4">
                    Receba as principais notícias do mundo dos esports direto no seu email.
                  </p>
                  <form className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Seu melhor email"
                      className="w-full px-4 py-2 !rounded-lg border border-rcs-sec-400 bg-rcs-sec-700 text-rcs-bg placeholder-rcs-bg-400 focus:outline-none focus:ring-2 focus:ring-rcs-cta focus:border-transparent transition-all duration-300 hover:shadow-sm"
                    />
                    <button 
                      type="submit"
                      className="w-full bg-rcs-cta hover:bg-rcs-cta-600 text-rcs-bg font-bold py-2 px-4 !rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      Inscrever-se
                    </button>
                  </form>
                  <p className="text-xs text-rcs-bg-400 mt-2">
                    Sem spam. Cancele quando quiser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsListing;

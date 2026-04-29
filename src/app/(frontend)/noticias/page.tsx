'use client';

import { useState, useEffect } from "react";
import Header from "../components/Header";
import LiveGames from "../components/LiveGames";
import Footer from "../components/Footer";
import Ranking from "../components/Ranking";
import NewsListingCard from "../components/NewsListingCard";
import NewsFilters from "../components/NewsFilters";
import Pagination from "../components/Pagination";

// Interface para os dados das notícias do PayloadCMS
interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  meta?: {
    description?: string;
  };
  heroImage?: {
    url: string;
  };
  categories?: Array<{
    title: string;
  }>;
  populatedAuthors?: Array<{
    name: string;
  }>;
  publishedAt: string;
  featured: boolean;
}

const NewsListing = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [sortBy, setSortBy] = useState<string>("date");
  const [isLoading, setIsLoading] = useState(true);
  const [totalDocs, setTotalDocs] = useState(0);
  const [featuredPost, setFeaturedPost] = useState<NewsArticle | null>(null);

  const itemsPerPage = 6;

  // Buscar notícia de destaque
  const fetchFeaturedPost = async (category = "Todas") => {
    try {
      let url = '/api/posts?featured=true&limit=1';
      if (category !== "Todas") {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        if (result.docs.length > 0) {
          setFeaturedPost(result.docs[0]);
        } else {
          setFeaturedPost(null);
        }
      }
    } catch (error) {
      console.error('Error fetching featured post:', error);
      setFeaturedPost(null);
    }
  };

  // Buscar notícias da API
  const fetchNews = async (category = "Todas", sort = "date", page = 1) => {
    setIsLoading(true);
    try {
      let url = `/api/posts?limit=${itemsPerPage * 10}&page=${page}`;

      if (category !== "Todas") {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const result = await response.json();
      let docs = result.docs;

      // Excluir a notícia de destaque da lista se ela existir
      if (featuredPost) {
        docs = docs.filter((post: NewsArticle) => post.id !== featuredPost.id);
      }

      setNews(docs);
      setTotalDocs(result.totalDocs);

      // Aplicar filtros e ordenação no frontend
      let filtered = docs;

      // Ordenação
      filtered = filtered.sort((a: NewsArticle, b: NewsArticle) => {
        switch (sort) {
          case "date":
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          case "title":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      setFilteredNews(filtered);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
      setFilteredNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito inicial para buscar notícias e destaque
  useEffect(() => {
    const loadData = async () => {
      await fetchFeaturedPost(selectedCategory);
      await fetchNews(selectedCategory);
    };
    loadData();
  }, []);

  // Efeito para filtrar quando categoria ou ordenação mudam
  useEffect(() => {
    if (news.length > 0 || featuredPost) {
      fetchFeaturedPost(selectedCategory);
      fetchNews(selectedCategory, sortBy, currentPage);
    }
  }, [selectedCategory, sortBy]);

  // Calcular notícias da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // Extrair categorias únicas dos dados
  const categories: string[] = ["Todas", ...Array.from(new Set(news.map(item => item.categories?.[0]?.title).filter(Boolean) as string[]))];

  // Converter dados do PayloadCMS para o formato esperado pelos componentes
  const convertToNewsFormat = (item: NewsArticle) => ({
    id: parseInt(item.id, 10), // Convert to number for NewsListingCard
    title: item.title,
    slug: item.slug,
    excerpt: item.meta?.description || "",
    image: item.heroImage?.url || "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg",
    category: item.categories?.[0]?.title || "Geral",
    author: item.populatedAuthors?.[0]?.name || "Redator RCS",
    date: new Date(item.publishedAt).toLocaleDateString('pt-BR'),
    readTime: "3 min",
    featured: item.featured,
    tags: []
  });

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
                {currentPage === 1 && featuredPost && (
                  <div className="mb-8">
                    <NewsListingCard
                      key={featuredPost.id}
                      news={convertToNewsFormat(featuredPost)}
                      featured={true}
                      animate={true}
                      delay={0}
                    />
                  </div>
                )}

                {/* Demais notícias em grid */}
                {/* Seção de notícias em lista - igual à homepage */}
                <div className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {currentNews.map((newsItem, index) => {
                    const convertedNews = convertToNewsFormat(newsItem);
                    return (
                      <a
                        key={newsItem.id}
                        href={`/noticias/${newsItem.slug || newsItem.id}`}
                        className={`group flex items-center gap-3 md:gap-5 px-2 sm:px-3 md:px-5 py-2.5 md:py-4 transition-all duration-300 hover:shadow-lg focus:shadow-lg focus:bg-rcs-sec-700/70 outline-none focus:outline-rcs-cta focus:outline-offset-[-2px] rounded-sm`}
                        style={{
                          opacity: 0,
                          transform: 'translateY(16px) scale(0.98)',
                          animation: `fadeInUp 0.4s cubic-bezier(.4,0,.2,1) ${index * 60}ms forwards`
                        }}
                        tabIndex={0}
                      >
                        {convertedNews.image && (
                          <div className="overflow-hidden rounded-lg w-[56px] h-[42px] xs:w-[64px] xs:h-[48px] md:w-[88px] md:h-[64px] flex-shrink-0 bg-rcs-bg-200 shadow transition-shadow duration-300 group-hover:shadow-md">
                            <div
                              className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110 group-focus:scale-110 group-focus:brightness-110"
                              style={{ backgroundImage: `url('${convertedNews.image}')` }}
                            ></div>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          {convertedNews.category && (
                            <span className="text-[10px] font-bold text-rcs-cta mb-0.5 tracking-wide uppercase transition-colors duration-200 group-hover:text-rcs-cta-700 group-focus:text-rcs-cta-700">
                              {convertedNews.category}
                            </span>
                          )}
                          <h3 className="font-semibold text-base md:text-lg text-rcs-sec transition-all duration-200 group-hover:text-rcs-cta group-focus:text-rcs-cta transform-gpu group-hover:translate-x-0.5 group-focus:translate-x-0.5">
                            {convertedNews.title.toUpperCase()}
                          </h3>
                        </div>
                        <div className="ml-auto self-center opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-focus:opacity-100 group-focus:translate-x-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rcs-cta" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </a>
                    );
                  })}
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

    </div>
  );
};

export default NewsListing;

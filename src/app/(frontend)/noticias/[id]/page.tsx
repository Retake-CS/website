'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import LiveGames from "../../components/LiveGames";
import Footer from "../../components/Footer";
import RelatedNewsCard from "../../components/RelatedNewsCard";
import { getMediaUrl } from '@/utilities/getMediaUrl';

// Interface para os dados do PayloadCMS
interface PayloadPost {
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
  content?: any; // Rich text content
  featured: boolean;
}

// Componente para as tags
const NewsTag = ({ tag }: { tag: string }) => (
  <a 
    href={`/tag/${tag.toLowerCase()}`}
    className="text-xs bg-rcs-sec-100 text-rcs-sec-600 hover:bg-rcs-cta/20 hover:text-rcs-cta px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-sm group"
  >
    <span className="transform group-hover:translate-x-0.5 inline-block transition-transform">#</span>{tag}
  </a>
);

const NewsDetail = () => {
  const params = useParams();
  const slugOrId = params.id as string;

  const [news, setNews] = useState<PayloadPost | null>(null);
  const [relatedNews, setRelatedNews] = useState<PayloadPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Try fetching by slug first, then by id
        let response = await fetch(`/api/posts?slug=${encodeURIComponent(slugOrId)}`);
        let result = await response.json();

        if (!result.docs || result.docs.length === 0) {
          response = await fetch(`/api/posts?id=${encodeURIComponent(slugOrId)}`);
          result = await response.json();
        }

        if (result.docs && result.docs.length > 0) {
          const post = result.docs[0];
          setNews(post);

          // Fetch related news (same category, excluding current post)
          const category = post.categories?.[0]?.title;
          if (category) {
            const relatedResponse = await fetch(`/api/posts?category=${encodeURIComponent(category)}&limit=3`);
            const relatedResult = await relatedResponse.json();
            setRelatedNews(relatedResult.docs.filter((p: PayloadPost) => p.id !== post.id));
          }
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
        setAnimateContent(true);
      }
    };

    if (slugOrId) {
      fetchNews();
    }
  }, [slugOrId]);

  // Componente para renderizar rich text do PayloadCMS
  const RichTextRenderer = ({ content }: { content: any }) => {
    if (!content || !content.root || !content.root.children) {
      return <p className="text-rcs-sec-700">Conteúdo não disponível.</p>;
    }

    const renderNode = (node: any, index: number): React.ReactNode => {
      switch (node.type) {
        case 'paragraph':
          return (
            <p
              key={index}
              className={`mb-5 text-rcs-sec-700 leading-relaxed transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
            </p>
          );

        case 'heading':
          const headingLevel = node.tag || 2;
          const headingClass = `text-rcs-sec font-bold mb-4 mt-6 transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

          if (headingLevel === 1) {
            return (
              <h1 key={index} className={headingClass} style={{ transitionDelay: `${index * 75}ms` }}>
                {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
              </h1>
            );
          } else if (headingLevel === 2) {
            return (
              <h2 key={index} className={headingClass} style={{ transitionDelay: `${index * 75}ms` }}>
                {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
              </h2>
            );
          } else if (headingLevel === 3) {
            return (
              <h3 key={index} className={headingClass} style={{ transitionDelay: `${index * 75}ms` }}>
                {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
              </h3>
            );
          } else {
            return (
              <h4 key={index} className={headingClass} style={{ transitionDelay: `${index * 75}ms` }}>
                {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
              </h4>
            );
          }

        case 'list':
          const ListTag = node.tag === 'ol' ? 'ol' : 'ul';
          return (
            <ListTag
              key={index}
              className={`mb-5 ml-6 text-rcs-sec-700 transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              {node.children?.map((item: any, itemIndex: number) => (
                <li key={itemIndex} className="mb-2">
                  {item.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
                </li>
              ))}
            </ListTag>
          );

        case 'blockquote':
          return (
            <blockquote
              key={index}
              className={`border-l-4 border-rcs-cta pl-4 my-6 italic text-rcs-sec-600 bg-rcs-sec-50 p-4 rounded-r-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
            </blockquote>
          );

        case 'upload':
        case 'image':
          const imageUrl = getMediaUrl(node.value?.url || node.url, node.value?.updatedAt);
          const alt = node.value?.alt || node.alt || 'Imagem';
          if (!imageUrl) return null;

          return (
            <figure
              key={index}
              className={`my-8 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              {node.value?.caption && (
                <figcaption className="bg-rcs-sec-800 text-rcs-bg-200 text-xs p-3 text-center">
                  {node.value.caption}
                </figcaption>
              )}
            </figure>
          );

        case 'block':
          if (node.fields?.blockType === 'mediaBlock' && node.fields?.media) {
            const media = node.fields.media;
            const imageUrl = getMediaUrl(media.url, media.updatedAt);
            const alt = media.alt || 'Imagem';
            if (!imageUrl) return null;

            return (
              <figure
                key={index}
                className={`my-8 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <img
                  src={imageUrl}
                  alt={alt}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {media.caption && (
                  <figcaption className="bg-rcs-sec-800 text-rcs-bg-200 text-xs p-3 text-center">
                    {media.caption}
                  </figcaption>
                )}
              </figure>
            );
          } else if (node.fields?.blockType === 'banner' && node.fields?.content) {
            const style = (node.fields.style || 'info') as 'info' | 'warning' | 'error' | 'success';
            const styleClasses = {
              info: 'bg-blue-50 border-blue-200 text-blue-800',
              warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
              error: 'bg-red-50 border-red-200 text-red-800',
              success: 'bg-green-50 border-green-200 text-green-800'
            };
            return (
              <div
                key={index}
                className={`my-6 p-4 border-l-4 rounded-r-lg ${styleClasses[style]} transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <RichTextRenderer content={node.fields.content} />
              </div>
            );
          } else if (node.fields?.blockType === 'code' && node.fields?.code) {
            const language = node.fields.language || 'text';
            return (
              <pre
                key={index}
                className={`my-6 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <code className={`language-${language}`}>
                  {node.fields.code}
                </code>
              </pre>
            );
          }
          // Handle other block types if needed
          return null;

        case 'link':
          return (
            <a
              key={index}
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rcs-cta hover:text-rcs-cta-600 underline transition-colors"
            >
              {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
            </a>
          );

        default:
          // Para tipos não reconhecidos, tenta renderizar como parágrafo
          if (node.children) {
            return (
              <div
                key={index}
                className={`mb-5 text-rcs-sec-700 transition-all duration-500 ${animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                {node.children.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
              </div>
            );
          }
          return null;
      }
    };

    const renderTextNode = (node: any, index: number): React.ReactNode => {
      if (node.type === 'text') {
        let className = '';

        if (node.bold) className += ' font-bold';
        if (node.italic) className += ' italic';
        if (node.underline) className += ' underline';
        if (node.strikethrough) className += ' line-through';
        if (node.code) className += ' bg-rcs-sec-100 px-1 py-0.5 rounded text-sm font-mono';

        return (
          <span key={index} className={className}>
            {node.text}
          </span>
        );
      }

      if (node.type === 'link') {
        return (
          <a
            key={index}
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rcs-cta hover:text-rcs-cta-600 underline transition-colors"
          >
            {node.children?.map((child: any, childIndex: number) => renderTextNode(child, childIndex))}
          </a>
        );
      }

      return null;
    };

    return (
      <article className="prose prose-lg max-w-none">
        {content.root.children.map((node: any, index: number) => renderNode(node, index))}
      </article>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-rcs-bg to-rcs-bg-50 min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-rcs-cta/20 rounded-full mb-4 animate-spin"></div>
            <div className="h-5 bg-rcs-sec/20 rounded w-48 mb-3"></div>
            <div className="h-4 bg-rcs-sec/20 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="bg-rcs-bg bg-cover bg-center min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-rcs-sec mb-4">Notícia não encontrada</h1>
            <a href="/noticias" className="text-rcs-cta hover:underline">Voltar para notícias</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const category = news.categories?.[0]?.title || 'Geral';
  const author = news.populatedAuthors?.[0]?.name || 'Redator RCS';
  const date = new Date(news.publishedAt).toLocaleDateString('pt-BR');
  const image = news.heroImage?.url || "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg";

  return (
    <div className="bg-rcs-bg bg-cover bg-center min-h-screen flex flex-col">
      <Header />
      
      {/* Barra superior com LiveGames */}
      <div className="">
        <LiveGames />
      </div>

      <main className={`container mx-auto px-4 pt-6 flex-grow transition-all duration-500 ${animateContent ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
        {/* Navegação de breadcrumb */}
        <div className="flex items-center text-xs text-rcs-sec-400 mb-4">
          <a href="/" className="hover:text-rcs-cta transition-colors hover:underline">Início</a>
          <span className="mx-2">/</span>
          <a href="/noticias" className="hover:text-rcs-cta transition-colors hover:underline">Notícias</a>
          <span className="mx-2">/</span>
          <span className="text-rcs-sec-600 truncate max-w-[200px] hover:text-rcs-cta-700 cursor-default">{news.title}</span>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Coluna principal */}
          <div className="w-full lg:w-3/5 xl:w-2/3 transition-all duration-500 delay-75">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <a 
                href={`/categoria/${category.toLowerCase()}`} 
                className="text-xs font-bold text-rcs-cta bg-rcs-sec rounded-full px-3 py-1.5 inline-flex items-center group hover:bg-rcs-cta hover:text-rcs-bg transition-all duration-300"
              >
                {category}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <span className="text-xs text-rcs-sec-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-rcs-cta" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {date}
              </span>
              
              {/* CTA para compartilhar/salvar - CORRIGIDO alinhamento mobile */}
              <div className="flex items-center gap-2 ml-auto mt-0">
                <button className="flex items-center px-2.5 py-1.5 rounded-md bg-rcs-sec hover:bg-rcs-cta hover:text-rcs-bg transition-all duration-300 group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 group-hover:animate-opulse" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  <span className="text-xs font-medium">Compartilhar</span>
                </button>
                <button className="flex items-center px-2.5 py-1.5 rounded-md bg-rcs-sec hover:bg-rcs-cta hover:text-rcs-bg transition-all duration-300 group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  <span className="text-xs font-medium">Salvar</span>
                </button>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-rcs-sec mb-4 leading-tight">
              {news.title.toUpperCase()}
            </h1>
            
            <div className="flex items-center mb-6 group">
              <a href="#" className="flex items-center hover:bg-rcs-sec-50 px-2 py-1 rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-rcs-cta-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-rcs-sec-500 group-hover:text-rcs-cta-600 transition-colors">{author}</span>
              </a>
            </div>
            
            {/* Imagem principal com aspect ratio consistente */}
            <figure className="mb-6 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="relative overflow-hidden aspect-video">
          <img 
            src={image} 
            alt={news.title} 
            className="w-full h-full object-cover"
          />
              </div>
              <figcaption className="bg-rcs-sec-800 text-rcs-bg-200 text-xs p-2.5 text-center transition-colors duration-300 group-hover:bg-rcs-sec-700">
          {news.meta?.description || news.title}
              </figcaption>
            </figure>
            
            {/* Conteúdo do artigo com renderização completa do rich text */}
            <RichTextRenderer content={news.content} />
            
            {/* Tags - melhor espaçamento e visualização */}
            <div className="mt-8 pt-5">
              <h4 className="text-sm font-medium text-rcs-sec-500 mb-3">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                <NewsTag key="featured" tag={news.featured ? "DESTAQUE" : category} />
                {news.categories?.slice(1).map((cat, index) => (
                  <NewsTag key={index} tag={cat.title} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Coluna lateral - Ajustada para exibir todo o conteúdo quando possível */}
          <div className="w-full lg:w-2/5 xl:w-1/3 mt-6 lg:mt-0 transition-all duration-300">
            <div className="lg:sticky lg:top-[5.5rem] space-y-3 scrollbar-rcs" style={{ 
              maxHeight: 'min(100%, calc(100vh - 8rem))',
              height: 'fit-content',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: '0.5rem'
            }}>
              {/* Card de notícias relacionadas */}
              <div className="rounded-lg w-full bg-rcs-sec shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex-shrink-0">
                <div className="px-3 sm:px-4 py-2.5 border-b border-rcs-sec-600/50 flex items-center">
                  <div className="w-1.5 h-1.5 bg-rcs-cta rounded-full mr-2 animate-pulse"></div>
                  <h3 className="font-semibold text-rcs-bg text-xs sm:text-sm">MAIS LIDAS</h3>
                </div>
                <div className="divide-y divide-rcs-sec-600/20">
                  {relatedNews.slice(0, 3).map((item) => (
                    <a 
                      key={item.id} 
                      href={`/noticias/${item.slug || item.id}`} 
                      className="block p-2.5 sm:p-3 md:p-2.5 lg:p-3 hover:bg-rcs-sec-600 transition-colors duration-300 group"
                    >
                      <h4 className="font-medium text-xs text-rcs-bg-300 hover:text-rcs-cta transition-colors duration-300 line-clamp-2">
                        {item.title.toUpperCase()}
                      </h4>
                      <div className="flex items-center mt-1.5 text-[10px] text-rcs-bg-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{new Date(item.publishedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-rcs-sec-600/50 bg-rcs-sec-800/50">
                  <a href="/noticias" className="text-xs flex items-center justify-center text-rcs-bg-400 hover:text-rcs-cta transition-colors group">
                    Ver todas as notícias
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Anúncio */}
              <div className="bg-rcs-cta rounded-lg overflow-hidden py-3 px-3 sm:px-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-rcs-cta-400/20 flex-shrink-0">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-1.5 h-1.5 bg-rcs-bg rounded-full mr-1.5 animate-pulse"></div>
                  <h3 className="font-bold text-rcs-bg text-xs xs:text-sm sm:text-base tracking-wide">ANUNCIE AQUI</h3>
                </div>
                <p className="text-xs text-rcs-bg-100 text-center mb-3 max-w-xs mx-auto leading-snug">
                  Impulsione sua marca para milhares de fãs de esports no Brasil!
                </p>
                <div className="flex justify-center">
                  <a 
                    href="/contato" 
                    className="inline-flex items-center px-4 py-2 bg-rcs-bg text-rcs-cta font-medium rounded-md transition-all duration-300 hover:bg-rcs-bg-100 hover:shadow-md group"
                  >
                    <span className="text-sm">Fale Conosco</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Próxima partida */}
              <div className="bg-rcs-sec rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative group flex-shrink-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-105"></div>
                
                {/* Header com animação */}
                <div className="relative z-10 p-3 pb-2">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-rcs-cta rounded-full mr-2 group-hover:animate-pulse"></div>
                    <h3 className="font-semibold text-xs sm:text-sm text-rcs-bg">PRÓXIMA PARTIDA</h3>
                  </div>
                </div>
                
                {/* Informações da partida - simplificado para responsividade */}
                <div className="relative z-10 px-3 pb-3">
                  {/* Detalhes do evento */}
                  <div className="text-center mb-2">
                    <span className="text-xs inline-block bg-rcs-sec-700/60 text-rcs-bg-200 px-2.5 py-1 rounded-full">
                      ESL Pro League - Semifinal
                    </span>
                  </div>
                  
                  {/* Times */}
                  <div className="flex items-center justify-between mb-2">
                    {/* Time 1 */}
                    <div className="flex flex-col items-center space-y-1 w-1/3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rcs-sec-700 to-rcs-sec-800 p-0.5 overflow-hidden transform group-hover:scale-110 transition-all duration-300">
                        <img 
                          src="https://majoresports.net/wp-content/uploads/2023/08/Red-Canids-OW.png" 
                          alt="Red Canids" 
                          className="w-full h-full object-contain rounded-full bg-rcs-bg-900 p-1.5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            //target.src = "https://via.placeholder.com/80?text=RC";
                            target.onerror = null;
                          }}
                        />
                      </div>
                      <span className="font-medium text-rcs-bg-200 text-center text-sm">Red Canids</span>
                    </div>
                    
                    {/* VS com formato do jogo */}
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative">
                        <span className="text-rcs-cta font-bold text-xl relative z-10">VS</span>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-rcs-cta/10 rounded-full -z-0 group-hover:scale-150 transition-all duration-500 opacity-70"></div>
                      </div>
                      <span className="text-xs text-rcs-bg-400 mt-2 bg-rcs-sec-700/50 px-2 py-0.5 rounded">BO3</span>
                    </div>
                    
                    {/* Time 2 */}
                    <div className="flex flex-col items-center space-y-1 w-1/3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rcs-sec-700 to-rcs-sec-800 p-0.5 overflow-hidden transform group-hover:scale-110 transition-all duration-300">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FaZe_Clan_logo.svg/1200px-FaZe_Clan_logo.svg.png" 
                          alt="FaZe" 
                          className="w-full h-full object-contain rounded-full bg-rcs-bg-900 p-1.5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            //target.src = "https://via.placeholder.com/80?text=FaZe";
                            target.onerror = null;
                          }}
                        />
                      </div>
                      <span className="font-medium text-rcs-bg-200 text-center text-sm">FaZe</span>
                    </div>
                  </div>
                  
                  {/* Data e horário com contador */}
                  <div className="text-center text-xs">
                    <div className="flex items-center justify-center space-x-1 mb-1.5 text-rcs-bg-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-rcs-cta" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Sábado, 16/09 - 14:00</span>
                    </div>
                  
                  </div>
                </div>
                
                {/* Botão para ver mais */}
                <a 
                  href="/partidas" 
                  className="w-full mt-3 py-2 text-xs text-center bg-rcs-sec-700/80 hover:bg-rcs-cta text-rcs-bg-300 hover:text-rcs-bg rounded transition-colors flex items-center justify-center group"
                >
                  <span className="relative z-10">Ver todas as partidas</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Seção de notícias relacionadas - usando componente */}
      <section className="py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <div className="w-2.5 h-2.5 bg-rcs-cta rounded-full mr-2"></div>
            <h2 className="text-lg font-bold text-rcs-sec">RECOMENDADOS PARA VOCÊ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedNews.slice(0, 3).map((item) => (
              <RelatedNewsCard 
                key={item.id}
                id={parseInt(item.id)}
                category={item.categories?.[0]?.title || 'Geral'}
                title={item.title.toUpperCase()}
                image={item.heroImage?.url || "https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"}
                date={new Date(item.publishedAt).toLocaleDateString('pt-BR')}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <a 
              href="/noticias" 
              className="inline-flex items-center text-rcs-sec hover:text-rcs-cta transition-all duration-300 group"
            >
              <span className="mr-2 text-sm font-medium pb-0.5">
                Explorar mais notícias
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default NewsDetail;

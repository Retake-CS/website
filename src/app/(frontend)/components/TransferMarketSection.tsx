import { useEffect, useState } from 'react'
import NewsListItem from './NewsListItem'

export const TransferMarketSection = () => {
  const [news, setNews] = useState<any[]>([])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          '/api/posts?where[categories.slug][equals]=mtransferencias&limit=5',
        )
        if (!response.ok) {
          throw new Error('Failed to fetch transfer news')
        }
        const result = await response.json()
        setNews(result.docs)
      } catch (error) {
        console.error('Error fetching transfer news:', error)
      }
    }

    fetchNews()
  }, [])

  return (
    <section className="w-full">
      <h2 className="text-xl font-bold text-rcs-sec mb-3 flex items-center group cursor-pointer">
        <span className="w-3 h-3 bg-rcs-cta rounded-full mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:bg-orange-600"></span>
        MERCADO DE TRANSFERÊNCIAS
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
      {/* Lista de notícias do mercado */}
      <div className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {news.length >= 0 ? (
          news.map((item, index) => (
            <NewsListItem
              key={item.id}
              id={item.id}
              slug={item.slug}
              title={item.title}
              category={
                item.categories && item.categories.length > 0
                  ? item.categories[0].title
                  : 'Mercado de Transferências'
              }
              image={
                item.heroImage?.url ||
                'https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg'
              }
              isLast={index === news.length - 1}
              animate
              delay={index * 60}
            />
          ))
        ) : (
          <>
            <NewsListItem
              id={1}
              title="Red Canids confirma contratação de novo atirador para próxima temporada"
              category="Mercado de Transferências"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              animate
              delay={0}
            />
            <NewsListItem
              id={2}
              title="FURIA anuncia dispensa de jogador após fim de contrato"
              category="Mercado de Transferências"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              animate
              delay={60}
            />
            <NewsListItem
              id={3}
              title="Imperial negocia renovação com captain após boa temporada"
              category="Mercado de Transferências"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              animate
              delay={120}
            />
            <NewsListItem
              id={4}
              title="MIBR em negociações avançadas com jogador internacional"
              category="Mercado de Transferências"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              animate
              delay={180}
            />
            <NewsListItem
              id={5}
              title="Pain Gaming empresta jovem talento para equipe da segunda divisão"
              category="Mercado de Transferências"
              image="https://static.draft5.gg/news/2024/09/13124738/RED-Canids-coldzera-ESL-Pro-League-S20-2.jpg"
              animate
              delay={240}
              isLast
            />
          </>
        )}
      </div>
    </section>
  )
}

export default TransferMarketSection

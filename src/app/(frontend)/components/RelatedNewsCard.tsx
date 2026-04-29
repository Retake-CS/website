interface RelatedNewsCardProps {
  id: number;
  category: string;
  title: string;
  image: string;
  date: string;
  author?: string;
  slug?: string;
}

export const RelatedNewsCard = ({ id, category, title, image, date, author, slug }: RelatedNewsCardProps) => (
  <a href={`/noticias/${slug || id}`} className="block rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:translate-y-[-3px] group h-[180px] relative bg-rcs-sec-800/30">
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-90 transition-all duration-500 group-hover:scale-110 transform"
        style={{backgroundImage: `url('${image}')`}}>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-rcs-sec-900 via-rcs-sec-900/70 to-transparent"></div>
    </div>
    
    <div className="absolute inset-x-0 top-0 p-2">
      <span className="text-xs font-bold text-rcs-cta bg-rcs-sec-900/40 rounded-full px-2 py-0.5 inline-block group-hover:bg-rcs-cta/20 transition-all duration-300">
        {category}
      </span>
    </div>
    
    <div className="absolute inset-x-0 bottom-0 p-3 z-10">
      <h3 className="font-bold text-sm text-rcs-bg-200 group-hover:text-rcs-cta transition-colors duration-300 line-clamp-2 transform group-hover:translate-x-0.5 mb-2">
        {title}
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-rcs-bg-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 opacity-70" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>{date}</span>
          
          {author && (
            <div className="flex items-center ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{author}</span>
            </div>
          )}
        </div>
        
        <div className="bg-rcs-bg-900/50 rounded-full p-1 transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-rcs-cta" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </a>
);

export default RelatedNewsCard;

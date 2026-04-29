'use client';

import { useRef, useEffect } from "react";

interface NewsListItemProps {
  title: string;
  category?: string;
  image?: string;
  isLast?: boolean;
  animate?: boolean;
  delay?: number;
  id?: number;
  slug?: string;
}

export const NewsListItem = ({
  title,
  category,
  image,
  isLast,
  animate = false,
  delay = 0,
  id = 1,
  slug
}: NewsListItemProps) => {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (animate && ref.current) {
      ref.current.style.opacity = "0";
      ref.current.style.transform = "translateY(16px) scale(0.98)";
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.transition = "opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)";
          ref.current.style.opacity = "1";
          ref.current.style.transform = "translateY(0) scale(1)";
        }
      }, delay);
    }
  }, [animate, delay]);

  return (
    <a
      ref={ref}
      href={`/noticias/${slug || id}`}
      className={`group flex items-center gap-3 md:gap-5 px-2 sm:px-3 md:px-5 py-2.5 md:py-4 transition-all duration-300 hover:shadow-lg focus:shadow-lg focus:bg-rcs-sec-700/70 outline-none focus:outline-rcs-cta focus:outline-offset-[-2px] rounded-sm`}
      style={isLast ? { borderBottom: "none" } : {}}
      tabIndex={0}
    >
      {image && (
        <div className="overflow-hidden rounded-lg w-[56px] h-[42px] xs:w-[64px] xs:h-[48px] md:w-[88px] md:h-[64px] flex-shrink-0 bg-rcs-bg-200 shadow transition-shadow duration-300 group-hover:shadow-md">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110 group-focus:scale-110 group-focus:brightness-110"
            style={{ backgroundImage: `url('${image}')` }}
          ></div>
        </div>
      )}
      <div className="flex flex-col min-w-0">
        {category && (
          <span className="text-[10px] font-bold text-rcs-cta mb-0.5 tracking-wide uppercase transition-colors duration-200 group-hover:text-rcs-cta-700 group-focus:text-rcs-cta-700">
            {category}
          </span>
        )}
        <h3 className="font-semibold text-base md:text-lg text-rcs-sec transition-all duration-200 group-hover:text-rcs-cta group-focus:text-rcs-cta transform-gpu group-hover:translate-x-0.5 group-focus:translate-x-0.5">
          {title}
        </h3>
      </div>
      <div className="ml-auto self-center opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-focus:opacity-100 group-focus:translate-x-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rcs-cta" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </a>
  );
};

export default NewsListItem;

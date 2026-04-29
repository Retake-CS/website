import NewsListSection from "./NewsListSection";
import TransferMarketSection from "./TransferMarketSection";

export const NewsAndTransfersSection = () => (
	<section className="container mx-auto px-2 sm:px-4 py-6">
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Coluna esquerda - Notícias gerais */}
			<div className="w-full">
				<NewsListSection />
			</div>
			
			{/* Coluna direita - Mercado de transferências */}
			<div className="w-full">
				<TransferMarketSection />
			</div>
		</div>
	</section>
);

export default NewsAndTransfersSection;

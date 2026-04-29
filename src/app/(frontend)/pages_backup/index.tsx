import Header from "../components/Header";
import LiveGames from "../components/LiveGames";
import MainNews from "../components/MainNews";
import Ranking from "../components/Ranking";
import NewsGrid from "../components/NewsGrid";
import NewsAndTransfersSection from "../components/NewsAndTransfersSection";
import Footer from "../components/Footer";
import MobileNewsHighlights from "../components/MobileNewsHighlights";

export const dynamic = 'force-dynamic';

const Home = () => {
	return (
		<>
      <section className="bg-rcs-bg bg-cover bg-center">
			<Header />
			<LiveGames />
			<section className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 py-6 px-4">
				<div className="md:col-span-2">
					<MainNews />
					{/* Notícias adicionais visíveis apenas em mobile */}
					<div className="block md:hidden mt-4">
						<MobileNewsHighlights />
					</div>
				</div>
				<div className="md:col-span-1">
					<Ranking />
				</div>
			</section>
			<NewsGrid />
			<NewsAndTransfersSection />
			<Footer />
      </section>
		</>
	);
};

export default Home;

import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import OpenLetter from "./components/OpenLetter.jsx";
import ContributionStats from "./components/ContributionStats.jsx";
import ContributorMarquee from "./components/ContributorMarquee.jsx";
import DonateSection from "./components/DonateSection.jsx";
import ThanksFooter from "./components/ThanksFooter.jsx";
import { targetAmount as fallbackTargetAmount } from "./data/contributions.js";

export default function App() {
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    contributorCount: 0,
    targetAmount: fallbackTargetAmount,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, contributionsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/contributions?status=confirmed"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (contributionsRes.ok) setContributions(await contributionsRes.json());
      } catch {
        // Backend chưa sẵn sàng — giữ giá trị mặc định để trang vẫn hiển thị được.
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-heritage-paper text-heritage-blueDark">
      <Header />
      <main>
        <Hero />
        <OpenLetter targetAmount={stats.targetAmount} />
        <ContributionStats
          total={stats.total}
          targetAmount={stats.targetAmount}
          contributorCount={stats.contributorCount}
        />
        <ContributorMarquee contributions={contributions} />
        <DonateSection />
        <ThanksFooter />
      </main>
    </div>
  );
}

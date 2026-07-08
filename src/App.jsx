import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import OpenLetter from "./components/OpenLetter.jsx";
import ContributionStats from "./components/ContributionStats.jsx";
import ContributorMarquee from "./components/ContributorMarquee.jsx";
import ContributorListDialog from "./components/ContributorListDialog.jsx";
import DonateSection from "./components/DonateSection.jsx";
import ThanksFooter from "./components/ThanksFooter.jsx";
import { targetAmount as fallbackTargetAmount } from "./data/contributions.js";

export default function App() {
  const [contributions, setContributions] = useState([]);
  const [showContributorList, setShowContributorList] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    contributorCount: 0,
    targetAmount: fallbackTargetAmount,
  });

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Làm mới nền để đóng góp mới xác nhận hiện ra không cần tải lại trang:
  // mỗi 30 giây một lần, và ngay khi người dùng quay lại tab (vd sau khi
  // chuyển sang app ngân hàng quét mã rồi trở về).
  useEffect(() => {
    const intervalId = window.setInterval(loadData, 30000);
    const onVisible = () => {
      if (!document.hidden) loadData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadData]);

  return (
    <div className="min-h-screen bg-heritage-paper text-heritage-blueDark">
      <Header onShowContributors={() => setShowContributorList(true)} />
      <main>
        <Hero />
        <OpenLetter targetAmount={stats.targetAmount} />
        <ContributionStats
          total={stats.total}
          targetAmount={stats.targetAmount}
          contributorCount={stats.contributorCount}
          onShowContributors={() => setShowContributorList(true)}
        />
        <ContributorMarquee contributions={contributions} />
        <DonateSection onConfirmed={loadData} />
        <ThanksFooter />
      </main>
      <ContributorListDialog
        open={showContributorList}
        onClose={() => setShowContributorList(false)}
        contributions={contributions}
      />
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router";
import Footer from "~/components/derived/Footer";
import Header from "~/components/derived/Header";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";
import SummarySection from "~/pages/dashboard/SummarySection";

export default function Dashboard() {
  const nav = useNavigate();
  const { isConnected } = useWalletLifecycle({
    onConnect(address) {
      console.log("Connected:", address);
    },
    onDisconnect() {
      nav("/login");
    },
  });

  useEffect(() => {
    if (!isConnected) {
      nav("/login");
    }
  }, [isConnected, nav]);

  return (
    <div className="w-full h-full">
      <Header />
      <SummarySection />
      <Footer />
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router";
import Footer from "~/components/derived/Footer";
import Header from "~/components/derived/Header";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";

export default function Login() {
  const nav = useNavigate();
  const { isConnected } = useWalletLifecycle({
    onConnect() {
      nav("/dashboard");
    },
  });

  useEffect(() => {
    if (isConnected) {
      nav("/dashboard");
    }
  }, [isConnected, nav]);

  return (
    <div className="w-full h-full">
      <Header />
      <Footer />
    </div>
  );
}

import { Outlet } from "react-router";
import Footer from "~/components/derived/Footer";
import Header from "~/components/derived/Header";

export default function Layout() {
  return (
    <div className="w-full h-full">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-svh grid grid-rows-[auto_1fr_auto]">
      <Header />
      <main className="bg-background">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

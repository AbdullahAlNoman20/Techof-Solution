// admin/src/Root.jsx

import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./ScrollToTop.jsx";
import AppRoutes from "./Route.jsx";
import Nav from "./Components/Nav.jsx";
import Footer from "./Components/Footer.jsx";

export default function Root() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Nav />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </BrowserRouter>
  );
}
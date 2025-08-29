import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import Segmentacion from "./pages/Segmentacion";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campanias" element={<Campaigns />} />
          <Route path="/segmentacion" element={<Segmentacion />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

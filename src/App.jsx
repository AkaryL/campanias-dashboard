import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campanas" element={<Campaigns />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

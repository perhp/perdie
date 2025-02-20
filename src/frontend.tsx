import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import About from "./about/about";
import Dashboard from "./dashboard/dashboard";
import "./index.css";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

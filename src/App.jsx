import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load các trang
const Home = React.lazy(() => import("./pages/Home/index.jsx"));
const FusionGuide = React.lazy(() => import("./pages/FusionGuide/index.jsx"));
const Cards = React.lazy(() => import("./pages/Cards.jsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.jsx"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
    <div className="animate-bounce text-4xl">🃏</div>
    <p className="mt-2 text-lg">Loading...</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fusion-guide" element={<FusionGuide />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

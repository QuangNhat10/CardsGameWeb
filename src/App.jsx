import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = React.lazy(() => import("./pages/Home/index.jsx"));
const FusionGuide = React.lazy(() => import("./pages/FusionGuide/index.jsx"));
const Login = React.lazy(() => import("./pages/Login/index.jsx"));
const Register = React.lazy(() => import("./pages/Register/index.jsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.jsx"));
const Collection = React.lazy(() => import("./pages/Collection/index.jsx"));
const Profile = React.lazy(() => import("./pages/Profile.jsx"));

// Loading component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="card-flip">
        <div className="card-front">🃏</div>
        <div className="card-back">✨</div>
      </div>
      <div className="loading-text">Loading...</div>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/fusion-guide" element={<FusionGuide />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

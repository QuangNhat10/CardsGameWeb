
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


const Home = React.lazy(() => import('./pages/Home/index.jsx'));
const FusionGuide = React.lazy(() => import('./pages/FusionGuide/index.jsx'));
const NotFound = React.lazy(() => import('./pages/NotFound.jsx'));

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
                    <Route path="/fusion-guide" element={<FusionGuide />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </React.Suspense>
        </BrowserRouter>
    );
}

import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import { MovieProvider } from "./context/MovieContext";
import ChatBot from "./components/ChatBot";

import "./App.css";

function App() {
  return (
    <MovieProvider>
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>

        {/* ✅ ChatBot fixed at bottom-right */}
        <div className="fixed bottom-4 right-4 z-50">
          <ChatBot />
        </div>
      </div>
    </MovieProvider>
  );
}

export default App;

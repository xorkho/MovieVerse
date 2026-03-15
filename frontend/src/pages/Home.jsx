import React, { useEffect, useState } from "react";
import {
  getPopularMovies,
  getMovieDetails,
  getMovieCredits,
  getMovieTrailer,
} from "../services/api";

import MovieModal from "../components/MovieModal";
import MovieCard from "../components/MovieCard";

/* ─── Keyframe injection (once) ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --red:       #e50914;
    --red-dim:   rgba(229,9,20,0.18);
    --red-glow:  rgba(229,9,20,0.45);
    --bg:        #080808;
    --surface:   #111111;
    --surface2:  #1a1a1a;
    --border:    rgba(255,255,255,0.06);
    --text:      #f0f0f0;
    --muted:     #666;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .scanlines::after {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
    pointer-events: none;
    z-index: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }

  .stagger > * { opacity: 0; animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) forwards; }
  .stagger > *:nth-child(1)  { animation-delay: .05s }
  .stagger > *:nth-child(2)  { animation-delay: .10s }
  .stagger > *:nth-child(3)  { animation-delay: .15s }
  .stagger > *:nth-child(4)  { animation-delay: .20s }
  .stagger > *:nth-child(5)  { animation-delay: .25s }
  .stagger > *:nth-child(6)  { animation-delay: .30s }
  .stagger > *:nth-child(7)  { animation-delay: .35s }
  .stagger > *:nth-child(8)  { animation-delay: .40s }
  .stagger > *:nth-child(9)  { animation-delay: .45s }
  .stagger > *:nth-child(10) { animation-delay: .50s }
  .stagger > *:nth-child(11) { animation-delay: .55s }
  .stagger > *:nth-child(12) { animation-delay: .60s }

  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
    background-size: 700px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 10px;
  }

  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
  .pulse-dot { animation: pulse 1.8s ease-in-out infinite; }

  /* ── Card ── */
  .movie-card {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    background: var(--surface);
    border: 1px solid var(--border);
    transition: transform .35s cubic-bezier(.22,.68,0,1.2), box-shadow .35s ease, border-color .35s ease;
  }
  .movie-card:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 50px rgba(0,0,0,.7), 0 0 0 1px var(--red-glow);
    border-color: var(--red);
  }
  .movie-card img { width: 100%; display: block; transition: filter .35s ease; }
  .movie-card:hover img { filter: brightness(1.1); }

  .card-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.9) 0%, transparent 55%);
    opacity: 0;
    transition: opacity .3s ease;
    display: flex; align-items: flex-end;
    padding: 14px;
  }
  .movie-card:hover .card-overlay { opacity: 1; }

  .card-title { font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: .8rem; line-height: 1.3; color: #fff; }
  .card-rating { display: flex; align-items: center; gap: 4px; font-size: .72rem; color: #ffc107; margin-top: 4px; }

  /* ── Favorite heart button ── */
  .fav-btn {
    position: absolute; top: 8px; right: 8px;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.8);
    transition: opacity .25s ease, transform .25s cubic-bezier(.22,.68,0,1.2), background .2s ease, border-color .2s ease;
    z-index: 10;
    backdrop-filter: blur(4px);
  }
  .movie-card:hover .fav-btn { opacity: 1; transform: scale(1); }
  .fav-btn.active {
    opacity: 1 !important;
    transform: scale(1) !important;
    background: rgba(229,9,20,0.25);
    border-color: var(--red);
  }
  .fav-btn:hover { background: rgba(229,9,20,0.35) !important; border-color: var(--red) !important; }

  @keyframes heartPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.5); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  .heart-pop { animation: heartPop 0.35s cubic-bezier(.22,.68,0,1.2); }

  /* ── Badge ── */
  .badge {
    position: absolute; top: 10px; left: 10px;
    background: var(--red); color: #fff;
    font-size: .62rem; font-weight: 700; letter-spacing: .08em;
    padding: 3px 8px; border-radius: 4px; text-transform: uppercase; z-index: 10;
  }

  /* ── Search ── */
  .search-wrap { position: relative; width: 100%; }
  .search-input {
    width: 100%;
    padding: 14px 52px 14px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: .95rem;
    outline: none;
    transition: border-color .25s ease, box-shadow .25s ease;
  }
  .search-input::placeholder { color: var(--muted); }
  .search-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px var(--red-dim); }
  .search-icon {
    position: absolute; right: 16px; top: 50%;
    transform: translateY(-50%);
    color: var(--muted); pointer-events: none; transition: color .25s;
  }
  .search-input:focus ~ .search-icon { color: var(--red); }

  /* ── Tabs ── */
  .tab-btn {
    padding: 7px 18px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 500;
    cursor: pointer;
    transition: all .2s ease;
    letter-spacing: .03em;
    white-space: nowrap;
  }
  .tab-btn:hover { border-color: var(--red); color: var(--text); }
  .tab-btn.active { background: var(--red); border-color: var(--red); color: #fff; box-shadow: 0 4px 14px var(--red-dim); }

  /* ── Suggestion strip ── */
  .suggestion-strip {
    display: flex; gap: 14px;
    overflow-x: auto; padding-bottom: 10px;
    scrollbar-width: thin; scrollbar-color: var(--red) transparent;
  }
  .suggestion-strip::-webkit-scrollbar { height: 4px; }
  .suggestion-strip::-webkit-scrollbar-thumb { background: var(--red); border-radius: 4px; }

  .suggestion-card {
    min-width: 120px; border-radius: 10px; overflow: hidden;
    background: var(--surface2); border: 1px solid var(--border);
    cursor: pointer; flex-shrink: 0;
    transition: transform .3s cubic-bezier(.22,.68,0,1.2), border-color .3s;
  }
  .suggestion-card:hover { transform: translateY(-5px) scale(1.04); border-color: var(--red); }
  .suggestion-card img { width: 100%; display: block; }
  .suggestion-card-title {
    padding: 6px 8px; font-size: .68rem; font-weight: 500; color: #ccc;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Section label ── */
  .section-label { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .section-label-line { flex: 1; height: 1px; background: linear-gradient(to right, var(--red), transparent); }

  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .float-icon { animation: float 3s ease-in-out infinite; }

  .grain::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: .4;
  }

  .ambient-glow {
    position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
    width: 700px; height: 400px;
    background: radial-gradient(ellipse, rgba(229,9,20,0.12) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .count-pill {
    display: inline-flex; align-items: center;
    background: var(--red-dim); border: 1px solid var(--red-glow);
    border-radius: 100px; padding: 3px 12px;
    font-size: .72rem; font-weight: 600; color: var(--red); letter-spacing: .05em;
  }

  /* ── Toast ── */
  @keyframes toastIn  { from { opacity:0; transform: translateX(-50%) translateY(10px) scale(.95); } to { opacity:1; transform: translateX(-50%) translateY(0) scale(1); } }
  @keyframes toastOut { from { opacity:1; transform: translateX(-50%) translateY(0) scale(1); } to { opacity:0; transform: translateX(-50%) translateY(10px) scale(.95); } }
  .toast {
    position: fixed; bottom: 90px; left: 50%;
    transform: translateX(-50%);
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); font-family: 'DM Sans', sans-serif;
    font-size: .82rem; padding: 10px 20px; border-radius: 100px;
    box-shadow: 0 8px 30px rgba(0,0,0,.5);
    z-index: 9999; white-space: nowrap;
    animation: toastIn .3s ease forwards;
  }
  .toast.hide { animation: toastOut .3s ease forwards; }

  /* ── Responsive ── */
  .home-wrapper {
    position: relative;
    zIndex: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  .search-tabs-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .tabs-group {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .movie-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  /* Mobile */
  @media (max-width: 480px) {
    .home-wrapper { padding: 28px 14px 100px; }
    .search-tabs-row { flex-direction: column; align-items: stretch; }
    .tabs-group { width: 100%; }
    .tab-btn { flex: 1; text-align: center; padding: 9px 10px; }
    .movie-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
    .suggestion-card { min-width: 100px; }
  }

  /* Small-mid */
  @media (min-width: 481px) and (max-width: 640px) {
    .home-wrapper { padding: 36px 18px 90px; }
    .movie-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  }
`;

/* ─── Sub-components ─── */
const SkeletonCard = () => (
  <div style={{ borderRadius: 10, overflow: "hidden" }}>
    <div className="skeleton" style={{ height: 240 }} />
    <div style={{ padding: "10px 8px", background: "#111" }}>
      <div className="skeleton" style={{ height: 12, borderRadius: 4, width: "75%", marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "45%" }} />
    </div>
  </div>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#ffc107" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill={filled ? "#e50914" : "none"}
    stroke={filled ? "#e50914" : "#aaa"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const FilmIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

/* ═══════════════════════════════════════════
   HOME COMPONENT
═══════════════════════════════════════════ */
const Home = () => {
  const [movies, setMovies]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [gridKey, setGridKey]             = useState(0);
  const [activeTab, setActiveTab]         = useState("all");
  const [favorites, setFavorites]         = useState(() => {
    try { return JSON.parse(localStorage.getItem("mv_favorites") || "[]"); }
    catch { return []; }
  });
  const [toast, setToast] = useState(null);
  const toastTimer        = React.useRef(null);

  /* Inject styles once */
  React.useEffect(() => {
    if (document.getElementById("cine-styles")) return;
    const tag = document.createElement("style");
    tag.id = "cine-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);

  /* Persist favorites to localStorage */
  React.useEffect(() => {
    localStorage.setItem("mv_favorites", JSON.stringify(favorites));
  }, [favorites]);

  /* Fetch popular movies */
  React.useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      const data = await getPopularMovies();
      setMovies(data);
      setLoading(false);
    };
    fetchMovies();
  }, []);

  /* Toast helper */
  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, hide: false });
    toastTimer.current = setTimeout(() => {
      setToast(t => t ? { ...t, hide: true } : null);
      setTimeout(() => setToast(null), 320);
    }, 1800);
  };

  /* Toggle favorite */
  const toggleFavorite = (e, movie) => {
    e.stopPropagation();
    const isFav = favorites.some(f => f.id === movie.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== movie.id));
      showToast("Removed from favorites");
    } else {
      setFavorites(prev => [...prev, movie]);
      showToast("❤️ Added to favorites");
    }
    const btn = document.getElementById(`fav-${movie.id}`);
    if (btn) {
      btn.classList.remove("heart-pop");
      void btn.offsetWidth;
      btn.classList.add("heart-pop");
    }
  };

  /* Open movie modal */
  const handleMovieClick = async (id) => {
    const details = await getMovieDetails(id);
    const credits = await getMovieCredits(id);
    const trailer = await getMovieTrailer(id);
    setSelectedMovie({ ...details, cast: credits.cast.slice(0, 5), trailerKey: trailer });
    setShowModal(true);
  };

  /* ── KEY FIX: Fetch similar movies ONLY when searched movie exists in list ── */
  const fetchSimilarMovies = async (term, movieList) => {
    const matchExists = movieList.some(m =>
      m.title.toLowerCase().includes(term.toLowerCase())
    );

    if (!matchExists) {
      setSimilarMovies([]);
      return;
    }

    try {
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=ddf452b8f35ce69f72bf2780225f0c69&query=${encodeURIComponent(term)}`
      );
      const searchData = await searchRes.json();
      if (!searchData.results?.length) { setSimilarMovies([]); return; }

      const movieId = searchData.results[0].id;
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=ddf452b8f35ce69f72bf2780225f0c69&language=en-US&page=1`
      );
      const data = await res.json();
      setSimilarMovies(data.results.slice(0, 5));
    } catch {
      setSimilarMovies([]);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setGridKey(k => k + 1);
    setActiveTab("all");

    if (value.length > 1) {
      fetchSimilarMovies(value, movies);
    } else {
      setSimilarMovies([]);
    }
  };

  /* Decide what movies to show */
  const baseMovies =
    searchTerm.trim().length >= 3
      ? movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : movies;

  const displayMovies = activeTab === "favorites" ? favorites : baseMovies;

  /* ── Render ── */
  return (
    <div
      className="grain scanlines"
      style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'DM Sans', sans-serif", position: "relative" }}
    >
      <div className="ambient-glow" />

      <div className="home-wrapper" style={{ position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <header className="fade-up" style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 6vw, 5.5rem)", letterSpacing: ".04em", lineHeight: 1, color: "#fff" }}>
              MOVIE<span style={{ color: "var(--red)" }}>VERSE</span>
            </h1>
            {!loading && (
              <span className="count-pill" style={{ marginBottom: 4 }}>
                {displayMovies.length} movies
              </span>
            )}
          </div>
          <p style={{ color: "var(--muted)", fontSize: ".9rem", letterSpacing: ".06em", textTransform: "uppercase" }}>
            AI Powered Movie Discovery
          </p>
        </header>

        {/* ── Search + Tabs ── */}
        <div className="fade-up" style={{ animationDelay: ".1s", marginBottom: 36 }}>
          <div className="search-tabs-row">
            <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
              <input
                className="search-input"
                type="text"
                placeholder="Search movies…"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <span className="search-icon"><SearchIcon /></span>
            </div>

            <div className="tabs-group">
              <button
                className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => { setActiveTab("all"); setSearchTerm(""); setSimilarMovies([]); setGridKey(k => k + 1); }}
              >
                All Movies
              </button>
              <button
                className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
                onClick={() => { setActiveTab("favorites"); setSearchTerm(""); setSimilarMovies([]); setGridKey(k => k + 1); }}
              >
                ❤️ Favorites
                {favorites.length > 0 && (
                  <span style={{
                    marginLeft: 6, background: "rgba(255,255,255,0.2)",
                    borderRadius: "100px", padding: "1px 7px",
                    fontSize: ".7rem", fontWeight: 700,
                  }}>
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Section heading ── */}
        <div className="section-label fade-up" style={{ animationDelay: ".15s" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.25rem", letterSpacing: ".1em", color: "#fff" }}>
            {activeTab === "favorites"
              ? "MY FAVORITES"
              : searchTerm.length >= 3 ? "SEARCH RESULTS" : "POPULAR NOW"}
          </span>
          <div className="section-label-line" />
          {activeTab === "all" && !searchTerm && (
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", display: "inline-block", flexShrink: 0 }} />
          )}
        </div>

        {/* ── Movie grid ── */}
        {loading ? (
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : displayMovies.length > 0 ? (
          <div
            key={gridKey + activeTab}
            className="stagger movie-grid"
          >
            {displayMovies.map((movie, idx) => {
              const isFav = favorites.some(f => f.id === movie.id);
              return (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  {activeTab === "all" && !searchTerm && idx < 3 && (
                    <span className="badge">#{idx + 1}</span>
                  )}

                  <button
                    id={`fav-${movie.id}`}
                    className={`fav-btn ${isFav ? "active" : ""}`}
                    onClick={(e) => toggleFavorite(e, movie)}
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <HeartIcon filled={isFav} />
                  </button>

                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} loading="lazy" />
                  ) : (
                    <div style={{ height: 240, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FilmIcon />
                    </div>
                  )}

                  <div className="card-overlay">
                    <div>
                      <div className="card-title">{movie.title}</div>
                      {movie.vote_average != null && (
                        <div className="card-rating">
                          <StarIcon />
                          {movie.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
            <div className="float-icon" style={{ marginBottom: 20 }}>
              <FilmIcon />
            </div>
            {activeTab === "favorites" ? (
              <>
                <p style={{ fontSize: "1rem", marginBottom: 6 }}>No favorites yet</p>
                <p style={{ fontSize: ".82rem" }}>
                  Tap the <span style={{ color: "var(--red)" }}>♥</span> on any movie to save it here
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: "1rem", marginBottom: 6 }}>
                  No results for <strong style={{ color: "#fff" }}>"{searchTerm}"</strong>
                </p>
                <p style={{ fontSize: ".82rem" }}>Try a different title</p>
              </>
            )}
          </div>
        )}

        {similarMovies.length > 0 && activeTab === "all" && (
          <div className="fade-up" style={{ marginBottom: 44, marginTop: 44 }}>
            <div className="section-label">
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.25rem", letterSpacing: ".1em", color: "var(--red)" }}>
                YOU MAY LIKE
              </span>
              <div className="section-label-line" />
              <span style={{ color: "var(--muted)", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".08em", whiteSpace: "nowrap" }}>
                {similarMovies.length} results
              </span>
            </div>

            <div className="suggestion-strip stagger">
              {similarMovies.map((movie) => (
                <div key={movie.id} className="suggestion-card" onClick={() => handleMovieClick(movie.id)}>
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
                  ) : (
                    <div style={{ height: 160, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FilmIcon size={32} />
                    </div>
                  )}
                  <div className="suggestion-card-title">{movie.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setShowModal(false)} />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.hide ? "hide" : ""}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Home;
import React, { useEffect, useState } from "react";
import { 
  getPopularMovies, 
  getMovieDetails, 
  getMovieCredits, 
  getMovieTrailer 
} from "../services/api";

import MovieModal from "../components/MovieModal";
import MovieCard from "../components/MovieCard"; 

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      const data = await getPopularMovies();
      setMovies(data);
    };
    fetchMovies();
  }, []);

  const handleMovieClick = async (id) => {
    const details = await getMovieDetails(id);
    const credits = await getMovieCredits(id);
    const trailer = await getMovieTrailer(id);

    setSelectedMovie({
      ...details,
      cast: credits.cast.slice(0, 5), //Only top 5 actor
      trailerKey: trailer,
    });
    setShowModal(true);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      {/* Heading */}
      <div className="mb-10 border-l-4 border-red-600 pl-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Popular <span className="text-red-600">Movies</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Handpicked for you</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-4 py-3 rounded bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>

      {/* Movie Grid */}
      <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/30 rounded-lg overflow-hidden"
            >
              <MovieCard movie={movie} onMovieClick={handleMovieClick} />
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No movies found.
          </p>
        )}
      </div>

      {showModal && selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Home;

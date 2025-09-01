import React from "react";
import { Heart } from "lucide-react";
import { useMovieContext } from "../context/MovieContext";

const MovieCard = ({ movie, onMovieClick }) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useMovieContext();
  const favorite = isFavorite(movie.id);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  return (
    <div
      className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 relative"
    >
      {/* ❤️ Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // movie click blocker
          favorite ? removeFromFavorites(movie.id) : addToFavorites(movie);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
          favorite
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-black/50 text-white hover:bg-red-500"
        }`}
      >
        <Heart
          size={20}
          className={favorite ? "fill-current" : ""}
        />
      </button>

      {/* Poster + Clickable Area */}
      <div onClick={() => onMovieClick && onMovieClick(movie.id)} className="cursor-pointer">
        <img
          src={posterUrl}
          alt={movie.title || "Movie Poster"}
          className="w-full h-[300px] object-cover"
          loading="lazy"
        />

        {/* Movie Info */}
        <div className="p-3">
          <h2 className="text-lg font-semibold truncate">{movie.title}</h2>
          <p className="text-sm text-gray-400">
            {movie.release_date ? movie.release_date : "Unknown Release Date"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

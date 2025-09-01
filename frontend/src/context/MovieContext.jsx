import { createContext, useState, useContext, useEffect } from "react";
const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [Favorites, setFavorites] = useState([]);

  // ✅ localStorage se load karna
  useEffect(() => {
    const storedFavs = localStorage.getItem("Favorites");
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
  }, []);

  // ✅ har update ke baad localStorage me save karna
  useEffect(() => {
    localStorage.setItem("Favorites", JSON.stringify(Favorites));
  }, [Favorites]);

  // ✅ duplicate add hone se bacha lo
  const addToFavorites = (movie) => {
    setFavorites((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev; // already fav
      return [...prev, movie];
    });
  };

  const removeFromFavorites = (movieId) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isFavorite = (movieId) => {
    return Favorites.some((movie) => movie.id === movieId);
  };

  const value = {
    Favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

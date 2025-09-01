import { useMovieContext } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";

const Favorites = () => {
  const { Favorites } = useMovieContext();

  if (!Favorites || Favorites.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-red-500 text-lg">No favorites found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 min-h-screen bg-black">
      <h2 className="text-3xl font-bold text-red-500 text-center mb-8">
        Your Favorites
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Favorites.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;

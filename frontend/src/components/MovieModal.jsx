import React, { useEffect, useState } from "react";

const API_KEY = "ddf452b8f35ce69f72bf2780225f0c69";
const BASE_URL = "https://api.themoviedb.org/3";

const MovieModal = ({ movie, onClose }) => {
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch movie details
      const detailsRes = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
      const detailsData = await detailsRes.json();
      setDetails(detailsData);

      // Fetch cast
      const castRes = await fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}&language=en-US`);
      const castData = await castRes.json();
      setCast(castData.cast.slice(0, 6)); // Top 6 cast

      // Fetch trailer
      const videoRes = await fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}&language=en-US`);
      const videoData = await videoRes.json();
      const trailerVideo = videoData.results.find(
        (vid) => vid.type === "Trailer" && vid.site === "YouTube"
      );
      setTrailer(trailerVideo ? `https://www.youtube.com/embed/${trailerVideo.key}` : null);
    };

    fetchData();
  }, [movie.id]);

  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-950 rounded-lg shadow-lg max-w-4xl w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:text-white text-2xl"
        >
          ✕
        </button>

        {/* Poster + Details */}
        <div className="flex flex-col md:flex-row">
          <img
            src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
            alt={details.title}
            className="w-full md:w-1/3 h-auto object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
          />
          <div className="p-6 flex-1">
            <h2 className="text-3xl font-bold text-red-500">{details.title}</h2>
            <p className="text-gray-400 text-sm mb-2">
              Release Date: {details.release_date}
            </p>
            <p className="text-gray-300 mb-4">{details.overview}</p>

            {/* Genres */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-1">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-red-600 text-white px-2 py-1 rounded-full text-xs"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Cast */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-1">Cast</h3>
              <div className="flex flex-wrap gap-3">
                {cast.map((actor) => (
                  <div key={actor.cast_id} className="w-16 text-center">
                    <img
                      src={
                        actor.profile_path
                          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                          : "https://via.placeholder.com/200x300?text=No+Image"
                      }
                      alt={actor.name}
                      className="w-16 h-16 object-cover rounded-full border-2 border-red-500"
                    />
                    <p className="text-xs text-gray-300 mt-1">{actor.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trailer */}
            {trailer && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white mb-2">Trailer</h3>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={trailer}
                    title="Trailer"
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-64 rounded-lg"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;

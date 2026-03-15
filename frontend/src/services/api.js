const API_KEY = "ddf452b8f35ce69f72bf2780225f0c69";
const BASE_URL = "https://api.themoviedb.org/3";

// Get popular movies
export const getPopularMovies = async (pages = 5) => {
  let allMovies = [];
  for (let page = 1; page <= pages; page++) {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    const data = await response.json();
    allMovies = allMovies.concat(data.results);
  }
  return allMovies;
};
// Search movies
export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results;
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
  const data = await response.json();
  return data;
};

// Get movie cast/credits
export const getMovieCredits = async (movieId) => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
  const data = await response.json();
  return data;
};

// Get movie trailer
export const getMovieTrailer = async (movieId) => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  const data = await response.json();
  
  // Sirf YouTube trailer ka key
  const trailer = data.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );
  
  return trailer ? trailer.key : null;
};

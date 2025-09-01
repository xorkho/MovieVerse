import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-red-600 font-semibold transition-colors duration-300"
      : "relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-red-600 hover:after:w-full after:transition-all after:duration-300 text-white hover:text-red-600 transition-colors duration-300";
  };

  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50 border-b border-red-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-wide text-red-600 hover:opacity-90 transition-opacity duration-300"
        >
          🎬 MovieVerse
        </Link>

        {/* Nav Links */}
        <div className="flex items-center space-x-6 sm:space-x-10 text-sm sm:text-base font-medium">
          <Link to="/" className={linkClass("/")}>
            Home
          </Link>
          <Link to="/favorites" className={linkClass("/favorites")}>
            Favorites
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

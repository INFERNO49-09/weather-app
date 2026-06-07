import axios from "axios";

const API = "/api";

function FavoriteButton({ weather, refreshFavorites }) {
  const addFavorite = async () => {
    try {
      await axios.post(
        `${API}/favorites`,
        { city: weather.name },
        { withCredentials: true }
      );
      refreshFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  if (!weather) return null;

  return (
    <button
      onClick={addFavorite}
      className="backdrop-blur-xl bg-yellow-500/20 border border-yellow-400 rounded-2xl px-5 py-3"
    >
      ⭐ Save City
    </button>
  );
}

export default FavoriteButton;
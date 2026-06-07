import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function FavoriteButton({ weather, refreshFavorites }) {
  const addFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to save favorites.");
      return;
    }

    try {
      await axios.post(
        `${API}/favorites`,
        { city: weather.name },
        { headers: { Authorization: `Bearer ${token}` } }
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
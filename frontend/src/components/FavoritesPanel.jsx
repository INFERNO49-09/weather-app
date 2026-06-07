function FavoritesPanel({
  favorites,
  onSelectCity,
  onRemove,
}) {
  if (!favorites.length) return null;

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
      <h2 className="text-xl font-bold mb-4">
        ⭐ Favorite Cities
      </h2>

      <div className="flex flex-wrap gap-3">
        {favorites.map((city) => (
          <div
            key={city}
            className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2"
          >
            <button
              onClick={() =>
                onSelectCity(city)
              }
              className="hover:text-cyan-300"
            >
              {city}
            </button>

            <button
              onClick={() =>
                onRemove(city)
              }
              className="text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavoritesPanel;
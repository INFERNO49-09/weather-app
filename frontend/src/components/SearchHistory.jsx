function SearchHistory({ history, onSelectCity }) {
  if (history.length === 0) return null;

  return (
    <div className="mt-6 w-full">
      <h2 className="text-2xl font-bold mb-4">
        Recent Searches
      </h2>

      <div className="flex flex-wrap gap-3">
        {history.map((city, index) => (
          <button
            key={index}
            onClick={() => onSelectCity(city)}
            className="backdrop-blur-xl bg-white/10 border border-white/20 px-6 py-3 rounded-2xl hover:bg-white/20 transition"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchHistory;
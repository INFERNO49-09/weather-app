function LocationsPage({
  history,
  onSelectCity,
}) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Saved Locations
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        {history.map((city, index) => (
          <button
            key={index}
            onClick={() => onSelectCity(city)}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 text-left hover:bg-white/20 transition"
          >
            <p className="text-2xl font-bold">
              📍 {city}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationsPage;
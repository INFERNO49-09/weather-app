function ClimateInsights({ weather }) {
  if (!weather) return null;

  const sunrise = new Date(
    weather.sys.sunrise * 1000
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sunset = new Date(
    weather.sys.sunset * 1000
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <p className="text-gray-400">Visibility</p>
        <p className="text-3xl font-bold">
          {(weather.visibility / 1000).toFixed(1)} km
        </p>
      </div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <p className="text-gray-400">Pressure</p>
        <p className="text-3xl font-bold">
          {weather.main.pressure}
        </p>
      </div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <p className="text-gray-400">Sunrise</p>
        <p className="text-2xl font-bold">
          {sunrise}
        </p>
      </div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
        <p className="text-gray-400">Sunset</p>
        <p className="text-2xl font-bold">
          {sunset}
        </p>
      </div>

    </div>
  );
}

export default ClimateInsights;
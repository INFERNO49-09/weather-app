import FavoriteButton from "./FavoriteButton";

function WeatherCard({
  weather,
  aqi,
  refreshFavorites,
}) {
  if (!weather) return null;

  const icon = weather.weather[0].icon;

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
    <div className="w-full">

      <div className="grid lg:grid-cols-2 gap-8 items-center">

        <div>

          <div className="flex items-center gap-4 mb-4">
            <p className="text-sky-400 text-lg">
              📍 {weather.name}
            </p>

            <FavoriteButton
              weather={weather}
              refreshFavorites={
                refreshFavorites
              }
            />
          </div>

          <h1 className="text-8xl font-bold leading-none">
            {Math.round(weather.main.temp)}°
          </h1>

          <h2 className="text-3xl font-semibold mt-4">
            {weather.weather[0].main}
          </h2>

          <p className="text-gray-300 mt-2">
            Feels like{" "}
            {Math.round(
              weather.main.feels_like
            )}
            °C
          </p>

        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
            alt="weather"
            className="w-64 h-64"
          />
        </div>

      </div>

      <div className="grid md:grid-cols-4 gap-4 mt-10">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <p className="text-gray-400">
            Humidity
          </p>

          <p className="text-3xl font-bold mt-2">
            {weather.main.humidity}%
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <p className="text-gray-400">
            Wind
          </p>

          <p className="text-3xl font-bold mt-2">
            {weather.wind.speed}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <p className="text-gray-400">
            Sunrise
          </p>

          <p className="text-2xl font-bold mt-2">
            {sunrise}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <p className="text-gray-400">
            Sunset
          </p>

          <p className="text-2xl font-bold mt-2">
            {sunset}
          </p>
        </div>

      </div>

      {aqi && (
        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <p className="text-gray-400">
              Air Quality
            </p>

            <p className="text-5xl font-bold mt-4">
              {aqi.list[0].main.aqi}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <p className="text-gray-400">
              PM2.5
            </p>

            <p className="text-5xl font-bold mt-4">
              {Math.round(
                aqi.list[0].components.pm2_5
              )}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <p className="text-gray-400">
              PM10
            </p>

            <p className="text-5xl font-bold mt-4">
              {Math.round(
                aqi.list[0].components.pm10
              )}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

export default WeatherCard;
function ForecastCard({ forecast }) {
  if (!forecast || forecast.length === 0)
    return null;

  return (
    <div className="w-full">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">
          5-Day Forecast
        </h2>

        <span className="text-sky-400">
          Weekly Outlook
        </span>
      </div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden">

        {forecast.map((day, index) => (
          <div
            key={index}
            className={`flex items-center justify-between px-8 py-6 ${
              index !== forecast.length - 1
                ? "border-b border-white/10"
                : ""
            }`}
          >
            <div className="flex items-center gap-6">

              <img
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt="weather"
                className="w-14 h-14"
              />

              <div>
                <p className="font-semibold text-xl">
                  {day.date}
                </p>

                <p className="text-gray-400 capitalize">
                  {day.description}
                </p>
              </div>

            </div>

            <div className="text-right">
              <p className="text-3xl font-bold">
                {Math.round(day.temp)}°
              </p>

              <p className="text-gray-400">
                Forecast
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default ForecastCard;
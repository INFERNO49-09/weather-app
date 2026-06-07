function HourlyForecastChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">
          Hourly Forecast
        </h2>

        <span className="text-sky-400">
          View 24h
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">

        {data.map((hour, index) => (
          <div
            key={index}
            className="min-w-[140px] backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 flex flex-col items-center"
          >
            <p className="text-gray-400">
              {hour.time}
            </p>

            <div className="text-4xl my-4">
              ☀️
            </div>

            <p className="text-3xl font-bold">
              {Math.round(hour.temp)}°
            </p>

            <p className="text-gray-500 mt-3 text-sm">
              NW
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}

export default HourlyForecastChart;
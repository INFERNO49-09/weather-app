import ForecastCard from "./ForecastCard";

function ForecastPage({
  forecast,
}) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Weekly Forecast
      </h1>

      <ForecastCard
        forecast={forecast}
      />
    </div>
  );
}

export default ForecastPage;
import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import LocationButton from "./components/LocationButton";
import ForecastCard from "./components/ForecastCard";
import SearchHistory from "./components/SearchHistory";
import HourlyForecastChart from "./components/HourlyForecastChart";
import WeatherEffects from "./components/WeatherEffects";
import TopBar from "./components/TopBar";
import LoginButton from "./components/LoginButton";
import ClimateInsights from "./components/ClimateInsights";
import FavoritesPanel from "./components/FavoritesPanel";

import ForecastPage from "./components/ForecastPage";
import LocationsPage from "./components/LocationsPage";
import SettingsPage from "./components/SettingsPage";
import MapPage from "./components/MapPage";

const API = import.meta.env.VITE_API_URL;

// Axios helper that always attaches JWT from localStorage
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("weatherHistory")) || [];
  });

  useEffect(() => {
    // Check if Google OAuth just redirected back with a token in the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Clean the token from the URL without reloading
      window.history.replaceState({}, "", "/");
    }

    // Now fetch the user using whatever token we have
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API}/auth/user`, {
        headers: authHeaders(),
      });
      setUser(res.data);
      loadFavorites();
    } catch (err) {
      // Token invalid or expired — clear it
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await axios.get(`${API}/favorites`, {
        headers: authHeaders(),
      });
      setFavorites(res.data.map((item) => item.city));
    } catch (err) {
      console.error(err);
    }
  };

  const removeFavorite = async (city) => {
    try {
      await axios.delete(`${API}/favorites/${city}`, {
        headers: authHeaders(),
      });
      loadFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setFavorites([]);
  };

  const saveToHistory = (city) => {
    const updatedHistory = [
      city,
      ...history.filter(
        (item) => item.toLowerCase() !== city.toLowerCase()
      ),
    ].slice(0, 5);

    setHistory(updatedHistory);
    localStorage.setItem("weatherHistory", JSON.stringify(updatedHistory));
  };

  const getBackgroundClass = () => {
    if (!weather)
      return "bg-gradient-to-br from-slate-950 via-slate-900 to-black";

    const condition = weather.weather[0].main.toLowerCase();

    switch (condition) {
      case "clear":
        return "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900";
      case "clouds":
        return "bg-gradient-to-br from-slate-950 via-slate-800 to-slate-900";
      case "rain":
      case "drizzle":
        return "bg-gradient-to-br from-slate-950 via-blue-950 to-black";
      case "thunderstorm":
        return "bg-gradient-to-br from-black via-purple-950 to-slate-950";
      default:
        return "bg-gradient-to-br from-slate-950 via-slate-900 to-black";
    }
  };

  const fetchAQI = async (lat, lon) => {
    try {
      const res = await axios.get(`${API}/aqi?lat=${lat}&lon=${lon}`);
      setAqi(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForecast = async (city) => {
    try {
      const res = await axios.get(`${API}/forecast/${city}`);

      const dailyForecast = res.data.list
        .filter((item) => item.dt_txt.includes("12:00:00"))
        .slice(0, 5)
        .map((item) => ({
          date: new Date(item.dt_txt).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          temp: item.main.temp,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        }));

      setForecast(dailyForecast);

      const hourlyData = res.data.list.slice(0, 8).map((item) => ({
        time: new Date(item.dt_txt).toLocaleTimeString([], { hour: "numeric" }),
        temp: item.main.temp,
      }));

      setHourlyForecast(hourlyData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeather = async (city) => {
    if (!city.trim()) return;

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API}/weather/${city}`);

      setWeather(res.data);
      saveToHistory(city);
      await fetchForecast(city);
      await fetchAQI(res.data.coord.lat, res.data.coord.lon);
    } catch (err) {
      setError("City not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        const res = await axios.get(
          `${API}/weather/location?lat=${latitude}&lon=${longitude}`
        );

        setWeather(res.data);
        saveToHistory(res.data.name);
        await fetchForecast(res.data.name);
        await fetchAQI(latitude, longitude);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className={`min-h-screen text-white ${getBackgroundClass()}`}>
      <WeatherEffects condition={weather?.weather?.[0]?.main} />

      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden pb-24 lg:pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-8">
            <TopBar user={user} />
            <div className="flex justify-start lg:justify-end">
              <LoginButton user={user} onLogout={handleLogout} />
            </div>
          </div>

          <div className="mb-8">
            <SearchBar onSearch={fetchWeather} />
          </div>

          <div className="mb-8 flex justify-center lg:justify-start">
            <LocationButton onLocationSearch={fetchLocationWeather} />
          </div>

          {favorites.length > 0 && (
            <div className="mb-8">
              <FavoritesPanel
                favorites={favorites}
                onSelectCity={fetchWeather}
                onRemove={removeFavorite}
              />
            </div>
          )}

          {activePage === "dashboard" && weather && (
            <div className="space-y-6 lg:space-y-8">
              <WeatherCard
                weather={weather}
                aqi={aqi}
                refreshFavorites={loadFavorites}
              />
              <ClimateInsights weather={weather} />
              <HourlyForecastChart data={hourlyForecast} />
              <ForecastCard forecast={forecast} />
              <SearchHistory history={history} onSelectCity={fetchWeather} />
            </div>
          )}

          {activePage === "forecast" && <ForecastPage forecast={forecast} />}

          {activePage === "locations" && (
            <LocationsPage history={history} onSelectCity={fetchWeather} />
          )}

          {activePage === "map" && <MapPage weather={weather} />}

          {activePage === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
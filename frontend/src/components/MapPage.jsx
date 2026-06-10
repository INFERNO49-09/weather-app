import { useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL;

function MapPage({ weather }) {
  const [layer, setLayer] = useState("clouds_new");

  if (!weather) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Weather Map</h2>
        <p className="text-gray-400">Search for a city first</p>
      </div>
    );
  }

  const lat = weather.coord.lat;
  const lon = weather.coord.lon;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Weather Map</h1>
          <p className="text-gray-400 mt-2">Interactive Weather Layers</p>
        </div>

        <select
          value={layer}
          onChange={(e) => setLayer(e.target.value)}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-4 py-3"
        >
          <option value="clouds_new">☁ Clouds</option>
          <option value="precipitation_new">🌧 Rain</option>
          <option value="temp_new">🌡 Temperature</option>
          <option value="wind_new">🌬 Wind</option>
        </select>
      </div>

      <div className="rounded-3xl overflow-hidden border border-white/20">
        <MapContainer
          center={[lat, lon]}
          zoom={8}
          style={{ height: "700px", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <TileLayer
            url={`${API}/weather-layer?layer=${layer}&z={z}&x={x}&y={y}`}
            opacity={0.6}
          />

          <Marker position={[lat, lon]}>
            <Popup>
              <div>
                <h3 className="font-bold">{weather.name}</h3>
                <p>{Math.round(weather.main.temp)}°C</p>
                <p>{weather.weather[0].description}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5">
          <p className="text-gray-400">Latitude</p>
          <p className="text-2xl font-bold">{lat.toFixed(2)}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5">
          <p className="text-gray-400">Longitude</p>
          <p className="text-2xl font-bold">{lon.toFixed(2)}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5">
          <p className="text-gray-400">Temperature</p>
          <p className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5">
          <p className="text-gray-400">Condition</p>
          <p className="text-2xl font-bold">{weather.weather[0].main}</p>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
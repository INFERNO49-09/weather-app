import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// Severe conditions from OpenWeatherMap weather codes
// https://openweathermap.org/weather-conditions
const SEVERE_CODES = new Set([
  // Thunderstorm
  200, 201, 202, 210, 211, 212, 221, 230, 231, 232,
  // Heavy rain
  502, 503, 504, 511,
  // Heavy shower rain
  522, 531,
  // Heavy snow / blizzard
  602, 611, 612, 613, 615, 616, 621, 622,
  // Extreme / tornado / hurricane
  900, 901, 902, 903, 904, 905, 906,
  // Squalls / tornado
  771, 781,
]);

const ALERT_LABELS = {
  2: "⛈️ Thunderstorm",
  3: "🌧️ Heavy Drizzle",
  5: "🌧️ Heavy Rain",
  6: "❄️ Heavy Snow",
  7: "🌫️ Extreme Atmosphere",
  9: "🌪️ Tornado / Extreme Wind",
};

function getSeverityLabel(code) {
  const group = Math.floor(code / 100);
  return ALERT_LABELS[group] || "⚠️ Severe Weather";
}

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("notificationsEnabled") === "true";
  });
  const [supported] = useState(
    typeof Notification !== "undefined" && "serviceWorker" in navigator
  );

  // Register service worker once on mount
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }, [supported]);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [supported]);

  const enable = useCallback(async () => {
    const granted = permission === "granted" || (await requestPermission());
    if (granted) {
      setEnabled(true);
      localStorage.setItem("notificationsEnabled", "true");
    }
    return granted;
  }, [permission, requestPermission]);

  const disable = useCallback(() => {
    setEnabled(false);
    localStorage.setItem("notificationsEnabled", "false");
  }, []);

  // Check weather data for severe conditions and fire a notification if found
  const checkForAlerts = useCallback(
    async (weather) => {
      if (!enabled || permission !== "granted" || !weather) return;

      const code = weather.weather[0]?.id;
      if (!SEVERE_CODES.has(code)) return;

      const label = getSeverityLabel(code);
      const city = weather.name;
      const description = weather.weather[0].description;
      const temp = Math.round(weather.main.temp);

      // Check backend for official alerts too (One Call API)
      let officialAlerts = [];
      try {
        const res = await axios.get(
          `${API}/alerts?lat=${weather.coord.lat}&lon=${weather.coord.lon}`
        );
        officialAlerts = res.data.alerts || [];
      } catch {
        // Fall back to local detection if endpoint fails
      }

      const sw = await navigator.serviceWorker.ready;

      if (officialAlerts.length > 0) {
        // Use official alert text if available
        const alert = officialAlerts[0];
        sw.showNotification(`🚨 ${alert.event} — ${city}`, {
          body: alert.description?.slice(0, 150) || description,
          icon: "/favicon.svg",
          badge: "/favicon.svg",
          tag: "weather-alert",
          renotify: true,
          vibrate: [200, 100, 200],
        });
      } else {
        // Fall back to detected condition
        sw.showNotification(`${label} Alert — ${city}`, {
          body: `${description} · ${temp}°C · Stay safe and check conditions before heading out.`,
          icon: "/favicon.svg",
          badge: "/favicon.svg",
          tag: "weather-alert",
          renotify: true,
          vibrate: [200, 100, 200],
        });
      }
    },
    [enabled, permission]
  );

  return { supported, permission, enabled, enable, disable, checkForAlerts };
}
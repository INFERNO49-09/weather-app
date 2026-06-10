import { useNotifications } from "./useNotifications";

function SettingsPage() {
  const { supported, permission, enabled, enable, disable } =
    useNotifications();

  const handleToggle = async () => {
    if (enabled) {
      disable();
    } else {
      const granted = await enable();
      if (!granted) {
        alert(
          "Notifications were blocked. Please allow them in your browser settings and try again."
        );
      }
    }
  };

  const statusText = () => {
    if (!supported) return "Not supported in this browser";
    if (permission === "denied") return "Blocked by browser — enable in site settings";
    if (enabled && permission === "granted") return "Active — you'll be alerted for severe conditions";
    return "Off — enable to get severe weather alerts";
  };

  const alertTypes = [
    { icon: "⛈️", label: "Thunderstorms" },
    { icon: "🌧️", label: "Heavy Rain" },
    { icon: "❄️", label: "Blizzard / Heavy Snow" },
    { icon: "🌪️", label: "Tornado / Extreme Wind" },
    { icon: "🌫️", label: "Extreme Atmosphere" },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="grid gap-4">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <h2 className="text-xl font-bold">Temperature Unit</h2>
          <p className="text-gray-400">Coming Soon</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Severe Weather Alerts</h2>
              <p className="text-gray-400 text-sm mt-1">{statusText()}</p>
            </div>

            <button
              onClick={handleToggle}
              disabled={!supported || permission === "denied"}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none
                ${enabled && permission === "granted"
                  ? "bg-green-500"
                  : "bg-white/20"
                }
                ${(!supported || permission === "denied") ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200
                  ${enabled && permission === "granted" ? "translate-x-7" : "translate-x-0"}
                `}
              />
            </button>
          </div>

          {permission === "denied" && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-sm text-red-300">
              Notifications are blocked. Go to your browser's site settings for{" "}
              <strong>{window.location.hostname}</strong> and set Notifications to "Allow", then refresh.
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-3">Alerts are triggered for:</p>
            <div className="grid grid-cols-2 gap-2">
              {alertTypes.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm bg-white/5 rounded-xl px-3 py-2"
                >
                  <span>{icon}</span>
                  <span className="text-gray-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {enabled && permission === "granted" && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-400/30 rounded-xl text-sm text-green-300">
              ✓ Alerts are active. Search any city to check for severe conditions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
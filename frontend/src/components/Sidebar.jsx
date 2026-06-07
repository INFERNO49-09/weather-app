import {
  LayoutDashboard,
  CloudSun,
  MapPin,
  Settings,
  Map,
} from "lucide-react";

function Sidebar({
  activePage,
  setActivePage,
}) {
  const navItem = (
    page,
    label,
    Icon
  ) => (
    <button
      onClick={() =>
        setActivePage(page)
      }
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition ${
        activePage === page
          ? "bg-white/10 border border-white/10"
          : "hover:bg-white/5"
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <aside className="w-56 min-h-screen bg-black/30 backdrop-blur-2xl border-r border-white/10 flex flex-col">
      <div className="p-8">
        <h2 className="text-2xl font-bold whitespace-nowrap">
          Weather
        </h2>

        <p className="text-xs text-gray-400 mt-2 tracking-[4px] uppercase">
          Live Atmosphere
        </p>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-3">

          {navItem(
            "dashboard",
            "Dashboard",
            LayoutDashboard
          )}

          {navItem(
            "forecast",
            "Forecast",
            CloudSun
          )}

          {navItem(
            "locations",
            "Locations",
            MapPin
          )}

          {navItem(
            "map",
            "Map",
            Map
          )}

          {navItem(
            "settings",
            "Settings",
            Settings
          )}

        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
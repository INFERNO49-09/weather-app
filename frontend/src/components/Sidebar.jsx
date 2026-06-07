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
  const navItems = [
    {
      page: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      page: "forecast",
      label: "Forecast",
      icon: CloudSun,
    },
    {
      page: "locations",
      label: "Locations",
      icon: MapPin,
    },
    {
      page: "map",
      label: "Map",
      icon: Map,
    },
    {
      page: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 min-h-screen bg-black/30 backdrop-blur-2xl border-r border-white/10 flex-col">
        <div className="p-8">
          <h2 className="text-2xl font-bold">
            Weather
          </h2>

          <p className="text-xs text-gray-400 mt-2 tracking-[4px] uppercase">
            Live Atmosphere
          </p>
        </div>

        <nav className="flex-1 px-4">
          <div className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.page}
                  onClick={() =>
                    setActivePage(item.page)
                  }
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition ${
                    activePage === item.page
                      ? "bg-white/10 border border-white/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/80 border-t border-white/10">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.page}
                onClick={() =>
                  setActivePage(item.page)
                }
                className={`flex flex-col items-center justify-center py-3 text-xs ${
                  activePage === item.page
                    ? "text-sky-400"
                    : "text-gray-400"
                }`}
              >
                <Icon size={20} />

                <span className="mt-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
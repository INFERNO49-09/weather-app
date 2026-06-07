function SettingsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Settings
      </h1>

      <div className="grid gap-4">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <h2 className="text-xl font-bold">
            Temperature Unit
          </h2>

          <p className="text-gray-400">
            Coming Soon
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <h2 className="text-xl font-bold">
            Notifications
          </h2>

          <p className="text-gray-400">
            Coming Soon
          </p>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
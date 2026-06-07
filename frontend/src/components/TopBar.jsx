function TopBar({ user }) {
  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <h1 className="text-3xl font-bold">
          Weather Dashboard
        </h1>

        <p className="text-gray-400">
          Real-time Weather Insights
        </p>
      </div>

      {user && (
        <div className="ml-auto mr-6 flex items-center gap-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl px-3 py-2">
          <img
            src={user.photos?.[0]?.value}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover"
          />

          <div>
            <p className="text-sm font-medium">
              {user.displayName}
            </p>

            <p className="text-xs text-gray-400 truncate max-w-[140px]">
              {user.emails?.[0]?.value}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopBar;
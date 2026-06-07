function TopBar({ user }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Weather Dashboard
        </h1>

        <p className="text-gray-400 text-sm md:text-base">
          Real-time Weather Insights
        </p>
      </div>

      {user && (
        <div className="w-full lg:w-auto lg:ml-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl px-3 py-2 flex items-center gap-3">
          {user.photo && (
            <img
              src={user.photo}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}

          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {user.name}
            </p>

            <p className="text-xs text-gray-400 truncate max-w-[220px]">
              {user.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopBar;
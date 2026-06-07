function LoginButton({ user }) {
  const login = () => {
    window.location.href =
      "http://localhost:5000/auth/google";
  };

  const logout = () => {
    window.location.href =
      "http://localhost:5000/auth/logout";
  };

  if (user) {
    return (
      <button
        onClick={logout}
        className="backdrop-blur-xl bg-red-500/20 border border-red-400 px-5 py-3 rounded-2xl"
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="backdrop-blur-xl bg-white/10 border border-white/20 px-5 py-3 rounded-2xl hover:bg-white/20 transition"
    >
      Sign In With Google
    </button>
  );
}

export default LoginButton;
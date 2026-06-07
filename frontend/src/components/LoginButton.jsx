const API = import.meta.env.VITE_API_URL;

function LoginButton({ user, onLogout }) {
  const login = () => {
    window.location.href = `${API}/auth/google`;
  };

  if (user) {
    return (
      <button
        onClick={onLogout}
        className="backdrop-blur-xl bg-red-500/20 border border-red-400 px-5 py-3 rounded-2xl hover:bg-red-500/30 transition"
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
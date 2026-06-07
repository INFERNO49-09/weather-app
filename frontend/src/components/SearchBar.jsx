import { useState } from "react";
import { Search } from "lucide-react";

function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(city);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="flex items-center gap-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-6 py-4">
        <Search size={22} />

        <input
          type="text"
          placeholder="Search City..."
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
          className="bg-transparent outline-none w-full text-lg"
        />
      </div>
    </form>
  );
}

export default SearchBar;
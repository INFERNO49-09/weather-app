function LocationButton({ onLocationSearch }) {
  return (
    <button
      onClick={onLocationSearch}
      className="bg-green-500 px-5 py-3 rounded-xl hover:bg-green-600"
    >
      📍 Use My Location
    </button>
  );
}

export default LocationButton;
import React from 'react';

export default function SearchBar({ search, setSearch, onSearch, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une entreprise..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>
    </form>
  );
}

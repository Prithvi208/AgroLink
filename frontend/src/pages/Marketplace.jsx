import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Wheat, Carrot, Apple, Flame, Milk, Bean, Sprout, TreePine, Package } from 'lucide-react';
import { api } from '../utils/api';

const categories = ['all', 'grains', 'vegetables', 'fruits', 'spices', 'dairy', 'pulses', 'cotton', 'sugarcane'];
const categoryIcons = {
  grains: <Wheat className="text-2xl" />,
  vegetables: <Carrot className="text-2xl text-green-600" />,
  fruits: <Apple className="text-2xl text-red-500" />,
  spices: <Flame className="text-2xl text-orange-500" />,
  dairy: <Package className="text-2xl text-blue-500" />,
  pulses: <Bean className="text-2xl text-amber-600" />,
  cotton: <Sprout className="text-2xl text-white" />,
  sugarcane: <TreePine className="text-2xl text-green-700" />,
  all: <Package className="text-2xl" />
};

export default function Marketplace() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'all') params.set('category', category);
    if (location) params.set('location', location);
    api.get(`/crops?${params}`)
      .then(data => setCrops(data))
      .catch(() => setCrops([]))
      .finally(() => setLoading(false));
  }, [search, category, location]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crop Marketplace</h1>
        <p className="text-gray-600 mt-1">Browse fresh agricultural produce from verified farmers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search crops..." 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Filter by location..."
              className="w-full md:w-48 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none" />
          </div>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${category === c ? 'bg-agro-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {categoryIcons[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"></div>
        </div>
      ) : crops.length === 0 ? (
        <div className="text-center py-16">
          <Wheat className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No crops found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map(crop => (
            <Link key={crop.id} to={`/marketplace/${crop.id}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              <div className="h-44 bg-gradient-to-br from-agro-50 to-agro-100 flex items-center justify-center">
                <span className="text-7xl group-hover:scale-110 transition-transform">
                  {categoryIcons[crop.category?.toLowerCase()] || categoryIcons.all}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-agro-700 transition">{crop.name}</h3>
                  <span className="bg-agro-100 text-agro-700 text-xs font-medium px-2 py-1 rounded-lg capitalize">{crop.category}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{crop.description || 'Fresh from the farm'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{crop.farmer_name} · {crop.farmer_location || crop.location || 'India'}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-2xl font-bold text-agro-700">${crop.price_per_unit}</p>
                    <p className="text-xs text-gray-500">per {crop.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{crop.quantity} {crop.unit}</p>
                    <p className="text-xs text-gray-500">available</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

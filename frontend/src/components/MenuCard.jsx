// src/components/MenuCard.jsx
import { formatIDR } from '../utils/formatCurrency'

const CategoryIcons = {
  coffee: '☕',
  'non-coffee': '🥤',
  food: '🍰'
};

const MenuCard = ({ item }) => {
  const imageUrl = item.image_url ? 
    `http://localhost:3000${item.image_url}` : 
    '/default-menu.png';

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        <img 
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/default-menu.png'
            e.target.onerror = null
          }}
        />
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full shadow-lg z-20">
          <span className="text-[#2C3639] font-bold">{formatIDR(item.price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 bg-gradient-to-b from-white to-gray-50">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-[#A27B5C]/10 text-[#A27B5C] text-xs font-semibold rounded-full">
              {CategoryIcons[item.category]} {item.category}
            </span>
            {item.isPopular && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                ⭐ Popular
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-[#2C3639] line-clamp-1 group-hover:text-[#A27B5C] transition-colors">
            {item.name}
          </h3>
        </div>
        
        <p className="text-[#3F4E4F]/80 text-sm line-clamp-2 mb-4 min-h-[40px]">
          {item.description}
        </p>

        {/* Order Button - Optional */}
        <button className="w-full py-2 px-4 bg-[#A27B5C] text-white rounded-lg font-medium 
                         opacity-0 group-hover:opacity-100 transition-opacity transform 
                         translate-y-2 group-hover:translate-y-0 hover:bg-[#8B6B4F]">
          Order Now
        </button>
      </div>
    </div>
  )
}

export default MenuCard
import type { Property } from '../types';
import { FaBed, FaMapMarkerAlt } from 'react-icons/fa';

interface PropertyCardProps {
  property: Property;
  variant?: 'whatsapp' | 'gmail' | 'compact';
}

export default function PropertyCard({ property, variant = 'whatsapp' }: PropertyCardProps) {
  const formatPrice = (price: number, currency: string) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ${currency}`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K ${currency}`;
    }
    return `${price.toLocaleString()} ${currency}`;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-16 h-16 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23999" x="50" y="50" text-anchor="middle" dy=".3em"%3EProperty%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center text-gray-500 text-xs">
            No Image
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium text-sm truncate">{property.title}</div>
          <div className="text-gray-400 text-xs">{property.area}</div>
          <div className="text-amber-400 font-semibold text-sm">{formatPrice(property.price, property.currency)}</div>
        </div>
      </div>
    );
  }

  if (variant === 'gmail') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
        <div className="flex gap-4">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-24 h-24 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%236b7280" x="50" y="50" text-anchor="middle" dy=".3em"%3EProperty%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-gray-900 font-semibold text-sm mb-1">{property.title}</h4>
            <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
              <FaMapMarkerAlt className="w-3 h-3" />
              <span>{property.area}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <FaBed className="w-3 h-3" />
                <span>{property.bedrooms} BR</span>
              </div>
            </div>
            <div className="text-gray-900 font-bold text-sm">{formatPrice(property.price, property.currency)}</div>
          </div>
        </div>
      </div>
    );
  }

  // WhatsApp variant (default)
  return (
    <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-4 mb-3 max-w-sm">
      {property.images && property.images.length > 0 ? (
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%231f2937" width="400" height="200"/%3E%3Ctext fill="%236b7280" x="200" y="100" text-anchor="middle" dy=".3em"%3EProperty Image%3C/text%3E%3C/svg%3E';
          }}
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-3 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">🏠</div>
            <div className="text-xs">No Image Available</div>
          </div>
        </div>
      )}
      <h4 className="text-white font-semibold text-sm mb-2">{property.title}</h4>
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
        <FaMapMarkerAlt className="w-3 h-3" />
        <span>{property.area}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <FaBed className="w-3 h-3" />
          <span>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="text-amber-400 font-bold text-lg">{formatPrice(property.price, property.currency)}</div>
    </div>
  );
}


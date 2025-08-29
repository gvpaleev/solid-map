import type { GeocodingResult, CityLocation } from '../types/geocoding';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export class GeocodingService {
  private static cache = new Map<string, CityLocation>();

  static async searchCity(cityName: string): Promise<CityLocation | null> {
    if (!cityName.trim()) {
      return null;
    }

    const cacheKey = cityName.toLowerCase().trim();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams({
        q: cityName,
        format: 'json',
        limit: '1',
        addressdetails: '1',
        'accept-language': 'ru,en'
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
        headers: {
          'User-Agent': 'SolidJS-Map-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results: GeocodingResult[] = await response.json();

      if (results.length === 0) {
        return null;
      }

      const result = results[0];
      const cityLocation: CityLocation = {
        name: cityName,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name
      };

      // Cache the result
      this.cache.set(cacheKey, cityLocation);

      return cityLocation;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

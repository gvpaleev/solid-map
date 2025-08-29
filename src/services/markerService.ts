import type { CustomMarker } from '../types/markers';

const STORAGE_KEY = 'solid-map-custom-markers';

export class MarkerService {
  static saveMarkers(markers: CustomMarker[]): void {
    try {
      const serializedMarkers = markers.map(marker => ({
        ...marker,
        createdAt: marker.createdAt.toISOString()
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedMarkers));
    } catch (error) {
      console.error('Failed to save markers:', error);
    }
  }

  static loadMarkers(): CustomMarker[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      let markers: CustomMarker[] = parsed.map((marker: any) => ({
        ...marker,
        createdAt: new Date(marker.createdAt)
      }));

      const moscoLat = 55.7558;
      const moscoLon = 37.6176;
      const range = 0.1; // +/- 0.1 degrees

      // Randomize existing markers (position and color)
      markers = markers.map(marker => {
        const randomLat = moscoLat + (Math.random() * 2 * range - range);
        const randomLon = moscoLon + (Math.random() * 2 * range - range);
        const randomColor = (['red', 'blue', 'green', 'orange', 'purple'] as CustomMarker['color'][])[Math.floor(Math.random() * 5)];
        return {
          ...marker,
          lat: randomLat,
          lon: randomLon,
          color: randomColor,
        };
      });

      // Ensure exactly 15 markers
      const targetCount = 15;
      if (markers.length < targetCount) {
        while (markers.length < targetCount) {
          const randomLat = moscoLat + (Math.random() * 2 * range - range);
          const randomLon = moscoLon + (Math.random() * 2 * range - range);
          markers.push({
            id: MarkerService.generateId(),
            lat: randomLat,
            lon: randomLon,
            title: `Marker ${markers.length + 1}`,
            color: (['red', 'blue', 'green', 'orange', 'purple'] as CustomMarker['color'][])[Math.floor(Math.random() * 5)], // Random color
            createdAt: new Date(),
          });
        }
      } else if (markers.length > targetCount) {
        markers = markers.slice(0, targetCount);
      }
      
      // Save the adjusted list back to localStorage
      MarkerService.saveMarkers(markers);

      return markers;

    } catch (error) {
      console.error('Failed to load markers:', error);
      return [];
    }
  }

  static addMarker(marker: CustomMarker): CustomMarker[] {
    const markers = this.loadMarkers(); // This will now handle the 15-marker logic
    markers.push(marker);
    this.saveMarkers(markers);
    return markers;
  }

  static removeMarker(markerId: string): CustomMarker[] {
    const markers = this.loadMarkers().filter(m => m.id !== markerId);
    this.saveMarkers(markers);
    return markers;
  }

  static updateMarker(markerId: string, updates: Partial<CustomMarker>): CustomMarker[] {
    const markers = this.loadMarkers().map(marker => 
      marker.id === markerId ? { ...marker, ...updates } : marker
    );
    this.saveMarkers(markers);
    return markers;
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

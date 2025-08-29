import { onMount, onCleanup, createEffect, createSignal } from 'solid-js';
import type { Component } from 'solid-js';
import L from 'leaflet';
import type { CityLocation } from '../types/geocoding';
import type { CustomMarker, MarkerFormData } from '../types/markers';
import { MarkerService } from '../services/markerService';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Import local marker images
import markerIconRed from '../assets/markers/marker-icon-2x-red.png';
import markerIconBlue from '../assets/markers/marker-icon-2x-blue.png';
import markerIconGreen from '../assets/markers/marker-icon-2x-green.png';
import markerIconOrange from '../assets/markers/marker-icon-2x-orange.png';
import markerIconViolet from '../assets/markers/marker-icon-2x-violet.png';
import markerIcon from '../assets/leaflet/marker-icon.png';
import markerIcon2x from '../assets/leaflet/marker-icon-2x.png';
import markerShadow from '../assets/leaflet/marker-shadow.png';

interface MapComponentProps {
  city: CityLocation | null;
  selectedTags: string[]; // Add selectedTags prop
  onMarkerClick: (marker: CustomMarker) => void; // New prop for marker click
}

const MapComponent: Component<MapComponentProps> = (props) => {
  let mapContainer: HTMLDivElement;
  let map: L.Map;
  let cityMarker: L.Marker | null = null;
  let markerLayers: Map<string, L.Marker> = new Map();
  
  const [customMarkers, setCustomMarkers] = createSignal<CustomMarker[]>([]);

  // Create colored marker icons
  const createColoredIcon = (color: CustomMarker['color']) => {
    const iconMap = {
      red: markerIconRed,
      blue: markerIconBlue,
      green: markerIconGreen,
      orange: markerIconOrange,
      purple: markerIconViolet, // Using violet for purple
    };
    
    return L.icon({
      iconUrl: iconMap[color] || markerIconRed, // fallback to red if color not found
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Update map markers display
  const updateMapDisplay = () => {
    if (!map) return;

    // Clear existing custom markers from the map
    markerLayers.forEach(layer => map.removeLayer(layer));
    markerLayers.clear();

    const markers = customMarkers();
    const selectedColors = props.selectedTags; // Renamed for clarity, still uses selectedTags prop

    markers.forEach(marker => {
      // If no colors are selected, all markers are bright.
      // Otherwise, markers matching selected colors are bright, others are dark.
      const opacity = selectedColors.length === 0 || selectedColors.includes(marker.color) ? 1.0 : 0.3;

      const leafletMarker = L.marker([marker.lat, marker.lon], {
        icon: createColoredIcon(marker.color),
        opacity: opacity
      })
      .addTo(map);

      leafletMarker.on('click', () => {
        props.onMarkerClick(marker); // Call the passed handler
      });
      
      markerLayers.set(marker.id, leafletMarker);
    });
  };


  onMount(() => {
    // Initialize the map
    map = L.map(mapContainer!, { attributionControl: false, zoomControl: false }).setView([55.7558, 37.6176], 10); // Default to Moscow
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19
    }).addTo(map);

    // Fix for default markers in Leaflet with bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    // Load existing custom markers from localStorage
    const markers = MarkerService.loadMarkers();
    setCustomMarkers(markers);

    // Invalidate map size after initialization to ensure it renders correctly
    map.invalidateSize();
  });

  // React to city changes
  createEffect(() => {
    const city = props.city;
    if (city && map) {
      // Remove existing city marker
      if (cityMarker) {
        map.removeLayer(cityMarker);
      }

      // Add new city marker
      cityMarker = L.marker([city.lat, city.lon])
        .addTo(map)
        .bindPopup(`<b>${city.name}</b><br>${city.displayName}`)
        .openPopup();

      // Center map on the city
      map.setView([city.lat, city.lon], 12);
    }
  });

  // React to markers or selectedTags changes
  createEffect(() => {
    // This effect will run when customMarkers or selectedTags change
    updateMapDisplay();
    // Invalidate map size to ensure it redraws correctly after updates
    if (map) {
      map.invalidateSize();
    }
  });

  onCleanup(() => {
    if (map) {
      map.remove();
    }
  });

  return (
    <>
      <div class="map-container">
        <div ref={mapContainer!} class="map"></div>
      </div>
    </>
  );
};

export default MapComponent;

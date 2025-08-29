import { createSignal, createEffect } from 'solid-js';
import type { Component } from 'solid-js';
import type { CityLocation } from './types/geocoding';
import MapComponent from './components/MapComponent';
import { MarkerService } from './services/markerService'; // Import MarkerService
import type { CustomMarker } from './types/markers'; // Import CustomMarker
import './App.css';
import MarkerModal from './components/MarkerModal'; // Import MarkerModal
import type { MarkerFormData } from './types/markers'; // Import MarkerFormData
import TagFilterBar from './components/TagFilterBar'; // Import TagFilterBar

const App: Component = () => {
  const [currentCity, setCurrentCity] = createSignal<CityLocation | null>(null);
  const [errorMessage, setErrorMessage] = createSignal<string>('');
  const [allMarkers, setAllMarkers] = createSignal<CustomMarker[]>([]); // State to hold all markers
  // const [allTags, setAllTags] = createSignal<string[]>([]); // State to hold all unique tags - No longer needed for color filtering
  const [selectedColors, setSelectedColors] = createSignal<string[]>([]); // State to hold selected colors

  // Define all possible marker colors
  const allMarkerColors = ['red', 'blue', 'green', 'orange', 'purple'];

  // State for MarkerModal
  const [showMarkerModal, setShowMarkerModal] = createSignal(false);
  const [editingMarkerData, setEditingMarkerData] = createSignal<CustomMarker | null>(null);
  const [newMarkerPosition, setNewMarkerPosition] = createSignal<{ lat: number; lon: number } | null>(null);

  // Function to generate random marker data for the modal
  const generateRandomMarkerData = (): CustomMarker => {
    const colors = ['red', 'blue', 'green', 'orange', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)] as CustomMarker['color'];
    const randomTitle = `Случайное событие ${Math.floor(Math.random() * 1000)}`;
    const randomDescription = `Это описание для случайного события: ${randomTitle}. Здесь может быть любая информация о мероприятии.`;
    const randomTags = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => `тег${Math.floor(Math.random() * 5) + 1}`);

    return {
      id: MarkerService.generateId(), // Generate a new ID for mock data
      lat: 0, // Lat/Lon are not relevant for mock data in modal
      lon: 0,
      title: randomTitle,
      description: randomDescription,
      color: randomColor,
      createdAt: new Date(),
      tags: randomTags,
    };
  };

  // Function to generate a random marker (for initial map population)
  const generateRandomMarker = (): CustomMarker => {
    const colors = ['red', 'blue', 'green', 'orange', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)] as CustomMarker['color'];
    const randomLat = 55.7558 + (Math.random() - 0.5) * 0.5; // Around Moscow
    const randomLon = 37.6176 + (Math.random() - 0.5) * 0.5; // Around Moscow
    const randomTitle = `Событие ${Math.floor(Math.random() * 1000)}`;
    const randomDescription = `Описание для события ${randomTitle}.`;
    const randomTags = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => `tag${Math.floor(Math.random() * 5) + 1}`);

    return {
      id: MarkerService.generateId(),
      lat: randomLat,
      lon: randomLon,
      title: randomTitle,
      description: randomDescription,
      color: randomColor,
      createdAt: new Date(),
      tags: randomTags,
    };
  };

  // Initialize markers on app start
  createEffect(() => {
    let markers = MarkerService.loadMarkers();
    
    // Add random markers only if no markers exist
    if (markers.length === 0) {
      for (let i = 0; i < 10; i++) {
        const newMarker = generateRandomMarker();
        markers = MarkerService.addMarker(newMarker);
      }
    }
    
    setAllMarkers(markers);
    // The allTags and uniqueTags logic is no longer directly used for color filtering
    // but might be used elsewhere. For now, I'll comment it out if it's not needed.
    // const uniqueTags = Array.from(new Set(markers.flatMap(marker => marker.tags || [])));
    // setAllTags(uniqueTags);
  });

  const handleCityFound = (city: CityLocation) => {
    setCurrentCity(city);
    setErrorMessage('');
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(''), 5000); // Clear error after 5 seconds
  };

  // Functions to handle MarkerModal
  const handleOpenEditModal = (marker: CustomMarker) => {
    // Generate random mock data for the modal instead of using the actual marker data
    setEditingMarkerData(generateRandomMarkerData());
    setNewMarkerPosition(null); // Clear new marker position
    setShowMarkerModal(true);
  };

  const handleOpenAddModal = (position: { lat: number; lon: number }) => {
    setEditingMarkerData(null); // Clear editing marker data
    setNewMarkerPosition(position);
    setShowMarkerModal(true);
  };

  const handleCloseModal = () => {
    setShowMarkerModal(false);
    setEditingMarkerData(null);
    setNewMarkerPosition(null);
  };

  const handleSaveMarker = (data: MarkerFormData) => {
    if (editingMarkerData()) {
      // Update existing marker
      const updatedMarker: CustomMarker = {
        ...editingMarkerData()!,
        title: data.title,
        description: data.description,
        color: data.color,
        tags: data.tags,
      };
      const updatedMarkers = MarkerService.updateMarker(updatedMarker.id, {
        title: data.title,
        description: data.description,
        color: data.color,
        tags: data.tags,
      });
      setAllMarkers(updatedMarkers);
    } else if (newMarkerPosition()) {
      // Add new marker
      const newMarker: CustomMarker = {
        id: MarkerService.generateId(),
        lat: newMarkerPosition()!.lat,
        lon: newMarkerPosition()!.lon,
        title: data.title,
        description: data.description,
        color: data.color,
        createdAt: new Date(),
        tags: data.tags,
      };
      const updatedMarkers = MarkerService.addMarker(newMarker);
      setAllMarkers(updatedMarkers);
    }
    // Re-extract unique tags after saving - No longer needed as allTags is commented out
    // const uniqueTags = Array.from(new Set(allMarkers().flatMap(marker => marker.tags || [])));
    // setAllTags(uniqueTags);
    handleCloseModal();
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1>События в твоем городе</h1>
      </header>
      
      <main class="app-main">
        {errorMessage() && (
          <div class="error-message">
            {errorMessage()}
          </div>
        )}
        
        {currentCity() && (
          <div class="city-info">
            <h3>Найден город: {currentCity()!.name}</h3>
            <p>{currentCity()!.displayName}</p>
          </div>
        )}
        
        <TagFilterBar 
          allTags={allMarkerColors} 
          onTagSelect={setSelectedColors} 
        />

        <MapComponent 
          city={currentCity()} 
          selectedTags={selectedColors()} 
          onMarkerClick={handleOpenEditModal} // Pass the handler to MapComponent
        />

        <MarkerModal
          isOpen={showMarkerModal()}
          onClose={handleCloseModal}
          onSave={handleSaveMarker}
          editingMarker={editingMarkerData()}
          position={newMarkerPosition()}
        />
      </main>
    </div>
  );
};

export default App;

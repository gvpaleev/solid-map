import { createSignal, createEffect } from 'solid-js';
import type { Component } from 'solid-js';
import type { CityLocation } from '../types/geocoding';
import { GeocodingService } from '../services/geocoding';

interface SearchInputProps {
  onCityFound: (city: CityLocation) => void;
  onError: (error: string) => void;
}

const SearchInput: Component<SearchInputProps> = (props) => {
  const [searchTerm, setSearchTerm] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  let searchTimeout: number;

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await GeocodingService.searchCity(term);
      
      if (result) {
        props.onCityFound(result);
      } else {
        props.onError(`Город "${term}" не найден`);
      }
    } catch (error) {
      props.onError('Ошибка при поиске города');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    setSearchTerm(value);

    // Clear previous timeout
    clearTimeout(searchTimeout);

    // Debounce search
    if (value.trim()) {
      searchTimeout = setTimeout(() => {
        handleSearch(value);
      }, 500);
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    clearTimeout(searchTimeout);
    if (searchTerm().trim()) {
      handleSearch(searchTerm());
    }
  };

  return (
    <div class="search-container">
      <form onSubmit={handleSubmit}>
        <div class="search-input-wrapper">
          <input
            type="text"
            placeholder="Введите название города..."
            value={searchTerm()}
            onInput={handleInput}
            class="search-input"
            disabled={isLoading()}
          />
          <button 
            type="submit" 
            class="search-button"
            disabled={isLoading() || !searchTerm().trim()}
          >
            {isLoading() ? 'Поиск...' : 'Найти'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchInput;

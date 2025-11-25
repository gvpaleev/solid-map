# Solid Map

Interactive map application for discovering and managing local events in your city, built with SolidJS and Leaflet.

## Features

- **Interactive Map**: Browse events on an interactive map powered by Leaflet
- **Color-Coded Markers**: Events categorized by color (red, blue, green, orange, purple)
- **Filter by Category**: Filter events by color categories
- **Add/Edit Events**: Create new events or edit existing ones
- **Persistent Storage**: Events saved in browser localStorage
- **Geocoding**: Search for cities and locations

## Tech Stack

- **SolidJS** - Reactive UI framework
- **TypeScript** - Type-safe development
- **Leaflet** - Interactive maps
- **Vite** - Build tool and dev server

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

Outputs production build to `dist/` folder.

## Project Structure

```
src/
├── components/       # UI components
│   ├── MapComponent.tsx
│   ├── MarkerModal.tsx
│   ├── SearchInput.tsx
│   └── TagFilterBar.tsx
├── services/        # Business logic
│   ├── geocoding.ts
│   └── markerService.ts
├── types/           # TypeScript definitions
│   ├── geocoding.ts
│   └── markers.ts
└── App.tsx          # Main application
```

## License

MIT

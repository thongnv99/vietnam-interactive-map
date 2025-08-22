# 🗺️ Vietnam Interactive Map

An interactive map application of Vietnam built with OpenLayers, allowing users to explore provinces and manage personal landmarks.

![Vietnam Map Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![OpenLayers](https://img.shields.io/badge/OpenLayers-1F6B75?logo=openlayers&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## ✨ Features

### 🏛️ Province Exploration

- **Interactive map** displaying all 63 provinces/cities of Vietnam
- **Dropdown selector** to choose and navigate to specific provinces
- **Dynamic highlighting** with red dashed borders when selecting provinces
- **Detailed information** about selected provinces/cities
- **Smooth animations** when transitioning between regions

### 📍 Personal Landmark Management

- **Add landmarks** by double-clicking on the map
- **Modal form** for entering information:
  - Landmark title
  - Thumbnail URL (optional)
  - Detailed description
- **Pin display** with custom SVG icons
- **Popup tooltips** when hovering over pins
- **Management list** in sidebar with ability to:
  - Click to focus on landmarks
  - Delete landmarks
- **Local storage** persistence with localStorage

### 🎨 Interface & User Experience

- **Responsive design** compatible with multiple devices
- **Professional sidebar** layout
- **Auto theme** following system preferences
- **Smooth animations** & transitions
- **Keyboard shortcuts** (ESC to close modal)

## 🚀 Installation & Setup

### System Requirements

- Node.js >= 16.0.0
- npm or yarn

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🛠️ Technologies Used

| Technology     | Version | Purpose                                |
| -------------- | ------- | -------------------------------------- |
| **TypeScript** | ~5.8.3  | Type safety and development experience |
| **OpenLayers** | ^10.6.1 | Interactive mapping library            |
| **Vite**       | ^7.1.2  | Build tool and development server      |
| **CSS3**       | -       | Styling and responsive design          |

## 📁 Project Structure

```
root/
├── public/
│   ├── pin.svg          # Icon for landmarks
│   ├── vn.json          # GeoJSON data for Vietnam provinces
│   └── vite.svg         # Vite logo
├── src/
│   ├── main.ts          # Main application logic
│   ├── style.css        # Main stylesheet
│   └── vite-env.d.ts    # Type definitions
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # Documentation
```

## 🎯 How to Use

### Exploring Provinces

1. **Select from dropdown**: Use the "Choose Province/City" dropdown for quick navigation
2. **Direct clicking**: Click on any province on the map to view information
3. **View details**: Province/city information will display in the left panel

### Managing Landmarks

1. **Add new**: Double-click anywhere on the map
2. **Fill information**: Enter title, description, and image URL (optional)
3. **Save**: Click "Add Landmark" to save
4. **Manage**: Use the sidebar list to navigate or delete landmarks

## 🔧 Customization

### Change map center

```typescript
// In main.ts, line ~134
center: fromLonLat([106.6297, 14.0583]), // [longitude, latitude]
```

### Customize selected province style

```typescript
// In main.ts, lines ~98-107
const selectedStyle = new Style({
  stroke: new Stroke({
    color: '#ff0000', // Border color
    width: 2, // Border width
    lineDash: [5, 5], // Dash pattern
  }),
  fill: new Fill({
    color: 'transparent', // Fill color
  }),
});
```

### Change landmark icon

Replace the `public/pin.svg` file with a new icon (recommended size: 24x24px)

## 📊 Data

### GeoJSON Data Source

- **File**: `public/vn.json`
- **Format**: GeoJSON FeatureCollection
- **Contains**: 63 provinces/cities of Vietnam
- **Properties**: `id`, `name`
- **Geometry**: Polygon/MultiPolygon boundaries

### LocalStorage Structure

```typescript
interface Landmark {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
}
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

**Project Link**: [https://github.com/username/vietnam-interactive-map](https://github.com/username/vietnam-interactive-map)

---

<div align="center">
  <strong>🇻🇳 Made with ❤️ for Vietnam 🇻🇳</strong>
</div>

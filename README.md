# Customizable Mapbox Scalebar Plugin

A highly customizable scalebar plugin for Mapbox GL JS that adapts to different zoom levels and latitudes.

## Features

- **Adaptive scaling**: Automatically adjusts scale based on current zoom level and latitude
- **Multiple units**: Support for metric, imperial, or both units simultaneously
- **Two display styles**: Classic line style or checkered pattern (like ArcGIS scalebars)
- **Highly customizable**: Colors, fonts, transparency, stroke width, and frame settings
- **Responsive**: Updates in real-time as users pan and zoom the map
- **Lightweight**: No external dependencies beyond Mapbox GL JS

  <img width="1073" height="902" alt="image" src="https://github.com/user-attachments/assets/09d55c07-3d5b-4fc1-8e71-19f74e5198db" />


## Installation

### Option 1: Direct Include
```html
<script src="path/to/mapbox-scalebar.js"></script>
```

### Option 2: ES6 Import
```javascript
import MapboxScalebar from './src/mapbox-scalebar.js';
```

### Option 3: CommonJS
```javascript
const MapboxScalebar = require('./src/mapbox-scalebar.js');
```

## Usage

### Basic Usage
```javascript
// Initialize the scalebar
const scalebar = new MapboxScalebar();

// Add to your Mapbox map
map.addControl(scalebar, 'bottom-left');
```

### Advanced Usage with Custom Options
```javascript
const scalebar = new MapboxScalebar({
    units: 'both',              // 'metric', 'imperial', or 'both'
    maxWidth: 200,              // Maximum width in pixels
    textColor: '#333333',       // Text color
    strokeColor: '#000000',     // Line color
    backgroundColor: '#ffffff', // Background color
    transparency: 0.9,          // Background transparency (0-1)
    fontSize: 14,               // Font size in pixels
    fontFamily: 'Arial, sans-serif', // Font family
    strokeWidth: 2,             // Line thickness
    showFrame: true,            // Show background frame
    frameColor: '#cccccc',      // Frame border color
    frameWidth: 1,              // Frame border thickness
    framePadding: 8,            // Padding inside frame
    padding: 12                 // Content padding
});

map.addControl(scalebar, 'bottom-left');
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `units` | string | `'metric'` | Scale units: 'metric', 'imperial', or 'both' |
| `maxWidth` | number | `150` | Maximum scalebar width in pixels |
| `color` | string | `'#000000'` | General color (legacy, use specific color options) |
| `textColor` | string | `'#000000'` | Color of scale text |
| `strokeColor` | string | `'#000000'` | Color of scale lines |
| `backgroundColor` | string | `'rgba(255, 255, 255, 0.8)'` | Background color |
| `transparency` | number | `0.8` | Background transparency (0-1) |
| `fontSize` | number | `12` | Font size in pixels |
| `fontFamily` | string | `'Arial, sans-serif'` | Font family |
| `strokeWidth` | number | `2` | Thickness of scale lines |
| `showFrame` | boolean | `true` | Whether to show background frame |
| `frameColor` | string | `'#000000'` | Frame border color |
| `frameWidth` | number | `1` | Frame border thickness |
| `framePadding` | number | `5` | Padding inside the frame |
| `padding` | number | `10` | Content padding |
| `position` | string | `'bottom-left'` | Control position (used by Mapbox) |
| `style` | string | `'line'` | Display style: 'line' or 'checkered' |
| `checkeredHeight` | number | `8` | Height of checkered bar in pixels |
| `checkeredSegments` | number | `4` | Number of alternating segments in checkered pattern |
| `checkeredColor1` | string | `'#ffffff'` | First color in checkered pattern |
| `checkeredColor2` | string | `'#000000'` | Second color in checkered pattern |

## Methods

### `setOptions(options)`
Update scalebar options dynamically:
```javascript
scalebar.setOptions({
    units: 'imperial',
    textColor: '#ff0000',
    transparency: 0.5
});
```

### `getOptions()`
Get current scalebar options:
```javascript
const currentOptions = scalebar.getOptions();
console.log(currentOptions);
```

## Examples

### Dark Theme
```javascript
const darkScalebar = new MapboxScalebar({
    textColor: '#ffffff',
    strokeColor: '#ffffff',
    backgroundColor: '#000000',
    frameColor: '#ffffff',
    transparency: 0.9
});
```

### Minimal Style
```javascript
const minimalScalebar = new MapboxScalebar({
    showFrame: false,
    strokeWidth: 1,
    fontSize: 10,
    textColor: '#666666',
    strokeColor: '#666666',
    transparency: 0.5
});
```

### Both Units
```javascript
const dualScalebar = new MapboxScalebar({
    units: 'both',
    maxWidth: 200,
    backgroundColor: '#f8f9fa',
    frameColor: '#dee2e6'
});
```

### Checkered Style (ArcGIS-like)
```javascript
const checkeredScalebar = new MapboxScalebar({
    style: 'checkered',
    checkeredHeight: 10,
    checkeredSegments: 5,
    checkeredColor1: '#ffffff',
    checkeredColor2: '#000000',
    units: 'both',
    strokeColor: '#333333'
});
```

### Custom Checkered Pattern
```javascript
const colorfulCheckered = new MapboxScalebar({
    style: 'checkered',
    checkeredHeight: 12,
    checkeredSegments: 8,
    checkeredColor1: '#e3f2fd',
    checkeredColor2: '#1976d2',
    strokeColor: '#0d47a1',
    textColor: '#0d47a1'
});
```

## Browser Support

- Modern browsers with Canvas support
- Mapbox GL JS v2.0+ or v3.0+

## Development

### Build
```bash
npm install
npm run build
```

### Serve Example
```bash
npm run serve
```

Then open `http://localhost:8080/example.html` in your browser.

**Note**: You'll need to replace the Mapbox access token in `example.html` with your own token from [Mapbox](https://account.mapbox.com/).

## License

Apache 2.0

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

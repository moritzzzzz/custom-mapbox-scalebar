class MapboxScalebar {
  constructor(options = {}) {
    this.options = {
      units: options.units || 'metric', // 'metric', 'imperial', or 'both'
      maxWidth: options.maxWidth || 150,
      color: options.color || '#000000',
      backgroundColor: options.backgroundColor || 'rgba(255, 255, 255, 0.8)',
      textColor: options.textColor || '#000000',
      fontSize: options.fontSize || 12,
      fontFamily: options.fontFamily || 'Arial, sans-serif',
      strokeWidth: options.strokeWidth || 2,
      strokeColor: options.strokeColor || '#000000',
      transparency: options.transparency !== undefined ? options.transparency : 0.8,
      padding: options.padding || 10,
      position: options.position || 'bottom-left',
      showFrame: options.showFrame !== undefined ? options.showFrame : true,
      frameColor: options.frameColor || '#000000',
      frameWidth: options.frameWidth || 1,
      framePadding: options.framePadding || 5,
      style: options.style || 'line', // 'line' or 'checkered'
      checkeredHeight: options.checkeredHeight || 8,
      checkeredSegments: options.checkeredSegments || 4,
      checkeredColor1: options.checkeredColor1 || '#ffffff',
      checkeredColor2: options.checkeredColor2 || '#000000'
    };

    this._container = null;
    this._canvas = null;
    this._ctx = null;
    this._map = null;
    this._updateBound = this._update.bind(this);
  }

  onAdd(map) {
    this._map = map;
    
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapbox-scalebar-ctrl';
    this._container.style.position = 'relative';
    this._container.style.pointerEvents = 'none';

    this._canvas = document.createElement('canvas');
    this._canvas.style.display = 'block';
    this._ctx = this._canvas.getContext('2d');

    this._container.appendChild(this._canvas);

    this._map.on('zoom', this._updateBound);
    this._map.on('move', this._updateBound);
    this._map.on('resize', this._updateBound);

    this._update();

    return this._container;
  }

  onRemove() {
    if (this._map) {
      this._map.off('zoom', this._updateBound);
      this._map.off('move', this._updateBound);
      this._map.off('resize', this._updateBound);
    }
    
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    
    this._map = null;
    this._container = null;
    this._canvas = null;
    this._ctx = null;
  }

  _update() {
    if (!this._map || !this._ctx) return;

    const center = this._map.getCenter();
    const latitude = center.lat;
    const zoom = this._map.getZoom();
    
    const scaleData = this._calculateScale(latitude, zoom);
    this._render(scaleData);
  }

  _calculateScale(latitude, zoom) {
    // Get the center of the map and calculate actual distance using map bounds
    const center = this._map.getCenter();
    const bounds = this._map.getBounds();
    
    // Calculate the actual distance across the maxWidth pixels using map bounds
    // Use two points at the same latitude but different longitudes
    const centerLng = center.lng;
    const centerLat = center.lat;
    
    // Get the map container dimensions
    const mapCanvas = this._map.getCanvas();
    const mapWidth = mapCanvas.width / (window.devicePixelRatio || 1);
    const mapHeight = mapCanvas.height / (window.devicePixelRatio || 1);
    
    // Calculate the longitude range that corresponds to the maxWidth pixels
    const lngRange = bounds.getEast() - bounds.getWest();
    const pixelToLngRatio = lngRange / mapWidth;
    const maxWidthLng = this.options.maxWidth * pixelToLngRatio;
    
    // Calculate distance between two points at the same latitude
    const point1 = { lat: centerLat, lng: centerLng - maxWidthLng / 2 };
    const point2 = { lat: centerLat, lng: centerLng + maxWidthLng / 2 };
    
    // Use Haversine formula to calculate actual distance
    const maxWidthMeters = this._haversineDistance(point1, point2);
    
    let distance, unit, pixelWidth;
    
    if (this.options.units === 'metric' || this.options.units === 'both') {
      if (maxWidthMeters >= 1000) {
        distance = this._getRoundedDistance(maxWidthMeters / 1000);
        unit = 'km';
        // Calculate how many pixels this rounded distance represents
        const actualDistanceMeters = distance * 1000;
        pixelWidth = (actualDistanceMeters / maxWidthMeters) * this.options.maxWidth;
      } else {
        distance = this._getRoundedDistance(maxWidthMeters);
        unit = 'm';
        pixelWidth = (distance / maxWidthMeters) * this.options.maxWidth;
      }
    }

    let imperialData = null;
    if (this.options.units === 'imperial' || this.options.units === 'both') {
      const maxWidthFeet = maxWidthMeters * 3.28084;
      if (maxWidthFeet >= 5280) {
        const miles = this._getRoundedDistance(maxWidthFeet / 5280);
        const actualDistanceFeet = miles * 5280;
        imperialData = {
          distance: miles,
          unit: 'mi',
          pixelWidth: (actualDistanceFeet / maxWidthFeet) * this.options.maxWidth
        };
      } else {
        const feet = this._getRoundedDistance(maxWidthFeet);
        imperialData = {
          distance: feet,
          unit: 'ft',
          pixelWidth: (feet / maxWidthFeet) * this.options.maxWidth
        };
      }
    }

    return {
      metric: this.options.units !== 'imperial' ? { distance, unit, pixelWidth } : null,
      imperial: imperialData
    };
  }

  _haversineDistance(point1, point2) {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = point1.lat * Math.PI / 180;
    const lat2Rad = point2.lat * Math.PI / 180;
    const deltaLatRad = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLngRad = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  _getRoundedDistance(distance) {
    const rounded = Math.pow(10, Math.floor(Math.log10(distance)));
    const normalized = distance / rounded;
    
    if (normalized >= 5) return rounded * 5;
    if (normalized >= 2) return rounded * 2;
    return rounded;
  }

  _render(scaleData) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const padding = this.options.padding;
    const framePadding = this.options.showFrame ? this.options.framePadding : 0;
    
    let totalHeight = padding * 2;
    let maxWidth = 0;

    // Calculate dimensions
    const isCheckered = this.options.style === 'checkered';
    const scaleHeight = isCheckered ? this.options.checkeredHeight : this.options.fontSize;
    const textHeight = this.options.fontSize;
    const spacing = 5; // Keep consistent spacing
    
    if (scaleData.metric) {
      totalHeight += (isCheckered ? textHeight + scaleHeight + 3 : scaleHeight) + spacing; // text + bar + tick space + spacing
      maxWidth = Math.max(maxWidth, scaleData.metric.pixelWidth);
    }
    if (scaleData.imperial) {
      totalHeight += (isCheckered ? textHeight + scaleHeight + 3 : scaleHeight) + spacing;
      maxWidth = Math.max(maxWidth, scaleData.imperial.pixelWidth);
    }

    const canvasWidth = maxWidth + padding * 2 + framePadding * 2;
    const canvasHeight = totalHeight + framePadding * 2;

    // Set canvas size
    this._canvas.width = canvasWidth * devicePixelRatio;
    this._canvas.height = canvasHeight * devicePixelRatio;
    this._canvas.style.width = canvasWidth + 'px';
    this._canvas.style.height = canvasHeight + 'px';

    this._ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear canvas
    this._ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw frame background
    if (this.options.showFrame) {
      this._ctx.globalAlpha = this.options.transparency;
      this._ctx.fillStyle = this.options.backgroundColor;
      this._ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      this._ctx.globalAlpha = 1;
      this._ctx.strokeStyle = this.options.frameColor;
      this._ctx.lineWidth = this.options.frameWidth;
      this._ctx.strokeRect(0.5, 0.5, canvasWidth - 1, canvasHeight - 1);
    }

    // Set drawing context
    this._ctx.globalAlpha = 1;
    this._ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';

    let currentY = framePadding + padding;

    // Draw metric scale
    if (scaleData.metric) {
      this._drawScale(
        scaleData.metric.distance + ' ' + scaleData.metric.unit,
        scaleData.metric.pixelWidth,
        currentY,
        framePadding + padding,
        canvasWidth
      );
      const spacing = 5; // Keep consistent spacing
      const elementHeight = this.options.style === 'checkered' 
        ? this.options.fontSize + this.options.checkeredHeight + 3 // text + bar + tick space
        : this.options.fontSize;
      currentY += elementHeight + spacing;
    }

    // Draw imperial scale
    if (scaleData.imperial) {
      this._drawScale(
        scaleData.imperial.distance + ' ' + scaleData.imperial.unit,
        scaleData.imperial.pixelWidth,
        currentY,
        framePadding + padding,
        canvasWidth
      );
    }
  }

  _drawScale(text, width, y, leftPadding, totalWidth) {
    const centerX = totalWidth / 2;
    const scaleLeft = centerX - width / 2;
    const scaleRight = centerX + width / 2;
    
    if (this.options.style === 'checkered') {
      this._drawCheckeredScale(text, width, y, scaleLeft, scaleRight, centerX);
    } else {
      this._drawLineScale(text, width, y, scaleLeft, scaleRight, centerX);
    }
  }

  _drawLineScale(text, width, y, scaleLeft, scaleRight, centerX) {
    const lineY = y + this.options.fontSize / 2;

    // Draw scale line
    this._ctx.strokeStyle = this.options.strokeColor;
    this._ctx.lineWidth = this.options.strokeWidth;
    this._ctx.beginPath();
    
    // Main horizontal line
    this._ctx.moveTo(scaleLeft, lineY);
    this._ctx.lineTo(scaleRight, lineY);
    
    // Left tick
    this._ctx.moveTo(scaleLeft, lineY - 3);
    this._ctx.lineTo(scaleLeft, lineY + 3);
    
    // Right tick
    this._ctx.moveTo(scaleRight, lineY - 3);
    this._ctx.lineTo(scaleRight, lineY + 3);
    
    this._ctx.stroke();

    // Draw text
    this._ctx.fillStyle = this.options.textColor;
    this._ctx.fillText(text, centerX, lineY - this.options.fontSize / 2 - 2);
  }

  _drawCheckeredScale(text, width, y, scaleLeft, scaleRight, centerX) {
    const barHeight = this.options.checkeredHeight;
    const segments = this.options.checkeredSegments;
    const segmentWidth = width / segments;
    const textHeight = this.options.fontSize;
    const textPadding = 10; // Increased padding between text and bar by 5px
    
    // Position text at the top, checkered bar below it
    const textY = y;
    const barTop = y + textHeight + textPadding;
    const barBottom = barTop + barHeight;
    
    // Draw text first (at the top)
    this._ctx.fillStyle = this.options.textColor;
    this._ctx.fillText(text, centerX, textY + textHeight / 2);
    
    // Draw checkered pattern
    for (let i = 0; i < segments; i++) {
      const segmentLeft = scaleLeft + (i * segmentWidth);
      const segmentRight = segmentLeft + segmentWidth;
      
      // Alternate colors for checkered pattern
      const isEven = i % 2 === 0;
      this._ctx.fillStyle = isEven ? this.options.checkeredColor1 : this.options.checkeredColor2;
      this._ctx.fillRect(segmentLeft, barTop, segmentWidth, barHeight);
    }
    
    // Draw border around the entire bar
    this._ctx.strokeStyle = this.options.strokeColor;
    this._ctx.lineWidth = this.options.strokeWidth;
    this._ctx.strokeRect(scaleLeft, barTop, width, barHeight);
    
    // Draw segment dividers
    this._ctx.beginPath();
    for (let i = 1; i < segments; i++) {
      const dividerX = scaleLeft + (i * segmentWidth);
      this._ctx.moveTo(dividerX, barTop);
      this._ctx.lineTo(dividerX, barBottom);
    }
    this._ctx.stroke();
    
    // Draw scale markers below the bar
    this._ctx.strokeStyle = this.options.strokeColor;
    this._ctx.lineWidth = Math.max(1, this.options.strokeWidth - 1);
    this._ctx.beginPath();
    
    // Start and end ticks
    this._ctx.moveTo(scaleLeft, barBottom);
    this._ctx.lineTo(scaleLeft, barBottom + 3);
    this._ctx.moveTo(scaleRight, barBottom);
    this._ctx.lineTo(scaleRight, barBottom + 3);
    
    // Middle ticks for major segments
    for (let i = 1; i < segments; i++) {
      const tickX = scaleLeft + (i * segmentWidth);
      this._ctx.moveTo(tickX, barBottom);
      this._ctx.lineTo(tickX, barBottom + 3);
    }
    
    this._ctx.stroke();
  }

  setOptions(newOptions) {
    Object.assign(this.options, newOptions);
    this._update();
  }

  getOptions() {
    return { ...this.options };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapboxScalebar;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return MapboxScalebar; });
} else if (typeof window !== 'undefined') {
  window.MapboxScalebar = MapboxScalebar;
}
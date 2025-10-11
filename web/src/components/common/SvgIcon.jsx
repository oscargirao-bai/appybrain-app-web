import React from 'react';

export default function SvgIcon({ svgString, size = 24, color }) {
  if (!svgString) return null;
  
  // Parse SVG string and inject size and color if needed
  let svg = svgString;
  
  // Add width/height if not present
  if (!svg.includes('width=')) {
    svg = svg.replace('<svg', `<svg width="${size}" height="${size}"`);
  }
  
  // Replace fill/stroke with color if provided
  if (color) {
    svg = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
    svg = svg.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
  }
  
  return <div dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} />;
}

import React from 'react';

export default function SvgIcon({ svgString, size = 24, color }) {
  if (!svgString) return null;
  
  let svg = svgString;
  
  // Only add size if width/height not present - preserve viewBox
  if (!svg.includes('width=') && !svg.includes('viewBox=')) {
    svg = svg.replace('<svg', `<svg width="${size}" height="${size}"`);
  } else if (!svg.includes('width=') && svg.includes('viewBox=')) {
    // Has viewBox but no width - add width/height for sizing
    svg = svg.replace('<svg', `<svg width="${size}" height="${size}"`);
  }
  
  // Only replace fill/stroke if color is explicitly provided AND svg doesn't have currentColor
  if (color && !svg.includes('currentColor')) {
    // Only replace fill="none" or stroke="none", preserve other colors
    svg = svg.replace(/fill="none"/g, `fill="${color}"`);
  }
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: svg }} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: size,
        height: size
      }} 
    />
  );
}

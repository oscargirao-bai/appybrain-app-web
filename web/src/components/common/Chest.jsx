import React, { useMemo } from 'react';
import DataManager from '../../services/DataManager.js';
import './Chest.css';

// Helper function to get chest image based on type
function getChestImage(chestType) {
  const basePath = '/assets/chests';
  switch (chestType) {
    case 'bronze':
      return `${basePath}/chest-bronze.png`;
    case 'silver':
      return `${basePath}/chest-silver.png`;
    case 'gold':
      return `${basePath}/chest-gold.png`;
    case 'epic':
      return `${basePath}/chest-epic.png`;
    default:
      return `${basePath}/chest-bronze.png`;
  }
}

export default function Chest({ stars = 0, target = 10, size = 64, progress, style, dataSource = 'stars' }) {
  // Get chest data from DataManager
  const chestData = DataManager.getUserChests();
  const sourceData = dataSource === 'points' ? chestData?.points : chestData?.stars;
  
  // Determine if there are available (unopened) chests
  const availableChests = sourceData?.chests?.filter(chest => chest.openedAt === null) || [];
  const hasAvailableChests = availableChests.length > 0;
  
  // Use API data if available, otherwise fall back to props
  const currentValue = sourceData?.current || stars;
  const targetValue = sourceData?.nextThreshold || target;
  
  // Get the chest type for the image
  let chestType;
  if (hasAvailableChests) {
    chestType = availableChests[0]?.chestType || 'bronze';
  } else {
    chestType = sourceData?.nextChestType || 'bronze';
  }
  const chestImage = getChestImage(chestType);
  
  // Calculate progress
  let calculatedProgress;
  if (hasAvailableChests) {
    calculatedProgress = 1;
  } else {
    const earnedChests = sourceData?.chests?.filter(chest => chest.grantedAt) || [];
    const lastEarnedChest = earnedChests.length > 0 
      ? earnedChests.reduce((latest, chest) => 
        new Date(chest.grantedAt) > new Date(latest.grantedAt) ? chest : latest
      ) 
      : null;
    
    const startingMilestone = lastEarnedChest?.milestone || 0;
    const progressRange = targetValue - startingMilestone;
    const currentProgress = currentValue - startingMilestone;
    
    calculatedProgress = progressRange > 0 ? (currentProgress / progressRange) : 0;
  }
  
  const p = Math.min(1, Math.max(0, progress != null ? progress : calculatedProgress));
  const ringThickness = 8;
  const radius = (size - ringThickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - p);
  
  const isFull = p >= 1;
  
  return (
    <div className="chest-container" style={{ ...style, width: size, height: size }}>
      <svg width={size} height={size} className="chest-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,215,0,0.2)"
          strokeWidth={ringThickness}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#chestGradient)"
          strokeWidth={ringThickness}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="chestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
      {isFull && <div className="chest-glow" style={{ width: size * 0.9, height: size * 0.9 }} />}
      <img 
        src={chestImage} 
        alt="Chest" 
        className={`chest-image ${isFull ? 'pulse' : ''}`}
        style={{ width: size * 0.58, height: size * 0.58 }}
      />
    </div>
  );
}

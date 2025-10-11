import React from 'react';

import { useThemeColors } from '../../services/Theme';

/**
 * NotificationBadge - A red circular badge that displays unread notification count
 * Props:
 *  count: number - The number of unread notifications
 *  size: number - Optional size of the badge (default: 16)
 *  style: object - Optional additional styles
 */
export default function NotificationBadge({ count = 0, size = 16, style }) {
  const colors = useThemeColors();

  // Don't render if count is 0 or negative
  if (count <= 0) {
    return null;
  }

  // For counts > 99, show "99+"
  const displayCount = count > 99 ? '99+' : count.toString();

  const badgeSize = size;
  const fontSize = size * 0.6; // Font size relative to badge size

  return (
    <div       style={{...styles.badge, ...{
          backgroundColor: colors.error}}
    >
      <span         style={{...styles.badgeText, ...{
            fontSize: fontSize}}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {displayCount}
      </span>
    </div>
  );
}

const styles = {
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontWeight: '700',
    textAlign: 'center',
  },
};
import React from 'react';

import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

export default function PrimaryButton({ title, onPress, disabled, loading = false }) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  
  return (
    <button       onClick={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isDisabled ? colors.text + '33' : colors.primary,
          opacity: pressed && !isDisabled ? 0.85 : 1,
        },
      ]}
      
    >
      <div style={styles.content}>
        {loading && (
          <div 
            size="small" 
            color="#101010" 
            style={styles.loader}
          />
        )}
        <span style={{...styles.label, ...{ color: '#101010'}}>
          {loading ? (title + '...') : title}
        </span>
      </div>
    </button>
  );
}

const styles = {
  base: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginRight: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: family.semibold,
    letterSpacing: 0.5,
  },
};

import React from 'react';

import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

export default function PrimaryButton({ title, onPress, disabled, loading = false }) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  
  return (
    <button
      onClick={onPress}
      disabled={isDisabled}
      style={{
        ...styles.base,
        backgroundColor: isDisabled ? colors.text + '33' : colors.primary,
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      
    >
      <div style={styles.content}>
        {loading && (
          <div style={styles.loader}>
            {/* Loading spinner poderia ir aqui */}
          </div>
        )}
        <span style={{...styles.label, color: '#101010'}}>
          {loading ? title + '...' : title}
        </span>
      </div>
    </button>
  );
}

const styles = {
  base: {
    width: '100%',
    borderRadius: 28,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
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

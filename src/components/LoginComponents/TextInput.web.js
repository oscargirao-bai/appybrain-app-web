import React, { useState } from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { small, normal } from '../../constants/font';

const TextInputField = ({ 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  label,
  icon,
  style,
  containerStyle,
  placeholderTextColor: propPlaceholderTextColor
}) => {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  
  const isMobile = width < 768;
  const iconSize = isMobile ? 20 : 24;
  const fontSize = isMobile ? 14 : 16;
  const labelSize = isMobile ? 12 : 14;

  const placeholderTextColor = propPlaceholderTextColor || colors.greyLight;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text, fontSize: labelSize }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.background2, 
          borderColor: colors.border 
        }
      ]}>
        {/* Icon placeholder - no icon on web for now */}
        {icon && <View style={styles.iconPlaceholder} />}
        
        <RNTextInput
          style={[
            styles.input,
            { 
              color: colors.text,
              fontSize: fontSize
            },
            style
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeButton}
          >
            <Text style={{ color: colors.greyLight, fontSize: iconSize }}>
              {isSecure ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconPlaceholder: {
    width: 24,
    marginRight: 12,
  },
  input: {
    flex: 1,
    outlineStyle: 'none',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default TextInputField;

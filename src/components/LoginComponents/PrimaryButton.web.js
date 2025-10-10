import React from 'react';
import { Pressable, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

const PrimaryButton = ({ onPress, title, loading = false, disabled = false, style }) => {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          opacity: pressed ? 0.8 : disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator 
            color={colors.background} 
            style={styles.loader}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              color: colors.background,
              fontFamily: family.semibold,
            },
          ]}
        >
          {loading ? `${title}...` : title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginRight: 8,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default PrimaryButton;

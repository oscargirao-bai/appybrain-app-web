import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { header, small, normal } from '../constants/font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/lucide';
import { useTheme, useThemeColors } from '../services/Theme';
import { useTranslate } from '../services/Translate';
import { navigate } from '../services/navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Simple developer console overlay with a floating action button (FAB).
// For now, it exposes just a light/dark toggle.

export default function DevConsoleOverlay() {
	const [open, setOpen] = useState(false);
	const insets = useSafeAreaInsets();
	const { setTheme, resolvedTheme } = useTheme();
	const colors = useThemeColors();
  const { currentLanguage, changeLanguage, translate } = useTranslate();

	const styles = useMemo(() => makeStyles(colors, insets), [colors, insets]);
	const isLight = resolvedTheme === 'light';
	// Gender toggle removed

	const toggleTheme = () => setTheme(isLight ? 'dark' : 'light');

	// Clear all storage function
	const clearAllStorage = async () => {
		Alert.alert(
			'Clear All Storage',
			'This will delete all data from AsyncStorage and SecureStore. Are you sure?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Clear All',
					style: 'destructive',
					onPress: async () => {
						try {
							// Clear AsyncStorage
							await AsyncStorage.clear();
							
							// Clear SecureStore (try common keys)
							const secureKeys = [
								'appybrain_access_token',
								'appybrain_refresh_token',
								'appybrain_expires_at',
								'appybrain_user'
							];
							
							for (const key of secureKeys) {
								try {
									await SecureStore.deleteItemAsync(key);
								} catch (error) {
									// Ignore errors for keys that don't exist
								}
							}
							
							Alert.alert('Success', 'All storage cleared successfully!');
						} catch (error) {
							Alert.alert('Error', `Failed to clear storage: ${error.message}`);
						}
					}
				}
			]
		);
	};

  // --- CORNER CYCLING FAB LOGIC ---
  // Corners order: bottom-right -> bottom-left -> top-left -> top-right -> repeat
  const corners = ['br','bl','tl','tr'];
  const [cornerIndex, setCornerIndex] = useState(0); // start at bottom-right
  const [pressing, setPressing] = useState(false);
  const longPressTimeoutRef = useRef(null);
  const cycleIntervalRef = useRef(null);
  const didCycleRef = useRef(false);
  const LONG_PRESS_THRESHOLD = 450; // ms before cycling starts
  const CYCLE_INTERVAL = 650; // ms between corner jumps while holding

  const nextCorner = () => {
    setCornerIndex(prev => (prev + 1) % corners.length);
    didCycleRef.current = true;
  };

  const clearTimers = () => {
    if (longPressTimeoutRef.current) { clearTimeout(longPressTimeoutRef.current); longPressTimeoutRef.current = null; }
    if (cycleIntervalRef.current) { clearInterval(cycleIntervalRef.current); cycleIntervalRef.current = null; }
  };

  useEffect(() => () => clearTimers(), []);

  const handlePressIn = () => {
    if (open) return; // ignore when modal open
    setPressing(true);
    didCycleRef.current = false;
    longPressTimeoutRef.current = setTimeout(() => {
      nextCorner();
      cycleIntervalRef.current = setInterval(nextCorner, CYCLE_INTERVAL);
    }, LONG_PRESS_THRESHOLD);
  };

  const handlePressOut = () => {
    if (open) return; // nothing to do
    clearTimers();
    const shouldOpen = !didCycleRef.current; // tap (no cycling) => open
    setPressing(false);
    if (shouldOpen) setOpen(true);
  };

  const cornerStyle = (() => {
    const m = 16;
    const topSafe = (insets?.top || 0) + m;
    const bottomSafe = (insets?.bottom || 0) + m;
    switch (corners[cornerIndex]) {
      case 'br': return { bottom: bottomSafe, right: m };
      case 'bl': return { bottom: bottomSafe, left: m };
      case 'tl': return { top: topSafe, left: m };
      case 'tr': return { top: topSafe, right: m };
      default: return { bottom: bottomSafe, right: m };
    }
  })();

	return (
		<>
			{/* Floating toggle button (tap opens console, hold cycles corners) */}
			{!open && (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Open dev console"
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					style={[styles.fab, cornerStyle, pressing && { opacity: 0.85 }]}
				>
					<Icon name="wrench" color={colors.background} size={22} />
				</Pressable>
			)}

			{/* Console modal */}
			<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
				<Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
				<View style={styles.sheet}>
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Dev Console</Text>
						<TouchableOpacity onPress={() => setOpen(false)} accessibilityLabel="Close dev console">
							<Icon name="x" size={22} color={colors.secondary} />
						</TouchableOpacity>
					</View>

					{/* Options */}
					<View style={styles.optionRow}>
						<View style={styles.optionLabelWrap}>
							<Icon name={isLight ? 'sun' : 'moon'} size={18} color={colors.secondary} />
							<Text style={styles.optionLabel}>
								{isLight ? 'Theme: Light' : 'Theme: Dark'}
							</Text>
						</View>
						<TouchableOpacity style={styles.optionBtn} onPress={toggleTheme}>
							<Text style={styles.optionBtnText}>{isLight ? 'Switch to Dark' : 'Switch to Light'}</Text>
						</TouchableOpacity>
					</View>


					{/* Language switch */}
					<View style={styles.optionRow}>
						<View style={styles.optionLabelWrap}>
							<Icon name="globe" size={18} color={colors.secondary} />
							<Text style={styles.optionLabel}>
								{translate('settings.language')}: {currentLanguage === 'pt' ? translate('settings.portuguese') : translate('settings.english')}
							</Text>
						</View>
						<View style={styles.genderBtnGroup}>
							<TouchableOpacity
								style={[styles.genderBtn, currentLanguage === 'en' && styles.genderBtnActive]}
								onPress={() => changeLanguage('en')}
							>
								<Text style={[styles.genderBtnText, currentLanguage === 'en' && styles.genderBtnTextActive]}>{translate('settings.english')}</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.genderBtn, currentLanguage === 'pt' && styles.genderBtnActive]}
								onPress={() => changeLanguage('pt')}
							>
								<Text style={[styles.genderBtnText, currentLanguage === 'pt' && styles.genderBtnTextActive]}>{translate('settings.portuguese')}</Text>
							</TouchableOpacity>
						</View>
					</View>

					{/* Navigate to Start screen */}
					<View style={styles.optionRow}>
						<View style={styles.optionLabelWrap}>
							<Icon name="undo" size={18} color={colors.secondary} />
							<Text style={styles.optionLabel}>Go to Start</Text>
						</View>
						<TouchableOpacity style={styles.optionBtn} onPress={() => navigate('Login')}>
							<Text style={styles.optionBtnText}>Start</Text>
						</TouchableOpacity>
					</View>

					{/* Navigate to Home screen */}
					<View style={styles.optionRow}>
						<View style={styles.optionLabelWrap}>
							<Icon name="home" size={18} color={colors.secondary} />
							<Text style={styles.optionLabel}>Go to Tabs</Text>
						</View>
						<TouchableOpacity style={styles.optionBtn} onPress={() => { setOpen(false); navigate('MainTabs', { initialTab: 0 }); }}>
							<Text style={styles.optionBtnText}>Tabs</Text>
						</TouchableOpacity>
					</View>

					{/* Clear All Storage */}
					<View style={styles.optionRow}>
						<View style={styles.optionLabelWrap}>
							<Icon name="trash-2" size={18} color={colors.destructive || '#ff4444'} />
							<Text style={styles.optionLabel}>Clear All Storage</Text>
						</View>
						<TouchableOpacity style={[styles.optionBtn, { backgroundColor: colors.destructive || '#ff4444' }]} onPress={clearAllStorage}>
							<Text style={[styles.optionBtnText, { color: '#ffffff' }]}>Clear</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	);
}

const makeStyles = (c, insets) =>
	StyleSheet.create({
		fab: {
			position: 'absolute',
			width: 48,
			height: 48,
			borderRadius: 24,
			backgroundColor: c.accent,
			alignItems: 'center',
			justifyContent: 'center',
			shadowColor: '#000',
			shadowOpacity: 0.25,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 4,
			elevation: 4,
			zIndex: 9999,
		},
		backdrop: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			// Removed dimming; keep transparent to allow outside tap closing without visual overlay
			backgroundColor: 'transparent',
		},
		sheet: {
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: c.background,
			borderTopLeftRadius: 16,
			borderTopRightRadius: 16,
			paddingBottom: (insets?.bottom || 0) + 12,
			paddingHorizontal: 16,
			paddingTop: 12,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderColor: c.secondary,
		},
		sheetHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginBottom: 8,
		},
		sheetTitle: {
			...header,
			color: c.text,
		},
		optionRow: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingVertical: 10,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderColor: c.secondary,
		},
		optionLabelWrap: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		optionLabel: {
			...small,
			color: c.secondary,
			marginLeft: 8,
		},
		optionBtn: {
			paddingHorizontal: 12,
			paddingVertical: 8,
			backgroundColor: c.primary,
			borderRadius: 10,
		},
		optionBtnText: {
			...normal,
			color: c.background,
		},
		genderBtnGroup: { flexDirection: 'row', alignItems: 'center' },
		genderBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: c.secondary, borderRadius: 8, marginLeft: 8 },
		genderBtnActive: { backgroundColor: c.primary, borderColor: c.primary },
		genderBtnText: { ...small, color: c.secondary },
		genderBtnTextActive: { color: c.background },
	});


import React, { useMemo, useState, useRef, useEffect } from 'react';
import {Modal} from 'react-native';
import { header, small, normal } from '../constants/font';

import Icon from '@react-native-vector-icons/lucide';
import { useTheme, useThemeColors } from '../services/Theme';
import { useTranslate } from '../services/Translate';
import { navigate } from '../services/navigationRef';

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
		window.alert('This will delete all data from AsyncStorage and SecureStore. Are you sure?',
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
							
							window.alert('All storage cleared successfully!');
						} catch (error) {
							window.alert(`Failed to clear storage: ${error.message}`);
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
  });

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
  });

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
				<button 					
					aria-label="Open dev console"
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					style={{...styles.fab, ...cornerStyle}}
				>
					<Icon name="wrench" color={colors.background} size={22} />
				</button>
			)}

			{/* Console modal */}
			<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
				<button style={styles.backdrop} onClick={() => setOpen(false)} />
				<div style={styles.sheet}>
					<div style={styles.sheetHeader}>
						<span style={styles.sheetTitle}>Dev Console</span>
						<button onClick={() => setOpen(false)} aria-label="Close dev console">
							<Icon name="x" size={22} color={colors.secondary} />
						</button>
					</div>

					{/* Options */}
					<div style={styles.optionRow}>
						<div style={styles.optionLabelWrap}>
							<Icon name={isLight ? 'sun' : 'moon'} size={18} color={colors.secondary} />
							<span style={styles.optionLabel}>
								{isLight ? 'Theme: Light' : 'Theme: Dark'}
							</span>
						</div>
						<button style={styles.optionBtn} onClick={toggleTheme}>
							<span style={styles.optionBtnText}>{isLight ? 'Switch to Dark' : 'Switch to Light'}</span>
						</button>
					</div>


					{/* Language switch */}
					<div style={styles.optionRow}>
						<div style={styles.optionLabelWrap}>
							<Icon name="globe" size={18} color={colors.secondary} />
							<span style={styles.optionLabel}>
								{translate('settings.language')}: {currentLanguage === 'pt' ? translate('settings.portuguese') : translate('settings.english')}
							</span>
						</div>
						<div style={styles.genderBtnGroup}>
							<button 								style={{...styles.genderBtn, ...currentLanguage === 'en' && styles.genderBtnActive}}
								onClick={() => changeLanguage('en')}
							>
								<span style={{...styles.genderBtnText, ...currentLanguage === 'en' && styles.genderBtnTextActive}}>{translate('settings.english')}</span>
							</button>
							<button 								style={{...styles.genderBtn, ...currentLanguage === 'pt' && styles.genderBtnActive}}
								onClick={() => changeLanguage('pt')}
							>
								<span style={{...styles.genderBtnText, ...currentLanguage === 'pt' && styles.genderBtnTextActive}}>{translate('settings.portuguese')}</span>
							</button>
						</div>
					</div>

					{/* Navigate to Start screen */}
					<div style={styles.optionRow}>
						<div style={styles.optionLabelWrap}>
							<Icon name="undo" size={18} color={colors.secondary} />
							<span style={styles.optionLabel}>Go to Start</span>
						</div>
						<button style={styles.optionBtn} onClick={() => navigate('Login')}>
							<span style={styles.optionBtnText}>Start</span>
						</button>
					</div>

					{/* Navigate to Home screen */}
					<div style={styles.optionRow}>
						<div style={styles.optionLabelWrap}>
							<Icon name="home" size={18} color={colors.secondary} />
							<span style={styles.optionLabel}>Go to Tabs</span>
						</div>
						<button style={styles.optionBtn} onClick={() => { setOpen(false); navigate('MainTabs', { initialTab: 0 }); }}>
							<span style={styles.optionBtnText}>Tabs</span>
						</button>
					</div>

					{/* Clear All Storage */}
					<div style={styles.optionRow}>
						<div style={styles.optionLabelWrap}>
							<Icon name="trash-2" size={18} color={colors.destructive || '#ff4444'} />
							<span style={styles.optionLabel}>Clear All Storage</span>
						</div>
						<button style={{...styles.optionBtn, ...{ backgroundColor: colors.destructive || '#ff4444' }}} onClick={clearAllStorage}>
							<span style={{...styles.optionBtnText, ...{ color: '#ffffff' }}}>Clear</span>
						</button>
					</div>
				</div>
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
	};


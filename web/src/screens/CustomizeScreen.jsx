import React, { useEffect, useMemo, useState, useCallback } from 'react';


import Header from '../components/General/Header.jsx';
import Options from '../components/Shop/Options.jsx';
import Banner from '../components/Profile/Banner.jsx';
import CustomizeList from '../components/Profile/CustomizeList.jsx';
import Button1 from '../components/General/Button1.jsx';
import { useThemeColors } from '../services/Theme.jsx';
import { useTranslate } from '../services/Translate.jsx';
import DataManager from '../services/DataManager.jsx';
import ApiManager from '../services/ApiManager.jsx';
import LucideIcon from '../components/General/LucideIcon.jsx';

// Simple, responsive Customize screen based on wireframe
// Sections: avatar header, divider, segmented control, 3x3 grid, "Buy More" CTA
export default function CustomizeScreen({ navigation }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const width = window.innerWidth; const height = window.innerHeight;

  // Which category we are customizing
  const [category, setCategory] = useState('avatar'); // 'avatar' | 'background' | 'frames'
  const [avatars, setAvatars] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [frames, setFrames] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  // Local selection (pending confirmation)
  const [selAvatarId, setSelAvatarId] = useState(null);
  const [selBackgroundId, setSelBackgroundId] = useState(null);
  const [selFrameId, setSelFrameId] = useState(null);

  // Responsive paddings
  const horizontal = width >= 768 ? 28 : 16;
  // Load cosmetics (owned only) and user profile for banner
  useEffect(() => {
    const updateData = () => {
      // Use the same method as ShopScreen to ensure cached images are used
      // Then filter for acquired items (same as getAcquiredCosmeticsByType but with cached images)
      const allAvatars = DataManager.getCosmeticsByType(1);
      const allBackgrounds = DataManager.getCosmeticsByType(2);
      const allFrames = DataManager.getCosmeticsByType(3);
      
      // Filter for acquired items only
      const avatarItems = allAvatars.filter(item => item.acquired === 1);
      const backgroundItems = allBackgrounds.filter(item => item.acquired === 1);
      const frameItems = allFrames.filter(item => item.acquired === 1);
      
      setAvatars(avatarItems);
      setBackgrounds(backgroundItems);
      setFrames(frameItems);
      setUserProfile(DataManager.getUserProfile());
    };
    updateData();
    const unsub = DataManager.subscribe(updateData);
    return unsub;
  }, []);

  // Segmented control change handler
  function onSelect(key) {
    setCategory(key);
  }

  // Helper: get preview sources (prefer selected item image)
  const selectedAvatar = useMemo(() => avatars.find(a => String(a.id) === String(selAvatarId)), [avatars, selAvatarId]);
  const selectedBackground = useMemo(() => backgrounds.find(b => String(b.id) === String(selBackgroundId)), [backgrounds, selBackgroundId]);
  const selectedFrame = useMemo(() => frames.find(f => String(f.id) === String(selFrameId)), [frames, selFrameId]);

  const previewAvatar = selectedAvatar?.imageUrl || userProfile?.avatarUrl;
  const previewBackground = selectedBackground?.imageUrl || userProfile?.backgroundUrl;
  const previewFrame = selectedFrame?.imageUrl || selectedFrame?.previewUrl || userProfile?.frameUrl || null; // frame uses overlay image

  function handleConfirm() {
    const equipCosmetics = async () => {
      try {
        // Collect all selected cosmetics for API calls
        const selectedCosmetics = [];
        if (selAvatarId) selectedCosmetics.push(selAvatarId);
        if (selBackgroundId) selectedCosmetics.push(selBackgroundId);
        if (selFrameId) selectedCosmetics.push(selFrameId);

        // Make API calls for each selected cosmetic
        for (const cosmeticId of selectedCosmetics) {
          try {
            await ApiManager.cosmeticsUse(cosmeticId);
            //console.log(`Successfully equipped cosmetic ${cosmeticId}`);
          } catch (error) {
            console.warn(`Failed to equip cosmetic ${cosmeticId} via API:`, error);
            // Continue with local update even if API fails
          }
        }

        // Apply changes locally in DataManager
        DataManager.equipCosmetics({ avatarId: selAvatarId, backgroundId: selBackgroundId, frameId: selFrameId });
        
        navigation?.goBack?.();
      } catch (error) {
        console.error('Failed to confirm cosmetic changes:', error);
        // Still try to go back even if there's an error
        navigation?.goBack?.();
      }
    };

    equipCosmetics();
  }

  // Compute list data based on selected category
  const listData = category === 'avatar' ? avatars : category === 'background' ? backgrounds : frames;
  const listColumns = category === 'background' ? 2 : 3;

  // Selection handler for current category
  const handleSelectItem = useCallback((item) => {
    if (category === 'avatar') setSelAvatarId(item.id);
    else if (category === 'background') setSelBackgroundId(item.id);
    else setSelFrameId(item.id);
  }, [category]);

  return (
    <div style={{...styles.container, ...{ backgroundColor: colors.background }}}> 
      <Header title={translate('customize.title') || 'Customize'} showBack onBack={() => navigation?.goBack?.()} />

      <div style={styles.content}> 
        {/* Banner header */}
        <div style={{ marginLeft: 0, marginRight: 0, marginTop: 0 }}>
            <Banner
              avatarSource={previewAvatar ? { uri: previewAvatar } : null}
              bannerImageSource={previewBackground ? { uri: previewBackground } : null}
              frameSource={previewFrame ? { uri: previewFrame } : null}
              bottomFlat
              topFlat
            />
          </div>

        {/* Segmented control */}
        <Options value={category} onChange={onSelect} style={{ marginTop: 16 }} />

        {/* Conditional rendering: Empty state or list */}
        {listData.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={{...styles.emptyIconContainer, ...{ backgroundColor: colors.card }}}>
              <LucideIcon name="shopping-bag" size={48} color={colors.muted} />
            </div>
            <span style={{...styles.emptyTitle, ...{ color: colors.text }}}>
              {translate('customize.empty.title')}
            </span>
            <span style={{...styles.emptySubtitle, ...{ color: colors.muted }}}>
              {translate('customize.empty.subtitle')}
            </span>
            <button               style={{...styles.shopButton, ...{ backgroundColor: colors.primary }}}
              onClick={() => navigation?.navigate?.('MainTabs', { screen: 'Shop' })}
            >
              <span style={{...styles.shopButtonText, ...{ color: colors.background }}}>
                {translate('customize.empty.shopButton')}
              </span>
            </button>
          </div>
        ) : (
          <CustomizeList
            data={listData}
            numColumns={listColumns}
            scrollEnabled={true}
            onSelect={handleSelectItem}
            selectedIds={{ avatar: selAvatarId, background: selBackgroundId, frame: selFrameId }}
            bottomPadding={20}
          />
        )}
      </div>

      {/* Footer confirm button */}
      <div style={{...styles.footer, ...{ backgroundColor: colors.background }}}> 
        <Button1 label={translate('common.confirm') || 'Confirmar'} onClick={handleConfirm} />
      </div>
    </div>
  );
}

const styles = {
  container: { flex: 1 },
  content: { flex: 1 },
  divider: { height: 2, marginTop: 14, opacity: 0.6, marginLeft: 0, marginRight: 0 },
  fabContainer: { position: 'absolute', zIndex: 10 },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16, paddingRight: 16,
    paddingTop: 14, paddingBottom: 14,
    borderRadius: 24,
    borderWidth: 1,
    minWidth: 150,
  },
  buyRow: { flexDirection: 'row', alignItems: 'center' },
  buyLabel: { fontSize: 16, fontWeight: '800', fontStyle: 'italic', letterSpacing: 0.5 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingLeft: 16, paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 32, paddingRight: 32,
    paddingTop: 40, paddingBottom: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  shopButton: {
    paddingLeft: 24, paddingRight: 24,
    paddingTop: 16, paddingBottom: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
};


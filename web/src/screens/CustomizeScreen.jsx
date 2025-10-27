import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import MessageModal from '../components/General/MessageModal.jsx';

export default function CustomizeScreen({ navigation }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const [category, setCategory] = useState('avatar');
  const [avatars, setAvatars] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [frames, setFrames] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selAvatarId, setSelAvatarId] = useState(null);
  const [selBackgroundId, setSelBackgroundId] = useState(null);
  const [selFrameId, setSelFrameId] = useState(null);

  useEffect(() => {
    const updateData = () => {
      const avatarItems = DataManager.getCosmeticsByType(1).filter((item) => item.acquired === 1);
      const backgroundItems = DataManager.getCosmeticsByType(2).filter((item) => item.acquired === 1);
      const frameItems = DataManager.getCosmeticsByType(3).filter((item) => item.acquired === 1);
      setAvatars(avatarItems);
      setBackgrounds(backgroundItems);
      setFrames(frameItems);
      setUserProfile(DataManager.getUserProfile());
    };

    updateData();
    const unsubscribe = DataManager.subscribe(updateData);
    return unsubscribe;
  }, []);

  const selectedAvatar = useMemo(
    () => avatars.find((a) => String(a.id) === String(selAvatarId)),
    [avatars, selAvatarId],
  );
  const selectedBackground = useMemo(
    () => backgrounds.find((b) => String(b.id) === String(selBackgroundId)),
    [backgrounds, selBackgroundId],
  );
  const selectedFrame = useMemo(
    () => frames.find((f) => String(f.id) === String(selFrameId)),
    [frames, selFrameId],
  );

  const previewAvatar = selectedAvatar?.imageUrl || userProfile?.avatarUrl;
  const previewBackground = selectedBackground?.imageUrl || userProfile?.backgroundUrl;
  const previewFrame = selectedFrame?.imageUrl || selectedFrame?.previewUrl || userProfile?.frameUrl || null;

  const listData = category === 'avatar' ? avatars : category === 'background' ? backgrounds : frames;
  const listColumns = category === 'background' ? 2 : 3;

  const handleSelectItem = useCallback(
    (item) => {
      if (category === 'avatar') setSelAvatarId(item.id);
      else if (category === 'background') setSelBackgroundId(item.id);
      else setSelFrameId(item.id);
    },
    [category],
  );

  const handleConfirm = useCallback(() => {
    (async () => {
      try {
        const pending = [];
        if (selAvatarId) pending.push(selAvatarId);
        if (selBackgroundId) pending.push(selBackgroundId);
        if (selFrameId) pending.push(selFrameId);

        for (const cosmeticId of pending) {
          try {
            await ApiManager.cosmeticsUse(cosmeticId);
          } catch (error) {
            console.warn('Failed to equip cosmetic via API:', error);
          }
        }

        DataManager.equipCosmetics({
          avatarId: selAvatarId,
          backgroundId: selBackgroundId,
          frameId: selFrameId,
        });
      } catch (error) {
        console.error('Failed to confirm cosmetic changes:', error);
      } finally {
        navigation?.goBack?.();
      }
    })();
  }, [navigation, selAvatarId, selBackgroundId, selFrameId]);

  const ui = useMemo(() => ({
    outer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      backgroundColor: colors.background,
      paddingTop: 32,
      paddingBottom: 32,
      overflowY: 'auto',
    },
    panel: {
      width: '100%',
      minWidth: 0,
      maxWidth: 550,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.card,
      borderRadius: 28,
      boxShadow: '0 24px 48px rgba(0,0,0,0.32)',
      overflow: 'hidden',
    },
    header: {
      paddingLeft: 16,
      paddingRight: 16,
      borderBottomWidth: 0,
    },
    scroll: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 16,
      gap: 16,
      overflowY: 'auto',
    },
    bannerWrap: {
      marginTop: 8,
    },
    optionsWrap: {
      display: 'flex',
      justifyContent: 'center',
      paddingLeft: 16,
      paddingRight: 16,
    },
    optionsInner: {
      display: 'flex',
      justifyContent: 'center',
      minWidth: 0,
    },
    listWrap: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
    },
    list: {
      flex: 1,
      minHeight: 0,
    },
    empty: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 18,
      paddingTop: 40,
      paddingBottom: 40,
      paddingLeft: 24,
      paddingRight: 24,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: colors.muted,
    },
    shopButton: {
      border: 'none',
      cursor: 'pointer',
      borderRadius: 25,
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 16,
      paddingBottom: 16,
      backgroundColor: colors.primary,
      color: colors.background,
      fontSize: 14,
      fontWeight: '700',
    },
    footer: {
      borderTop: `1px solid ${colors.text + '1A'}`,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      paddingBottom: 20,
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },
    confirmButton: {
      minWidth: 220,
    },
  }), [colors]);

  const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '' });
  const [clearing, setClearing] = useState(false);

  const handleClearCosmetics = useCallback(async () => {
    if (clearing) return;
    setClearing(true);
    try {
      const resp = await ApiManager.makeAuthenticatedJSONRequest('api/app/remove_cosmetics', { method: 'POST' });
      // Consider success when resp.success === true
      if (resp && resp.success === true) {
        setMessageModal({ visible: true, title: '', message: 'Cosméticos removidos com sucesso' });
      } else {
        setMessageModal({ visible: true, title: '', message: 'Não foi possível remover os cosméticos' });
      }
    } catch (error) {
      console.error('Error removing cosmetics:', error);
      setMessageModal({ visible: true, title: '', message: 'Não foi possível remover os cosméticos' });
    } finally {
      setClearing(false);
    }
  }, [clearing]);

  // (messageModal state declared above)

  return (
    <div style={ui.outer}>
      <div style={ui.panel}>
        <Header
          title={translate('customize.title')}
          showBack
          onBack={() => navigation?.goBack?.()}
          style={ui.header}
          right={(
            <button
              onClick={handleClearCosmetics}
              aria-label="Limpar cosméticos"
              style={{
                border: 'none',
                background: 'transparent',
                color: colors.primary,
                fontWeight: 700,
                cursor: 'pointer',
                padding: 8,
                opacity: clearing ? 0.6 : 1,
              }}
              disabled={clearing}
            >
              Limpar
            </button>
          )}
        />
        <div style={ui.scroll}>
          <div style={ui.bannerWrap}>
            <Banner
              avatarSource={previewAvatar ? { uri: previewAvatar } : null}
              bannerImageSource={previewBackground ? { uri: previewBackground } : null}
              frameSource={previewFrame ? { uri: previewFrame } : null}
              bottomFlat
              topFlat
            />
          </div>
          <div style={ui.optionsWrap}>
            <Options value={category} onChange={setCategory} style={ui.optionsInner} />
          </div>
          <div style={ui.listWrap}>
            {listData.length === 0 ? (
              <div style={ui.empty}>
                <div style={{ ...ui.emptyIcon, backgroundColor: colors.card }}>
                  <LucideIcon name="shopping-bag" size={48} color={colors.muted} />
                </div>
                <span style={ui.emptyTitle}>{translate('customize.empty.title')}</span>
                <span style={ui.emptySubtitle}>{translate('customize.empty.subtitle')}</span>
                <button
                  type="button"
                  style={ui.shopButton}
                  onClick={() => navigation?.navigate?.('MainTabs', { screen: 'Shop' })}
                >
                  {translate('customize.empty.shopButton')}
                </button>
              </div>
            ) : (
              <CustomizeList
                data={listData}
                numColumns={listColumns}
                onSelect={handleSelectItem}
                selectedIds={{
                  avatar: selAvatarId,
                  background: selBackgroundId,
                  frame: selFrameId,
                }}
                bottomPadding={24}
                style={ui.list}
              />
            )}
          </div>
        </div>
        <div style={ui.footer}>
          <Button1 label={translate('common.confirm')} onClick={handleConfirm} style={ui.confirmButton} />
        </div>
      </div>
      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        buttonLabel={translate('common.ok') || 'OK'}
        onClose={async () => {
          // Close modal
          const wasSuccess = messageModal.message === 'Cosméticos removidos com sucesso';
          setMessageModal({ visible: false, title: '', message: '' });
          if (wasSuccess) {
            try {
              // Refresh user info and shop (cosmetics) sequentially
              await DataManager.refreshSection('userInfo');
              await DataManager.refreshSection('shop');
              // Reset selections so UI shows defaults
              setSelAvatarId(null);
              setSelBackgroundId(null);
              setSelFrameId(null);
            } catch (e) {
              console.error('Failed to refresh after clearing cosmetics:', e);
            }
          }
        }}
      />
    </div>
  );
}


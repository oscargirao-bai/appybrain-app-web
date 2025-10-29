import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/General/Header.jsx';
import Options from '../components/Shop/Options.jsx';
import Banner from '../components/Profile/Banner.jsx';
import CustomizeList from '../components/Profile/CustomizeList.jsx';
import Button1 from '../components/General/Button1.jsx';
import { useThemeColors, useTheme } from '../services/Theme.jsx';
import { useTranslate } from '../services/Translate.jsx';
import DataManager from '../services/DataManager.jsx';
import ApiManager from '../services/ApiManager.jsx';
import LucideIcon from '../components/General/LucideIcon.jsx';
import MessageModal from '../components/General/MessageModal.jsx';
import { family } from '../constants/font.jsx';

export default function CustomizeScreen({ navigation }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const { resolvedTheme } = useTheme();
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
  const isEmpty = (listData || []).length === 0;

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
      // manter os botões quase colados ao banner (consistente em ambos estados)
      marginTop: 16,
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

    /* ===== estado vazio (área com scroll e conteúdo compacto) ===== */
    emptyScroll: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 8,
    },
    emptyInner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 4,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      lineHeight: '18px',
      margin: 0,
    },
    emptySubtitle: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: '16px',
      color: colors.muted,
      margin: 0,
    },
    shopButton: {
      border: 'none',
      cursor: 'pointer',
      borderRadius: 25,
      paddingLeft: 18,
      paddingRight: 18,
      paddingTop: 8,
      paddingBottom: 8,
      backgroundColor: colors.primary,
      color: colors.background,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 4,
    },
    /* ===== fim vazio ===== */

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
              disabled={clearing}
              style={{
                paddingLeft: 14,
                paddingRight: 14,
                paddingTop: 6,
                paddingBottom: 6,
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 18,
                minHeight: 32,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                backgroundColor: colors.card + '55',
                borderColor: colors.text + '33',
                opacity: clearing ? 0.6 : 1,
              }}
            >
              <span style={{
                fontSize: 11,
                fontFamily: family.bold,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                lineHeight: '14px',
                color: colors.text
              }}>{clearing ? '...' : 'Limpar'}</span>
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
              /* tamanho fixo para ser igual com/sem cosméticos */
              aspectRatio={(560 / 260)}
            />
          </div>
          <div style={ui.optionsWrap}>
            <Options value={category} onChange={setCategory} style={ui.optionsInner} showLabel={false} iconSize={20} />
          </div>
          <div style={ui.listWrap}>
            {listData.length === 0 ? (
              <div style={ui.emptyScroll}>
                <div style={ui.emptyInner}>
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
          <Button1
            label={translate('common.confirm')}
            onClick={handleConfirm}
            style={ui.confirmButton}
            textColorOverride={resolvedTheme === 'light' ? '#000000' : '#FFFFFF'}
          />
        </div>
      </div>
      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        buttonLabel={translate('common.ok') || 'OK'}
        onClose={async () => {
          const wasSuccess = messageModal.message === 'Cosméticos removidos com sucesso';
          setMessageModal({ visible: false, title: '', message: '' });
          if (wasSuccess) {
            try {
              await DataManager.refreshSection('userInfo');
              await DataManager.refreshSection('shop');
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

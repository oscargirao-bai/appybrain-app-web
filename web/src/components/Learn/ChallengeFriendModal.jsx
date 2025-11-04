import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import { family } from '../../constants/font.jsx';
import LucideIcon from '../General/LucideIcon.jsx';

export default function ChallengeFriendModal({
	visible,
	onClose,
	onSelect,
	users = [],
	loading = false,
	error = '',
}) {
	const colors = useThemeColors();
	const { translate } = useTranslate();

	const sortedUsers = useMemo(() => [...(users || [])].sort((a, b) => (a?.nickname || '').localeCompare(b?.nickname || '')), [users]);

	const renderContent = () => {
		if (loading) {
			return (
				<div style={styles.emptyWrap}>
					<span style={{ ...styles.emptyText, color: colors.muted }}>{translate('learn.challenge.loading')}</span>
				</div>
			);
		}

		if (!sortedUsers.length) {
			return (
				<div style={styles.emptyWrap}>
					<span style={{ ...styles.emptyText, color: colors.muted }}>{translate('learn.challenge.empty')}</span>
				</div>
			);
		}

		return (
			<div style={styles.usersColumn}>
				{sortedUsers.map((user) => (
					<button
						key={user.id || user.nickname}
						onClick={() => onSelect && onSelect(user)}
						style={{ ...styles.userRow, borderColor: colors.border, backgroundColor: colors.text + '08' }}
					>
						<div style={{ ...styles.avatar, borderColor: colors.primary + '55' }}>
							{user.avatarUrl ? (
								<img src={user.avatarUrl} alt="" style={styles.avatarImg} />
							) : (
								<span style={{ ...styles.avatarLetter, color: colors.primary }}>
									{(user.nickname || '?').charAt(0).toUpperCase()}
								</span>
							)}
						</div>
						<span style={{ ...styles.userName, color: colors.text }}>{user.nickname || translate('learn.challenge.unknownName')}</span>
						<LucideIcon name="chevron-right" size={20} color={colors.text + '88'} />
					</button>
				))}
			</div>
		);
	};

	if (!visible) return null;

	return (
		<div style={styles.modalContainer}>
			<div style={{ ...styles.backdrop, backgroundColor: colors.overlay?.black50 || 'rgba(0,0,0,0.55)' }}>
				<button style={styles.backdropHit} onClick={onClose} aria-label={translate('common.close')} />
				<div style={styles.cardWrap}>
					<div style={{ ...styles.card, backgroundColor: colors.card || colors.background, borderColor: colors.border }}>
						<button style={styles.closeWrap} onClick={onClose} aria-label={translate('common.close')}>
							<LucideIcon name="x" size={22} color={colors.text} />
						</button>
						<span style={{ ...styles.title, color: colors.text }}>{translate('learn.challenge.modalTitle')}</span>
						{error ? (
							<div style={{ ...styles.errorBox, backgroundColor: colors.error + '10', borderColor: colors.error + '55' }}>
								<span style={{ ...styles.errorText, color: colors.error }}>{error}</span>
							</div>
						) : null}
						<div style={styles.listBox}>{renderContent()}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const styles = {
	modalContainer: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex' },
	backdrop: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' },
	backdropHit: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: 'none', background: 'transparent', cursor: 'pointer' },
	cardWrap: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
	card: { width: 520, maxWidth: '94%', borderRadius: 20, borderWidth: '1px', borderStyle: 'solid', padding: 18, boxShadow: '0 12px 24px rgba(0,0,0,0.28)', position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '80vh' },
	closeWrap: { position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6 },
	title: { fontSize: 20, fontFamily: family.bold, textAlign: 'center' },
	errorBox: { borderRadius: 14, borderWidth: '1px', borderStyle: 'solid', padding: 12 },
	errorText: { fontSize: 14, fontFamily: family.bold, textAlign: 'center' },
	listBox: { flex: 1, overflowY: 'auto', paddingRight: 6 },
	emptyWrap: { minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' },
	emptyText: { fontSize: 15, fontFamily: family.bold, textAlign: 'center' },
	usersColumn: { display: 'flex', flexDirection: 'column', gap: 10 },
	userRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, borderWidth: '1px', borderStyle: 'solid', padding: 12, cursor: 'pointer', transition: 'opacity 0.2s' },
	avatar: { width: 52, height: 52, borderRadius: 18, borderWidth: '2px', borderStyle: 'solid', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#11111122' },
	avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
	avatarLetter: { fontSize: 20, fontFamily: family.bold },
	userName: { flex: 1, fontSize: 16, fontFamily: family.bold, textAlign: 'left' },
};

import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../General/SvgIcon';
import UserList from '../General/UserList';
import { family } from '../../constants/font';

export default function RankingsModal({ visible, onClose, onFetchRankings }) {
	const colors = useThemeColors();
	const [metric, setMetric] = useState('points');
	const [tab, setTab] = useState('global');
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (visible && onFetchRankings) {
			setLoading(true);
			onFetchRankings(metric, tab)
				.then((data) => setUsers(data || []))
				.finally(() => setLoading(false));
		}
	}, [visible, metric, tab, onFetchRankings]);

	if (!visible) {
		return null;
	}

	const MetricBtn = ({ label, value, icon }) => {
		const active = metric === value;
		return (
			<button
				onClick={() => setMetric(value)}
				style={{...styles.tabBtn, borderColor: colors.text + '33', backgroundColor: active ? colors.primary + '22' : 'transparent'}}
				aria-label={`Métrica ${label}`}
			>
				{icon ? (
					<SvgIcon name={icon} size={16} color={active ? colors.primary : colors.text} />
				) : (
					<span style={{...styles.tabLabel, color: active ? colors.primary : colors.text}}>XP</span>
				)}
			</button>
		);
	};

	const TabBtn = ({ label, value, icon }) => {
		const active = tab === value;
		return (
			<button
				onClick={() => setTab(value)}
				style={{...styles.tabBtn, borderColor: colors.text + '33', backgroundColor: active ? colors.primary + '22' : 'transparent'}}
				aria-label={`Tab ${label}`}
			>
				<SvgIcon name={icon} size={16} color={active ? colors.primary : colors.text} />
			</button>
		);
	};

	return (
		<div style={styles.modalContainer}>
			<div style={{...styles.backdrop, backgroundColor: '#00000088'}}>
				<button style={styles.backdropHit} onClick={onClose} aria-label="Fechar rankings" />
				<div style={{...styles.panel, backgroundColor: colors.background}}>
					<div style={styles.titleRow}>
						<span style={{...styles.modalTitle, color: colors.text}}>Rankings</span>
						{loading && <span style={{...styles.loadingIndicator, color: colors.primary}}>...</span>}
					</div>
					<div style={styles.tabsRowCentered}>
						<MetricBtn label="Pontos" value="points" icon="trophy" />
						<MetricBtn label="Estrelas" value="stars" icon="star" />
						<MetricBtn label="XP" value="xp" icon={null} />
					</div>
					<div style={styles.tabsRowCentered}>
						<TabBtn label="Global" value="global" icon="globe" />
						<TabBtn label="Escola" value="school" icon="school" />
						<TabBtn label="Turma" value="class" icon="users" />
					</div>
					<div style={styles.listContainer}>
						<UserList 
							users={users}
							metric={metric}
							emptyMessage="Sem utilizadores"
							onUserPress={() => {}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

const styles = {
	modalContainer: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1000,
		display: 'flex',
	},
	backdrop: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		position: 'relative',
	},
	backdropHit: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
	},
	panel: {
		width: '90%',
		maxWidth: 500,
		borderRadius: 18,
		padding: 16,
		boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
		position: 'relative',
		zIndex: 1,
	},
	titleRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
		gap: 8,
	},
	modalTitle: {
		fontSize: 20,
		fontFamily: family.bold,
		letterSpacing: '0.5px',
	},
	loadingIndicator: {
		fontSize: 14,
		fontFamily: family.bold,
	},
	tabsRowCentered: {
		display: 'flex',
		flexDirection: 'row',
		gap: 8,
		justifyContent: 'center',
		marginBottom: 10,
	},
	tabBtn: {
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: 12,
		borderWidth: '1px',
		borderStyle: 'solid',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabLabel: {
		fontSize: 13,
		fontFamily: family.bold,
	},
	listContainer: {
		maxHeight: '400px',
		overflowY: 'auto',
	},
};

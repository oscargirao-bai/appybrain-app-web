import React from 'react';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import { family } from '../../constants/font';
import SvgIcon from '../../components/General/SvgIcon';

export default function Header({
	title = '',
	showBack = false,
	onBack,
	left,
	right,
	extraRight,
	style,
}) {
	const colors = useThemeColors();
	const width = window.innerWidth;
	const horizontalPadding = width >= 768 ? 28 : 16;
	const { translate } = useTranslate();

	const containerStyle = {
		...styles.container,
		paddingLeft: horizontalPadding,
		borderBottomColor: colors.text + '20',
		...(style || {})
	};

	const titleStyle = {
		...styles.title,
		color: colors.text
	};

	return (
		<div style={containerStyle}>
			<div style={styles.side}>
				{showBack && (
					<button
						aria-label={translate('common.back')}
						onClick={onBack}
						style={styles.iconBtn}
					>
						<SvgIcon name="arrow-left" size={24} color={colors.text} />
					</button>
				)}
				{left}
			</div>
			<div style={styles.sideRight}>
				{right}
				{extraRight && <div style={styles.extraRight}>{extraRight}</div>}
			</div>
			<div style={styles.centerWrap}>
				<span style={titleStyle}>{title}</span>
			</div>
		</div>
	);
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 56,
		borderBottomWidth: 2,
		borderBottomStyle: 'solid',
		gap: 12,
		justifyContent: 'space-between',
		position: 'relative',
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
		fontFamily: family.bold,
		letterSpacing: 0.5,
		textAlign: 'center',
		paddingLeft: 16,
		paddingRight: 16,
	},
	side: {
		width: 40,
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
	sideRight: {
		minWidth: 40,
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	extraRight: {
		marginLeft: 4,
	},
	iconBtn: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		padding: 8,
	},
	centerWrap: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'none',
	},
};

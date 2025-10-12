import React from 'react';
import { useThemeColors } from '../../services/Theme';

export default function ResultScreen2() {
	const colors = useThemeColors();

	return (
		<div style={{
			display: 'flex',
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.background,
			padding: 20,
			flexDirection: 'column',
		}}>
			<span style={{
				fontSize: 18,
				color: colors.text,
				textAlign: 'center',
			}}>
				ResultScreen2 - Em construção
			</span>
			<span style={{
				fontSize: 14,
				color: colors.text + '99',
				marginTop: 10,
				textAlign: 'center',
			}}>
				Esta tela está a ser convertida do React Native para React Web
			</span>
		</div>
	);
}

import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';

/**
 * ConfirmModal
 * Props:
 *  - visible (bool)
 *  - message (string | ReactNode)
 *  - onCancel () => void   (fires for "Não" & backdrop press)
 *  - onConfirm () => void  (fires for "Sim")
 *  - confirmLabel (optional string) default 'Sim'
 *  - cancelLabel  (optional string) default 'Não'
 *  - destructive (bool) -> color emphasis on confirm (uses error color)
 */
export default function ConfirmModal({
	visible,
	message = 'Tens a certeza?',
	onCancel,
	onConfirm,
	confirmLabel = 'Sim',
	cancelLabel = 'Não',
	destructive = false,
}) {
	const colors = useThemeColors();

	if (!visible) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: `${colors.backdrop}AA`,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				paddingLeft: 16,
				paddingRight: 16,
				zIndex: 9999
			}}
		>
			<div
				onClick={onCancel}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				}}
				aria-label="Fechar confirmação"
			/>
			<div style={{
				width: '100%',
				maxWidth: 400,
				borderRadius: 24,
				paddingLeft: 20,
				paddingRight: 20,
				paddingTop: 22,
				paddingBottom: 20,
				backgroundColor: colors.card,
				border: `1px solid ${colors.text}22`,
				position: 'relative',
				zIndex: 10000
			}}>
				<div style={{
					fontSize: 16,
					fontWeight: 600,
					color: colors.text,
					textAlign: 'center',
					marginBottom: 20,
					lineHeight: '22px'
				}}>{message}</div>
				<div style={{ display: 'flex', flexDirection: 'row', gap: 14 }}>
					<button
						onClick={onCancel}
						style={{
							flex: 1,
							border: `1px solid ${colors.text}25`,
							borderRadius: 18,
							paddingTop: 13,
							paddingBottom: 13,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: colors.surface,
							cursor: 'pointer'
						}}
						aria-label={cancelLabel}
					>
						<span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>{cancelLabel}</span>
					</button>
					<button
						onClick={onConfirm}
						style={{
							flex: 1,
							border: `1px solid ${destructive ? colors.error : colors.secondary}55`,
							borderRadius: 18,
							paddingTop: 13,
							paddingBottom: 13,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: destructive ? colors.error : colors.secondary,
							cursor: 'pointer'
						}}
						aria-label={confirmLabel}
					>
						<span style={{ fontSize: 15, fontWeight: 700, color: destructive ? colors.onError : colors.onSecondary }}>{confirmLabel}</span>
					</button>
				</div>
			</div>
		</div>
	);
}

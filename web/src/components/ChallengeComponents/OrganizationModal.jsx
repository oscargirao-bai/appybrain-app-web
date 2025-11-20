import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function OrganizationModal({ visible, onClose, organizationName, organizationImageUrl }) {
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
				backgroundColor: 'rgba(0, 0, 0, 0.75)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
			}}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: colors.card,
					borderRadius: 24,
					padding: '32px 24px',
					width: '90%',
					maxWidth: 400,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 24,
					boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Organization Image */}
				{organizationImageUrl && (
					<div
						style={{
							width: 160,
							height: 160,
							backgroundColor: colors.surface,
							borderRadius: 16,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							overflow: 'hidden',
							border: `1px solid ${colors.border}`,
						}}
					>
						<img
							src={organizationImageUrl}
							alt={organizationName}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'contain',
							}}
						/>
					</div>
				)}

				{/* Organization Name */}
				<h2
					style={{
						fontSize: 22,
						fontWeight: '700',
						fontFamily: family.bold,
						color: colors.text,
						textAlign: 'center',
						margin: 0,
					}}
				>
					{organizationName}
				</h2>

				{/* Close Button */}
				<button
					onClick={onClose}
					style={{
						backgroundColor: colors.primary,
						color: colors.onPrimary || '#000',
						border: 'none',
						borderRadius: 16,
						padding: '14px 32px',
						fontSize: 16,
						fontWeight: '700',
						fontFamily: family.bold,
						cursor: 'pointer',
						width: '100%',
						maxWidth: 200,
						transition: 'opacity 0.2s ease',
					}}
					onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
					onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
				>
					Fechar
				</button>
			</div>
		</div>
	);
}

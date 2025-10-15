import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import DataManager from '../../services/DataManager.jsx';
import { family } from '../../constants/font.jsx';

export default function NewsList({ style, limit, onPressItem }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [news, setNews] = useState([]);

	useEffect(() => {
		const handleDataUpdate = () => {
			const currentNews = DataManager.getNews();
			setNews(currentNews);
		};
		const unsubscribe = DataManager.subscribe(handleDataUpdate);
		handleDataUpdate();
		return () => {
			if (typeof unsubscribe === 'function') {
				unsubscribe();
			}
		};
	}, []);

	useEffect(() => {
		loadNews();
	}, []);

	const loadNews = async () => {
		try {
			await DataManager.loadNews();
			const newsData = DataManager.getNews();
			setNews(newsData);
		} catch (error) {
			console.error('NewsList: Failed to load news:', error);
		}
	};

	const handlePress = (item) => {
		if (onPressItem) {
			onPressItem(item);
		}
	};

	const displayedNews = limit ? news.slice(0, limit) : news;

	return (
		<div style={{ ...styles.container, ...(style || {}) }}>
			{displayedNews.map((item, index) => {
				const itemStyle = {
					...styles.card,
					borderColor: colors.text + '22',
					marginBottom: index < displayedNews.length - 1 ? 14 : 0,
				};

				const imageStyle = {
					...styles.imageBackground,
					backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
				};

				return (
					<button
						type="button"
						key={item.id}
						style={itemStyle}
						onClick={() => handlePress(item)}
						aria-label={item.title}
					>
						<div style={imageStyle}>
							<div style={styles.overlay} />
							<div style={styles.content}>
								<span style={styles.title}>{item.title}</span>
								{item.description && (
									<span style={styles.description}>
										{item.description}
									</span>
								)}
								{item.publishedDate && (
									<span style={styles.date}>
										{item.publishedDate}
									</span>
								)}
							</div>
						</div>
					</button>
				);
			})}
			{displayedNews.length === 0 && (
				<div style={styles.empty}>
					<span style={{ ...styles.emptyText, color: colors.text + '88' }}>
						{translate('news.noItems')}
					</span>
				</div>
			)}
		</div>
	);
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		overflowY: 'auto',
		paddingLeft: 16,
		paddingRight: 16,
		boxSizing: 'border-box',
	},
	card: {
		width: '100%',
		borderRadius: 22,
		overflow: 'hidden',
		borderWidth: 1,
		borderStyle: 'solid',
		cursor: 'pointer',
		transition: 'transform 0.2s, opacity 0.2s',
		padding: 0,
		backgroundColor: 'transparent',
	},
	imageBackground: {
		minHeight: 140,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		position: 'relative',
		borderRadius: 22,
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.55)',
	},
	content: {
		position: 'relative',
		zIndex: 1,
		paddingLeft: 14,
		paddingRight: 14,
		paddingTop: 12,
		paddingBottom: 16,
		display: 'flex',
		flexDirection: 'column',
		gap: 4,
	},
	title: {
		fontFamily: family.bold,
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 4,
		color: '#FFFFFF',
	},
	description: {
		fontFamily: family.medium,
		fontSize: 14,
		lineHeight: '18px',
		marginBottom: 4,
		color: '#FFFFFFDD',
	},
	date: {
		fontFamily: family.regular,
		fontSize: 12,
		marginTop: 6,
		color: '#FFFFFFAA',
	},
	empty: {
		padding: 32,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyText: {
		fontFamily: family.medium,
		fontSize: 14,
		textAlign: 'center',
	},
};

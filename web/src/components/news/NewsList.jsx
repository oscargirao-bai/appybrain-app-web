import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.js';

// Inline News List (view-based, no modal)
// Props:
// - style: optional container style override
// - limit: optional number to limit items displayed
// - onPressItem: optional handler override (item) => navigate to HtmlScreen
export default function NewsList({ style, limit, onPressItem }) {
	const colors = useThemeColors();
	const [news, setNews] = useState([]);
	const [newsAnimations, setNewsAnimations] = useState([]);
	const [firstRender, setFirstRender] = useState(true);

	// Subscribe to DataManager updates
	useEffect(() => {
		const handleDataUpdate = () => {
			const currentNews = DataManager.getNews?.() || [];
			setNews(currentNews);
		};

		const unsubscribe = DataManager.subscribe(handleDataUpdate);

		// Initial load
		handleDataUpdate();

		return unsubscribe;
	}, []);

	// Load news on mount
	useEffect(() => {
		loadNews();
	}, []);

	const loadNews = async () => {
		try {
			const result = await DataManager.loadNews?.();
			const newsData = DataManager.getNews?.() || [];

			// Determine if we should animate items
			const isFirstLoad = firstRender;
			const needsAnimations = newsAnimations.length !== newsData.length;
			const shouldAnimateItems = isFirstLoad || (result?.hasChanges && result?.newItems?.length > 0);

			if (isFirstLoad) {
				setFirstRender(false);
			}

			// Always create animations if they don't exist
			if (needsAnimations || shouldAnimateItems) {
				// Create or update animation values
				const animations = newsData.map((item) => {
					// If first time opening, animate all items
					// Otherwise, only animate new items
					const shouldAnimateItem = isFirstLoad || result?.newItems?.includes(item.id);

					// Find existing animation if item already exists
					const existingIndex = news.findIndex(existingItem => existingItem.id === item.id);
					const existingAnimation = existingIndex >= 0 ? newsAnimations[existingIndex] : null;

					if (existingAnimation && !shouldAnimateItem) {
						// Keep existing animation values for unchanged items
						return existingAnimation;
					} else {
						// Create new animation values for items that should animate
						return {
							translateY: shouldAnimateItem ? 30 : 0,
							opacity: shouldAnimateItem ? 0 : 1
						};
					}
				});

				setNewsAnimations(animations);

				// Only animate items that should be animated
				if (shouldAnimateItems) {
					setTimeout(() => {
						let animationDelay = 0;
						newsData.forEach((item, index) => {
							const shouldAnimateItem = isFirstLoad || result?.newItems?.includes(item.id);
							if (shouldAnimateItem) {
								setTimeout(() => {
									setNewsAnimations(prev => {
										const newAnims = [...prev];
										if (newAnims[index]) {
											newAnims[index] = { translateY: 0, opacity: 1 };
										}
										return newAnims;
									});
								}, animationDelay);
								animationDelay += 100; // 100ms delay between each item
							}
						});
					}, 50); // Small delay before starting animations
				}
			}

		} catch (error) {
			console.error('NewsList: Failed to load news:', error);
			setNews([]);
			setNewsAnimations([]);
		}
	};

	const openNews = (item) => {
		if (typeof onPressItem === 'function') return onPressItem(item);
		// Default: navigate to Html screen (onPressItem should be provided by parent)
	};

	const data = Array.isArray(news) ? (limit ? news.slice(0, limit) : news) : [];

	return (
		<div style={{ width: '100%', ...style }}>
			<div style={{ paddingBottom: 0 }}>
				{data.map((item, index) => {
					const animation = newsAnimations[index] || { translateY: 0, opacity: 1 };

					return (
						<div
							key={item.id}
							style={{
								border: `1px solid ${colors.text}20`,
								backgroundColor: `${colors.card}22`,
								borderRadius: 22,
								overflow: 'hidden',
								marginBottom: 14,
								transform: `translateY(${animation.translateY}px)`,
								opacity: animation.opacity,
								transition: 'transform 400ms, opacity 400ms'
							}}
						>
							<button
								onClick={() => openNews(item)}
								style={{
									flex: 1,
									width: '100%',
									padding: 0,
									border: 'none',
									background: 'transparent',
									cursor: 'pointer',
									textAlign: 'left'
								}}
								aria-label={`Abrir notícia ${item.title}`}
							>
								<div
									style={{
										width: '100%',
										height: 140,
										backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										borderRadius: 22,
										display: 'flex',
										justifyContent: 'flex-end',
										position: 'relative'
									}}
								>
									<div style={{
										position: 'absolute',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										backgroundColor: '#00000055',
										borderRadius: 22
									}} />
									<div style={{
										paddingLeft: 14,
										paddingRight: 14,
										paddingTop: 12,
										paddingBottom: 16,
										position: 'relative',
										zIndex: 1
									}}>
										<div style={{
											fontSize: 15,
											fontWeight: 700,
											color: '#fff',
											marginBottom: 4,
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>{item.title}</div>
										<div style={{
											fontSize: 13,
											fontWeight: 500,
											color: '#fff',
											lineHeight: '18px',
											marginBottom: 6,
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>{item.description}</div>
										<div style={{
											fontSize: 11,
											fontWeight: 600,
											color: '#ffffffdd',
											marginTop: 8,
											marginBottom: 4
										}}>{item.publishedDate}</div>
									</div>
								</div>
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

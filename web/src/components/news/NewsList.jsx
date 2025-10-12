import React, { useState, useEffect } from 'react';
// ImageBackground - use div with background-image
import { useThemeColors } from '../../services/Theme';
import DataManager from '../../services/DataManager';
import { family } from '../../constants/font';

// Inline News List (view-based, no modal)
// Props:
// - style: optional container style override
// - limit: optional number to limit items displayed
// - onPressItem: optional handler override
export default function NewsList({ style, limit, onPressItem }) {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const [news, setNews] = useState([]);
	const [newsAnimations, setNewsAnimations] = useState([]);
	const [firstRender, setFirstRender] = useState(true);

	// Subscribe to DataManager updates
	useEffect(() => {
		const handleDataUpdate = () => {
			//console.log('NewsModal: DataManager updated, refreshing news...');
			const currentNews = DataManager.getNews();
			setNews(currentNews);
			// Don't create animations here - let loadNews() handle them when modal opens
		};

		DataManager.subscribe(handleDataUpdate);
		
		// Initial load
		handleDataUpdate();

		return () => {
			// DataManager doesn't have unsubscribe yet, but we'll add it when needed
		});
	}, []);

	// Load news on mount
	useEffect(() => {
		loadNews();
	}, []);

	const loadNews = async () => {
		try {
			//console.log('NewsModal: Loading news...');
			const result = await DataManager.loadNews();
			const newsData = DataManager.getNews();
			
			// Determine if we should animate items
			const isFirstLoad = firstRender;
			const needsAnimations = newsAnimations.length !== newsData.length;
			const shouldAnimateItems = isFirstLoad || (result.hasChanges && result.newItems.length > 0);
			
			if (isFirstLoad) {
				setFirstRender(false);
				//console.log('NewsList: First load, animating all items');
			}
			
			// Always create animations if they don't exist
			if (needsAnimations || shouldAnimateItems) {
				//console.log('NewsModal: Creating animations for items');
				
				// Create or update animation values
				const animations = newsData.map((item) => {
					// If first time opening, animate all items
					// Otherwise, only animate new items
					const shouldAnimateItem = isFirstLoad || result.newItems.includes(item.id);
					
					// Find existing animation if item already exists
					const existingIndex = news.findIndex(existingItem => existingItem.id === item.id);
					const existingAnimation = existingIndex >= 0 ? newsAnimations[existingIndex] : null;
					
					if (existingAnimation && !shouldAnimateItem) {
						// Keep existing animation values for unchanged items
						return existingAnimation;
					} else {
						// Create new animation values for items that should animate
						return {
							translateY: new Animated.Value(shouldAnimateItem ? 30 : 0),
							opacity: new Animated.Value(shouldAnimateItem ? 0 : 1)
						};
					}
				};
				
				setNewsAnimations(animations);
				
				// Only animate items that should be animated
				if (shouldAnimateItems) {
					setTimeout(() => {
						let animationDelay = 0;
						newsData.forEach((item, index) => {
							const shouldAnimateItem = isFirstLoad || result.newItems.includes(item.id);
							if (shouldAnimateItem) {
								const anim = animations[index];
								setTimeout(() => {
									Animated.parallel([
										Animated.timing(anim.translateY, {
											toValue: 0,
											duration: 400,
											useNativeDriver: true,
										}),
										Animated.timing(anim.opacity, {
											toValue: 1,
											duration: 400,
											useNativeDriver: true,
										})
									]).start();
								}, animationDelay);
								animationDelay += 100; // 100ms delay between each item
							}
						};
					}, 50); // Small delay before starting animations
				}
			}
			
		} catch (error) {
			console.error('NewsModal: Failed to load news:', error);
			setNews([]);
			setNewsAnimations([]);
		}
	};

	// Basic escape to avoid breaking the inline HTML when injecting text fields
	const escapeHtml = (s) => {
		if (!s) return '';
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	};

	const openNews = (item) => {
		if (typeof onPressItem === 'function') return onPressItem(item);
		navigation.navigate('Html', { title: item.title || 'News', newsId: item.id });
	};

	const renderItem = ({ item, index }) => {
		const animation = newsAnimations[index];
		
		if (!animation) return null;

		return (
			<Animated.View 
				style={[
					styles.cardOuter, 
					{ 
						borderColor: colors.text + '20', 
						backgroundColor: colors.card + '22',
						transform: [{ translateY: animation.translateY }],
						opacity: animation.opacity
					}
				]}
			> 
				<button 					
					aria-label={`Abrir notícia ${item.title}`}
					onClick={() => openNews(item)}
					style={{ flex: 1 }}
				>
					<ImageBackground
						source={{ uri: item.imageUrl }}
						style={styles.image}
						imageStyle={styles.imageRadius}
						style={{objectFit: "cover"}}
					>
						<div style={{...styles.overlay, ...{ backgroundColor: '#00000055' }}} />
						<div style={styles.cardContent}> 
							<span style={{...styles.cardTitle, ...{ color: '#fff' }}} numberOfLines={2}>{item.title}</span>
							<span style={{...styles.cardBody, ...{ color: '#fff' }}} numberOfLines={2}>{item.description}</span>
							<span style={{...styles.cardDate, ...{ color: '#ffffffdd' }}}>{item.publishedDate}</span>
						</div>
					</ImageBackground>
				</button>
			</Animated.View>
		);
	};

	const data = Array.isArray(news) ? (limit ? news.slice(0, limit) : news) : [];
	return (
		<div style={{...styles.listContainer, ...style}}>
			<div 				data={data}
				keyExtractor={item => item.id.toString()}
				renderItem={renderItem}
				ItemSeparatorComponent={() => <div style={{ height: 14 }} />}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 0 }}
			/>
		</div>
	);
}

const styles = {
	listContainer: { width: '100%' },
	headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
	title: { fontSize: 18, fontFamily: family.bold },
	cardOuter: { borderWidth: 1, borderRadius: 22, overflow: 'hidden' },
	image: { width: '100%', height: 140, justifyContent: 'flex-end' },
	imageRadius: { borderRadius: 22 },
	overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
	cardContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 16 },
	cardTitle: { fontSize: 15, fontFamily: family.bold, marginBottom: 4 },
	cardBody: { fontSize: 13, fontFamily: family.medium, lineHeight: 18, marginBottom: 6 },
	cardDate: { fontSize: 11, fontFamily: family.semibold, marginTop: 8, marginBottom: 4 },
};

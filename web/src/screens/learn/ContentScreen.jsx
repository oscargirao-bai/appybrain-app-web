import React, { useMemo, useState, useEffect } from 'react';


import Header from '../../components/General/Header';
import { useThemeColors } from '../../services/Theme';
import { useSearch } from '../../services/SearchContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import DataManager from '../../services/DataManager';
import ApiManager from '../../services/ApiManager';
import ContentList from '../../components/CategoryContent/ContentList';
import SearchBox from '../../components/CategoryContent/SearchBox';

// Ecrã simples de Conteúdo: mostra apenas o Header com o nome da categoria recebida via params
// Params esperados: { categoryTitle: string }

export default function ContentScreen() {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const route = useRoute();
	const { categoryTitle, categoryId, categoryColor, categoryIconColor } = route.params || {};
	const { searchText, setSearchText } = useSearch();
	const [category, setCategory] = useState(null);
	const [contents, setContents] = useState([]);

	useEffect(() => {
		//console.log('ContentScreen: categoryId =', categoryId);
		
		const updateData = () => {
			//console.log('ContentScreen: updateData called'); // Debug log
			if (categoryId) {
				// Find the category across all disciplines
				const disciplines = DataManager.getDisciplines();
				let foundCategory = null;
				
				for (const discipline of disciplines) {
					foundCategory = discipline.categories?.find(cat => cat.id === categoryId);
					if (foundCategory) break;
				}
				
				//console.log('ContentScreen: foundCategory =', foundCategory); // Debug log
				setCategory(foundCategory);
				
				// Transform contents to include star data
				const transformedContents = (foundCategory?.contents || []).map(content => {
					const contentStars = DataManager.getContentStars(content.id);
					//console.log(`ContentScreen: Content ${content.title} has ${contentStars.totalStars}/${contentStars.maxStars} stars`); // Debug log
					return {
						id: content.id,
						order: content.title.split('.')[0] || '', // Extract order number from title
						title: content.title,
						description: content.description || '', // Include description from API
						stars: contentStars.totalStars,
						maxStars: contentStars.maxStars,
						iconColor: categoryIconColor || foundCategory?.iconColor, // Pass category iconColor to content items
						color: categoryColor || foundCategory?.color, // Pass category color to content items
					};
				};
				
				//console.log('ContentScreen: Setting transformedContents =', transformedContents); // Debug log
				setContents(transformedContents);
			}
		};

		// Initial load
		updateData();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateData);

		// Cleanup subscription
		return unsubscribe;
	}, [categoryId]);

	// Filter contents based on search text
	const filteredContents = useMemo(() => {
		if (!searchText.trim()) return contents;
		
		const searchLower = searchText.toLowerCase().trim();
		
		return contents.filter(content => 
			content.title?.toLowerCase().includes(searchLower) ||
			content.description?.toLowerCase().includes(searchLower)
		);
	}, [contents, searchText]);

	// Create starsByDifficulty object for ContentList
	const starsByDifficulty = useMemo(() => {
		const result = {});
		// Use filteredContents which already has updated star data
		filteredContents.forEach(content => {
			const contentStars = DataManager.getContentStars(content.id);
			//console.log(`ContentScreen: starsByDifficulty for ${content.title}:`, contentStars.stars); // Debug log
			result[content.id] = contentStars.stars; // stars object with easy/hard/genius keys
		};
		//console.log('ContentScreen: Final starsByDifficulty:', result); // Debug log
		return result;
	}, [filteredContents]); // Use filteredContents instead of contents

	const handleStudyPress = async (item) => {
		try {
			// Fetch the full content from API
			const response = await ApiManager.getLearnContentFull(item.id);
			
			// Navigate to HtmlScreen with the content
			navigation.navigate('Html', {
				title: item.title,
				html: response?.content?.longDescription || '<p>Conteúdo não disponível</p>'
			});
		} catch (error) {
			console.error('Failed to load content for study:', error);
			
			// Navigate with error message
			navigation.navigate('Html', {
				title: item.title,
				html: '<p>Erro ao carregar o conteúdo. Tente novamente mais tarde.</p>'
			});
		}
	};

	return (
		<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>      
			<Header title={categoryTitle || 'Conteúdo'} showBack onBack={() => navigation.goBack()} />
			<div style={styles.listWrapper}> 
				<SearchBox value={searchText} onChange={setSearchText} />
				<ContentList 
					data={filteredContents} 
					onPressStudy={handleStudyPress} 
					starsByDifficulty={starsByDifficulty}
				/>
			</div>
		</div>
	);
}

const styles = {
	safe: { flex: 1 },
	listWrapper: { flex: 1, paddingHorizontal: 16},
};

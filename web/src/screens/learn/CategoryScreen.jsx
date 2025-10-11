import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../services/Theme';
import { useSearch } from '../../services/SearchContext';
import DataManager from '../../services/DataManager';
import Header from '../../components/General/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import ContentList from '../../components/CategoryContent/List';
import SearchBox from '../../components/CategoryContent/SearchBox';

export default function CategoryScreen() {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const route = useRoute();
	const { disciplineId } = route.params || {};
	const { searchText, setSearchText } = useSearch();
	const [discipline, setDiscipline] = useState(null);
	const [categories, setCategories] = useState([]);

	useEffect(() => {
		//console.log('CategoryScreen: disciplineId =', disciplineId);
		
		const updateData = () => {
			//console.log('CategoryScreen: updateData called'); // Debug log
			if (disciplineId) {
				const disciplineData = DataManager.getAreaById(disciplineId);
				// console.log('CategoryScreen: disciplineData =', disciplineData);
				setDiscipline(disciplineData);
				
				// Transform categories to include stars data for ContentList component
				const transformedCategories = (disciplineData?.categories || []).map(category => {
					const categoryStars = DataManager.getCategoryStars(category.id);
					//console.log(`CategoryScreen: Category ${category.title} has ${categoryStars.earnedStars}/${categoryStars.maxStars} stars`); // Debug log
					return {
						id: category.id,
						title: category.title,
						icon: category.icon,
						color: category.color,
						iconColor: category.iconColor, // Include iconColor from API
						stars: categoryStars.earnedStars,
						maxStars: categoryStars.maxStars
					};
				});
				//console.log('CategoryScreen: Setting transformedCategories =', transformedCategories); // Debug log
				setCategories(transformedCategories);
			} else {
				//sconsole.log('CategoryScreen: No disciplineId provided'); // Debug log
			}
		};

		// Initial load
		updateData();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateData);

		// Cleanup subscription
		return unsubscribe;
	}, [disciplineId]);

	// Filter categories based on search text - only show categories that contain matching contents
	const filteredCategories = useMemo(() => {
		if (!searchText.trim()) return categories;
		
		const searchLower = searchText.toLowerCase().trim();
		
		return categories.filter(category => {
			// Get the full category data from discipline to access contents
			const fullCategory = discipline?.categories?.find(cat => cat.id === category.id);
			if (!fullCategory || !fullCategory.contents) return false;
			
			// Check if any content in this category matches the search text
			return fullCategory.contents.some(content => 
				content.title?.toLowerCase().includes(searchLower) ||
				content.description?.toLowerCase().includes(searchLower)
			);
		});
	}, [categories, discipline, searchText]);

	const handlePressItem = useCallback((item) => {
		navigation.navigate('Content', { 
			categoryTitle: item.title, 
			categoryId: item.id,
			categoryColor: item.color,
			categoryIconColor: item.iconColor
		});
	}, [navigation]);

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>      
			<Header title={discipline?.title || 'Carregando...'} showBack onBack={() => navigation.navigate('MainTabs', { initialTab: 0 })} />
			<View style={styles.body}>
				<SearchBox value={searchText} onChange={setSearchText} />
				<ContentList data={filteredCategories} onPressItem={handlePressItem} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1 },
	body: { flex: 1, paddingHorizontal: 16 },
});

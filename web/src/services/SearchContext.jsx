import React, { createContext, useContext, useState } from 'react';

// Context to share search text across Category and Content screens
const SearchContext = createContext();

export function SearchProvider({ children }) {
	const [searchText, setSearchText] = useState('');

	return (
		<SearchContext.Provider value={{ searchText, setSearchText }}>
			{children}
		</SearchContext.Provider>
	);
}

export function useSearch() {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error('useSearch must be used within SearchProvider');
	}
	return context;
}

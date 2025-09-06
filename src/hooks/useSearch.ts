import { useState, useEffect } from 'react';

interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount?: number;
}

export const useSearch = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedRecent = localStorage.getItem('recentSearches');
    const savedHistory = localStorage.getItem('searchHistory');
    
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
    
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addRecentSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const updated = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const addToHistory = (query: string, resultCount?: number) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const newHistoryItem: SearchHistory = {
      query: trimmedQuery,
      timestamp: Date.now(),
      resultCount
    };

    const updated = [newHistoryItem, ...searchHistory.filter(h => h.query !== trimmedQuery)].slice(0, 20);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const removeFromRecent = (query: string) => {
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const removeFromHistory = (query: string) => {
    const updated = searchHistory.filter(h => h.query !== query);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  return {
    recentSearches,
    searchHistory,
    addRecentSearch,
    addToHistory,
    clearRecentSearches,
    clearSearchHistory,
    removeFromRecent,
    removeFromHistory
  };
};

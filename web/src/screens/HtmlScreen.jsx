import React, { useMemo, useState, useEffect } from 'react';

import { useThemeColors } from '../services/Theme.jsx';
import { useTranslate } from '../services/Translate.jsx';
import ApiManager from '../services/ApiManager.jsx';
import Header from '../components/General/Header.jsx';
import MathJaxRenderer from '../components/General/MathJaxRenderer.jsx';

// Recebe navigation/route via props do AppRouter

/**
 * HtmlScreen - Displays HTML content with MathJax support for mathematical notation
 * Props via navigation params:
 *  - title: string (header title)
 *  - html: string (raw HTML to render)
 *  - uri: string (optional remote URL - if provided, loads URL instead of HTML)
 *  - newsId: number (optional news ID - if provided, loads news content from API)
 */
export default function HtmlScreen({ navigation, route }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const title = route?.params?.title || 'Detalhe';
  const html = route?.params?.html || '';
  const uri = route?.params?.uri;
  const newsId = route?.params?.newsId;

  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load news content if newsId is provided
  useEffect(() => {
    if (newsId) {
      loadNewsContent();
    }
  }, [newsId]);

  const loadNewsContent = async () => {
    try {
      setLoading(true);
      const newsArray = await ApiManager.getNewsContent(newsId);
      if (newsArray && newsArray.length > 0) {
        setNewsData(newsArray[0]); // Take the first (and only) news item
      }
    } catch (error) {
      console.error('Failed to load news content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine what content to display
  const contentHtml = newsData?.content || html;
  const displayTitle = newsData?.title || title;
  
  // Determine if this is study content (should have white background)
  const isStudyContent = !newsId && !newsData;

  // Determine header title based on content type
  const headerTitle = newsId ? translate('news.title') : translate('study.title');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div style={{ ...styles.container, backgroundColor: colors.background }}>
      <Header title={headerTitle} showBack onBack={() => navigation.goBack?.()} />
      
      {/* Show news metadata if this is a news item */}
      {newsData && (
        <div style={styles.metadataContainer}>
          {/* News Image */}
          {newsData.imageUrl && (
            <img 
              src={newsData.imageUrl}
              alt={newsData.title}
              style={{...styles.newsImage, objectFit: "cover"}}
            />
          )}
          
          {/* News Info */}
          <div style={styles.newsInfo}>
            <span style={{...styles.newsTitle, color: colors.text}}> 
              {newsData.title}
            </span>
            
            {newsData.description && (
              <span style={{...styles.newsDescription, ...{ color: colors.text + 'CC' }}}> 
                {newsData.description}
              </span>
            )}
            
            {newsData.publishDate && (
              <span style={{...styles.newsDate, ...{ color: colors.text + '99' }}}> 
                {formatDate(newsData.publishDate)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator for news */}
      {newsId && loading && (
        <div style={styles.loadingContainer}>
          <span style={{...styles.loadingText, ...{ color: colors.text + '99' }}}>
            Carregando notícia...
          </span>
        </div>
      )}
      
      {/* Content rendering */}
      <div style={styles.contentWrapper}>
        {uri ? (
          // For external URLs, use iframe
          <iframe 
            src={uri} 
            style={{...styles.webview, backgroundColor: colors.background}}
            title={headerTitle}
          />
        ) : (
          // For HTML content (especially study content), use MathJaxRenderer for math support
          <MathJaxRenderer
            content={contentHtml || '<p style="text-align:center">(sem conteúdo)</p>'}
            enabled={true}
            scrollEnabled={true}
            style={{...styles.webview, backgroundColor: isStudyContent ? '#ffffff' : colors.background}}
            baseFontSize={16}
            backgroundColor={isStudyContent ? '#ffffff' : colors.background}
            textColor={isStudyContent ? '#000000' : colors.text}
            padding={16}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
  contentWrapper: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 },
  webview: { flex: 1, width: '100%', border: 'none' },
  metadataContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127,127,127,0.2)',
  },
  newsImage: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(127,127,127,0.1)',
  },
  newsInfo: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 26,
  },
  newsDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
};

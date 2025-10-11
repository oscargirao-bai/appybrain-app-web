import React, { useMemo, useState, useEffect } from 'react';


import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColors } from '../services/Theme';
import { useTranslate } from '../services/Translate';
import ApiManager from '../services/ApiManager';
import Header from '../components/General/Header';
import MathJaxRenderer from '../components/General/MathJaxRenderer';

/**
 * HtmlScreen - Displays HTML content with MathJax support for mathematical notation
 * Props via navigation params:
 *  - title: string (header title)
 *  - html: string (raw HTML to render)
 *  - uri: string (optional remote URL - if provided, loads URL instead of HTML)
 *  - newsId: number (optional news ID - if provided, loads news content from API)
 */
export default function HtmlScreen() {
  const navigation = useNavigation();
  const route = useRoute();
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

  // Wrap provided HTML in a minimal template with appropriate colors based on content type
  const wrappedHtml = useMemo(() => {
    const body = contentHtml || '<p style="text-align:center">(sem conteúdo)</p>';
    
    // For study content: always use white background with black text for readability
    // For news content: use theme colors to match the app's appearance
    const isStudyContent = !newsId && !newsData;
    const textColor = isStudyContent ? '#000000' : colors.text;
    const backgroundColor = isStudyContent ? '#ffffff' : colors.background;
    const codeBackgroundOpacity = isStudyContent ? 'rgba(127,127,127,0.12)' : colors.text + '20';
    
    return `<!doctype html>
      <html lang="pt">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>
          :root {
            --text: ${textColor};
            --bg: ${backgroundColor};
            --link: ${colors.primary || '#0a7'};
          }
          html, body { margin:0; padding: 16px 24px 24px 24px; background: var(--bg); color: var(--text); font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; }
          img, video { max-width: 100%; height: auto; }
          a { color: var(--link); }
          h1,h2,h3 { margin-top: 1.2em; }
          pre, code { background: ${codeBackgroundOpacity}; padding: 2px 4px; border-radius: 4px; }
        </style>
      </head>
      <body>${body}</body>
      </html>`;
  }, [contentHtml, colors, newsId, newsData]);

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
      };
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div style={{...styles.container, ...{ backgroundColor: colors.background }}}>
      <Header title={headerTitle} showBack onBack={() => navigation.goBack?.()} />
      
      {/* Show news metadata if this is a news item */}
      {newsData && (
        <div style={styles.metadataContainer}>
          {/* News Image */}
          {newsData.imageUrl && (
            <img 
              source={{ uri: newsData.imageUrl }} 
              style={styles.newsImage}
              style={{objectFit: "cover"}}
            />
          )}
          
          {/* News Info */}
          <div style={styles.newsInfo}>
            <span style={{...styles.newsTitle, ...{ color: colors.text }}}> 
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
      {uri ? (
        // For external URLs, keep using WebView
        <WebView source={{ uri }} style={{...styles.webview, ...{ backgroundColor: colors.background }}} originWhitelist={["*"]} />
      ) : (
        // For HTML content (especially study content), use MathJaxRenderer for math support
        <MathJaxRenderer
          content={contentHtml || '<p style="text-align:center">(sem conteúdo)</p>'}
          enabled={true}
          scrollEnabled={true}
          style={{...styles.webview, ...{ backgroundColor: isStudyContent ? '#ffffff' : colors.background }}}
          baseFontSize={16}
          backgroundColor={isStudyContent ? '#ffffff' : undefined}
          textColor={isStudyContent ? '#000000' : undefined}
          padding={10}
        />
      )}
    </div>
  );
}

const styles = {
  container: { flex: 1 },
  webview: { flex: 1 },
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

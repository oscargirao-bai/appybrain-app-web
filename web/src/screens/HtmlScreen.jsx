import React, { useMemo, useState, useEffect } from 'react';

import { useThemeColors } from '../services/Theme.jsx';
import { useTranslate } from '../services/Translate.jsx';
import ApiManager from '../services/ApiManager.jsx';
import Header from '../components/General/Header.jsx';
import MathJaxRenderer from '../components/General/MathJaxRenderer.jsx';
import { family } from '../constants/font.jsx';

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

  const ui = useMemo(() => ({
    outer: {
      flex: 1,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    panel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.background,
      borderRadius: 0,
      boxShadow: 'none',
      overflow: 'hidden',
    },
    header: {
      paddingLeft: 16,
      paddingRight: 16,
      borderBottomWidth: 0,
    },
    body: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      backgroundColor: colors.background,
    },
    metadata: {
      borderBottom: `1px solid ${colors.text + '1A'}`,
      flexShrink: 0,
  backgroundColor: colors.card,
    },
    image: {
      width: '100%',
      height: 220,
      objectFit: 'cover',
      backgroundColor: colors.text + '10',
    },
    info: {
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },
    title: {
      fontSize: 22,
      lineHeight: '28px',
      fontFamily: family.bold,
      fontWeight: 700,
      color: colors.text,
    },
    description: {
      fontSize: 16,
      lineHeight: '22px',
      fontFamily: family.medium,
      fontWeight: 500,
      color: colors.text + 'CC',
    },
    date: {
      fontSize: 14,
      fontStyle: 'italic',
      fontFamily: family.regular,
      color: colors.text + '99',
    },
    loading: {
      padding: 18,
      textAlign: 'center',
      fontFamily: family.medium,
      color: colors.text + '99',
    },
    contentWrapper: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
  backgroundColor: isStudyContent ? '#ffffff' : colors.background,
      padding: 24,
      gap: 0,
    },
    iframe: {
      flex: 1,
      width: '100%',
      border: 'none',
      backgroundColor: isStudyContent ? '#ffffff' : colors.card,
    },
    mathjax: {
      flex: 1,
      backgroundColor: isStudyContent ? '#ffffff' : colors.background,
    },
  }), [colors, isStudyContent]);

  return (
    <div style={ui.outer}>
      <div style={ui.panel}>
        <Header title={headerTitle} showBack onBack={() => navigation.goBack?.()} style={ui.header} />
        <div style={ui.body}>
          {newsData && (
            <div style={ui.metadata}>
              {newsData.imageUrl && (
                <img
                  src={newsData.imageUrl}
                  alt={newsData.title}
                  style={ui.image}
                />
              )}
              <div style={ui.info}>
                <span style={ui.title}>{newsData.title}</span>
                {newsData.description && (
                  <span style={ui.description}>{newsData.description}</span>
                )}
                {newsData.publishDate && (
                  <span style={ui.date}>{formatDate(newsData.publishDate)}</span>
                )}
              </div>
            </div>
          )}

          {newsId && loading && (
            <div style={ui.loading}>{translate('common.loading')}</div>
          )}

          <div style={ui.contentWrapper}>
            {uri ? (
              <iframe
                src={uri}
                style={ui.iframe}
                title={headerTitle}
              />
            ) : (
              <MathJaxRenderer
                key={contentHtml || 'empty-content'}
                className="study-content"
                content={contentHtml || '<p style="text-align:center">(sem conteúdo)</p>'}
                enabled={true}
                scrollEnabled={true}
                style={ui.mathjax}
                baseFontSize={16}
                backgroundColor={isStudyContent ? '#ffffff' : colors.background}
                textColor={isStudyContent ? '#000000' : colors.text}
                padding={16}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

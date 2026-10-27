import { useEffect } from 'react';

/**
 * Custom hook to dynamically synchronize document title and SEO metadata.
 * Ensures search engine crawlers and users see crisp SpaceView branding
 * on every view rather than generic host titles.
 */
export function useSEO({
  title,
  description,
  canonicalUrl,
  ogImage,
}) {
  useEffect(() => {
    const baseTitle = 'SpaceView';
    const fullTitle = title ? `${title} | ${baseTitle}` : 'SpaceView - Explore NASA Data, ISS Tracker & The Cosmos';
    document.title = fullTitle;

    // Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', description);
      }
      let twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) {
        twDesc.setAttribute('content', description);
      }
    }

    // OpenGraph & Twitter Titles
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) {
      twTitle.setAttribute('content', fullTitle);
    }

    // Canonical & OG URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', canonicalUrl);
      }
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', canonicalUrl);
      }
    }

    // OpenGraph & Twitter Image
    if (ogImage) {
      let ogImgMeta = document.querySelector('meta[property="og:image"]');
      if (ogImgMeta) {
        ogImgMeta.setAttribute('content', ogImage);
      }
      let twImgMeta = document.querySelector('meta[name="twitter:image"]');
      if (twImgMeta) {
        twImgMeta.setAttribute('content', ogImage);
      }
    }
  }, [title, description, canonicalUrl, ogImage]);
}

export default useSEO;

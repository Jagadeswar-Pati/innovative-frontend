import { useEffect } from 'react';
import { updateDocumentHead, type SEOOptions } from '@/lib/seo';

interface SEOProps extends SEOOptions {}

/**
 * Renders nothing; updates document head (title, meta description, OG, Twitter, canonical).
 * Use once per page at the top of the page component.
 */
export default function SEO(props: SEOProps) {
  const { title, description, image, path, ogType, noIndex } = props;
  useEffect(() => {
    updateDocumentHead({ title, description, image, path, ogType, noIndex });
  }, [title, description, image, path, ogType, noIndex]);
  return null;
}

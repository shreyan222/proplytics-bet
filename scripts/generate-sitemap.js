import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sitemap = new SitemapStream({ 
  hostname: 'https://proplytics.bet' // Update this to your actual domain
});

const links = [
  // Main pages
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/landing', changefreq: 'weekly', priority: 0.9 },
  { url: '/auth', changefreq: 'monthly', priority: 0.7 },
  { url: '/forgot-password', changefreq: 'monthly', priority: 0.5 },
  { url: '/reset-password', changefreq: 'monthly', priority: 0.5 },
  
  // Dashboard and main features
  { url: '/tracker', changefreq: 'daily', priority: 0.9 },
  { url: '/best-props', changefreq: 'daily', priority: 0.9 },
  { url: '/compare', changefreq: 'daily', priority: 0.8 },
  { url: '/hot-props', changefreq: 'daily', priority: 0.8 },
  { url: '/players', changefreq: 'daily', priority: 0.8 },
  { url: '/analytics', changefreq: 'daily', priority: 0.8 },
  { url: '/recap', changefreq: 'daily', priority: 0.7 },
  
  // Settings and info pages
  { url: '/settings', changefreq: 'monthly', priority: 0.6 },
  { url: '/data-processing', changefreq: 'weekly', priority: 0.6 },
  { url: '/using-proplytics', changefreq: 'monthly', priority: 0.7 },
  
  // Legal pages
  { url: '/responsible-gaming', changefreq: 'monthly', priority: 0.5 },
  { url: '/terms-of-use', changefreq: 'monthly', priority: 0.5 },
  { url: '/privacy-policy', changefreq: 'monthly', priority: 0.5 },
  
  // Add dynamic routes here as needed
  // Example: Player detail pages, specific prop pages, etc.
];

console.log('🚀 Generating sitemap...');
console.log(`📝 Adding ${links.length} static pages`);

links.forEach(link => {
  console.log(`  ✓ ${link.url} (priority: ${link.priority})`);
  sitemap.write(link);
});

sitemap.end();

streamToPromise(sitemap).then(data => {
  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  const writeStream = createWriteStream(outputPath);
  writeStream.write(data);
  writeStream.end();
  
  console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
  console.log(`📊 Total URLs: ${links.length}`);
}).catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});

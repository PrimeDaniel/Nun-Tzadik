import fs from 'fs';

async function fetchUrl(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } catch (e) {
        console.error(`Failed to fetch ${url}:`, e.message);
        return '';
    }
}

function extractCoordinates(html) {
    let match = html.match(/ll=([\d\.]+)(?:%2C|,)([\d\.]+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    match = html.match(/[?&]q=([\d\.]+),([\d\.]+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    match = html.match(/data-lat="([^"]+)"\s.*data-lng="([^"]+)"/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Waze embed link sometimes
    match = html.match(/waze\.com\/(?:he|en)\/iframe\?navigate=yes&amp;zoom=17&amp;lat=([\d\.]+)&amp;lon=([\d\.]+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    return null;
}

function extractName(html) {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    if (match) return match[1].replace(/<[^>]+>/g, '').trim();
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) return titleMatch[1].split('-')[0].split('|')[0].trim();
    return 'Unknown';
}

function extractLocation(html) {
    const locMatch = html.match(/class="elementor-icon-list-text">(.*?[מושב|קיבוץ|עיר|כפר|צומת|פארק].*?)<\/span>/);
    if (locMatch) return locMatch[1].replace(/<[^>]+>/g, '').trim();
    return 'Israel';
}

function extractDescription(html) {
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (metaMatch) return metaMatch[1].replace(/&quot;/g, '"');
    const ogMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
    if (ogMatch) return ogMatch[1].replace(/&quot;/g, '"');
    return '';
}

async function scrapeAll() {
    console.log('Fetching sitemap index...');
    const indexXml = await fetchUrl('https://coffeetrail.co.il/sitemap_index.xml');

    const sitemapUrls = [...indexXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    let cartUrls = [];

    for (const sitemapUrl of sitemapUrls) {
        const xml = await fetchUrl(sitemapUrl);
        const urls = [...xml.matchAll(/<loc>(https:\/\/coffeetrail\.co\.il\/coffeecart\/[^<]+)<\/loc>/g)].map(m => m[1]);
        const valid = urls.filter(u => u !== 'https://coffeetrail.co.il/coffeecart/');
        cartUrls.push(...valid);
    }

    // Deduplicate
    cartUrls = [...new Set(cartUrls)];
    console.log(`Found ${cartUrls.length} coffee carts to scrape.`);

    if (cartUrls.length === 0) {
        console.log('No cart URLs found. Exiting.');
        return;
    }

    const results = [];

    for (let i = 0; i < cartUrls.length; i++) {
        const url = cartUrls[i];
        console.log(`[${i + 1}/${cartUrls.length}] Scraping ${url}`);

        const html = await fetchUrl(url);
        if (!html) continue;

        const name = extractName(html);
        const coords = extractCoordinates(html);
        const desc = extractDescription(html);
        const loc = extractLocation(html);

        if (coords && !Number.isNaN(coords.lat)) {
            results.push({
                id: `cart-${i + 1}`,
                name,
                location: loc || 'Israel',
                description: desc,
                lat: coords.lat,
                lng: coords.lng,
                icon: "☕",
                sourceUrl: url
            });
            console.log(`  -> Found: ${name} at ${coords.lat}, ${coords.lng}`);
        } else {
            console.log(`  -> No coordinates found for ${name}`);
        }

        // Small delay to prevent being blocked
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\nSuccessfully scraped ${results.length} carts with coordinates!`);
    fs.writeFileSync('src/data/coffeeCarts.json', JSON.stringify(results, null, 2));
    console.log('Saved to src/data/coffeeCarts.json');
}

scrapeAll();

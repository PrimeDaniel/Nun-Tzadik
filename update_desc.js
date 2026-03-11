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

function extractTrueDescription(html) {
        .filter(t =>
    t.length > 20 &&
    !t.includes('ניוזלטר') &&
    !t.includes('עדכונים שווים') &&
    !t.includes('הבית של עגלות הקפה בישראל') &&
    !t.includes('קבלו גישה מהירה') &&
    !t.includes('לכל מה שחשוב')
);

    if (pMatches.length > 0) {
        // Return the first valid paragraph, limit to ~150 chars if too long
        let desc = pMatches[0];
        if (desc.length > 180) {
            desc = desc.substring(0, 150) + '...';
        }
        return desc;
    }
    return '';
}

async function updateDescriptions() {
    const filePath = 'src/data/coffeeCarts.json';
    const carts = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Loaded ${carts.length} carts. Updating descriptions...`);

    let updatedCount = 0;

    for (let i = 0; i < carts.length; i++) {
        const cart = carts[i];
        console.log(`[${i + 1}/${carts.length}] Fetching ${cart.sourceUrl}`);

        const html = await fetchUrl(cart.sourceUrl);
        if (!html) continue;

        const trueDesc = extractTrueDescription(html);

        if (trueDesc && trueDesc !== cart.description) {
            // Only log if we found a genuinely new description
            console.log(`  -> Update: ${trueDesc.substring(0, 50)}...`);
            cart.description = trueDesc;
            updatedCount++;
        }

        // Small delay
        await new Promise(r => setTimeout(r, 100));
    }

    fs.writeFileSync(filePath, JSON.stringify(carts, null, 2));
    console.log(`\nSuccessfully updated descriptions for ${updatedCount} carts! Saved to ${filePath}.`);
}

updateDescriptions();

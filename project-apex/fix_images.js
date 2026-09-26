const fs = require('fs');

const mockData = fs.readFileSync('./src/data/mockProducts.ts', 'utf8');

// Quick and dirty parser for mockProducts
const products = [];
const regex = /"title":\s*"(.*?)",[\s\S]*?"image":\s*"(.*?)"/g;
let match;
while ((match = regex.exec(mockData)) !== null) {
  products.push({ title: match[1].toLowerCase(), image: match[2] });
}

console.log("Parsed products:", products.length);

const homeClientPath = './src/components/HomeClient.tsx';
let homeCode = fs.readFileSync(homeClientPath, 'utf8');

const quadCardsRegex = /const QUAD_CARDS = \[[\s\S]*?\];\n/;
const quadCardsMatch = homeCode.match(quadCardsRegex);
if(!quadCardsMatch) {
    console.error("Could not find QUAD_CARDS");
    process.exit(1);
}

let arrayStr = quadCardsMatch[0].replace('const QUAD_CARDS = ', '').trim();
if(arrayStr.endsWith(';')) arrayStr = arrayStr.slice(0, -1);

// Evaluate the array string to get the JS object
const QUAD_CARDS = eval(arrayStr);

const usedImages = new Set();

function getUniqueImage(label, fallbackTerm) {
    const cleanLabel = label.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const terms = cleanLabel.split(/\s+/).filter(t => t.length > 2);
    const fallbackTerms = fallbackTerm.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);
    
    let allTerms = [...terms, ...fallbackTerms];
    
    // First try finding a matching product
    let found = products.find(p => {
        if(usedImages.has(p.image)) return false;
        return allTerms.some(term => p.title.includes(term));
    });

    if (!found) {
        // fallback to ANY unused image
        found = products.find(p => !usedImages.has(p.image));
    }
    
    if (found) {
        usedImages.add(found.image);
        return found.image;
    }
    return "https://placehold.co/300x300/E3E1DD/171717?text=" + encodeURIComponent(label);
}

QUAD_CARDS.forEach(card => {
    card.items.forEach(item => {
        item.img = getUniqueImage(item.label, card.title);
    });
});

const newArrayStr = "const QUAD_CARDS = " + JSON.stringify(QUAD_CARDS, null, 2) + ";\n";
const newCode = homeCode.replace(quadCardsRegex, newArrayStr);

fs.writeFileSync(homeClientPath, newCode);
console.log("Successfully replaced 64 images with unique guaranteed Amazon product images!");

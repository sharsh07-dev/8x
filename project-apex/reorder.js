const fs = require('fs');
const path = './src/components/HomeClient.tsx';
let code = fs.readFileSync(path, 'utf8');

const quickActionsRegex = /\{\/\* ══ QUICK ACTIONS ════════════════════════════════════════════ \*\/\}([\s\S]*?)<\/section>/;
const quadCardsRegex = /\{\/\* ══ QUAD CARDS \(CATEGORIES & DEALS\) ════════════════════════ \*\/\}([\s\S]*?)<\/section>/;
const shopByOccasionRegex = /\{\/\* ══ SHOP BY OCCASION ════════════════════════════════════════ \*\/\}([\s\S]*?)<\/section>/;
const recommendationsRegex = /\{\/\* ══ RECOMMENDATIONS ════════════════════════════════════════ \*\/\}([\s\S]*?)<\/section>/;

const quickMatch = code.match(quickActionsRegex)[0];
const quadMatch = code.match(quadCardsRegex)[0];
const occasionMatch = code.match(shopByOccasionRegex)[0];
const recMatch = code.match(recommendationsRegex)[0];

// Remove them all from their original positions
code = code.replace(quadCardsRegex, '');
code = code.replace(shopByOccasionRegex, '');
code = code.replace(recommendationsRegex, '');

// Clean up any double blank lines left behind
code = code.replace(/\n\s*\n\s*\n/g, '\n\n');

// Build the new order
// New order: QUICK ACTIONS -> RECOMMENDATIONS -> SHOP BY OCCASION -> QUAD CARDS
// We'll remove the border-t from recommendations since it's now higher up
const recModified = recMatch.replace(' border-t border-[#E3E1DD]/50', '');

const newOrder = `${quickMatch}\n\n      ${recModified}\n\n      ${occasionMatch}\n\n      ${quadMatch}`;

// Insert back by replacing quickMatch
code = code.replace(quickMatch, newOrder);

fs.writeFileSync(path, code);
console.log('Reordered successfully!');

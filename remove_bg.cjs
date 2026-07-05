const fs = require('fs');

let content = fs.readFileSync('public/splitsmart.svg', 'utf8');

// The outer rectangle path string
const outerRect = 'M0 0 C99.33 0 198.66 0 301 0 C301 83.49 301 166.98 301 253 C201.67 253 102.34 253 0 253 C0 169.51 0 86.02 0 0 Z ';

// Remove Path 1 completely (the solid blue background)
const path1Regex = new RegExp(`<path d="${outerRect}" fill="#6366F1" transform="translate\\(0,0\\)"/>\\s*`);
content = content.replace(path1Regex, '');

// For Path 2, remove the outer rect so it only draws the logo shape, and change fill to #6366F1
content = content.replace(`d="${outerRect}`, `d="`);
content = content.replace(`fill="#FEFEFE"`, `fill="#6366F1"`);

// Now set the viewBox properly
const baseSVG = content.replace('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="301" height="253">', '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 301 253">');

// Generate the specific files
fs.writeFileSync('public/favicon.svg', baseSVG.replace('width="100%" height="100%"', 'width="32" height="32"'));
fs.writeFileSync('public/pwa-192x192.svg', baseSVG.replace('width="100%" height="100%"', 'width="192" height="192"'));
fs.writeFileSync('public/pwa-512x512.svg', baseSVG.replace('width="100%" height="100%"', 'width="512" height="512"'));

// Update icons.svg
const iconsContent = fs.readFileSync('public/icons.svg', 'utf8');
const symbolContent = baseSVG.replace('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 301 253">', '<symbol id="splitsmart-icon" viewBox="0 0 301 253">').replace('</svg>', '</symbol>');
// Since we already prepended it last time, let's replace the old symbol if it exists, otherwise prepend.
let newIconsContent;
if (iconsContent.includes('<symbol id="splitsmart-icon"')) {
    newIconsContent = iconsContent.replace(/<symbol id="splitsmart-icon"[\s\S]*?<\/symbol>/, symbolContent);
} else {
    newIconsContent = iconsContent.replace('<svg xmlns="http://www.w3.org/2000/svg">', `<svg xmlns="http://www.w3.org/2000/svg">\n  ${symbolContent}`);
}
fs.writeFileSync('public/icons.svg', newIconsContent);

console.log('Background removed and SVGs regenerated.');

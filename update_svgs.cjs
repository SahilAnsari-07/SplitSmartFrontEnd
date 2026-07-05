const fs = require('fs');

const content = fs.readFileSync('public/splitsmart.svg', 'utf8');
const newContent = content.replace('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="301" height="253">', '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 301 253">');

fs.writeFileSync('public/favicon.svg', newContent.replace('width="100%" height="100%"', 'width="32" height="32"'));
fs.writeFileSync('public/pwa-192x192.svg', newContent.replace('width="100%" height="100%"', 'width="192" height="192"'));
fs.writeFileSync('public/pwa-512x512.svg', newContent.replace('width="100%" height="100%"', 'width="512" height="512"'));

const iconsContent = fs.readFileSync('public/icons.svg', 'utf8');
const symbolContent = newContent.replace('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 301 253">', '<symbol id="splitsmart-icon" viewBox="0 0 301 253">').replace('</svg>', '</symbol>');
const newIconsContent = iconsContent.replace('<svg xmlns="http://www.w3.org/2000/svg">', '<svg xmlns="http://www.w3.org/2000/svg">\n  ' + symbolContent);
fs.writeFileSync('public/icons.svg', newIconsContent);
console.log('SVGs updated successfully.');

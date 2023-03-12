module.exports = {
  'apps/*.{js,jsx,ts,tsx}': ['npm run lint:fix'],
  'apps/*.{json,md,html,css,scss,less}': ['npm run format:fix'],
};

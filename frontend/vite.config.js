const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
module.exports = defineConfig({
	plugins: [react()],
	base: process.env.GITHUB_ACTIONS ? '/aptus/' : '/',
});

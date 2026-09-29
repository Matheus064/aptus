const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
module.exports = defineConfig({
	base: process.env.GITHUB_ACTIONS ? '/aptus/' : '/',
	plugins: [react()],
	server: {
		proxy: {
			'/api': 'http://localhost:3000',
			'/uploads': 'http://localhost:3000',
		},
	},
});

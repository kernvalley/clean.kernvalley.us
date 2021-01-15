/* eslint no-unused-vars: 0 */
/* eslint-env serviceworker */
const config = {
	version: '1.0.3',
	fresh: [
		'https://apps.kernvalley.us/apps.json',
	].map(url => new URL(url, location.origin).href),
	stale: [
		'/',
		'/js/index.min.js',
		'/css/index.min.css',
		'/img/favicon.svg',
		'/img/icon-16.png',
		'/img/apple-touch-icon.png',
		'/img/icons.svg',
		'/manifest.json',
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/toast-message.css',
		'https://cdn.kernvalley.us/components/notification/html-notification.html',
		'https://cdn.kernvalley.us/components/notification/html-notification.css',
		'https://cdn.kernvalley.us/components/github/user.html',
		'https://cdn.kernvalley.us/components/github/user.css',
		'https://cdn.kernvalley.us/components/share-to-button/share-to-button.css',
		'https://cdn.kernvalley.us/components/share-to-button/share-to-button.html',
		'https://cdn.kernvalley.us/img/adwaita-icons/actions/mail-send.svg',
		'https://cdn.kernvalley.us/img/logos/instagram.svg',
		'https://cdn.kernvalley.us/img/keep-kern-clean.svg',
		'https://cdn.kernvalley.us/fonts/roboto.woff2',
	].map(path => new URL(path, location.origin).href),
	allowed: [
		/https:\/\/i\.imgur\.com\/*/,
		/https:\/\/api\.github\.com\/users\/*/,
		/https:\/\/avatars\d\.githubusercontent.com\/u\/*/,
	]
};

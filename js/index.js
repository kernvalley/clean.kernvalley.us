import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://unpkg.com/@webcomponents/custom-elements@1.4.2/custom-elements.min.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/share-to-button/share-to-button.js';
import 'https://cdn.kernvalley.us/components/date-locale.js';
import { HTMLNotificationElement } from 'https://cdn.kernvalley.us/components/notification/html-notification.js';

import { ready } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { loadScript } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { importGa } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { GA } from './consts.js';

document.documentElement.classList.replace('no-js', 'js');
document.body.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.body.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);

if (typeof GA === 'string') {
	importGa(GA);
}

Promise.allSettled([
	ready(),
	loadScript('https://cdn.polyfill.io/v3/polyfill.min.js'),
]).then(async () => {
	document.forms.blocked.addEventListener('submit', event => event.preventDefault());
	document.forms.blocked.hidden = false;
	const img = document.querySelector('img');
	const ratio = img.width / img.height;
	const link = img.parentElement;

	document.getElementById('height').addEventListener('input', ({ target }) => {
		const height = parseInt(target.value);
		const width = parseInt(ratio * height);
		document.getElementById('width').value = width;
		requestAnimationFrame(() => {
			img.width = width;
			img.height = height;
		});
	}, {
		passive: true,
		capture: true,
	});

	document.getElementById('source').addEventListener('change', event => {
		const url = new URL(link.href);
		url.searchParams.set('utm_source', event.target.value.toLowerCase().replace(/[^a-z\d]/g, '-'));
		link.href = url.href;
	}, {
		passive: true,
		capture: true,
	});

	document.getElementById('medium').addEventListener('change', event => {
		const url = new URL(link.href);
		url.searchParams.set('utm_medium', event.target.value);
		link.href = url.href;
	}, {
		passive: true,
		capture: true,
	});

	link.addEventListener('click', async event => {
		event.preventDefault();
		const html = event.target.closest('a').outerHTML;

		if (('clipboard' in navigator) && navigator.clipboard.writeText instanceof Function) {
			await navigator.clipboard.writeText(html).catch(() => alert('Copying to clipboard failed'));

			new HTMLNotificationElement('HTML Copied', {
				body: 'Paste the copied HTML into your website',
				icon: img.src,
				actions: [{
					title: 'Share',
					action: 'share',
					icon: 'https://cdn.kernvalley.us/img/adwaita-icons/places/folder-publicshare.svg'
				}, {
					title: 'Download',
					action: 'save',
					icon: 'https://cdn.kernvalley.us/img/octicons/cloud-download.svg'
				}, {
					title: 'Dismiss',
					action: 'close',
					icon: 'https://cdn.kernvalley.us/img/octicons/x.svg',
				}],
				data: {
					html,
					filename: 'keep-kern-clean.html',
					type: 'text/html',
					share: {
						title: 'Keep Kern Clean',
						text: '#KeepKernClean',
						url: 'https://kernriverconservancy.org',
					}
				}
			}).addEventListener('notificationclick', async ({ notification, action }) => {
				const { html, filename, type, share } = notification.data;
				const { title, text, url } = share;

				switch(action) {
					case 'share':
						notification.close();
						Promise.resolve([new File([html], filename, { type })]).then(async files => {
							if ((navigator.canShare instanceof Function) && navigator.canShare({ title, text, url, files })) {
								await navigator.share({ title, text, url, files });
							} else {
								await navigator.share({ title, text, url });
							}

						});

						break;

					case 'close':
						notification.close();
						break;

					case 'save':
						notification.close();
						Promise.resolve(new File([html], filename, { type })).then(file => {
							const url = URL.createObjectURL(file);
							const a = document.createElement('a');
							a.href = url;
							a.download = file.name;
							a.textContent = 'Download';
							document.body.append(a);
							notification.close();

							try {
								a.click();
								a.remove();
							} catch(err) {
								console.error(err);
								a.scrollIntoView({ block: 'end', behavior: 'smooth' });
							}
						});
						break;
				}
			});
		} else {
			alert('Clipboard not supported');
		}
	});
});

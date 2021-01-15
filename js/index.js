import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/js/std-js/theme-cookie.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/share-to-button/share-to-button.js';
import 'https://cdn.kernvalley.us/components/date-locale.js';
import { HTMLNotificationElement } from 'https://cdn.kernvalley.us/components/notification/html-notification.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { ready, $ } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { GA } from './consts.js';

document.documentElement.classList.replace('no-js', 'js');
document.body.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.body.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);

function generated() {
	if (window.ga instanceof Function) {
		window.ga('send', {
			hitType: 'event',
			eventCategory: 'action',
			eventLabel: 'Generated',
			transport: 'beacon',
		});
	}
}

if (typeof GA === 'string' && GA.length !== 0) {
	requestIdleCallback(() => {
		importGa(GA).then(async ({ ga }) => {
			if (ga instanceof Function) {
				ga('create', GA, 'auto');
				ga('set', 'transport', 'beacon');
				ga('send', 'pageview');

				await ready();

				$('a[rel~="external"]:not([title="#KeepKernClean"])').click(externalHandler, { passive: true, capture: true });
				$('a[href^="tel:"]').click(telHandler, { passive: true, capture: true });
				$('a[href^="mailto:"]').click(mailtoHandler, { passive: true, capture: true });
				$('#preview > a').click(generated, { passive: true, capture: true });
			}
		});
	});
}

Promise.allSettled([
	ready(),
]).then(async () => {
	init().catch(console.error);
	$('[data-toast]').click(async ({ target }) => {
		await customElements.whenDefined('toast-message');
		document.getElementById(target.closest('[data-toast]').dataset.toast).show();
	}, {
		passive: true,
		capture: true,
	});

	document.forms.blocked.addEventListener('submit', event => event.preventDefault());
	document.forms.blocked.hidden = false;
	const img = document.querySelector('#preview img');
	const ratio = img.width / img.height;
	const link = img.parentElement;

	img.addEventListener('wheel', event => {
		if (event.deltaY !== 0 && HTMLInputElement.prototype.stepUp instanceof Function) {
			event.preventDefault();
			const input = document.getElementById('height');
			input.stepUp(parseInt(input.step) * event.deltaY);
			input.dispatchEvent(new Event('input'));
		}
	});

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

	if ('clipboard' in navigator) {
		link.addEventListener('click', async event => {
			event.preventDefault();
			const html = event.target.closest('a').outerHTML.replace(/[\t\n]/g, '');

			if (('clipboard' in navigator) && navigator.clipboard.writeText instanceof Function) {
				await navigator.clipboard.writeText(html).catch(() => alert('Copying to clipboard failed'));

				new HTMLNotificationElement('HTML Copied', {
					body: 'Paste the copied HTML into your website',
					icon: '/img/favicon.svg',
					vibrate: [300, 0, 300],
					requireInteraction: true,
					image: 'https://cdn.kernvalley.us/img/keep-kern-clean.svg',
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
	} else {
		const pre = document.createElement('pre');
		const code = document.createElement('code');
		pre.append(code);
		document.querySelector('output[for="slider"]').append(pre);

		link.addEventListener('click', async event => {
			event.preventDefault();
			const target = event.target.closest('a');
			code.textContent = target.outerHTML.replace(/[\t\n]/g, '');

			if (document.body.createTextRange) {
				const range = document.body.createTextRange();
				range.moveToElementText(code);
				range.select();
			} else if (window.getSelection) {
				const selection = window.getSelection();
				const range = document.createRange();
				range.selectNodeContents(code);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}, {
			capture: true,
		});
	}
});

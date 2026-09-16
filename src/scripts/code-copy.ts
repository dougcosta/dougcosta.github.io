document.addEventListener('DOMContentLoaded', () => {
	const codeBlocks = document.querySelectorAll('pre');

	const copyIcon = `
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="9" y="9" width="10" height="10" rx="1.5"></rect>
			<path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"></path>
		</svg>
	`;

	const checkIcon = `
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="m5 12 4 4L19 6"></path>
		</svg>
	`;

	codeBlocks.forEach((pre) => {
		const code = pre.querySelector('code');

		if (!code) return;

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'code-copy';
		button.setAttribute('aria-label', 'Copiar código');
		button.innerHTML = copyIcon;

		button.addEventListener('click', async () => {
			await navigator.clipboard.writeText(code.textContent ?? '');

			button.innerHTML = checkIcon;
			button.setAttribute('aria-label', 'Código copiado');

			setTimeout(() => {
				button.innerHTML = copyIcon;
				button.setAttribute('aria-label', 'Copiar código');
			}, 2000);
		});

		pre.appendChild(button);
	});
});
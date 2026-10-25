(() => {
    const scriptURL = document.currentScript?.src || location.href;
    const gallery = document.querySelector('.deck-gallery[data-catalog]');
    if (!gallery) return;
    const catalogURL = new URL(gallery.dataset.catalog, scriptURL);
    const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const resolveURL = value => {
        const url = new URL(value, catalogURL);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid catalogue URL');
        return url.href;
    };
    const icon = name => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('viewBox', '0 0 24 24');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', `/assets/icons/sprite.svg#${name}`);
        svg.append(use);
        return svg;
    };
    const button = (label, symbol, action) => {
        const node = element('button', 'gallery-icon');
        node.type = 'button';
        node.title = label;
        node.setAttribute('aria-label', label);
        node.append(icon(symbol));
        node.addEventListener('click', action);
        return node;
    };

    function positionDownloads() {
        gallery.querySelectorAll('.deck-footer').forEach(footer => {
            const text = footer.querySelector('p');
            const download = footer.querySelector('.deck-download');
            const position = () => {
                const bounds = text.getBoundingClientRect();
                const control = download.getBoundingClientRect();
                const range = document.createRange();
                range.selectNodeContents(text);
                let top = Math.max(0, bounds.height - control.height);
                for (const rect of range.getClientRects()) {
                    if (rect.right > bounds.right - control.width - 8) {
                        top = Math.max(top, rect.bottom - bounds.top + 4);
                    }
                }
                footer.style.setProperty('--download-top', `${top}px`);
                footer.style.minHeight = `${Math.max(bounds.height, top + control.height)}px`;
                footer.classList.add('download-positioned');
            };
            new ResizeObserver(position).observe(text);
            document.fonts.ready.then(position);
            position();
        });
    }

    function deckCard(deck) {
        const card = element('article', 'deck-card');
        card.id = deck.slug;
        card.dataset.noteCount = deck.noteCount;
        card.dataset.cardCount = deck.cardCount;
        const preview = element('div', 'deck-preview');
        preview.setAttribute('role', 'group');
        preview.setAttribute('aria-label', `${deck.title} sample card`);
        const inputs = ['front', 'back'].map(side => {
            const input = element('input');
            input.type = 'radio';
            input.name = `${deck.slug}-side`;
            input.id = `${deck.slug}-${side}`;
            input.value = side;
            input.checked = side === 'front';
            const label = element('label', '', side === 'front' ? 'Front' : 'Back');
            label.htmlFor = input.id;
            preview.append(input, label);
            return input;
        });
        for (const side of ['front', 'back']) {
            const link = element('a', `preview-image preview-${side}`);
            link.setAttribute('aria-label', `Enlarge ${deck.title} card ${side}`);
            const img = element('img');
            img.loading = 'lazy';
            link.append(img);
            preview.append(link);
        }
        const heading = element('h3');
        const source = element('a', '', deck.title);
        source.href = deck.source;
        heading.append(source);
        const footer = element('div', 'deck-footer');
        const description = element('p', '', deck.description);
        const downloadRow = element('p');
        const download = element('a', 'deck-download gallery-icon');
        download.href = deck.download;
        download.setAttribute('aria-label', `Download ${deck.title} .apkg`);
        download.title = 'Download .apkg';
        download.append(icon('download'));
        downloadRow.append(download);
        footer.append(description, downloadRow);
        card.append(preview, heading, footer);
        return { card, inputs, slug: deck.slug, title: deck.title,
            types: deck.previews, index: 0, side: 'front' };
    }

    function validateCatalog(catalog) {
        if (catalog.version !== 1 || !Array.isArray(catalog.decks) || !catalog.decks.length) {
            throw new Error('Invalid deck catalogue');
        }
        const slugs = new Set();
        return catalog.decks.map(deck => {
            if (typeof deck.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(deck.slug) || slugs.has(deck.slug) ||
                !['title', 'description', 'download', 'source'].every(key => typeof deck[key] === 'string') ||
                ![deck.noteCount, deck.cardCount].every(value => Number.isInteger(value) && value > 0) ||
                !Array.isArray(deck.previews) || !deck.previews.length) {
                throw new Error('Invalid deck entry');
            }
            slugs.add(deck.slug);
            return { ...deck, download: resolveURL(deck.download), source: resolveURL(deck.source),
                previews: deck.previews.map(type => {
                    if (!['name', 'front', 'back'].every(key => typeof type[key] === 'string') ||
                        ![type.width, type.height].every(value => Number.isInteger(value) && value > 0)) {
                        throw new Error('Invalid card preview');
                    }
                    return { ...type, front: resolveURL(type.front), back: resolveURL(type.back) };
                }) };
        });
    }

    function initializeGallery(decks) {
        const states = decks.map(deckCard);
        gallery.replaceChildren(...states.map(state => state.card));
        const dialog = element('dialog', 'deck-lightbox');
        dialog.setAttribute('aria-label', 'Anki card gallery');
        const header = element('header', 'lightbox-header');
        const select = element('select');
        select.setAttribute('aria-label', 'Choose a deck');
        states.forEach(state => select.add(new Option(state.title, state.slug)));
        header.append(select, button('Close gallery', 'close', () => dialog.close()));
        const image = element('div', 'lightbox-image');
        const enlarged = element('img');
        enlarged.alt = '';
        image.append(enlarged);
        const sides = element('div', 'lightbox-sides');
        sides.setAttribute('role', 'group');
        sides.setAttribute('aria-label', 'Card side');
        for (const side of ['front', 'back']) {
            const control = element('button', '', side === 'front' ? 'Front' : 'Back');
            control.type = 'button';
            control.dataset.side = side;
            sides.append(control);
        }
        const lightboxNavigation = element('div', 'lightbox-navigation');
        dialog.append(header, image, sides, lightboxNavigation);
        document.body.append(dialog);
        let active = null;

        function navigation(state) {
            const nav = element('div', 'type-controls');
            const dots = element('div', 'type-dots');
            dots.setAttribute('role', 'group');
            dots.setAttribute('aria-label', `${state.title} card types`);
            state.types.forEach((type, index) => {
                const dot = element('button');
                dot.type = 'button';
                dot.title = type.name;
                dot.setAttribute('aria-label', type.name);
                dot.dataset.index = index;
                dot.addEventListener('click', () => { state.index = index; update(state); });
                dots.append(dot);
            });
            const label = element('div', 'type-name');
            label.setAttribute('aria-live', 'polite');
            nav.append(button('Previous card type', 'chevron-left', () => move(state, -1)), dots,
                button('Next card type', 'chevron-right', () => move(state, 1)), label);
            return nav;
        }

        function move(state, direction) {
            state.index = (state.index + direction + state.types.length) % state.types.length;
            update(state);
        }

        function updateNav(nav, state) {
            nav.querySelector('.type-name').textContent = state.types[state.index].name;
            nav.querySelectorAll('[data-index]').forEach(dot => {
                dot.setAttribute('aria-pressed', String(Number(dot.dataset.index) === state.index));
            });
        }

        function update(state) {
            const type = state.types[state.index];
            for (const side of ['front', 'back']) {
                const link = state.card.querySelector(`.preview-${side}`);
                const img = link.querySelector('img');
                link.href = type[side];
                img.src = type[side];
                img.alt = `${state.title}: ${type.name}, ${side}`;
                img.width = type.width;
                img.height = type.height;
            }
            state.inputs.forEach(input => { input.checked = input.value === state.side; });
            updateNav(state.nav, state);
            if (active === state && dialog.open) {
                enlarged.src = type[state.side];
                enlarged.alt = `${state.title}: ${type.name}, ${state.side}`;
                enlarged.width = type.width;
                enlarged.height = type.height;
                sides.querySelectorAll('[data-side]').forEach(control => {
                    control.setAttribute('aria-pressed', String(control.dataset.side === state.side));
                });
                updateNav(lightboxNavigation.querySelector('.type-controls'), state);
            }
        }

        function show(state) {
            active = state;
            select.value = state.slug;
            lightboxNavigation.replaceChildren(navigation(state));
            if (!dialog.open) dialog.showModal();
            update(state);
        }

        states.forEach(state => {
            state.nav = navigation(state);
            state.card.querySelector('.deck-preview').after(state.nav);
            state.inputs.forEach(input => input.addEventListener('change', () => {
                state.side = input.value;
                update(state);
            }));
            state.card.querySelectorAll('.preview-image').forEach(link => link.addEventListener('click', event => {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                show(state);
            }));
            update(state);
        });
        select.addEventListener('change', () => show(states.find(state => state.slug === select.value)));
        sides.querySelectorAll('[data-side]').forEach(control => control.addEventListener('click', () => {
            active.side = control.dataset.side;
            update(active);
        }));
        dialog.addEventListener('click', event => {
            if (event.target !== dialog) return;
            const bounds = dialog.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right ||
                event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
        });
        dialog.addEventListener('keydown', event => {
            if (event.target === select) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                move(active, event.key === 'ArrowLeft' ? -1 : 1);
            }
        });
        positionDownloads();
    }

    function showError() {
        const message = element('p', 'gallery-status');
        message.setAttribute('role', 'status');
        message.append(document.createTextNode('The deck gallery could not load. '));
        const link = element('a', '', 'Open the deck catalogue');
        link.href = catalogURL.href;
        message.append(link, document.createTextNode(' or browse the source files on '));
        const repository = element('a', '', 'GitHub');
        repository.href = 'https://github.com/AK1089/anki-decks';
        message.append(repository, document.createTextNode('.'));
        const retry = element('button', 'gallery-retry', 'Retry');
        retry.type = 'button';
        retry.addEventListener('click', () => { retry.disabled = true; load(); });
        message.append(retry);
        gallery.replaceChildren(message);
    }

    async function load() {
        gallery.setAttribute('aria-busy', 'true');
        try {
            const response = await fetch(catalogURL);
            if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
            const decks = validateCatalog(await response.json());
            initializeGallery(decks);
        } catch (error) {
            console.error('Anki gallery:', error);
            showError();
        } finally {
            gallery.setAttribute('aria-busy', 'false');
        }
    }
    load();
})();

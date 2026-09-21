(() => {
    document.querySelectorAll('.deck-footer').forEach(footer => {
        const text = footer.querySelector('p');
        const download = footer.querySelector('.deck-download');
        const positionDownload = () => {
            const bounds = text.getBoundingClientRect();
            const button = download.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(text);
            let top = Math.max(0, bounds.height - button.height);
            // Only lines reaching the button's column constrain its vertical position.
            for (const rect of range.getClientRects()) {
                if (rect.right > bounds.right - button.width - 8) {
                    top = Math.max(top, rect.bottom - bounds.top + 4);
                }
            }
            footer.style.setProperty('--download-top', `${top}px`);
            footer.style.minHeight = `${Math.max(bounds.height, top + button.height)}px`;
            footer.classList.add('download-positioned');
        };
        new ResizeObserver(positionDownload).observe(text);
        document.fonts.ready.then(positionDownload);
    });

    const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="/assets/icons/sprite.svg#${name}"></use></svg>`;
    const button = (label, symbol, action) => {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'gallery-icon';
        element.title = label;
        element.setAttribute('aria-label', label);
        element.innerHTML = icon(symbol);
        element.addEventListener('click', action);
        return element;
    };

    async function init() {
        const response = await fetch(new URL('previews.json', document.currentScript?.src || location.href));
        if (!response.ok) throw new Error('Could not load card previews');
        const previews = await response.json();
        const states = [...document.querySelectorAll('.deck-card')].map(card => {
            const inputs = [...card.querySelectorAll('input[type="radio"]')];
            const slug = inputs[0].name.replace(/-side$/, '');
            return { card, inputs, slug, title: card.querySelector('h3').textContent,
                types: previews[slug], index: 0, side: inputs.find(input => input.checked).value };
        });

        const dialog = document.createElement('dialog');
        dialog.className = 'deck-lightbox';
        dialog.setAttribute('aria-label', 'Anki card gallery');
        dialog.innerHTML = `<header class="lightbox-header"><select aria-label="Choose a deck"></select></header>
            <div class="lightbox-image"><img alt=""></div>
            <div class="lightbox-sides" role="group" aria-label="Card side"><button type="button" data-side="front">Front</button><button type="button" data-side="back">Back</button></div>
            <div class="lightbox-navigation"></div>`;
        document.body.append(dialog);
        const select = dialog.querySelector('select');
        states.forEach(state => select.add(new Option(state.title, state.slug)));
        dialog.querySelector('header').append(button('Close gallery', 'close', () => dialog.close()));
        let active = null;

        function navigation(state) {
            const nav = document.createElement('div');
            nav.className = 'type-controls';
            const dots = document.createElement('div');
            dots.className = 'type-dots';
            dots.setAttribute('role', 'group');
            dots.setAttribute('aria-label', `${state.title} card types`);
            state.types.forEach((type, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.title = type.name;
                dot.setAttribute('aria-label', type.name);
                dot.dataset.index = index;
                dot.addEventListener('click', () => { state.index = index; update(state); });
                dots.append(dot);
            });
            const label = document.createElement('div');
            label.className = 'type-name';
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
            }
            state.inputs.forEach(input => { input.checked = input.value === state.side; });
            updateNav(state.nav, state);
            if (active === state && dialog.open) {
                const img = dialog.querySelector('img');
                img.src = type[state.side];
                img.alt = `${state.title}: ${type.name}, ${state.side}`;
                dialog.querySelectorAll('[data-side]').forEach(button => {
                    button.setAttribute('aria-pressed', String(button.dataset.side === state.side));
                });
                updateNav(dialog.querySelector('.type-controls'), state);
            }
        }

        function show(state) {
            active = state;
            select.value = state.slug;
            dialog.querySelector('.lightbox-navigation').replaceChildren(navigation(state));
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
        dialog.querySelectorAll('[data-side]').forEach(button => button.addEventListener('click', () => {
            active.side = button.dataset.side;
            update(active);
        }));
        dialog.addEventListener('click', event => {
            if (event.target !== dialog) return;
            const bounds = dialog.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
        });
        dialog.addEventListener('keydown', event => {
            if (event.target === select) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                move(active, event.key === 'ArrowLeft' ? -1 : 1);
            }
        });
    }
    init().catch(error => console.error('Anki gallery:', error));
})();

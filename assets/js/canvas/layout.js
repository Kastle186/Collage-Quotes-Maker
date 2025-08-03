/*
 * ************************ *
 * Layouts Class Definition *
 * ************************ *
 */

'use strict';

/**
 * @typedef {import('./canvas.js').CollageCanvas} CollageCanvas
 * @typedef {import('./imageslot.js').ImageSlot} ImageSlot
 */

export class Layout {
    /** @type {string} */
    #name;

    /** @type {string} */
    #thumbnailPath;

    /** @type {number} */
    #dimX;

    /** @type {number} */
    #dimY;

    /** @type {Layout[]} */
    #customSlots;

    constructor(name, thumbnail, xSlots, ySlots, customSlots) {
        this.#name = name;
        this.#thumbnailPath = thumbnail;
        this.#dimX = xSlots;
        this.#dimY = ySlots;
        this.#customSlots = customSlots;
    }

    get dimX() {
        return this.#dimX;
    }

    get dimY() {
        return this.#dimY;
    }

    get customSlots() {
        return this.#customSlots;
    }

    /**
     * @param {CollageCanvas} theCanvas
     * @returns {HTMLDivElement}
     */
    generateLayoutDivElement(theCanvas) {
        const wrapper = document.createElement('div');
        wrapper.className = 'layout-thumbnail';

        const thumbElem = document.createElement('img');
        thumbElem.src = this.#thumbnailPath;
        thumbElem.alt = `Thumbnail representing the ${this.#name} layout.`;
        thumbElem.dataset.layoutId = this.#name;

        wrapper.addEventListener('mouseenter', () => {
            wrapper.classList.add('hovered');
        });

        wrapper.addEventListener('mouseleave', () => {
            wrapper.classList.remove('hovered');
        });

        wrapper.addEventListener('click', (event) => {
            wrapper.classList.remove('hovered');

            setTimeout(() => {
                if (wrapper.matches(':hover')) {
                    wrapper.classList.add('hovered');
                }
            }, 150);

            const key = event.target.dataset.layoutId;

            if (key)
                theCanvas.drawLayout(this, true);
        });

        wrapper.appendChild(thumbElem);
        return wrapper;
    }
}
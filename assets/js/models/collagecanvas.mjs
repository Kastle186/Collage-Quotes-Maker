// File: collagecanvas.mjs

import ImageSlot from './imageslot.mjs';

/** @typedef {import('./gridlayout.mjs').GridLayout} GridLayout */

class CollageCanvas {

    /** @type {HTMLElement} */
    #canvasHtmlObj;

    /** @type {HTMLElement} */
    #gridHtmlObj;

    /** @type {number} */
    #width = 0;

    /** @type {number} */
    #height = 0;

    /** @type {GridLayout | null} */
    #layout;

    /** @type {ImageSlot[]} */
    #slots;

    /** @type {number} */
    #selectedSlotIndex;

    /**
     * Create a CollageCanvas object, which controls the core of the app.
     *
     * @param {number} width
     * @param {number} height
     */

    constructor(width, height) {
        this.#canvasHtmlObj = document.querySelector('.the-canvas');
        this.#gridHtmlObj = document.querySelector('.the-grid');

        this.#layout = null;
        this.#slots = [];
        this.#selectedSlotIndex = -1; // -1 means none is selected.

        this.width = width;
        this.height = height;
        this.#configureGridListeners();
    }

    get canvas() {
        return this.#canvasHtmlObj;
    }

    get grid() {
        return this.#gridHtmlObj;
    }

    set width(newWidth) {
        this.#width = parseInt(newWidth);
        this.#canvasHtmlObj.style.width = `${newWidth}px`;
        this.#renderCanvas();
    }

    set height(newHeight) {
        this.#height = parseInt(newHeight);
        this.#canvasHtmlObj.style.height = `${newHeight}px`;
        this.#renderCanvas();
    }

    /**
     * Updates the layout of the canvas to the one selected by the user, and
     * resets the canvas (Later on, we might look to implement it keeping the
     * images added so far, if the new layout has equal or more slots than
     * the previous one).
     *
     * @param {GridLayout} newLayout
     */

    updateLayout(newLayout) {
        this.#slots.length = 0;
        this.#layout = newLayout;

        // Generate the slot elements that will be later populated with either
        // the empty slot notation ("Click to add image"), or the image added
        // previously, if any.

        this.#gridHtmlObj.style.gridTemplateRows =
            `repeat(${newLayout.rows}, 1fr)`;

        this.#gridHtmlObj.style.gridTemplateColumns =
            `repeat(${newLayout.columns}, 1fr)`;

        this.#gridHtmlObj.innerHTML = '';

        const totalSlots = this.#layout.rows * this.#layout.columns;
        const slotWidth = Math.trunc(this.#width / newLayout.rows);
        const slotHeight = Math.trunc(this.#height / newLayout.columns);

        // Create the <div> element that will contain each slot, as that's how
        // browsers can render them on-screen.

        for (let i = 0; i < totalSlots; i++) {
            const divElem = document.createElement('div');
            divElem.className = 'slot';
            divElem.dataset.index = i.toString();
            this.#slots[i] = new ImageSlot(divElem, null, slotWidth, slotHeight);
        }

        this.#renderCanvas();
    }

    /**
     * Draws each slot onto the canvas by appending their <div> objects to
     * the grid general <div> (class='the-grid' in index.html).
     */

    #renderCanvas() {
        this.#slots.forEach((slot) => {
            if (slot.imgObj) {
                slot.htmlObj.replaceChildren(slot.imgObj.cloneNode());
                slot.htmlObj.classList.add('has-image');
            }

            this.#gridHtmlObj.appendChild(slot.htmlObj);
        });
    }

    #configureGridListeners() {
        const fileInput = document.getElementById('img-input');

        // Configure the invisible upload button to prompt the user to pick
        // the image they want to set to the slot they clicked.

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file || this.#selectedSlotIndex === -1) return ;

            const imgObj = new Image();
            const selectedSlot = this.#slots[this.#selectedSlotIndex];

            imgObj.onload = () => {
                selectedSlot.imgObj = imgObj;
                this.#renderCanvas();
            };

            imgObj.src = URL.createObjectURL(file);
            fileInput.value = '';
            this.#selectedSlotIndex = -1;
        });

        // Configure the grid to call the click event to trigger the invisible
        // upload button, and set the selected image to the clicked slot.

        this.#gridHtmlObj.addEventListener('click', (evt) => {
            const slot = evt.target.closest('.slot');
            if (!slot) return ;

            slot.classList.add('click-animate');

            slot.addEventListener('animationend', () => {
                slot.classList.remove('click-animate');
            }, { once: true });

            this.#selectedSlotIndex = parseInt(slot.dataset.index);
            fileInput.click();
        });
    }
}

export default CollageCanvas;

/*
 * *********************** *
 * Canvas Class Definition *
 * *********************** *
 */

'use strict';

import {
    DEFAULT_BG_COLOR,
    DEFAULT_FRAME_COLOR,
    DEFAULT_HEIGHT,
    DEFAULT_SPACING,
    DEFAULT_WIDTH,
} from '../constants.js'

import { makeUploadOnChangeHandler } from '../utils.js';
import { ImageSlot } from './imageslot.js';

// FIXME: When changing layouts, the frame color is not retained, and is returned
//        to the default blue.

/**
 * @typedef {import('./layout.js').Layout} Layout
 */

export class CollageCanvas {
    /** @type {HTMLCanvasElement} */
    #canvasObj;

    /** @type {CanvasRenderingContext2D} */
    #canvasCtx;

    /** @type {string} */
    #bgColor;

    /** @type {string} */
    #frameColor;

    /** @type {Layout} */
    #layout;

    /** @type {ImageSlot[]} */
    #slots;

    /** @type {number} */
    #spacing;

    /** @type {boolean} */
    #isSlotAnimating;

    constructor() {
        this.#canvasObj = null;
        this.#canvasCtx = null;
        this.#bgColor = DEFAULT_BG_COLOR;
        this.#frameColor = DEFAULT_FRAME_COLOR;
        this.#layout = null;
        this.#slots = [];
        this.#spacing = DEFAULT_SPACING;
        this.#isSlotAnimating = false;
    }

    /**
     * Initializes canvas class instance and the HTML canvas object's event listeners.
     */
    initialize() {
        this.#canvasObj = document.getElementById('the-canvas');
        this.#canvasObj.width = DEFAULT_WIDTH;
        this.#canvasObj.height = DEFAULT_HEIGHT;

        document.documentElement.style.setProperty(
            '--canvas-width',
            `${DEFAULT_WIDTH}px`);

        document.documentElement.style.setProperty(
            '--canvas-height',
            `${DEFAULT_HEIGHT}px`);

        this.#canvasCtx = this.#canvasObj.getContext('2d');
        this.#fillBackground();
        this.#createSlotsListeners();
    }

    /**
     * Deletes all slots and leaves a clean canvas with just the current
     * background color.
     * @param {boolean} deleteSlots
     */
    clear(deleteSlots) {
        if (deleteSlots)
            this.#slots = [];

        this.#canvasCtx.clearRect(0, 0, this.#canvasObj.width, this.#canvasObj.height);
        this.#fillBackground();
    }

    /**
     * Render the slots according to the selected layout.
     * @param {Layout | null} theLayout
     * @param {boolean} needsRecalculation
     * @param {boolean} preserveSlots
     */
    drawLayout(theLayout, needsRecalculation, preserveSlots) {
        // The slots will be deleted in #generateSlotsFromLayout() if needed.
        this.clear(!preserveSlots);

        // If we arrived here from a new layout, then update the CollageCanvas
        // object with the new layout's parameters.

        if (theLayout != null)
            this.#layout = theLayout;

        // If we arrived here from selecting a new layout or changed the slots'
        // spacing, then we have to do all the calculations. But if we got here
        // solely from a canvas resize, then we only have to redraw the layout.

        if (needsRecalculation)
            this.#generateSlotsFromLayout();

        for (const slot of this.#slots) {
            slot.calculatePixels(this.#canvasObj.width, this.#canvasObj.height);
            slot.draw(this.#canvasCtx, false);
        }
    }

    /**
     * Updates the value of the specified property of the canvas.
     * @param {string} property
     * @param {number | string} newValue
     */
    update(property, newValue) {
        let spacingChanged = false;
        let frameColorChanged = false;

        switch (property) {
            case 'width':
            case 'height':
                newValue = Math.max(newValue, 1);
                document.documentElement.style.setProperty(
                    `--canvas-${property}`,
                    `${newValue}px`);

                this.#canvasObj[property] = newValue;
                break;

            case 'spacing':
                this.#spacing = Math.max(newValue, 0.01);
                spacingChanged = true;
                break;

            case 'bg-color':
                this.#bgColor = newValue;
                break;

            case 'frame-color':
                this.#frameColor = newValue;
                frameColorChanged = true;
                break;

            default:
                console.warn(`Unknown canvas property value received: ${property}`);
                return ;
        }

        if (this.#slots.length > 0)
            this.drawLayout(null, spacingChanged || frameColorChanged, true);
    }

    /**
     *
     */
    #animateSlots() {
        const animationParams = {
            needsRedraw: false,
            isInProgress: false
        };

        for (const slot of this.#slots)
            slot.calculateNextAnimationScale(animationParams);

        if (animationParams.needsRedraw)
            this.drawLayout(null, false, true);

        if (animationParams.isInProgress) {
            requestAnimationFrame(() => this.#animateSlots());
        }
        else {
            this.#isSlotAnimating = false;
        }
    }

    /**
     * Initializes the listeners in charge of the slots' functions:
     * - Zoom in/out animation when the cursor hovers/leaves the area.
     * - Set the image uploaded by the user when clicked.
     */
    #createSlotsListeners() {
        const uploadButton = document.getElementById('upload-layer');

        this.#canvasObj.addEventListener('click', (event) => {
            const rect = this.#canvasObj.getBoundingClientRect();
            const clickedX = event.clientX - rect.left;
            const clickedY = event.clientY - rect.top;

            const clickedImgSlot = this.#slots.find(s =>
                s.hasMouseOver(clickedX, clickedY)
            );

            if (clickedImgSlot) {
                uploadButton.onchange = makeUploadOnChangeHandler(
                    clickedImgSlot,
                    this.#canvasCtx
                );
                uploadButton.click();
            }
        });

        this.#canvasObj.addEventListener('mousemove', (event) => {
            const rect = this.#canvasObj.getBoundingClientRect();
            const cursorX = event.clientX - rect.left;
            const cursorY = event.clientY - rect.top;

            let didStateChange = false;

            // We check for all slots here, as opposed to just for the first one
            // in the click event, since more than one slot might be in animation
            // state at the same time. For example, the mouse slides quickly from
            // one to another. There will be a fraction of a second where one is
            // zooming out and the other is zooming in.

            for (const slot of this.#slots) {
                const isSlotNowHovered = slot.hasMouseOver(cursorX, cursorY);

                if (slot.isHovered !== isSlotNowHovered) {
                    didStateChange = true;
                    slot.isHovered = isSlotNowHovered;
                }
            }

            if (didStateChange && !this.#isSlotAnimating) {
                this.#isSlotAnimating = true;
                requestAnimationFrame(() => this.#animateSlots());
            }
        });
    }

    /**
     * Renders a rectangle the size of the canvas with the currently set
     * background color.
     */
    #fillBackground() {
        this.#canvasCtx.fillStyle = this.#bgColor;
        this.#canvasCtx.fillRect(0, 0, this.#canvasObj.width, this.#canvasObj.height);
    }

    /**
     * Calculate the dimensions for each slot of the given layout, and render
     * them into the canvas.
     */
    #generateSlotsFromLayout() {
        if (this.#layout.customSlots == null || this.#layout.customSlots.length === 0) {
            this.#generateUniformSlots();
        }
        else {
            this.#generateCustomSlots();
        }
    }

    /**
     *
     */
    #generateCustomSlots() {
        // FUTURE FEATURE!
        // Custom Layout!
        console.log('Future Feature! Custom Layouts!');
    }

    /**
     *
     */
    #generateUniformSlots() {
        // Uniform Layout!
        const numSlotsX = this.#layout.dimX;
        const numSlotsY = this.#layout.dimY;

        // Generate the pattern from the dimensions' information (percentage).
        // The formula is the following:
        // slotDimSize = (canvas / numSlots) - spacing - (spacing / numSlots)

        const slotWidthPct =
            (1.0 / numSlotsX) - this.#spacing - (this.#spacing / numSlotsX);
        const slotHeightPct =
            (1.0 / numSlotsY) - this.#spacing - (this.#spacing / numSlotsY);

        let count = 0;

        for (let i = 0; i < numSlotsX; i++) {
            let xStartPct = this.#spacing + ((this.#spacing + slotWidthPct) * i);
            let yStartPct = 0;

            for (let j = 0; j < numSlotsY; j++) {
                yStartPct += this.#spacing;

                // If there are already slots in the canvas, then we know we only
                // need to update their parameters. Otherwise, it means we are
                // working with a clear canvas and need to create the slots.

                if (count < this.#slots.length) {
                    this.#slots[count].update(
                        xStartPct,
                        yStartPct,
                        slotWidthPct,
                        slotHeightPct,
                        this.#frameColor
                    );
                }
                else {
                    const slotObj = new ImageSlot(
                        xStartPct,
                        yStartPct,
                        slotWidthPct,
                        slotHeightPct
                    );

                    this.#slots.push(slotObj);
                }

                yStartPct += slotHeightPct;
                count++;
            }
        }
    }
}

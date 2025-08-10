/*
 * *********************** *
 * Canvas Class Definition *
 * *********************** *
 */

'use strict';

import * as Constants from '../constants.js';
import { makeUploadOnChangeHandler } from "../utils.js";
import { ImageSlot } from "./imageslot.js";

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

    /** @type {Layout} */
    #layout;

    /** @type {ImageSlot[]} */
    #slots;

    /** @type {number} */
    #spacing;

    constructor() {
        this.#canvasObj = null;
        this.#canvasCtx = null;
        this.#bgColor = Constants.DEFAULT_BG_COLOR;
        this.#layout = null;
        this.#slots = [];
        this.#spacing = Constants.DEFAULT_SPACING;
    }

    get slots() {
        return this.#slots;
    }

    /**
     *
     */
    initialize() {
        this.#canvasObj = document.getElementById('the-canvas');
        this.#canvasObj.width = Constants.DEFAULT_WIDTH;
        this.#canvasObj.height = Constants.DEFAULT_HEIGHT;

        document.documentElement.style.setProperty(
            '--canvas-width',
            `${Constants.DEFAULT_WIDTH}px`);

        document.documentElement.style.setProperty(
            '--canvas-height',
            `${Constants.DEFAULT_HEIGHT}px`);

        this.#canvasCtx = this.#canvasObj.getContext('2d');
        this.#fillBackground();
        this.#createSlotsListeners();
    }

    /**
     * @param {boolean} deleteSlots
     */
    clear(deleteSlots) {
        if (deleteSlots)
            this.#slots = [];

        this.#canvasCtx.clearRect(0, 0, this.#canvasObj.width, this.#canvasObj.height);
        this.#fillBackground();
    }

    /**
     * @param {Layout | null} theLayout
     * @param {boolean} needsRecalculation
     */
    drawLayout(theLayout, needsRecalculation) {
        // FIXME: When we get here from a change of spacing, the images in the
        //        slots are erased instead of resized with their respective slots.

        // The slots will be deleted in #generateSlotsFromLayout() if needed.
        this.clear(false);

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
            slot.draw(this.#canvasCtx);
        }
    }

    /**
     * @param {string} property
     * @param {number | string} newValue
     */
    update(property, newValue) {
        let spacingChanged = false;

        switch (property) {
            case 'width':
            case 'height':
                newValue = Math.max(newValue, 1);
                document.documentElement.style.setProperty(
                    `--canvas-${property}`,
                    `${newValue}px`);

                if (property === 'width')
                    this.#canvasObj.width = newValue;
                if (property === 'height')
                    this.#canvasObj.height = newValue;
                break;

            case 'spacing':
                this.#spacing = Math.max(newValue, 0.01);
                spacingChanged = true;
                break;

            case 'bg-color':
                this.#bgColor = newValue;
                break;

            case 'frame-color':
                break;

            default:
                console.log(`Unknown canvas property value received: ${property}`);
                return ;
        }

        if (this.#slots.length > 0)
            this.drawLayout(null, spacingChanged);
    }

    /**
     *
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

        let isSlotAnimationRunning = false;

        /**
         * @param {CollageCanvas} theCanvas
         */
        function animateSlots(theCanvas) {
            const animationParams = {
                needsRedraw: false,
                isInProgress: false
            };

            for (const s of theCanvas.slots)
                s.calculateNextAnimationScale(animationParams);

            if (animationParams.needsRedraw)
                theCanvas.drawLayout(null, false);

            if (animationParams.isInProgress) {
                requestAnimationFrame(() => animateSlots(theCanvas));
            }
            else {
                isSlotAnimationRunning = false;
            }
        }

        this.#canvasObj.addEventListener('mousemove', (event) => {
            const rect = this.#canvasObj.getBoundingClientRect();
            const cursorX = event.clientX - rect.left;
            const cursorY = event.clientY - rect.top;

            let didStateChange = false;

            for (const slot of this.#slots) {
                const isSlotNowHovered = slot.hasMouseOver(cursorX, cursorY);

                if (slot.isHovered !== isSlotNowHovered) {
                    didStateChange = true;
                    slot.isHovered = isSlotNowHovered;
                }
            }

            if (didStateChange && !isSlotAnimationRunning) {
                isSlotAnimationRunning = true;
                requestAnimationFrame(() => animateSlots(this));
            }
        });
    }

    /**
     *
     */
    #fillBackground() {
        this.#canvasCtx.fillStyle = this.#bgColor;
        this.#canvasCtx.fillRect(0, 0, this.#canvasObj.width, this.#canvasObj.height);
    }

    /**
     *
     */
    #generateSlotsFromLayout() {
        this.#slots = [];

        if (this.#layout.customSlots == null || this.#layout.customSlots.length === 0) {
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

            for (let i = 0; i < numSlotsX; i++) {
                let xStartPct = this.#spacing + ((this.#spacing + slotWidthPct) * i);
                let yStartPct = 0;

                for (let j = 0; j < numSlotsY; j++) {
                    yStartPct += this.#spacing;

                    const slotObj = new ImageSlot(
                        xStartPct,
                        yStartPct,
                        slotWidthPct,
                        slotHeightPct);

                    this.#slots.push(slotObj);
                    yStartPct += slotHeightPct;
                }
            }
        }
        else {
            // FUTURE FEATURE!
            // Custom Layout!
            console.log('Future Feature! Custom Layouts!');
        }
    }
}

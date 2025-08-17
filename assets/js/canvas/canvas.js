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

    /** @type {boolean} */
    #isSlotAnimating;

    /** @type {ImageSlot} */
    #selectedSlot;

    constructor() {
        this.#canvasObj = null;
        this.#canvasCtx = null;
        this.#bgColor = Constants.DEFAULT_BG_COLOR;
        this.#layout = null;
        this.#slots = [];
        this.#spacing = Constants.DEFAULT_SPACING;
        this.#isSlotAnimating = false;
        this.#selectedSlot = null;
    }

    /**
     * Initializes canvas class instance and the HTML canvas object's event listeners.
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
     * Updates the value of the specified property of the canvas.
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
                console.log('Frame color customization coming soon!');
                break;

            default:
                console.warn(`Unknown canvas property value received: ${property}`);
                return ;
        }

        if (this.#slots.length > 0)
            this.drawLayout(null, spacingChanged);
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
            this.drawLayout(null, false);

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
                if (clickedImgSlot.isSelected) {
                    uploadButton.onchange = makeUploadOnChangeHandler(
                        clickedImgSlot,
                        this.#canvasCtx
                    );
                    uploadButton.click();
                }
                else {
                    clickedImgSlot.isSelected = true;

                    // ENHANCEME: Check if we can merge this #selectedSlot !== null
                    //            condition with the one in the else if afterwards.
                    if (this.#selectedSlot !== null) {
                        this.#selectedSlot.isSelected = false;
                    }

                    this.#selectedSlot = clickedImgSlot;
                    this.drawLayout(null, false);
                }
            }
            else if (this.#selectedSlot !== null) {
                this.#selectedSlot.isSelected = false;
                this.#selectedSlot = null;
                this.drawLayout(null, false);
            }
        });

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
        this.#slots = [];

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
}

// let selectedRect = null;
//
// canvas.addEventListener("click", function(e) {
//     const { offsetX, offsetY } = e;
//     let clickedSomething = false;
//
//     for (const rect of rectangles) {
//         if (isInsideRect(offsetX, offsetY, rect)) {
//             if (selectedRect === rect) {
//                 // Deselect if already selected
//                 selectedRect = null;
//             } else {
//                 selectedRect = rect;
//             }
//             clickedSomething = true;
//             drawAll();
//             break;
//         }
//     }
//
//     // Optional: deselect if clicked outside any rectangle
//     if (!clickedSomething) {
//         selectedRect = null;
//         drawAll();
//     }
// });

// function drawAll() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//     for (const rect of rectangles) {
//         // Set glow for selected
//         if (rect === selectedRect) {
//             ctx.shadowBlur = 10;
//             ctx.shadowColor = selectedBorderColor;
//         } else {
//             ctx.shadowBlur = 0;
//             ctx.shadowColor = "transparent";
//         }
//
//         // Draw fill
//         ctx.fillStyle = rect.fill || "#ddd";
//         ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
//
//         // Draw border
//         ctx.strokeStyle = rect === selectedRect ? selectedBorderColor : "#000";
//         ctx.lineWidth = rect === selectedRect ? 3 : 1;
//         ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
//     }
//
//     // Always reset
//     ctx.shadowBlur = 0;
//     ctx.shadowColor = "transparent";
// }

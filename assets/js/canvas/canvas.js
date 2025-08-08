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
     * @param {number|string} newValue
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

            const imgSlotClicked = this.#slots.find(s =>
                s.hasMouseOver(clickedX, clickedY)
            );

            if (imgSlotClicked) {
                uploadButton.onchange = makeUploadOnChangeHandler(
                    imgSlotClicked,
                    this.#canvasCtx
                );
                uploadButton.click();
            }
        });

        this.#canvasObj.addEventListener('mousemove', (event) => {
            console.log(`Slots animations coming soon!`);
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
        }
    }
}

// <canvas id="myCanvas" width="600" height="400" style="border:1px solid black;"></canvas>
//
// <script>
// const canvas = document.getElementById("myCanvas");
// const ctx = canvas.getContext("2d");
//
// // 🟥 Define rectangles with position, size, current scale, target scale, and hover state
// const rectangles = [
//     { x: 100, y: 100, width: 100, height: 80, scale: 1, targetScale: 1, hovered: false },
//     { x: 250, y: 150, width: 120, height: 90, scale: 1, targetScale: 1, hovered: false }
// ];
//
// // 🖱 Track the mouse position relative to the canvas
// let mouse = { x: 0, y: 0 };
//
// // 🕹 Flag to control whether an animation is currently running
// let animationRunning = false;
//
// /**
//  * 🔍 Helper to check if the mouse is currently over a given rectangle.
//  * We take into account the current scale to detect hover accurately.
//  */
// function isMouseOver(rect) {
//     const scaledW = rect.width * rect.scale;
//     const scaledH = rect.height * rect.scale;
//     const offsetX = (scaledW - rect.width) / 2;
//     const offsetY = (scaledH - rect.height) / 2;
//
//     return (
//         mouse.x >= rect.x - offsetX &&
//         mouse.x <= rect.x + rect.width + offsetX &&
//         mouse.y >= rect.y - offsetY &&
//         mouse.y <= rect.y + rect.height + offsetY
//     );
// }
//
// /**
//  * 🧠 Check whether any hover states have changed.
//  * If so, update the target scale and trigger the animation loop.
//  */
// function updateHoverStates() {
//     let stateChanged = false;
//
//     for (let rect of rectangles) {
//         const isHovered = isMouseOver(rect);
//
//         if (rect.hovered !== isHovered) {
//             rect.hovered = isHovered;
//             rect.targetScale = isHovered ? 1.1 : 1.0;
//             stateChanged = true;
//         }
//     }
//
//     // Start animation only if needed
//     if (stateChanged && !animationRunning) {
//         animationRunning = true;
//         requestAnimationFrame(animate);
//     }
// }
//
// /**
//  * 🧩 Animate the rectangles by easing their scale values toward the target.
//  * If there's no more change needed, stop the loop to save performance.
//  */
// function animate() {
//     let needsRedraw = false;
//     let animating = false;
//
//     for (let rect of rectangles) {
//         const diff = rect.targetScale - rect.scale;
//
//         if (Math.abs(diff) > 0.001) {
//             rect.scale += diff * 0.1; // simple easing
//             needsRedraw = true;
//             animating = true;
//         } else {
//             // Snap to target to prevent jitter
//             if (rect.scale !== rect.targetScale) {
//                 rect.scale = rect.targetScale;
//                 needsRedraw = true;
//             }
//         }
//     }
//
//     // Redraw only if something actually changed
//     if (needsRedraw) draw();
//
//     // Continue animating if still in motion
//     if (animating) {
//         requestAnimationFrame(animate);
//     } else {
//         animationRunning = false;
//     }
// }
//
// /**
//  * 🖼 Redraw the entire canvas with the current rectangle states.
//  * Takes into account the scaling and centers the scaled rectangles properly.
//  */
// function draw() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//     for (let rect of rectangles) {
//         const scaledW = rect.width * rect.scale;
//         const scaledH = rect.height * rect.scale;
//         const offsetX = (scaledW - rect.width) / 2;
//         const offsetY = (scaledH - rect.height) / 2;
//
//         ctx.strokeRect(
//             rect.x - offsetX,
//             rect.y - offsetY,
//             scaledW,
//             scaledH
//         );
//     }
// }
//
// /**
//  * 🖱 Event listener for mouse movement.
//  * Converts the browser coordinates to canvas coordinates and updates hover state.
//  */
// canvas.addEventListener("mousemove", (e) => {
//     const rect = canvas.getBoundingClientRect();
//     mouse.x = e.clientX - rect.left;
//     mouse.y = e.clientY - rect.top;
//
//     updateHoverStates();
// });
//
// // 🟢 Initial render (only happens once at the start)
// draw();
// </script>

/*
 * ******************** *
 * Canvas Configuration *
 * ******************** *
 */

import { makeUploadOnChangeHandler } from "./utils.js";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const DEFAULT_SPACING = 0.05;

class ImageSlot {
    #xPx = 0;
    #yPx = 0;
    #widthPx = 0;
    #heightPx = 0;

    constructor(originX, originY, width, height, image = null) {
        // We're keeping the percents public because a future feature will be
        // to allow the user to resize slots individually. In that case, we will
        // need to set these properties from elsewhere.

        this.xPct = originX;
        this.yPct = originY;
        this.widthPct = width;
        this.heightPct = height;
        this.image = image;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        this.#drawFrame(ctx, "blue");
        this.#drawImage(ctx);
    }

    // We need this function and the pixel values because strokeRect() only allows
    // dimensions in pixels. We originally save them in fractions of 1.0 because it
    // is easier to just recalculate the pixels whenever there are changes in the
    // canvas' dimensions or slots' spacing.
    calculatePixels(canvasWidth, canvasHeight) {
        this.#xPx = this.xPct * canvasWidth;
        this.#yPx = this.yPct * canvasHeight;
        this.#widthPx = this.widthPct * canvasWidth;
        this.#heightPx = this.heightPct * canvasHeight;
    }

    wasClicked(clickX, clickY) {
        return clickX >= this.#xPx &&
            clickX <= this.#xPx + this.#widthPx &&
            clickY >= this.#yPx &&
            clickY <= this.#yPx + this.#heightPx;
    }

    #drawFrame(ctx, color) {
        ctx.strokeStyle = color;
        ctx.strokeRect(this.#xPx, this.#yPx, this.#widthPx, this.#heightPx);
    }

    #drawImage(ctx) {
        if (this.image == null)
            return;

        const imgAspectRatio = this.image.width / this.image.height;
        const slotAspectRatio = this.#widthPx / this.#heightPx;

        let resWidth, resHeight, resX, resY;

        // Crop the center section we will be zooming in of the image, to fit
        // the slot's aspect ratio, without deforming it.

        if (imgAspectRatio > slotAspectRatio) {
            resWidth = this.image.height * slotAspectRatio;
            resHeight = this.image.height;
            resX = (this.image.width - resWidth) / 2;
            resY = 0;
        }
        else {
            resWidth = this.image.width;
            resHeight = this.image.width / slotAspectRatio;
            resX = 0;
            resY = (this.image.height - resHeight) / 2;
        }

        ctx.drawImage(this.image, resX, resY, resWidth, resHeight,
            this.#xPx, this.#yPx, this.#widthPx, this.#heightPx);
    }
}

class CollageCanvas {
    #theCanvas;
    #slots;
    #spacing;
    #layout;

    constructor() {
        this.#theCanvas = null;
        this.#slots = [];
        this.#spacing = DEFAULT_SPACING;
        this.#layout = null;
    }

    initialize() {
        this.#theCanvas = document.getElementById("thecanvas");
        this.#theCanvas.width = DEFAULT_WIDTH;
        this.#theCanvas.height = DEFAULT_HEIGHT;

        document.documentElement.style.setProperty("--canvas-width", DEFAULT_WIDTH + "px");
        document.documentElement.style.setProperty("--canvas-height", DEFAULT_HEIGHT + "px");

        const widthInput = document.getElementById("width-txtbx");
        const heightInput = document.getElementById("height-txtbx");
        const spacingInput = document.getElementById("spacing-txtbx");
        const clearButton = document.getElementById("clearbtn");
        const uploadButton = document.getElementById("uploadlayer");

        widthInput.addEventListener('input', () => {
            this.#update(widthInput, heightInput, spacingInput);
        });

        heightInput.addEventListener('input', () => {
            this.#update(widthInput, heightInput, spacingInput);
        });

        spacingInput.addEventListener('input', () => {
            this.#update(widthInput, heightInput, spacingInput);
        });

        clearButton.addEventListener('click', () => {
            this.#slots = [];
            this.#clear();
        });

        this.#theCanvas.addEventListener('click', (evt) => {
            const rect = this.#theCanvas.getBoundingClientRect();
            const clickedX = evt.clientX - rect.left;
            const clickedY = evt.clientY - rect.top;

            const imgSlotClicked = this.#slots.find(s =>
                s.wasClicked(clickedX, clickedY)
            );

            if (imgSlotClicked) {
                uploadButton.onchange = makeUploadOnChangeHandler(
                    imgSlotClicked,
                    this.#theCanvas);
                uploadButton.click();
            }
        });
    }

    drawLayout(layoutParams, needsPercentsCalculation) {
        this.#clear();

        // If we arrived here from a new layout, then update the CollageCanvas
        // object with the new layout's parameters dictionary.

        if (layoutParams != null)
            this.#layout = layoutParams;

        // If we arrived here from selecting a new layout or changed the slots'
        // spacing, then we have to do all the calculations. But if we got here
        // solely from a canvas resize, then we only have to redraw the layout.

        if (needsPercentsCalculation) {
            this.#slots = [];

            if ("customPattern" in this.#layout) {
                // FUTURE FEATURE!
                // Custom Layout!
            }
            else {
                // Uniform Layout!
                const numSlotsX = this.#layout["dimX"];
                const numSlotsY = this.#layout["dimY"];

                // Generate the pattern from the dimensions' information (percentage).
                // The formula is the following:
                // slotDimSize = (canvas / numSlots) - spacing - (spacing / numSlots)

                const slotWidthPct = (1.0 / numSlotsX) - this.#spacing - (this.#spacing / numSlotsX);
                const slotHeightPct = (1.0 / numSlotsY) - this.#spacing - (this.#spacing / numSlotsY);

                for (let i = 0; i < numSlotsX; i++) {
                    let xStartPct = this.#spacing + ((this.#spacing + slotWidthPct) * i);
                    let yStartPct = 0;

                    for (let j = 0; j < numSlotsY; j++) {
                        yStartPct += this.#spacing;

                        const slotObj = new ImageSlot(xStartPct,
                                                                yStartPct,
                                                                slotWidthPct,
                                                                slotHeightPct);

                        this.#slots.push(slotObj);
                        yStartPct += slotHeightPct;
                    }
                }
            }
        }

        for (const slot of this.#slots) {
            slot.calculatePixels(this.#theCanvas.width, this.#theCanvas.height);
            slot.draw(this.#theCanvas);
        }
    }

    #update(widthInput, heightInput, spacingInput) {
        const newWidth = parseInt(widthInput.value, 10) || DEFAULT_WIDTH;
        const newHeight = parseInt(heightInput.value, 10) || DEFAULT_HEIGHT;
        const newSpacing = parseInt(spacingInput.value, 10) / 100.0 || DEFAULT_SPACING;

        const widthChanged = newWidth !== this.#theCanvas.width;
        const heightChanged = newHeight !== this.#theCanvas.height;
        const spacingChanged = newSpacing !== this.#spacing;

        if (widthChanged || heightChanged || spacingChanged) {
            if (widthChanged) {
                this.#theCanvas.width = Math.max(newWidth, 1);
                document.documentElement.style.setProperty(
                    "--canvas-width",
                    this.#theCanvas.width + "px");
            }

            if (heightChanged) {
                this.#theCanvas.height = Math.max(newHeight, 1);
                document.documentElement.style.setProperty(
                    "--canvas-height",
                    this.#theCanvas.height + "px");
            }

            if (spacingChanged)
                this.#spacing = Math.max(newSpacing, 0.01);

            if (this.#slots.length > 0)
                this.drawLayout(null, spacingChanged);
        }
    }

    #clear() {
        const ctx = this.#theCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.#theCanvas.width, this.#theCanvas.height);
    }
}

export const THE_CANVAS = new CollageCanvas();

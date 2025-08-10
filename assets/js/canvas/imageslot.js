/*
 * **************************** *
 * Image Slots Class Definition *
 * **************************** *
 */

'use strict';

import { NORMAL_SCALE, HOVERED_SCALE } from "../constants.js";

export class ImageSlot {
    /** @type {number} */
    #xPct;

    /** @type {number} */
    #yPct;

    /** @type {number} */
    #widthPct;

    /** @type {number} */
    #heightPct;

    /** @type {number} */
    #xPx;

    /** @type {number} */
    #yPx;

    /** @type {number} */
    #widthPx;

    /** @type {number} */
    #heightPx;

    /** @type {CanvasImageSource} */
    #image;

    /** @type {boolean} */
    #isHovered;

    /** @type {number} */
    #currScale;

    /** @type {number} */
    #nextScale;

    /**
     * Creates an ImageSlot object.
     * @param {number} originX
     * @param {number} originY
     * @param {number} width
     * @param {number} height
     * @param {CanvasImageSource} image
     */
    constructor(originX, originY, width, height, image = null) {
        // We're keeping the percents public because a future feature will be
        // to allow the user to resize slots individually. In that case, we will
        // need to set these properties from elsewhere.
        this.#xPct = originX;
        this.#yPct = originY;
        this.#widthPct = width;
        this.#heightPct = height;

        this.#image = image;
        this.#isHovered = false;
        this.#currScale = NORMAL_SCALE;
        this.#nextScale = HOVERED_SCALE;
    }

    get isHovered() {
        return this.#isHovered;
    }

    set image(newImage) {
        this.#image = newImage;
    }

    /**
     * @param {{needsRedraw: boolean, isInProgress: boolean}} params
     */
    calculateNextAnimationScale(params) {
        const diff = this.#nextScale - this.#currScale;

        if (Math.abs(diff) > 0.001) {
            this.#currScale += diff * 0.1;
            params.needsRedraw = true;
            params.isInProgress = true;
        }
        else if (this.#currScale !== this.#nextScale) {
            this.#currScale = this.#nextScale;
            this.#nextScale = this.#nextScale === HOVERED_SCALE ? NORMAL_SCALE : HOVERED_SCALE;
            params.needsRedraw = true;
        }

        this.#scalePixels();
    }

    /**
     * We need this function and the pixel values because strokeRect() only allows
     * dimensions in pixels. We originally save them in fractions of 1.0 because it
     * is easier to just recalculate the pixels whenever there are changes in the
     * canvas' dimensions or slots' spacing.
     *
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     */
    calculatePixels(canvasWidth, canvasHeight) {
        this.#xPx = this.#xPct * canvasWidth;
        this.#yPx = this.#yPct * canvasHeight;
        this.#widthPx = this.#widthPct * canvasWidth;
        this.#heightPx = this.#heightPct * canvasHeight;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        this.#drawFrame(ctx);
        if (this.#image)
            this.#drawImage(ctx);
    }

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     * @returns {boolean}
     */
    hasMouseOver(mouseX, mouseY) {
        return mouseX >= this.#xPx
            && mouseX <= this.#xPx + this.#widthPx
            && mouseY >= this.#yPx
            && mouseY <= this.#yPx + this.#heightPx;
    }

    /**
     *
     */
    toggleHoveredState() {
        this.#isHovered = !this.#isHovered;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    #drawFrame(ctx) {
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(this.#xPx, this.#yPx, this.#widthPx, this.#heightPx);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    #drawImage(ctx) {
        const imgAspectRatio = this.#image.width / this.#image.height;
        const slotAspectRatio = this.#widthPx / this.#heightPx;

        let resWidth, resHeight, resX, resY;

        // Crop the center section we will be zooming in of the image, to fit
        // the slot's aspect ratio, without deforming it.

        if (imgAspectRatio > slotAspectRatio) {
            resWidth = this.#image.height * slotAspectRatio;
            resHeight = this.#image.height;
            resX = (this.#image.width - resWidth) / 2;
            resY = 0;
        }
        else {
            resWidth = this.#image.width;
            resHeight = this.#image.width / slotAspectRatio;
            resX = 0;
            resY = (this.#image.height - resHeight) / 2;
        }

        ctx.drawImage(this.#image, resX, resY, resWidth, resHeight,
            this.#xPx, this.#yPx, this.#widthPx, this.#heightPx);
    }

    /**
     *
     */
    #scalePixels() {
        this.#xPx *= this.#currScale;
        this.#yPx *= this.#currScale;
        this.#widthPx *= this.#currScale;
        this.#heightPx *= this.#currScale;
    }
}
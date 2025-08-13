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

    /**
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
    }

    get isHovered() {
        return this.#isHovered;
    }

    set isHovered(newHoveredState) {
        this.#isHovered = newHoveredState;
    }

    set image(newImage) {
        this.#image = newImage;
    }

    /**
     * Smoothly interpolates scale based on hover state.
     * @param {{needsRedraw: boolean, isInProgress: boolean}} params
     */
    calculateNextAnimationScale(params) {
        const targetScale = this.#isHovered ? HOVERED_SCALE : NORMAL_SCALE;
        const diff = targetScale - this.#currScale;

        if (Math.abs(diff) > 0.001) {
            this.#currScale += diff * 0.1;
            params.needsRedraw = true;
            params.isInProgress = true;
        }
        else if (this.#currScale !== targetScale) {
            this.#currScale = targetScale;
            params.needsRedraw = true;
        }
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
     * Renders the image slot, including image and frame.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.save();

        const centerX = (this.#xPx + this.#widthPx) / 2.0;
        const centerY = (this.#yPx + this.#heightPx) / 2.0;

        ctx.translate(centerX, centerY);
        ctx.scale(this.#currScale, this.#currScale);
        ctx.translate(-centerX, -centerY);

        this.#drawFrame(ctx);
        if (this.#image)
            this.#drawImage(ctx);

        ctx.restore();
    }

    /**
     * Checks if the slot got clicked or hovered by the mouse.
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
     * Renders the slot's frame.
     * @param {CanvasRenderingContext2D} ctx
     */
    #drawFrame(ctx) {
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(this.#xPx, this.#yPx, this.#widthPx, this.#heightPx);
    }

    /**
     * Draws the image scaled and cropped to fit the slot.
     * @param {CanvasRenderingContext2D} ctx
     */
    #drawImage(ctx) {
        const imgAspectRatio = this.#image.width / this.#image.height;
        const slotAspectRatio = this.#widthPx / this.#heightPx;

        let resX = 0;
        let resY = 0;
        let resWidth = this.#image.width;
        let resHeight = this.#image.height;

        // Crop the center section we will be zooming in of the image, to fit
        // the slot's aspect ratio, without deforming it.

        if (imgAspectRatio > slotAspectRatio) {
            resWidth = this.#image.height * slotAspectRatio;
            resX = (this.#image.width - resWidth) / 2.0;
        }
        else {
            resHeight = this.#image.width / slotAspectRatio;
            resY = (this.#image.height - resHeight) / 2.0;
        }

        ctx.drawImage(
            this.#image,
            resX, resY, resWidth, resHeight,
            this.#xPx, this.#yPx, this.#widthPx, this.#heightPx
        );
    }
}

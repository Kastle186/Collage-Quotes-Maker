/*
 * **************************** *
 * Image Slots Class Definition *
 * **************************** *
 */

'use strict';

export class ImageSlot {
    /** @type {number} */
    #xPx;

    /** @type {number} */
    #yPx;

    /** @type {number} */
    #widthPx;

    /** @type {number} */
    #heightPx;

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
        this.xPct = originX;
        this.yPct = originY;
        this.widthPct = width;
        this.heightPct = height;
        this.image = image;
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
        this.#xPx = this.xPct * canvasWidth;
        this.#yPx = this.yPct * canvasHeight;
        this.#widthPx = this.widthPct * canvasWidth;
        this.#heightPx = this.heightPct * canvasHeight;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        this.#drawFrame(ctx);
        if (this.image)
            this.#drawImage(ctx);
    }

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     * @returns {boolean}
     */
    hadMouseInteraction(mouseX, mouseY) {
        return mouseX >=this.#xPx
            && mouseX <= this.#xPx + this.#widthPx
            && mouseY >=this.#yPx
            && mouseY <= this.#yPx + this.#heightPx;
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
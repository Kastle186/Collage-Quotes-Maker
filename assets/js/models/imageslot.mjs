// File: imageslot.mjs

class ImageSlot {

    /** @type {HTMLElement} */
    htmlObj;

    /** @type {HTMLImageElement | null} */
    imgObj;

    /** @type {number} */
    #width;

    /** @type {number} */
    #height;

    /**
     * Creates an ImageSlot object, which contains references to the HTML nodes
     * representing it, as well as other data, like its dimensions and image,
     * if any.
     *
     * @param {HTMLElement} htmlObj
     * @param {HTMLImageElement | null} imgObj
     * @param {number} width
     * @param {number} height
     */

    constructor(htmlObj, imgObj, width, height) {
        this.htmlObj = htmlObj;
        this.imgObj = imgObj;
        this.#width = width;
        this.#height = height;
    }
}

export default ImageSlot;

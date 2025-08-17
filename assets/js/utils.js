/*
 * **************** *
 * Extra Utilities! *
 * **************** *
 */

'use strict';

import { ImageSlot } from './canvas/imageslot.js';

/**
 * @param {ImageSlot} imgSlot
 * @param {RenderingContext} canvasCtx
 * @returns {(function(Event): void)}
 */
export function makeUploadOnChangeHandler(imgSlot, canvasCtx) {
    return function (event) {
        const imgFile = event.target.files[0];
        if (!imgFile) return;

        const img = new Image();
        img.onload = function () {
            imgSlot.image = img;
            imgSlot.draw(canvasCtx, true);
        };
        img.src = URL.createObjectURL(imgFile);
    };
}
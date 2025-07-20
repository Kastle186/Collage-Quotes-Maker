/*
 * **************** *
 * Extra Utilities! *
 * **************** *
 */

export function makeUploadOnChangeHandler(imgSlot, canvas) {
    return function (event) {
        const imgFile = event.target.files[0];
        if (!imgFile) return;

        const img = new Image();
        img.onload = function () {
            imgSlot.image = img;
            imgSlot.draw(canvas);
        };
        img.src = URL.createObjectURL(imgFile);
    };
}
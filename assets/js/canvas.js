/*
 * ******************** *
 * Canvas Configuration *
 * ******************** *
 */

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const COLLAGE_SLOTS = [];

class Rectangle
{
    constructor(originX, originY, width, height)
    {
        this.x = originX;
        this.y = originY;
        this.width = width;
        this.height = height;
    }
}

export function initCanvas() {
    const widthInput = document.getElementById("width-txtbx");
    const heightInput = document.getElementById("height-txtbx");
    const theCanvas = document.getElementById("thecanvas");

    resizeCanvas(theCanvas, DEFAULT_WIDTH, DEFAULT_HEIGHT);

    widthInput.addEventListener("input", () => {
        updateCanvas(theCanvas, widthInput, heightInput);
    });

    heightInput.addEventListener("input", () => {
        updateCanvas(theCanvas, widthInput, heightInput);
    });
}

function updateCanvas(theCanvas, widthInput, heightInput) {
    const newWidth = parseInt(widthInput.value, 10) || DEFAULT_WIDTH;
    const newHeight = parseInt(heightInput.value, 10) || DEFAULT_HEIGHT;

    if (newWidth !== theCanvas.width || newHeight !== theCanvas.height)
        resizeCanvas(theCanvas, Math.max(newWidth, 1), Math.max(newHeight, 1));

    // Here is potentially the best spot to call the rectangles/slots
    // drawing function.
}

function resizeCanvas(theCanvas, newWidth, newHeight) {
    // The values newWidth and newHeight are already validated here, as this
    // function's only callers (this.initialize and this.update) take care of
    // guaranteeing valid inputs.

    theCanvas.width = newWidth;
    theCanvas.height = newHeight;

    document.documentElement.style.setProperty("--canvas-width", newWidth + "px");
    document.documentElement.style.setProperty("--canvas-height", newHeight + "px");
}

// Make a Canvas Object:
// - Width
// - Height
// - Array of Rectangles
//
// Rectangle Object?
// - StartX
// - StartY
// - Width
// - Height
// - Image?

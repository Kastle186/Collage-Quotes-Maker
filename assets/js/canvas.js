/*
 * ******************** *
 * Canvas Configuration *
 * ******************** *
 */

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

export function initCanvas()
{
    const widthInput = document.getElementById("width-txtbx");
    const heightInput = document.getElementById("height-txtbx");
    const canvas = document.getElementById("thecanvas");

    resizeCanvas(canvas, DEFAULT_WIDTH, DEFAULT_HEIGHT);

    widthInput.addEventListener("input", () => {
        updateCanvas(canvas, widthInput, heightInput)
    });

    heightInput.addEventListener("input", () => {
        updateCanvas(canvas, widthInput, heightInput)
    });
}

function resizeCanvas(canvas, width, height)
{
    canvas.width = width;
    canvas.height = height;

    document.documentElement.style.setProperty("--canvas-width", width + "px");
    document.documentElement.style.setProperty("--canvas-height", height + "px");
}

function updateCanvas(canvas, widthInput, heightInput)
{
    let newWidth = parseInt(widthInput.value, 10) || DEFAULT_WIDTH;
    let newHeight = parseInt(heightInput.value, 10) || DEFAULT_HEIGHT;

    newWidth = Math.max(newWidth, 1);
    newHeight = Math.max(newHeight, 1);

    resizeCanvas(canvas, newWidth, newHeight);
}
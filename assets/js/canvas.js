/*
 * ******************** *
 * Canvas Configuration *
 * ******************** *
 */

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

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

class CollageCanvas {
    #theCanvas;
    #slots;
    #spacing;

    constructor() {
        this.#theCanvas = null;
        this.#slots = [];
        this.#spacing = 0.05;
    }

    initialize() {
        this.#theCanvas = document.getElementById("thecanvas");
        const widthInput = document.getElementById("width-txtbx");
        const heightInput = document.getElementById("height-txtbx");

        this.#resize(DEFAULT_WIDTH, DEFAULT_HEIGHT);

        widthInput.addEventListener("input", () => {
            this.#update(widthInput, heightInput);
        });

        heightInput.addEventListener("input", () => {
            this.#update(widthInput, heightInput);
        });
    }

    drawLayout(layoutParams) {
        if (!("customPattern" in layoutParams)) {
            const numSlotsX = layoutParams["dimX"];
            const numSlotsY = layoutParams["dimY"];

            // Generate the pattern from the dimensions' information.
            // The formula is the following:
            // slotDimSize = (canvas / numSlots) - spacing - (spacing / numSlots)

            let slotWidth = (1.0 / numSlotsX) - this.#spacing - (this.#spacing / numSlotsX);
            let slotHeight = (1.0 / numSlotsY) - this.#spacing - (this.#spacing / numSlotsY);

            // Convert the fractions to pixels because strokeRect() only allows
            // dimensions in px units.

            slotWidth *= this.#theCanvas.width;
            slotHeight *= this.#theCanvas.height;

            const spacingPixelsX = this.#spacing * this.#theCanvas.width;
            const spacingPixelsY = this.#spacing * this.#theCanvas.height;

            for (let i = 0; i < numSlotsX; i++) {
                let xStart = spacingPixelsX + ((spacingPixelsX + slotWidth) * i);
                let yStart = 0;

                for (let j = 0; j < numSlotsY; j++) {
                    yStart += spacingPixelsY;
                    const slotObj = new Rectangle(xStart, yStart, slotWidth, slotHeight);
                    this.#slots.push(slotObj);
                    yStart += slotHeight;
                }
            }
        }

        // Update the canvas info and draw the layout here.
        console.log(layoutParams["dimX"] + ", " + layoutParams["dimY"]);
        for (let i = 0; i < this.#slots.length; i++) {
            console.log("\n" + (i + 1) + ")");
            console.log("X Start: " + this.#slots[i].x);
            console.log("Y Start: " + this.#slots[i].y);
            console.log("Width: " + this.#slots[i].width);
            console.log("Height: " + this.#slots[i].height);
        }
    }

    #resize(newWidth, newHeight) {
        // The values newWidth and newHeight are already validated here, as this
        // function's only callers (this.initialize and this.#update) take care of
        // guaranteeing valid inputs.

        this.#theCanvas.width = newWidth;
        this.#theCanvas.height = newHeight;

        document.documentElement.style.setProperty("--canvas-width", newWidth + "px");
        document.documentElement.style.setProperty("--canvas-height", newHeight + "px");
    }

    #update(widthInput, heightInput) {
        const newWidth = parseInt(widthInput.value, 10) || DEFAULT_WIDTH;
        const newHeight = parseInt(heightInput.value, 10) || DEFAULT_HEIGHT;

        if (newWidth !== this.#theCanvas.width || newHeight !== this.#theCanvas.height)
            this.#resize(Math.max(newWidth, 1), Math.max(newHeight, 1));
    }
}

export const THE_CANVAS = new CollageCanvas();

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

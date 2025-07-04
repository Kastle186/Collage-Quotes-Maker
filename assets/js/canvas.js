/*
 * ******************** *
 * Canvas Configuration *
 * ******************** *
 */

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

class Rectangle {
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
        // If we arrived here from selecting a new layout, then do all the
        // calculations. But if we got here from a canvas resize, then we only
        // have to redraw the layout.
        if (layoutParams != null) {
            this.#slots = [];

            if (!("customPattern" in layoutParams)) {
                const numSlotsX = layoutParams["dimX"];
                const numSlotsY = layoutParams["dimY"];

                // Generate the pattern from the dimensions' information (percentage).
                // The formula is the following:
                // slotDimSize = (canvas / numSlots) - spacing - (spacing / numSlots)

                let slotWidth = (1.0 / numSlotsX) - this.#spacing - (this.#spacing / numSlotsX);
                let slotHeight = (1.0 / numSlotsY) - this.#spacing - (this.#spacing / numSlotsY);

                for (let i = 0; i < numSlotsX; i++) {
                    let xStart = this.#spacing + ((this.#spacing + slotWidth) * i);
                    let yStart = 0;

                    for (let j = 0; j < numSlotsY; j++) {
                        yStart += this.#spacing;
                        const slotObj = new Rectangle(xStart, yStart, slotWidth, slotHeight);
                        this.#slots.push(slotObj);
                        yStart += slotHeight;
                    }
                }
            } else {
                // FUTURE FEATURE!

                // const pattern = layoutParams["customPattern"];
                //
                // for (const rect of pattern) {
                //     const xPixels = rect.x / 100.0;
                //     const yPixels = rect.y / 100.0;
                //     const widthPixels = rect.width / 100.0;
                //     const heightPixels = rect.height / 100.0;
                //
                //     this.#slots.push(new Rectangle(xPixels, yPixels, widthPixels, heightPixels));
                // }
            }
        }

        const ctx = this.#theCanvas.getContext("2d");

        for (const slot of this.#slots) {
            // Convert the fractions to pixels because strokeRect() only allows
            // dimensions in px units.

            const xPixels = slot.x * this.#theCanvas.width;
            const yPixels = slot.y * this.#theCanvas.height;
            const widthPixels = slot.width * this.#theCanvas.width;
            const heightPixels = slot.height * this.#theCanvas.height;

            ctx.strokeStyle = "blue";
            ctx.strokeRect(xPixels, yPixels, widthPixels, heightPixels);
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

        // If there is already a set layout, then redraw it with the new dimensions.
        if (this.#slots.length > 0)
            this.drawLayout(null);
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

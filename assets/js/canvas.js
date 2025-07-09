/*
 * ******************** *
 * Canvas Configuration *
 * ******************** *
 */

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const DEFAULT_SPACING = 0.05;

class Rectangle {
    constructor(originX, originY, width, height) {
        this.x = originX;
        this.y = originY;
        this.width = width;
        this.height = height;
    }
}

class CollageCanvas {
    #width;
    #height;
    #spacing;

    #slots;
    #layout;

    constructor() {
        this.#width = DEFAULT_WIDTH;
        this.#height = DEFAULT_HEIGHT;
        this.#spacing = DEFAULT_SPACING;

        this.#slots = [];
        this.#layout = null;
    }

    initialize() {
        const widthInput = document.getElementById("width-txtbx");
        const heightInput = document.getElementById("height-txtbx");

        this.#draw();

        widthInput.addEventListener("input", () => {
            this.#update(widthInput, heightInput);
        });

        heightInput.addEventListener("input", () => {
            this.#update(widthInput, heightInput);
        });
    }

    #draw() {
        const theCanvas = document.getElementById("thecanvas");

        // The values newWidth and newHeight are already validated here, as this
        // function's only callers (this.initialize and this.#update) take care of
        // guaranteeing valid inputs.

        theCanvas.width = this.#width;
        theCanvas.height = this.#height;

        document.documentElement.style.setProperty("--canvas-width", this.#width + "px");
        document.documentElement.style.setProperty("--canvas-height", this.#height + "px");

        // If there is already a set layout, then redraw it with the new dimensions.
        if (this.#slots.length > 0)
            this.traceLayout(null);
    }

    #update(widthInput, heightInput) {
        const newWidth = parseInt(widthInput.value, 10) || DEFAULT_WIDTH;
        const newHeight = parseInt(heightInput.value, 10) || DEFAULT_HEIGHT;

        if (newWidth !== this.#width || newHeight !== this.#height) {
            this.#width = Math.max(newWidth, 1);
            this.#height = Math.max(newHeight, 1);
            this.#draw();
        }
    }

    traceLayout(layoutParams) {
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

        const theCanvas = document.getElementById("thecanvas");
        const ctx = theCanvas.getContext("2d");

        for (const slot of this.#slots) {
            // Convert the fractions to pixels because strokeRect() only allows
            // dimensions in px units.

            const xPixels = slot.x * theCanvas.width;
            const yPixels = slot.y * theCanvas.height;
            const widthPixels = slot.width * theCanvas.width;
            const heightPixels = slot.height * theCanvas.height;

            ctx.strokeStyle = "blue";
            ctx.strokeRect(xPixels, yPixels, widthPixels, heightPixels);
        }
    }
}

export const THE_CANVAS = new CollageCanvas();

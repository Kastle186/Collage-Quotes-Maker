// File: ui.mjs

import CollageCanvas from "./models/collagecanvas.mjs";
import GridLayout from "./models/gridlayout.mjs";

const layouts = new Map();

/**
 * Setup function!
 */

export function initUIAndCanvas() {
    initLayouts();

    const widthHtmlObj = document.getElementById('width-input');
    const heightHtmlObj = document.getElementById('height-input');

    const theCanvas = new CollageCanvas(
        parseInt(widthHtmlObj.value),
        parseInt(heightHtmlObj.value)
    );

    initCanvasControls(theCanvas);
}

/**
 * Create the GridLayout objects corresponding to each of the supported layouts.
 */

function initLayouts() {
    const layoutButtons =
        document.querySelector('.layout-picker').querySelectorAll('button');

    layoutButtons.forEach((btn) => {
        const numRows = parseInt(btn.dataset.rows);
        const numCols = parseInt(btn.dataset.cols);
        const name = btn.textContent;
        layouts.set(name, new GridLayout(numRows, numCols, name));
    });
}

/**
 * Adds the necessary listeners to all HTML elements (except the image slots)
 * that interact with the canvas in one way or another.
 *
 * @param {CollageCanvas} theCanvas
 */

function initCanvasControls(theCanvas) {
    const layoutPicker = document.querySelector('.layout-picker');

    layoutPicker.addEventListener('click', (evt) => {
        const layoutBtn = evt.target.closest('button');
        if (!layoutBtn) {
            return ;
        }
        theCanvas.updateLayout(layouts.get(layoutBtn.textContent));
    });

    const widthControls = document.getElementById('width-input');
    const heightControls = document.getElementById('height-input');

    widthControls.addEventListener('input', (evt) => {
        theCanvas.width = evt.target.value;
    });

    heightControls.addEventListener('input', (evt) => {
        theCanvas.height = evt.target.value;
    });
}

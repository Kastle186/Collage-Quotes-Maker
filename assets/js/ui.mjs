// File: ui.mjs

import CollageCanvas from "./models/collagecanvas.mjs";
import GridLayout from "./models/gridlayout.mjs";

HTMLElement.prototype.setCustomCSSProperty = function(propName, propValue) {
    this.style.setProperty(`--${propName}`, propValue);
}

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
    const widthControls = document.getElementById('width-input');
    const heightControls = document.getElementById('height-input');
    const frameColorControls = document.getElementById('frame-color-picker');
    const bgColorControls = document.getElementById('bg-color-picker');
    const spacingControls = document.getElementById('spacing-slider');
    const cornerRadiusControls = document.getElementById('corner-radius-slider');
    const layoutPicker = document.querySelector('.layout-picker');

    // Dimensions Controls

    widthControls.addEventListener('input', (evt) => {
        theCanvas.width = evt.target.value;
    });

    heightControls.addEventListener('input', (evt) => {
        theCanvas.height = evt.target.value;
    });

    // Colors Controls

    frameColorControls.addEventListener('input', () => {
        theCanvas.grid.setCustomCSSProperty(
            'frame-color-global',
            frameColorControls.value
        );

        document.querySelectorAll('.slot').forEach((slot) => {
            slot.setCustomCSSProperty('frame-color', frameColorControls.value);
        });
    });

    bgColorControls.addEventListener('input', () => {
        theCanvas.canvas.setCustomCSSProperty('canvas-bg', bgColorControls.value);
    });

    // Spacing Controls

    spacingControls.addEventListener('input', () => {
        theCanvas.grid.setCustomCSSProperty('gap', `${spacingControls.value}%`);
    })

    // Corner Rounding Controls

    cornerRadiusControls.addEventListener('input', () => {
        document.querySelectorAll('.slot').forEach((slot) => {
            slot.setCustomCSSProperty('radius', `${cornerRadiusControls.value}px`);
        });
    });

    // Layout Picker

    layoutPicker.addEventListener('click', (evt) => {
        const layoutBtn = evt.target.closest('button');
        if (!layoutBtn) {
            return ;
        }
        theCanvas.updateLayout(layouts.get(layoutBtn.textContent));
    });
}

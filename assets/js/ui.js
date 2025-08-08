/*
 * **************************** *
 * User Interface Configuration *
 * **************************** *
 */

'use strict';

import * as Constants from './constants.js';
import { CollageCanvas } from './canvas/canvas.js';
import { Layout } from './canvas/layout.js';

/**
 * @returns {CollageCanvas}
 */
export function initUIAndCanvas() {
    const theCanvas = new CollageCanvas();
    theCanvas.initialize();

    initOptionsPanel(theCanvas);
    return theCanvas;
}

/**
 * @param {CollageCanvas} theCanvas
 */
function initOptionsPanel(theCanvas) {
    initPanelComponent();
    initCanvasControls(theCanvas);
    initLayoutsGrid(theCanvas);
}

/**
 *
 */
function initPanelComponent() {
    const optionsPanel = document.getElementById('options-panel');
    const toggleBtn = document.getElementById('toggle-btn');
    const workspace = document.getElementById('workspace');

    toggleBtn.addEventListener('click', () => {
        optionsPanel.classList.toggle('hidden');

        if (optionsPanel.classList.contains('hidden'))
        {
            toggleBtn.textContent = '☰ Configure';
            workspace.style.marginLeft = '2%';
        }
        else
        {
            toggleBtn.textContent = '✖ Collapse';
            workspace.style.marginLeft = '30%';
        }
    });
}

/**
 * @param {CollageCanvas} theCanvas
 */
function initCanvasControls(theCanvas) {
    const dimensionSettings = {
        'width-input': {
            propertyName: 'width',
            defaultValue: Constants.DEFAULT_WIDTH,
            parse: value => parseInt(value, 10)
        },

        'height-input': {
            propertyName: 'height',
            defaultValue: Constants.DEFAULT_HEIGHT,
            parse: value => parseInt(value, 10)
        },

        'spacing-input': {
            propertyName: 'spacing',
            defaultValue: Constants.DEFAULT_SPACING,
            parse: value => parseInt(value, 10) / 100.0
        }
    };

    const clearButton = document.getElementById('clear-btn');
    const bgColorPicker = document.getElementById('bg-color-picker');

    let rafId;

    Object.entries(dimensionSettings).forEach(([inputName, config]) => {
        const inputElement = document.getElementById(inputName);

        inputElement.addEventListener('input', () => {
            cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
                const theValue = config.parse(inputElement.value) || config.defaultValue;
                theCanvas.update(config.propertyName, theValue);
            });
        });
    });

    clearButton.addEventListener('click', () => {
        theCanvas.clear(true);
    });

    bgColorPicker.addEventListener('change', (event) => {
        theCanvas.update('bg-color', event.target.value);
    });
}

/**
 * @param {CollageCanvas} theCanvas
 */
function initLayoutsGrid(theCanvas) {
    const grid = document.querySelector('.layouts-grid');

    // TODO: Read this from a JSON file instead of hardcoding it.
    const layouts = {
        '2x2': {
            'imgPath': 'assets/images/2x2-Layout.webp',
            'dimX': 2,
            'dimY': 2
        }
    };

    Object.entries(layouts).forEach(([layoutName, layoutParams]) => {
        const layoutObj = new Layout(
            layoutName || null,
            layoutParams['imgPath'] || null,
            layoutParams['dimX'] || 0,
            layoutParams['dimY'] || 0,
            layoutParams['custom'] || []
        );

        const layoutElemWrapper = layoutObj.generateLayoutDivElement(theCanvas);
        grid.appendChild(layoutElemWrapper);
    });
}

/*
 * ************************** *
 * Layouts Grid Configuration *
 * ************************** *
 */

import { THE_CANVAS } from "./canvas.js";

// For complex layouts that don't necessarily follow a specific pattern, we will
// be using a different field called 'customPattern' or something like that. That will
// contain the values of the individual rectangles. Then, drawLayout() in canvas.js
// will choose. If the data has dimX and dimY, then it calculates the rectangles.
// If it has custom, then it will simply follow those instructions.

// FUTURE: Evaluate whether we can store this in a JSON file or something like that
//         instead of hard-coding a global variable.

const LAYOUTS = {
    "2x2": {
        "imgPath": "assets/images/2x2-Layout.webp",
        "dimX": 2,
        "dimY": 2
    }
};

export function loadLayouts()
{
    const grid = document.querySelector(".layouts-grid");

    for (let [layoutName, layoutParams] of Object.entries(LAYOUTS))
    {
        const layoutElemWrapper = initializeLayoutElement(
            layoutName,
            layoutParams["imgPath"]);

        grid.appendChild(layoutElemWrapper);
    }
}

function initializeLayoutElement(layoutName, layoutThumbnailPath) {
    const wrapper = document.createElement("div");
    wrapper.className = "layout-thumbnail";

    const thumbElem = document.createElement("img");
    thumbElem.src = layoutThumbnailPath;
    thumbElem.alt = "Layout Placeholder Tag";
    thumbElem.dataset.layoutId = layoutName;

    wrapper.addEventListener('mouseenter', () => {
        wrapper.classList.add("hovered");
    });

    wrapper.addEventListener('mouseleave', () => {
        wrapper.classList.remove("hovered");
    });

    wrapper.addEventListener('click', (evt) => {
        wrapper.classList.remove("hovered");

        setTimeout(() => {
            if (wrapper.matches(":hover")) {
                wrapper.classList.add("hovered");
            }
        }, 150);

        const key = evt.target.dataset.layoutId;

        if (key) {
            const params = LAYOUTS[key];
            THE_CANVAS.traceLayout(params, true);
        }
    });

    wrapper.appendChild(thumbElem);
    return wrapper;
}

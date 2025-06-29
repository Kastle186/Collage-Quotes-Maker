/*
 * ************************** *
 * Layouts Grid Configuration *
 * ************************** *
 */

// For complex layouts that don't necessarily follow a specific pattern, we will
// be using a different field called 'custom' or something like that. That will
// contain the values of the individual rectangles. Then, drawLayout() in canvas.js
// will choose. If the data has dimX and dimY, then it calculates the rectangles.
// If it has custom, then it will simply follow those instructions.

const layouts = {
    "2x2": {
        "imgPath": "assets/images/2x2-Layout.webp",
        "dimX": 2,
        "dimY": 2
    }
};

export function loadLayouts()
{
    const grid = document.querySelector(".layouts-grid");

    for (let [layoutName, layoutParams] of Object.entries(layouts))
    {
        const thumbImgPath = layoutParams["imgPath"];
        const wrapper = document.createElement("div");
        wrapper.className = "layout-thumbnail";

        const thumbElem = document.createElement("img");
        thumbElem.src = thumbImgPath;
        thumbElem.alt = "Layout Placeholder Tag";
        thumbElem.dataset.layoutId = layoutName;

        wrapper.appendChild(thumbElem);
        grid.appendChild(wrapper);
    }
}

// const layouts = {
//   layout1: [
//     { x: 10, y: 10, width: 100, height: 50 },
//     { x: 120, y: 10, width: 50, height: 100 }
//   ],
//   layout2: [
//     { x: 20, y: 20, width: 80, height: 80 }
//   ],
//   // Add more layouts here
// };

// <img src="thumb1.png" data-layout-id="layout1" class="thumbnail" />
// <img src="thumb2.png" data-layout-id="layout2" class="thumbnail" />

// document.querySelectorAll('.thumbnail').forEach(thumb => {
//   thumb.addEventListener('click', (event) => {
//     const layoutId = event.target.dataset.layoutId;
//     const rectangles = layouts[layoutId];
//     if (rectangles) {
//       drawRectangles(rectangles);
//     }
//   });
// });

// function drawRectangles(rects) {
//   const canvas = document.getElementById('myCanvas');
//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   rects.forEach(rect => {
//     ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
//   });
// }

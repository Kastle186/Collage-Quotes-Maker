'use strict';

/*
 * ************************************ *
 * General Options Panel Configuration! *
 * ************************************ *
 */

const optionsPanel = document.getElementById("optionspanel");
const toggleBtn = document.getElementById("togglebtn");
const workspace = document.getElementById("workspace");

toggleBtn.addEventListener("click", () => {
    optionsPanel.classList.toggle("hidden");

    if (optionsPanel.classList.contains("hidden"))
    {
        toggleBtn.textContent = "☰ Configure";
        workspace.style.marginLeft = "2%";
    }
    else
    {
        toggleBtn.textContent = "✖ Collapse";
        workspace.style.marginLeft = "30%";
    }
});

/*
 * ************************** *
 * Layouts Grid Configuration *
 * ************************** *
 */

// Doing it this way for now because it is entirely front-end. Will add code to read the files programmatically
// if/when I add a backend server.
const layouts = [
    "assets/images/2x2-Layout.webp"
];

const grid = document.querySelector(".layouts-grid");

// It works! Now, I just need to scale the images properly :)
// for (let layout of layouts)
// {
//     const imgLandscape = document.createElement('img');
//     const imgPortrait = document.createElement('img');
//
//     imgLandscape.src = layout;
//     imgLandscape.alt = "Landscape Layout Tag";
//     imgLandscape.className = "landscape-layout";
//
//     imgPortrait.src = layout;
//     imgPortrait.alt = "Portrait Layout Tag";
//     imgPortrait.className = "portrait-layout";
//
//     grid.appendChild(imgLandscape);
//     grid.appendChild(imgPortrait);
// }

for (let i = 0; i < layouts.length; i++)
{
    let layout = layouts[i];

    const landscapeWrapper = document.createElement("div");
    const portraitWrapper = document.createElement("div");

    landscapeWrapper.className = "layout-thumbnail";
    portraitWrapper.className = "layout-thumbnail";

    const imgLandscape = document.createElement("img");
    const imgPortrait = document.createElement("img");

    imgLandscape.src = layout;
    imgLandscape.alt = "Landscape Layout Placeholder Tag";
    imgLandscape.className = "landscape";
    landscapeWrapper.appendChild(imgLandscape);

    imgPortrait.src = layout;
    imgPortrait.alt = "Portrait Layout Placeholder Tag";
    imgPortrait.className = "portrait";
    portraitWrapper.appendChild(imgPortrait);

    grid.appendChild(landscapeWrapper);
    grid.appendChild(portraitWrapper);
}

// for (let layout of layouts) {
//     const grid = document.querySelector(".layouts-grid");
//
//     const landscapeWrapper = document.createElement('div');
//     const portraitWrapper = document.createElement('div');
//
//     const imgLandscape = document.createElement('img');
//     imgLandscape.src = layout;
//     imgLandscape.alt = "Landscape Layout Tag";
//     imgLandscape.className = "landscape-layout";
//     landscapeWrapper.appendChild(imgLandscape);
//
//     const imgPortrait = document.createElement('img');
//     imgPortrait.src = layout;
//     imgPortrait.alt = "Portrait Layout Tag";
//     imgPortrait.className = "portrait-layout";
//     portraitWrapper.appendChild(imgPortrait);
//
//     grid.appendChild(landscapeWrapper);
//     grid.appendChild(portraitWrapper);
// }

/*
 * ********************* *
 * Canvas Configuration! *
 * ********************* *
 */

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

const widthInput = document.getElementById("width-txtbx");
const heightInput = document.getElementById("height-txtbx");
const canvas = document.getElementById("thecanvas");

resizeCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);

widthInput.addEventListener("input", updateCanvas);
heightInput.addEventListener("input", updateCanvas);

function updateCanvas()
{
    let newWidth = widthInput.value || DEFAULT_WIDTH;
    let newHeight = heightInput.value || DEFAULT_HEIGHT;

    if (newWidth <= 0)
        newWidth = 1;

    if (newHeight <= 0)
        newHeight = 1;

    resizeCanvas(newWidth, newHeight);
}

function resizeCanvas(width, height)
{
    canvas.width = width;
    canvas.height = height;

    document.documentElement.style.setProperty("--canvas-width", width + "px");
    document.documentElement.style.setProperty("--canvas-height", height + "px");
}
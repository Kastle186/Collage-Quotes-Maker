'use strict';

/* General Configuration! */

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

/* Canvas Configuration! */

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
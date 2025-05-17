'use strict';

const optionsPanel = document.getElementById("optionspanel");
const openBtn = document.getElementById("openbtn");
const closeBtn = document.getElementById("closebtn");
const workspace = document.getElementById("workspace");

openBtn.addEventListener("click", () => {
    optionsPanel.style.left = "0";
    workspace.style.marginLeft = "50%";
    openBtn.style.display = "none";
});

closeBtn.addEventListener("click", () => {
    optionsPanel.style.left = "-50%";
    workspace.style.marginLeft = "0%";
    openBtn.style.display = "inline-block";
});

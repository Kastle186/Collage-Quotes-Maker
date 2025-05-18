'use strict';

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

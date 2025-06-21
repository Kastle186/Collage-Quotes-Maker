'use strict';

import { initCanvas } from "./canvas.js";
import { initUserInterface } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
    initUserInterface();
    initCanvas();
});
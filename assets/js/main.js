'use strict';

import { THE_CANVAS } from "./canvas.js";
import { initUserInterface } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
    initUserInterface();
    THE_CANVAS.initialize();
});

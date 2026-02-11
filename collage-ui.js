document.addEventListener("DOMContentLoaded", () => {

    const grid = document.querySelector(".the-grid");
    const canvas = document.querySelector(".the-canvas");

    /* ============================= */
    /*         GAP CONTROL           */
    /* ============================= */

    const gapSlider = document.getElementById("gapSlider");

    if (gapSlider) {
        gapSlider.addEventListener("input", () => {
            grid.style.setProperty("--gap", gapSlider.value + "%");
        });
    }

    /* ============================= */
    /*      BACKGROUND CONTROL       */
    /* ============================= */

    const bgPicker = document.getElementById("bgPicker");

    if (bgPicker) {
        bgPicker.addEventListener("input", () => {
            canvas.style.setProperty("--canvas-bg", bgPicker.value);
        });
    }

    /* ============================= */
    /*        FRAME COLOR            */
    /* ============================= */

    const frameColorPicker = document.getElementById("frameColorPicker");

    if (frameColorPicker) {
        frameColorPicker.addEventListener("input", () => {
            grid.style.setProperty("--frame-color-global", frameColorPicker.value);

            document.querySelectorAll(".slot").forEach(slot => {
                slot.style.setProperty("--frame-color", frameColorPicker.value);
            });
        });
    }

    /* ============================= */
    /*         CORNER RADIUS         */
    /* ============================= */

    const radiusSlider = document.getElementById("radiusSlider");

    if (radiusSlider) {
        radiusSlider.addEventListener("input", () => {
            document.querySelectorAll(".slot").forEach(slot => {
                slot.style.setProperty("--radius", radiusSlider.value + "px");
            });
        });
    }

    /* ============================= */
    /*       CLICK BOUNCE FX         */
    /* ============================= */

    // Event delegation so it works even after grid re-renders
    grid.addEventListener("click", (event) => {
        const slot = event.target.closest(".slot");
        if (!slot) return;

        slot.classList.add("click-animate");

        slot.addEventListener("animationend", () => {
            slot.classList.remove("click-animate");
        }, { once: true });
    });

});

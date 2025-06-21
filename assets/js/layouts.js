/*
 * ************************** *
 * Layouts Grid Configuration *
 * ************************** *
 */

const layouts = [
    "assets/images/2x2-Layout.webp"
];

export function loadLayouts()
{
    const grid = document.querySelector(".layouts-grid");

    for (let i = 0; i < layouts.length; i++)
    {
        const layout = layouts[i];
        const wrapper = document.createElement("div");
        wrapper.className = "layout-thumbnail";

        const layoutImage = document.createElement("img");

        layoutImage.src = layout;
        layoutImage.alt = "Landscape Layout Placeholder Tag";
        layoutImage.className = "landscape";

        wrapper.appendChild(layoutImage);
        grid.appendChild(wrapper);
    }
}
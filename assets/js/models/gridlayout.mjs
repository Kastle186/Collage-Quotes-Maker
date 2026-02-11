// File: gridlayout.mjs

class GridLayout {

    /** @type {number} */
    rows;

    /** @type {number} */
    columns;

    /** @type {string} */
    name;

    /**
     * Create a GridLayout object, representing the image slots layout to be
     * rendered in the canvas.
     *
     * @param {number} rows
     * @param {number} columns
     * @param {string} name
     */

    constructor(rows, columns, name) {
        this.rows = rows;
        this.columns = columns;
        this.name = name;
    }
}

export default GridLayout;

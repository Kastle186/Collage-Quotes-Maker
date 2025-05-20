const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const uploader = document.getElementById('imageUploader');
const saveBtn = document.getElementById('saveBtn');

// Store each slot with its image, position, and size
let imageSlots = [
    { x: 20, y: 20, width: 150, height: 150, image: null },
    { x: 200, y: 20, width: 150, height: 150, image: null },
    { x: 110, y: 200, width: 150, height: 150, image: null },
];

let draggingSlot = null;
let offsetX = 0;
let offsetY = 0;

// 🎨 Draw all slots (with image and border, and placeholder text)
function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    imageSlots.forEach((slot) => {
        // Border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);

        // Placeholder text in empty slots
        if (!slot.image) {
            ctx.fillStyle = '#aaa';  // Light gray for placeholder text
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Drop image here', slot.x + slot.width / 2, slot.y + slot.height / 2);
        } else {
            // Image: Maintain aspect ratio
            const img = slot.image;
            const imgAspectRatio = img.width / img.height;
            const slotAspectRatio = slot.width / slot.height;

            let drawWidth, drawHeight;

            if (imgAspectRatio > slotAspectRatio) {
                // Image is wider than the slot
                drawWidth = slot.width;
                drawHeight = slot.width / imgAspectRatio;
            } else {
                // Image is taller than the slot or fits perfectly
                drawHeight = slot.height;
                drawWidth = slot.height * imgAspectRatio;
            }

            // Center the image in the slot
            const offsetX = slot.x + (slot.width - drawWidth) / 2;
            const offsetY = slot.y + (slot.height - drawHeight) / 2;

            // Draw the image
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
    });
}

// 📷 Load images into slots
uploader.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file, index) => {
        if (index < imageSlots.length) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    imageSlots[index].image = img;
                    drawAll();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// 🖱 Drag logic
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    for (let i = imageSlots.length - 1; i >= 0; i--) {
        const slot = imageSlots[i];
        if (
            mouseX >= slot.x &&
            mouseX <= slot.x + slot.width &&
            mouseY >= slot.y &&
            mouseY <= slot.y + slot.height
        ) {
            draggingSlot = slot;
            offsetX = mouseX - slot.x;
            offsetY = mouseY - slot.y;
            // Bring this slot to front
            imageSlots.splice(i, 1);
            imageSlots.push(draggingSlot);
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingSlot) {
        draggingSlot.x = e.offsetX - offsetX;
        draggingSlot.y = e.offsetY - offsetY;
        drawAll();
    }
});

canvas.addEventListener('mouseup', () => {
    draggingSlot = null;
});

// 💾 Save to disk
saveBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'arrangement.png';
    a.click();
});

drawAll();
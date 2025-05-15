const imageInput = document.getElementById('imageInput');
const collage = document.getElementById('collage');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const images = []; // Store Image elements

imageInput.addEventListener('change', function () {
    const files = Array.from(this.files);

    files.forEach(file => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'collage-image';
            collage.appendChild(img);

            // Also keep it for canvas drawing
            const tempImg = new Image();
            tempImg.src = event.target.result;
            tempImg.onload = () => {
                images.push(tempImg);
            };
        };

        reader.readAsDataURL(file);
    });
});

// Download the canvas as an image
downloadBtn.addEventListener('click', function () {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 10;
    let x = padding;
    let y = padding;
    const maxHeightInRow = 160;

    images.forEach(img => {
        if (x + img.width > canvas.width) {
            x = padding;
            y += maxHeightInRow + padding;
        }

        const scale = 150 / Math.max(img.width, img.height);
        const w = img.width * scale;
        const h = img.height * scale;

        ctx.drawImage(img, x, y, w, h);
        x += w + padding;
    });

    // Trigger download
    const link = document.createElement('a');
    link.download = 'collage.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});


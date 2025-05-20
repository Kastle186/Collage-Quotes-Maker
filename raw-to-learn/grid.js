const imageSources = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg',
];

const grid = document.querySelector('.image-grid');

imageSources.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Grid Image';
    grid.appendChild(img);
});

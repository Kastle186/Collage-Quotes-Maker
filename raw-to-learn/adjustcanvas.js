const canvasWidthInput = document.getElementById('canvasWidth');
const canvasHeightInput = document.getElementById('canvasHeight');
const setCanvasSizeBtn = document.getElementById('setCanvasSizeBtn');

setCanvasSizeBtn.addEventListener('click', () => {
  const width = parseInt(canvasWidthInput.value);
  const height = parseInt(canvasHeightInput.value);

  if (isNaN(width) || isNaN(height) || width < 100 || height < 100) {
    alert("Please enter valid dimensions (minimum 100x100).");
    return;
  }

  canvas.width = width;
  canvas.height = height;
  alert(`Canvas size set to ${width} x ${height}`);
});

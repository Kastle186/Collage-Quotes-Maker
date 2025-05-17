const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");

openBtn.addEventListener("click", () => {
    sidebar.style.left = "0";
});

closeBtn.addEventListener("click", () => {
    sidebar.style.left = "-250px";
});

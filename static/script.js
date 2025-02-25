document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("themeToggle");
    const cubeContainer = document.querySelector(".cube-container");
    const typingText = document.getElementById("typing-text");
    const phrase = "Welcome to CryptGuard";
    let index = 0;

    // Load theme from localStorage
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Light Mode";
    }

    // Toggle Theme Mode
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️ Light Mode";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙 Dark Mode";
        }
    });

    // Function to Create 3D Cubes (Ensures Cubes Stay on Page)
    function createCubes() {
        if (document.querySelectorAll(".cube").length > 0) return; // Prevents duplicate cubes

        for (let i = 0; i < 15; i++) {
            let cube = document.createElement("div");
            cube.classList.add("cube");

            let faces = ["front", "back", "left", "right", "top", "bottom"];
            faces.forEach(face => {
                let faceDiv = document.createElement("div");
                faceDiv.classList.add(face);
                cube.appendChild(faceDiv);
            });

            let size = 25;
            let leftPos = Math.random() * (window.innerWidth - size * 2);
            let topPos = Math.random() * (window.innerHeight - size * 2);
            let speed = Math.random() * 4 + 3;

            cube.style.width = `${size}px`;
            cube.style.height = `${size}px`;
            cube.style.left = `${leftPos}px`;
            cube.style.top = `${topPos}px`;
            cube.style.animationDuration = `${speed}s`;

            cubeContainer.appendChild(cube);
        }
    }

    // Ensure cubes are always there even if page content changes
    setInterval(() => {
        createCubes();
    }, 2000); // Check every 2 seconds if cubes exist

    createCubes(); // Create cubes on page load

    // Typing Effect for "Welcome to CryptGuard"
    function typeEffect() {
        if (index < phrase.length) {
            typingText.textContent += phrase[index];
            index++;
            setTimeout(typeEffect, 150); // Adjust speed of typing
        }
    }

    typeEffect(); // Start typing effect
});

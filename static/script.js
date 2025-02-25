document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("themeToggle");
    const cubeContainer = document.querySelector(".cube-container");
    const inputArea = document.querySelector("#predictionForm"); // Ensure it targets the correct input form

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

    // Function to check if a cube overlaps the input area
    function isOverlapping(x, y, width, height, element) {
        const rect = element.getBoundingClientRect();
        return (
            x + width > rect.left - 50 && // Added buffer to keep space
            x < rect.right + 50 &&
            y + height > rect.top - 50 &&
            y < rect.bottom + 50
        );
    }

    // Function to Create 3D Cubes
    function createCubes() {
        for (let i = 0; i < 15; i++) { // Adjusted number for balance
            let cube = document.createElement("div");
            cube.classList.add("cube");

            let faces = ["front", "back", "left", "right", "top", "bottom"];
            faces.forEach(face => {
                let faceDiv = document.createElement("div");
                faceDiv.classList.add(face);
                cube.appendChild(faceDiv);
            });

            let size = 25; // Small cubes
            let leftPos, topPos;
            let safeZone = inputArea.getBoundingClientRect();

            let attempts = 0;
            do {
                leftPos = Math.random() * (window.innerWidth - size * 2); // Ensure within screen bounds
                topPos = Math.random() * (window.innerHeight - size * 2);
                attempts++;
                if (attempts > 50) break; // Prevent infinite loops
            } while (isOverlapping(leftPos, topPos, size, size, inputArea));

            let speed = Math.random() * 4 + 3; // Different speeds

            cube.style.width = `${size}px`;
            cube.style.height = `${size}px`;
            cube.style.left = `${leftPos}px`;
            cube.style.top = `${topPos}px`;
            cube.style.animationDuration = `${speed}s`;

            cubeContainer.appendChild(cube);
        }
    }

    createCubes(); // Generate cubes on page load
});

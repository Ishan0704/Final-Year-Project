document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("themeToggle");
    const cubeContainer = document.querySelector(".cube-container");
    const typingText = document.getElementById("typing-text");
    const phrase = "Welcome to CryptGuard";
    let index = 0;

    const predictionButton = document.getElementById("predictionButton");
    const predictionModal = document.getElementById("predictionModal");
    const closeModal = document.getElementById("closeModal");
    const addressForm = document.getElementById("addressForm");
    const addressInput = document.getElementById("addressInput");
    const predictionResult = document.getElementById("predictionResult");

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

    // Show Modal when button is clicked
    predictionButton.addEventListener("click", function () {
        predictionModal.style.display = "block";
    });

    // Close Modal when the close button is clicked
    closeModal.addEventListener("click", function () {
        predictionModal.style.display = "none";
        // Clear the modal contents when closed
        addressInput.value = ''; // Clear input field
        predictionResult.innerHTML = ''; // Clear result display
    });

    // Close Modal when clicked outside of modal content
    window.addEventListener("click", function (event) {
        if (event.target === predictionModal) {
            predictionModal.style.display = "none";
            // Clear the modal contents when closed
            addressInput.value = ''; // Clear input field
            predictionResult.innerHTML = ''; // Clear result display
        }
    });

    // Handle form submission for prediction
    addressForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const address = addressInput.value.trim();

        if (address === "") {
            alert("Please enter a valid address.");
            return;
        }

        // Send the address to the Flask app for prediction
        fetch("/", {
            method: "POST",
            body: new URLSearchParams({
                address: address
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Prediction Data:", data); // Log the response to inspect the data structure

            if (data.error) {
                predictionResult.innerHTML = `<p style="color: red;">${data.error}</p>`;
            } else {
                const { predictions, majority_prediction, actual_target } = data;
                
                let resultHtml = `<h3>Predictions:</h3>`;
                resultHtml += `<ul>`;
                
                // Ensure predictions is an object and iterate through it
                if (predictions && typeof predictions === "object") {
                    for (const model in predictions) {
                        resultHtml += `<li><strong>${model}:</strong> ${predictions[model]}</li>`;
                    }
                } else {
                    resultHtml += `<li>No predictions found.</li>`;
                }

                resultHtml += `</ul>`;
                
                // Display fraud detection message based on majority_prediction
                if (majority_prediction === 1) {
                    resultHtml += `<p style="color: red;"><strong>Fraudulent Transaction Detected</strong></p>`;
                } else if (majority_prediction === 0) {
                    resultHtml += `<p style="color: green;"><strong>Non-Fraudulent Transaction Detected</strong></p>`;
                } else {
                    resultHtml += `<p><strong>Prediction Error: Invalid Majority Prediction</strong></p>`;
                }

                // Check if actual_target exists, otherwise display 'N/A'
                resultHtml += `<p><strong>Actual Target:</strong> ${actual_target !== undefined ? actual_target : 'N/A'}</p>`;

                predictionResult.innerHTML = resultHtml;
            }
        })
        .catch(error => {
            predictionResult.innerHTML = `<p style="color: red;">An error occurred: ${error}</p>`;
        });
    });
});

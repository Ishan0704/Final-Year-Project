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

    // New modal for detailed transaction info
    const detailsModal = document.createElement("div");
    detailsModal.id = "detailsModal";
    detailsModal.classList.add("modal", "wide-modal"); // Added a class to make it wider
    detailsModal.innerHTML = `
        <div class="modal-content">
            <span id="closeDetailsModal" class="close">&times;</span>
            <h2>Transaction Details</h2>
            <div id="detailsContent"></div>
        </div>
    `;
    document.body.appendChild(detailsModal);

    const closeDetailsModal = document.getElementById("closeDetailsModal");
    const detailsContent = document.getElementById("detailsContent");


    // Function to Create 3D Cubes
    function createCubes() {
        if (document.querySelectorAll(".cube").length > 0) return;

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

    setInterval(createCubes, 2000);
    createCubes();

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

    function typeEffect() {
        if (index < phrase.length) {
            typingText.textContent += phrase[index];
            index++;
            setTimeout(typeEffect, 150);
        }
    }

    typeEffect();

    predictionButton.addEventListener("click", function () {
        predictionModal.style.display = "block";
    });

    closeModal.addEventListener("click", function () {
        predictionModal.style.display = "none";
        addressInput.value = '';
        predictionResult.innerHTML = '';
    });

    closeDetailsModal.addEventListener("click", function () {
        detailsModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === predictionModal) {
            predictionModal.style.display = "none";
            addressInput.value = '';
            predictionResult.innerHTML = '';
        }
        if (event.target === detailsModal) {
            detailsModal.style.display = "none";
        }
    });

    addressForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const address = addressInput.value.trim();

        if (address === "") {
            alert("Please enter a valid address.");
            return;
        }

        fetch("/", {
            method: "POST",
            body: new URLSearchParams({ address: address }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Prediction Data:", data);

            if (data.error) {
                predictionResult.innerHTML = `<p style="color: red;">${data.error}</p>`;
            } else {
                const { predictions, majority_prediction, actual_target } = data;

                let resultHtml = `<h3>Result:</h3>`;

                if (majority_prediction === 1) {
                    resultHtml += `<p style="color: red;"><strong>Fraudulent Transaction Detected</strong></p>`;
                } else if (majority_prediction === 0) {
                    resultHtml += `<p style="color: green;"><strong>Non-Fraudulent Transaction Detected</strong></p>`;
                } else {
                    resultHtml += `<p><strong>Prediction Error: Invalid Majority Prediction</strong></p>`;
                }
                resultHtml += `
                <div style="display:flex">
                    <p>Curious to Unravel the Logic Behind This Prediction?
                        <a id="viewDetails" style="color:#0077b6;cursor: pointer;padding-left:2%">Click here</a>
                    </p>
                </div>
                `;

                predictionResult.innerHTML = resultHtml;

                document.getElementById("viewDetails").addEventListener("click", function () {
                    let detailsHtml = `<h3>Result of predictions made by the models </h3>`;
                    
                    if (predictions && typeof predictions === "object") {
                        detailsHtml += `<table><tr><th>Models</th><th>Predicted Values</th></tr>`;

                        for (const model in predictions) {
                            detailsHtml += `<tr><td>${model}</td><td>${predictions[model]}</td></tr>`;
                        }
                        
                        detailsHtml += `</table>`;
                    } else {
                        detailsHtml += `<p>No predictions found.</p>`;
                    }

                    detailsHtml += `
                        <div style="display: flex; justify-content: space-between; margin-top: 5%;">
                            <p style="text-align: left; margin: 0;"><strong>Majority prediction:</strong> ${majority_prediction !== undefined ? majority_prediction : 'N/A'}</p>
                            <p style="text-align: right; margin: 0;"><strong>Actual value:</strong> ${actual_target !== undefined ? actual_target : 'N/A'}</p>
                        </div>
                        `;

                    detailsContent.innerHTML = detailsHtml;
                    detailsModal.style.display = "block";
                });
            }
        })
        .catch(error => {
            predictionResult.innerHTML = `<p style="color: red;">An error occurred: ${error}</p>`;
        });
    });
});

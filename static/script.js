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

    // CSS to make the second modal wider
    const style = document.createElement("style");
    style.innerHTML = `
        .wide-modal .modal-content {
            width: 60%; /* Adjust width */
            max-width: 700px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table, th, td {
            border: 1px solid black;
        }
        th, td {
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f4f4f4;
        }
    `;
    document.head.appendChild(style);

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

                resultHtml += `<button id="viewDetails" class="view-details-btn">View Details</button>`;
                predictionResult.innerHTML = resultHtml;

                document.getElementById("viewDetails").addEventListener("click", function () {
                    let detailsHtml = `<h3>Predictions:</h3>`;
                    
                    if (predictions && typeof predictions === "object") {
                        detailsHtml += `<table><tr><th>Model</th><th>Predicted Value</th></tr>`;

                        for (const model in predictions) {
                            detailsHtml += `<tr><td>${model}</td><td>${predictions[model]}</td></tr>`;
                        }
                        
                        detailsHtml += `</table>`;
                    } else {
                        detailsHtml += `<p>No predictions found.</p>`;
                    }
                    
                    detailsHtml += `<p><strong>Actual Target:</strong> ${actual_target !== undefined ? actual_target : 'N/A'}</p>`;

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

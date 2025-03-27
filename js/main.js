import { classList, updateDimensions, calculateCanvasDimensions, sanitizeRenameInput, getFileDetails, debounce } from './helperFunctions.js';
import { loadImage, resizeCanvas, resizeAndDownload, resizeAndZip, downloadZip, setupMultiResizeEvents } from './imageManager.js';

const imageInput = document.getElementById('imageInput'),
    widthInput = document.getElementById('widthInput'),
    heightInput = document.getElementById('heightInput'),
    maintainAspectRatio = document.getElementById('aspectRatio'),
    multipleResize = document.getElementById("multipleResize"),
    downloadBtn = document.getElementById('downloadBtn'),
    renameFileInput = document.getElementById('renameFile'),
    fileLabel = document.getElementById('fileLabel'),
    fileInfo = document.getElementById('fileInfo'),

    canvasContainer = document.getElementById('canvasContainer'),
    options = document.querySelector('.options'),

    previewCanvas = document.getElementById('previewCanvas'),
    previewCtx = previewCanvas.getContext('2d'),

    mainCanvas = document.createElement('canvas'),
    mainCtx = mainCanvas.getContext('2d'),

    resizeList = document.getElementById('resize-list'),
    addResizeBtn = document.getElementById('addResizeBtn'),

    footer = document.querySelector("footer");

let originalImage = new Image(), aspectRatio = 1, resizeOptions = [];

imageInput.addEventListener('change', function () {
    if (this.files.length === 0) return;

    const file = this.files[0];
    if (!file.type.startsWith("image/")) return alert("Please select a valid image file.");

    loadImage(file, originalImage);
    fileLabel.textContent = "Reupload Image";

    const { name, ext } = getFileDetails(file);
    const filename = `<i class="bi bi-image-fill"></i> ${name.slice(0, 10)}.${ext}`;

    renameFileInput.placeholder = name;
    fileInfo.style.display = "block";
    fileInfo.innerHTML = `${filename}<div style="font-size: 0.9rem;"><i class="bi bi-arrow-clockwise refreshing"></i> <i class="bi bi-x"></i> <i class="bi bi-arrow-clockwise refreshing"></i></div>`;

    originalImage.onload = () => {
        aspectRatio = originalImage.width / originalImage.height;
        widthInput.value = originalImage.width;
        heightInput.value = originalImage.height;

        downloadBtn.removeAttribute("disabled");
        options.removeAttribute("disabled");

        classList(document.querySelector("main"), "canvas-loaded");
        classList(canvasContainer, "hidden", false);
        classList(canvasContainer, "show");

        fileInfo.innerHTML = `${filename}<div style="font-size: 0.9rem;">${originalImage.width} <i class="bi bi-x"></i> ${originalImage.height}</div>`;

        requestAnimationFrame(() => {
            resizeCanvas(originalImage, widthInput, heightInput, mainCanvas, mainCtx);

            const { canvasWidth, canvasHeight, drawWidth, drawHeight } = calculateCanvasDimensions(
                originalImage.width, originalImage.height, 304, 304, 740, 416, aspectRatio
            );

            previewCanvas.width = canvasWidth;
            previewCanvas.height = canvasHeight;
            previewCtx.clearRect(0, 0, canvasWidth, canvasHeight);

            previewCtx.drawImage(originalImage, (canvasWidth - drawWidth) / 2, (canvasHeight - drawHeight) / 2, drawWidth, drawHeight);
        });
    };
});

const debouncedUpdate = debounce((input, relatedInput, isWidth) => {
    updateDimensions(input, relatedInput, isWidth, aspectRatio, maintainAspectRatio);
}, 200);


widthInput.addEventListener('input', () => debouncedUpdate(widthInput, heightInput, true));
heightInput.addEventListener('input', () => debouncedUpdate(heightInput, widthInput, false));
renameFileInput.addEventListener('input', () => sanitizeRenameInput(renameFileInput));

function toggleResizeInputs() {
    const resizeContainer = document.querySelector(".option-container:has(.resize-container)");
    if (multipleResize.checked) {
        document.querySelector(".option-container:has(#widthInput)").setAttribute("disabled", true);
        document.querySelector(".option-container:has(#heightInput)").setAttribute("disabled", true);
        resizeContainer.removeAttribute("disabled");
    } else {
        document.querySelector(".option-container:has(#widthInput)").removeAttribute("disabled");
        document.querySelector(".option-container:has(#heightInput)").removeAttribute("disabled");
        resizeContainer.setAttribute("disabled", true);
    }
}

multipleResize.addEventListener("change", toggleResizeInputs);
addResizeBtn.addEventListener('click', () => {
    if (resizeList.children.length >= 20) return alert("You can add up to 20 resize options only.");

    const divId = Date.now();
    const div = document.createElement('div');
    div.classList.add('resize-item');
    div.innerHTML = `
        <i class="bi bi-image-fill resize-icon"></i>
        <input type="number" placeholder="Width" class="resize-width" min="1" max="8192">
        <i class="bi bi-x"></i>
        <input type="number" placeholder="Height" class="resize-height" min="1" max="8192">
        <button class="removeResizeBtn" data-id="${divId}"><i class="bi bi-x-lg"></i></button>
    `;

    resizeList.appendChild(div);

    setupMultiResizeEvents(div, divId, resizeList, resizeOptions, addResizeBtn, updateDimensions, maintainAspectRatio);

    resizeOptions.push({ id: divId, width: 0, height: 0 });

    if (resizeList.children.length >= 20) addResizeBtn.setAttribute("disabled", true);

    updateRemoveButtons();
});

function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('.removeResizeBtn');
    if (resizeList.children.length <= 1) {
        removeButtons.forEach(btn => btn.setAttribute("disabled", true));
    } else {
        removeButtons.forEach(btn => btn.removeAttribute("disabled"));
    }
}

window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 20) {
        classList(navbar, "scroll");
    } else {
        classList(navbar, "scroll", false);
    }

});

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                classList(canvasContainer, "reduceOpacity");
            } else {
                classList(canvasContainer, "reduceOpacity", false);
            }
        });
    },
    {
        root: null,
        threshold: 0.1
    }
);

observer.observe(footer);

downloadBtn.addEventListener('click', async () => {
    try {
        downloadBtn.textContent = "Processing...";
        downloadBtn.setAttribute("disabled", true);

        let fileName = renameFileInput.value.trim() || 'resized-image';

        if (multipleResize.checked) {
            const zip = new JSZip();

            await resizeAndZip(originalImage, originalImage.width, originalImage.height, mainCanvas, mainCtx, zip);

            let hasValidSize = false;

            for (let opt of document.querySelectorAll('.resize-item')) {
                const width = parseInt(opt.querySelector('.resize-width').value);
                const height = parseInt(opt.querySelector('.resize-height').value);

                if (!width || !height) {
                    if (resizeList.children.length === 1) {
                        alert("Please enter valid width and height.");
                        throw new Error("No valid width and height provided");
                    }
                    continue;
                } else {
                    hasValidSize = true;
                    await resizeAndZip(originalImage, width, height, mainCanvas, mainCtx, zip, fileName);
                }
            }

            if (!hasValidSize) {
                alert("Please enter valid width and height.");
                throw new Error("No valid width and height provided");
            } else {
                downloadZip(zip, fileName);
            }
        } else {
            await resizeAndDownload(originalImage, widthInput, heightInput, mainCanvas, mainCtx, fileName);
        }
    } catch (error) {
        console.error("Error during download process:", error.message);
    } finally {
        downloadBtn.innerHTML = `Download`;
        downloadBtn.removeAttribute("disabled");
    }
});


if (resizeList.children.length === 0) addResizeBtn.click();

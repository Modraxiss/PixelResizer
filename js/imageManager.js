/**
 * Loads the given file and sets the image source.
 * @param {File} file
 * @param {HTMLImageElement} element
 */
export function loadImage(file, element) {
    const reader = new FileReader();
    reader.onload = (e) => {
        element.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Resizes the hidden canvas using current width/height input values.
 * @param {HTMLImageElement} image 
 * @param {HTMLInputElement} widthInput 
 * @param {HTMLInputElement} heightInput 
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} ctx 
 */
export function resizeCanvas(image, widthInput, heightInput, canvas, ctx) {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    if (!width || !height) {
        alert("Please enter valid width and height.");
        throw new Error("No valid width and height provided");
    }
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
}

/**
 * Resizes the hidden canvas using current width/height input values.
 * @param {HTMLImageElement} image 
 * @param {HTMLInputElement} width 
 * @param {HTMLInputElement} height 
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} fileName
 */
export async function resizeAndDownload(image, width, height, canvas, ctx, fileName) {
    await new Promise(resolve => {
        requestAnimationFrame(() => {
            resizeCanvas(image, width, height, canvas, ctx);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${fileName}.png`;
            link.click();

            resolve();
        });
    });
}

/**
 * Processes an image resize and adds it to the ZIP archive.
 * @param {HTMLImageElement} image 
 * @param {number} width 
 * @param {number} height 
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {JSZip} zip 
 * @param {string} fileName 
 */
export async function resizeAndZip(image, width, height, canvas, ctx, zip, fileName) {
    await new Promise(resolve => {
        requestAnimationFrame(() => {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(image, 0, 0, width, height);

            zip.file(fileName ? `${fileName}_${width}x${height}.png` : "Original.png", canvas.toDataURL('image/png').split(',')[1], { base64: true });
            resolve();
        });
    });
}

/**
 * Generates a ZIP file from images and triggers download.
 * @param {JSZip} zip 
 * @param {string} fileName 
 */
export function downloadZip(zip, fileName) {
    zip.generateAsync({ type: "blob" }).then(zipFile => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipFile);
        link.download = `${fileName}_resized_images.zip`;
        link.click();
    });
}

/**
 * Sets up event listeners for width and height input fields, 
 * allowing for dynamic resizing validation and updates.
 * Also manages adding and removing resize elements.
 *
 * @param {HTMLElement} div - The container element for the resize fields.
 * @param {string} id - The unique identifier for the resize element.
 * @param {HTMLElement} htmlList - The parent container holding all resize elements.
 * @param {Array} jsList - The JavaScript array storing resize configurations.
 * @param {HTMLElement} addBtn - The button element for adding new resize fields.
 * @param {Function} debouncedUpdate - The debounced function to update width/height dynamically.
 */
export async function setupMultiResizeEvents(div, id, htmlList, jsList, addBtn, updateDimensions, maintainAspectRatio) {
    const widthField = div.querySelector('.resize-width'),
        heightField = div.querySelector('.resize-height'),
        resizeIcon = div.querySelector('.resize-icon');

    function validateResizeInputs() {
        const width = parseInt(widthField.value);
        const height = parseInt(heightField.value);

        if (!width || !height || width <= 0 || height <= 0) {
            resizeIcon.style.color = "var(--balanced-red)";
        } else {
            resizeIcon.style.color = "var(--balanced-green)";
        }
    }

    widthField.addEventListener('input', () => {
        updateDimensions(widthField, heightField, true, 1, maintainAspectRatio);
        validateResizeInputs();
    });

    heightField.addEventListener('input', () => {
        updateDimensions(heightField, widthField, false, 1, maintainAspectRatio);
        validateResizeInputs();
    });

    div.querySelector('.removeResizeBtn').addEventListener('click', () => {
        const removeButtons = document.querySelectorAll('.removeResizeBtn');

        div.remove();
        jsList = jsList.filter(opt => opt.id !== id);

        if (htmlList.children.length <= 1) {
            removeButtons.forEach(btn => btn.setAttribute("disabled", true));
        } else {
            removeButtons.forEach(btn => btn.removeAttribute("disabled"));
        }

        if (htmlList.children.length <= 20) addBtn.removeAttribute("disabled");
    });
}

/**
 * Adds or removes a class from an element.
 * 
 * Allows dynamically toggling a CSS class on an element. 
 * If `add` is `true`, the specified class is added; if `false`, it is removed.
 * 
 * @param {HTMLElement} element - The target HTML element.
 * @param {string} _class - The class name to be added or removed.
 * @param {boolean} add - If `true`, the class is added; if `false`, it is removed. Default is `true`.
 */
export function classList(element, _class, add = true) {
    if (!element) return;
    add ? element.classList.add(_class) : element.classList.remove(_class);
}

/**
 * Updates the target field based on the input field value while maintaining the aspect ratio.
 * 
 * Adjusts the width or height of an image based on the given aspect ratio.
 * If `maintainAspectRatio` is checked, it calculates the corresponding dimension 
 * automatically to preserve the original proportions.
 * 
 * @param {HTMLInputElement} inputField - The input field where the user enters a value (width or height).
 * @param {HTMLInputElement} targetField - The field that needs to be updated (height if width is changed, and vice versa).
 * @param {boolean} isWidthChange - If `true`, `inputField` represents the width; if `false`, it represents the height.
 * @param {number} aspectRatio - The aspect ratio of the image (width / height).
 * @param {HTMLInputElement} maintainAspectRatio - Checkbox input that determines whether to maintain aspect ratio.
 */
export function updateDimensions(inputField, targetField, isWidthChange, aspectRatio, maintainAspectRatio) {
    if (maintainAspectRatio.checked) {
        let newValue = isWidthChange
            ? Math.round(inputField.value / aspectRatio)
            : Math.round(inputField.value * aspectRatio);

        const min = parseInt(targetField.min) || 1;
        const max = parseInt(targetField.max) || 8192;

        targetField.value = Math.max(min, Math.min(newValue, max));
    }
}

/**
 * Calculates optimal canvas dimensions.
 * 
 * If the image is smaller than the minimum, the canvas is set to the minimum dimensions
 * and the image is drawn at its original size (centered).
 * If the image is larger than the maximum, it is scaled down.
 * Otherwise, original dimensions are used.
 * 
 * @param {number} oWidth - Original image width.
 * @param {number} oHeight - Original image height.
 * @param {number} minW - Minimum canvas width.
 * @param {number} minH - Minimum canvas height.
 * @param {number} maxW - Maximum canvas width.
 * @param {number} maxH - Maximum canvas height.
 * @param {number} aspectRatio - The image's aspect ratio.
 * @returns {Object} - { canvasWidth, canvasHeight, drawWidth, drawHeight }
 */
export function calculateCanvasDimensions(oWidth, oHeight, minW, minH, maxW, maxH, aspectRatio) {
    let canvasWidth, canvasHeight, drawWidth, drawHeight;
    if (oWidth < minW || oHeight < minH) {
        canvasWidth = minW;
        canvasHeight = minH;
        drawWidth = oWidth;
        drawHeight = oHeight;
    } else if (oWidth > maxW || oHeight > maxH) {
        let newWidth = oWidth;
        let newHeight = oHeight;
        if (newWidth > maxW) {
            newWidth = maxW;
            newHeight = newWidth / aspectRatio;
        }
        if (newHeight > maxH) {
            newHeight = maxH;
            newWidth = newHeight * aspectRatio;
        }
        canvasWidth = newWidth;
        canvasHeight = newHeight;
        drawWidth = newWidth;
        drawHeight = newHeight;
    } else {
        canvasWidth = oWidth;
        canvasHeight = oHeight;
        drawWidth = oWidth;
        drawHeight = oHeight;
    }
    return { canvasWidth, canvasHeight, drawWidth, drawHeight };
}

/**
 * Sanitizes the file rename input by removing any forbidden characters.
 * 
 * Forbidden Characters: \ / : * ? " < >
 * 
 * @param {HTMLInputElement} element - The target HTML element.
 */
export function sanitizeRenameInput(element) {
    const forbiddenSymbols = /[\\\/:*?"<>|]/g;
    const sanitized = element.value.replace(forbiddenSymbols, '');

    if (element.value !== sanitized) {
        element.value = sanitized;
    }
}

/**
 * Extracts and returns the file name (truncated to 20 characters) and file extension.
 * The function ensures that JPEG files are consistently represented as "jpg".
 *
 * @param {HTMLInputElement} file - The file input element containing the uploaded file.
 * @returns {{ name: string, ext: string }} An object containing the truncated file name and file extension.
 */
export function getFileDetails(file) {
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const name = file.name.replace(/\.[^/.]+$/, "").slice(0, 20);
    return { name, ext };
}

/**
 * Creates a debounced function that delays invoking `func` until after `delay` milliseconds have elapsed
 * since the last time the debounced function was called.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The number of milliseconds to delay.
 * @returns {Function} A new debounced function.
 */
export function debounce(func, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}


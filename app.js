/**
 * Date: 12/11/2023
 * Author: Simanto Roy
 * Description: Color picker application with huge dom functionalities
 */

// Globals

let toastContainer = null

const defaultColors = {
    red: 221,
    green: 222,
    blue: 238
}

const defaultPresetColors = [
    '#ffcdd2',
    '#f8bbd0',
    '#e1bee7',
    '#ff8a80',
    '#ff80ab',
    '#ea80fc',
    '#b39ddb',
    '#9fa8da',
    '#90caf9',
    '#b388ff',
    '#8c9eff',
    '#82b1ff',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#80d8ff',
    '#84ffff',
    '#a7ffeb',
    '#c8e6c9',
    '#dcedc8',
    '#f0f4c3',
    '#b9f6ca',
    '#ccff90',
    '#ffcc80',
];

let customColors = new Array(24);

const sound = new Audio('./sound.wav');

window.onload = function () {
    main();
    updatedColorCodeDom(defaultColors)

    // display presets colors
    displayColorBoxes(document.getElementById('preset-colors'), defaultPresetColors)
    const customColorsString = localStorage.getItem('custom-colors');
    if (customColorsString) {
        customColors = JSON.parse(customColorsString);
        displayColorBoxes(document.getElementById('custom-colors'), customColors)
    }
}

// main or boot function, this function will take care of getting all dom references
function main() {

    // dom references
    const generateRandomColorBtn = document.getElementById('generate-random-color');
    const colorModeHexInput = document.getElementById('input-hex');
    const colorSliderRed = document.getElementById('color-slider-red')
    const colorSliderGreen = document.getElementById('color-slider-green')
    const colorSliderBlue = document.getElementById('color-slider-blue')
    const copyToClipBoardBtn = document.getElementById('copy-to-clipboard')
    const saveToCustomBtn = document.getElementById('save-to-custom')
    const presetColorsParent = document.getElementById('preset-colors')
    const customColorsParent = document.getElementById('custom-colors')
    const bgFileInput = document.getElementById('bg-file-input')
    const bgFileInputBtn = document.getElementById('bg-file-input-btn')
    const bgPreview = document.getElementById('bg-preview')
    const bgFileDeleteBtn = document.getElementById('bg-file-delete-btn')
    const bgController = document.getElementById('bg-controller')
    bgFileDeleteBtn.style.display = 'none'
    bgController.style.display = 'none'



    // event listeners
    generateRandomColorBtn.addEventListener('click', handleGenerateRandomColorBtn);
    colorModeHexInput.addEventListener('keyup', handleColorModeHexInputChange);
    colorSliderRed.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue))
    colorSliderGreen.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue))
    colorSliderBlue.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue))
    copyToClipBoardBtn.addEventListener('click', handleCopyToClipBoard)
    presetColorsParent.addEventListener('click', handlePresetColorParent)
    saveToCustomBtn.addEventListener('click', handleSaveToCustomColorBtn(customColorsParent, colorModeHexInput))
    bgFileInputBtn.addEventListener('click', function(){
        bgFileInput.click();
    })
    bgFileInput.addEventListener("change",
        handleBgFileInput(bgPreview, bgFileDeleteBtn, bgController)
    );

    bgFileDeleteBtn.addEventListener(
        "click",
        handleBgFileDeleteBtn(bgPreview, bgFileDeleteBtn, bgController, bgFileInput)
    );
    document
        .getElementById("bg-size")
        .addEventListener("change", changeBackgroundPreferences);
    document
        .getElementById("bg-repeat")
        .addEventListener("change", changeBackgroundPreferences);
    document
        .getElementById("bg-position")
        .addEventListener("change", changeBackgroundPreferences);
    document
        .getElementById("bg-attachment")
        .addEventListener("change", changeBackgroundPreferences);
}

// event handler functions
function handleGenerateRandomColorBtn() {
    const color = generateColorDecimal();
    updatedColorCodeDom(color)
}

function handleColorModeHexInputChange(e) {
    const hexColor = e.target.value;
    if (hexColor) {
        this.value = hexColor.toUpperCase();
        if (isHexValid(hexColor)) {
            const color = hexToDecimalColors(hexColor)
            updatedColorCodeDom(color)
        }
    }
}

function handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue) {
    return function () {
        const color = {
            red: parseInt(colorSliderRed.value),
            green: parseInt(colorSliderGreen.value),
            blue: parseInt(colorSliderBlue.value)
        }
        updatedColorCodeDom(color);
    }
}

function handleCopyToClipBoard() {
    const colorModeRadios = document.getElementsByName('color-mode')
    const mode = getCheckedValuesFromRadios(colorModeRadios)

    if (mode === null) {
        throw new Error("Invalid Radio Input")
    }

    if (toastContainer !== null) {
        toastContainer.remove()
        toastContainer = null
    }

    if (mode == 'hex') {
        const hexColor = document.getElementById('input-hex').value
        if (hexColor && isHexValid(hexColor)) {
            navigator.clipboard.writeText(`#${hexColor}`);
            generateToastMsg(`#${hexColor} copied`)
        } else {
            alert("Invalid Hex Color")
        }
    } else {
        const rgbColor = document.getElementById('input-rgb').value
        if (rgbColor) {
            navigator.clipboard.writeText(rgbColor);
            generateToastMsg(`${rgbColor} copied`)
        } else {
            alert("Invalid RGB Color")
        }
    }
}

function handlePresetColorParent(e) {
    const child = e.target;
    if (child.className === 'color-box') {
        navigator.clipboard.writeText(child.getAttribute('data-color'));
        if (toastContainer !== null) {
            toastContainer.remove();
            toastContainer = null;
        }
        generateToastMsg(`${child.getAttribute('data-color')} copied`);
        sound.volume = 0.2;
        sound.play();
    }
}

function handleSaveToCustomColorBtn(customColorsParent, InputHex) {
    return function () {
        const color = `#${InputHex.value}`;
        if (customColors.includes(color)) {
            alert("Color Already Saved");
            return
        }
        customColors.unshift(color);
        if (customColors.length > 24) {
            customColors = customColors.slice(0, 24);
        }
        localStorage.setItem('custom-colors', JSON.stringify(customColors));
        removeChildren(customColorsParent);
        displayColorBoxes(customColorsParent, customColors);
    }
}

function handleBgFileInput(bgPreview, bgFileDeleteBtn, bgController) {
    return function (event) {
        const file = event.target.files[0];
        const imgUrl = URL.createObjectURL(file);
        bgPreview.style.background = `url(${imgUrl})`;
        document.body.style.background = `url(${imgUrl})`;
        bgFileDeleteBtn.style.display = "inline";
        bgController.style.display = "block";
    };
}

function handleBgFileDeleteBtn(bgPreview, bgFileDeleteBtn, bgController, bgFileInput) {
    return function (event) {
        bgPreview.style.background = `none`;
        document.body.style.background = `none`;
        bgPreview.style.backgroundColor = `#DDDEEE`;
        document.body.style.backgroundColor = `#DDDEEE`;
        bgFileDeleteBtn.style.display = "none";
        bgFileInput.value = null;
        bgController.style.display = "none";
    };
}
// DOM functions

/**
 * generate dynamically dom elements to show a toast message
 * @param {string} msg 
 */
function generateToastMsg(msg) {
    toastContainer = document.createElement('div')
    toastContainer.innerText = msg
    toastContainer.className = 'toast-message toast-message-slide-in';

    toastContainer.addEventListener('click', function () {
        toastContainer.classList.remove('toast-message-slide-in')
        toastContainer.classList.add('toast-message-slide-out')

        toastContainer.addEventListener('animationend', function () {
            toastContainer.remove()
            toastContainer = null
        })
    })

    document.body.appendChild(toastContainer);
}


/**
 * find the checked elements from a list of radio buttons
 * @param {Arrays} nodes 
 * @returns {string | null}
 */
function getCheckedValuesFromRadios(nodes) {
    let checkedValue = null;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].checked) {
            checkedValue = nodes[i].value;
            break;
        }
    }
    return checkedValue;
}


/**
 * updated dom elements with calculated color values
 * @param {object} color 
 */
function updatedColorCodeDom(color) {

    const hexColor = generateHexColor(color)
    const RGBColor = generateRGBColor(color)

    document.getElementById('color-display').style.backgroundColor = `#${hexColor}`;
    document.getElementById('input-hex').value = hexColor;
    document.getElementById('input-rgb').value = RGBColor;
    document.getElementById('color-slider-red').value = color.red;
    document.getElementById('color-slider-red-label').innerText = color.red;
    document.getElementById('color-slider-green').value = color.green;
    document.getElementById('color-slider-green-label').innerText = color.green;
    document.getElementById('color-slider-blue').value = color.blue;
    document.getElementById('color-slider-blue-label').innerText = color.green

}

/**
 * create a div element with class name color-box 
 * @param {string} color 
 * @returns {object}
 */
function generateColorBox(color) {
    const div = document.createElement('div');
    div.className = 'color-box';
    div.style.backgroundColor = color;
    div.setAttribute('data-color', color);
    return div;
}

/**
 * this function will create and append new color boxes to it's parent
 * @param {Object} parent 
 * @param {Array} colors 
 */
function displayColorBoxes(parent, colors) {
    colors.forEach((color) => {
        let colorSlice = color.slice(1);
        if (isHexValid(colorSlice)) {
            const colorBox = generateColorBox(color);
            parent.appendChild(colorBox)
        }
    });
}

function changeBackgroundPreferences() {
    document.body.style.backgroundSize = document.getElementById("bg-size").value;
    document.body.style.backgroundRepeat =
        document.getElementById("bg-repeat").value;
    document.body.style.backgroundPosition =
        document.getElementById("bg-position").value;
    document.body.style.backgroundAttachment =
        document.getElementById("bg-attachment").value;
}

// Utils



/**
 * generate and return an object of three color of decimal values
 * @returns {object}
 */

function generateColorDecimal() {
    const red = Math.floor(Math.random() * 255)
    const green = Math.floor(Math.random() * 255)
    const blue = Math.floor(Math.random() * 255)
    return {
        red,
        green,
        blue
    }
}

/**
 * take a color object of three decimal values and return a hexadecimal color code
 * @param {object} color 
 * @returns {string}
 */

function generateHexColor({ red, green, blue }) {
    const getTwoCode = (value) => {
        const hex = value.toString(16)
        return hex.length === 1 ? `0${hex}` : hex
    }

    return `${getTwoCode(red)}${getTwoCode(green)}${getTwoCode(blue)}`.toUpperCase();
}

/**
 * take a color object of three decimal values and return a rgb color code
 * @param {object} color 
 * @returns {string}
 */
function generateRGBColor({ red, green, blue }) {
    return `rgb(${red}, ${green}, ${blue})`
}


/**
 * convert hex color to decimal colors object
 * @param {string} hex 
 * @returns {object}
 */
function hexToDecimalColors(hex) {
    const red = parseInt(hex.slice(0, 2), 16)
    const green = parseInt(hex.slice(2, 4), 16)
    const blue = parseInt(hex.slice(4), 16)
    return {
        red,
        green,
        blue
    }
}

/**
 * validate hex color code
 * @param {string} color 
 * @returns {boolean}
 */
function isHexValid(color) {
    if (color.length !== 6) return false;
    return /^[0-9A-Fa-f]{6}$/i.test(color)
}

/**
 * remove all children from parent
 * @param {object} parent 
 */
function removeChildren(parent) {
    let child = parent.lastElementChild;
    while (child) {
        parent.removeChild(child)
        child = parent.lastElementChild;
    }
}
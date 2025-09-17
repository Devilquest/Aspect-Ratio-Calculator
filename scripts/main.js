// Main class for handling the aspect ratio calculator
class AspectRatioCalculator {
    constructor() {
        // Cache DOM elements for performance
        this.elements = {
            arPreset: document.getElementById('arPreset'),
            arWidth: document.getElementById('arWidth'),
            arHeight: document.getElementById('arHeight'),
            widthInput: document.getElementById('widthInput'),
            heightInput: document.getElementById('heightInput'),
            clearAspectBtn: document.getElementById('clearAspectBtn'),
            clearDimensionsBtn: document.getElementById('clearDimensionsBtn'),
            calculateRatioBtn: document.getElementById('calculateRatioBtn')
        };

        // Track which dimension was last edited
        this.lastEdited = null; // 'width' or 'height'

        // List of input IDs
        this.arInputIds = ['arWidth', 'arHeight'];
        this.dimensionInputIds = ['widthInput', 'heightInput'];

        this.init();
    }

    // Method to calculate and update dimensions based on aspect ratio
    calculateDimensions() {
        // Parse values
        const arW = parseFloat(this.elements.arWidth.value.trim());
        const arH = parseFloat(this.elements.arHeight.value.trim());
        let width = parseFloat(this.elements.widthInput.value.trim());
        let height = parseFloat(this.elements.heightInput.value.trim());

        // Enable/disable clear buttons
        const hasAspect = this.arInputIds.some(id => this.elements[id].value !== '');
        this.elements.clearAspectBtn.disabled = !hasAspect;

        const hasDimensions = this.dimensionInputIds.some(id => this.elements[id].value !== '');
        this.elements.clearDimensionsBtn.disabled = !hasDimensions;

        // Enable/disable the calculate ratio button
        const canCalculateRatio = !isNaN(width) && width > 0 && !isNaN(height) && height > 0;
        this.elements.calculateRatioBtn.disabled = !canCalculateRatio;

        // If aspect ratio is invalid, do nothing further
        if (isNaN(arW) || isNaN(arH) || arW <= 0 || arH <= 0) {
            return;
        }

        // Calculate based on last edited dimension
        if (this.lastEdited === 'width') {
            if (!isNaN(width) && width > 0) {
                height = width * (arH / arW);
                this.elements.heightInput.value = this.formatResult(height);
            }
        } else if (this.lastEdited === 'height') {
            if (!isNaN(height) && height > 0) {
                width = height * (arW / arH);
                this.elements.widthInput.value = this.formatResult(width);
            }
        }
    }

    // Method to calculate aspect ratio from dimensions
    calculateAspectRatio() {
        const width = parseFloat(this.elements.widthInput.value.trim());
        const height = parseFloat(this.elements.heightInput.value.trim());

        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            return;
        }

        // Use GCD to find the simplest ratio
        const commonDivisor = this._gcd(width, height);
        const ratioWidth = width / commonDivisor;
        const ratioHeight = height / commonDivisor;

        this.elements.arWidth.value = this.formatResult(ratioWidth);
        this.elements.arHeight.value = this.formatResult(ratioHeight);
        this.elements.arPreset.value = ''; // Reset preset

        // Trigger calculation to ensure consistency
        this.calculateDimensions();
    }

    // Helper function for Greatest Common Divisor (Euclidean algorithm)
    _gcd(a, b) {
        if (b === 0) {
            return a;
        }
        return this._gcd(b, a % b);
    }

    // Format result: integer if whole, else fixed decimals
    formatResult(value) {
        if (Number.isInteger(value)) {
            return value.toString();
        } else if (Math.abs(value) < 0.01) {
            return value.toExponential(2);
        } else {
            return value.toFixed(5).replace(/\.?0+$/, '');
        }
    }

    // Handle preset selection: fill AR fields and calculate
    handlePresetChange() {
        const value = this.elements.arPreset.value;
        if (value) {
            const [w, h] = value.split(':');
            this.elements.arWidth.value = w;
            this.elements.arHeight.value = h;
            this.calculateDimensions();
        }
    }

    // Clear aspect ratio fields
    clearAspect() {
        if (!this.elements.clearAspectBtn.disabled) {
            this.arInputIds.forEach(id => {
                this.elements[id].value = '';
            });
            this.elements.arPreset.value = ''; // Also reset preset
            this.calculateDimensions(); // Update button states
        }
    }

    // Clear dimension fields
    clearDimensions() {
        if (!this.elements.clearDimensionsBtn.disabled) {
            this.dimensionInputIds.forEach(id => {
                this.elements[id].value = '';
            });
            this.calculateDimensions(); // Update button states
        }
    }

    // Validate key presses: allow numbers and control keys
    isAllowedKey(event, input) {
        const key = event.key;
        if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
            return true;
        }
        if (/^[0-9]$/.test(key)) return true;
        if (key === "." && !input.value.includes(".")) return true;
        return false;
    }

    // Initialize event listeners and state
    init() {
        // Event listener for preset select
        this.elements.arPreset.addEventListener('change', () => this.handlePresetChange());

        // Event listeners for all inputs
        [...this.arInputIds, ...this.dimensionInputIds].forEach(id => {
            const element = this.elements[id];
            if (!element) return;

            const isDimensionInput = this.dimensionInputIds.includes(id);

            if (isDimensionInput) {
                element.addEventListener('focus', () => {
                    this.lastEdited = id === 'widthInput' ? 'width' : 'height';
                });
            }

            ['input', 'keyup', 'change'].forEach(eventType => {
                element.addEventListener(eventType, () => {
                    if (this.arInputIds.includes(id)) {
                        this.elements.arPreset.value = ''; // Reset preset on manual AR change
                    }
                    this.calculateDimensions();
                });
            });

            element.addEventListener('paste', () => setTimeout(() => this.calculateDimensions(), 10));

            element.addEventListener("keydown", (event) => {
                if (!this.isAllowedKey(event, element)) {
                    event.preventDefault();
                }
            });
        });

        // Event listener for the calculate ratio button
        this.elements.calculateRatioBtn.addEventListener('click', () => this.calculateAspectRatio());

        // Clear buttons
        this.elements.clearAspectBtn.addEventListener('click', () => this.clearAspect());
        this.elements.clearDimensionsBtn.addEventListener('click', () => this.clearDimensions());

        // Initial state
        document.addEventListener('DOMContentLoaded', () => {
            this.arInputIds.forEach(id => this.elements[id].value = '');
            this.dimensionInputIds.forEach(id => this.elements[id].value = '');
            this.elements.clearAspectBtn.disabled = true;
            this.elements.clearDimensionsBtn.disabled = true;
            this.elements.calculateRatioBtn.disabled = true;
            this.handlePresetChange();
        });
    }
}

// Instantiate the calculator
const calculator = new AspectRatioCalculator();
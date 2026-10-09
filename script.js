/**
 * Modern Scientific Calculator Engine
 * Designed by Sameen
 */

class Calculator {
    constructor(historyElement, primaryElement, copyBadgeElement) {
        this.historyElement = historyElement;
        this.primaryElement = primaryElement;
        this.copyBadgeElement = copyBadgeElement;

        this.angleMode = 'DEG'; // 'DEG' or 'RAD'
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.isEvaluated = false;
        this.updateDisplay();
    }

    delete() {
        if (this.shouldResetScreen || this.currentOperand === 'Error' || this.isEvaluated) {
            this.clear();
            return;
        }

        if (this.currentOperand.length === 1 || 
            (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') {
            this.clear();
        }

        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (this.isEvaluated) {
            this.currentOperand = '';
            this.previousOperand = '';
            this.isEvaluated = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) {
            // Check if last segment after operator has decimal
            const lastPart = this.currentOperand.split(/[\s+\-×÷^*/]/).pop();
            if (lastPart && lastPart.includes('.')) return;
        }

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand += number.toString();
        }

        this.updateDisplay();
    }

    appendParen(paren) {
        if (this.currentOperand === 'Error') {
            this.clear();
        }

        if (this.isEvaluated) {
            this.currentOperand = '';
            this.previousOperand = '';
            this.isEvaluated = false;
        }

        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (paren === '(') {
            if (this.currentOperand === '0' || this.currentOperand === '') {
                this.currentOperand = '(';
            } else if (/[\d)]$/.test(this.currentOperand.trim())) {
                this.currentOperand += ' × (';
            } else {
                this.currentOperand += '(';
            }
        } else if (paren === ')') {
            if (this.currentOperand !== '0' && this.currentOperand !== '') {
                this.currentOperand += ')';
            }
        }
        this.updateDisplay();
    }

    setConstant(name) {
        if (this.shouldResetScreen || this.isEvaluated) {
            this.shouldResetScreen = false;
            this.isEvaluated = false;
        }
        
        let val;
        if (name === 'pi') {
            val = Math.PI;
            this.historyElement.textContent = 'π';
        } else if (name === 'e') {
            val = Math.E;
            this.historyElement.textContent = 'e';
        }

        this.currentOperand = this.formatResult(val);
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;

        if (this.isEvaluated) {
            this.isEvaluated = false;
        }

        // If current operand has parentheses, evaluate it first
        if (this.currentOperand.includes('(')) {
            this.compute();
        }

        if (this.previousOperand !== '' && !this.shouldResetScreen) {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    safeEvaluateExpression(expr) {
        let sanitized = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/\^/g, '**');

        if (!/^[\d\s+\-*/().%]+$/.test(sanitized)) {
            throw new Error('Invalid characters');
        }

        sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
        const result = Function(`"use strict"; return (${sanitized})`)();
        if (!isFinite(result)) {
            throw new Error('Invalid calculation');
        }
        return result;
    }

    compute() {
        // If operand has parentheses, evaluate as full mathematical expression
        if (this.currentOperand.includes('(') || this.currentOperand.includes(')')) {
            try {
                let fullExpr = this.currentOperand;
                if (this.previousOperand !== '' && this.operation != null) {
                    const opSymbol = this.getOperatorSymbol(this.operation);
                    fullExpr = `${this.previousOperand} ${opSymbol} ${this.currentOperand}`;
                }
                const result = this.safeEvaluateExpression(fullExpr);
                this.historyElement.textContent = `${fullExpr} =`;
                this.currentOperand = this.formatResult(result);
                this.operation = undefined;
                this.previousOperand = '';
                this.shouldResetScreen = true;
                this.isEvaluated = true;
                this.updateDisplay();
                return;
            } catch (e) {
                this.showError('Invalid Expression');
                return;
            }
        }

        if (this.operation == null || this.previousOperand === '' || (this.shouldResetScreen && !this.isEvaluated)) {
            return;
        }

        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        let computation;
        const opSymbol = this.getOperatorSymbol(this.operation);

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                computation = prev / current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }

        this.historyElement.textContent = `${this.formatDisplayNumber(this.previousOperand)} ${opSymbol} ${this.formatDisplayNumber(this.currentOperand)} =`;
        this.currentOperand = this.formatResult(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.isEvaluated = true;
        this.updateDisplay();
    }

    percent() {
        if (this.currentOperand === 'Error') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;

        let computation;
        if (this.previousOperand !== '' && (this.operation === '+' || this.operation === '-')) {
            const prev = parseFloat(this.previousOperand);
            computation = (prev * current) / 100;
        } else {
            computation = current / 100;
        }

        this.currentOperand = this.formatResult(computation);
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    negate() {
        if (this.currentOperand === 'Error' || this.currentOperand === '0') return;

        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
        this.updateDisplay();
    }

    applyScientific(action) {
        if (this.currentOperand === 'Error') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;

        let result;
        let exprLabel = '';

        switch (action) {
            case 'sin':
                const sinAngle = this.angleMode === 'DEG' ? (current * Math.PI) / 180 : current;
                result = Math.sin(sinAngle);
                if (this.angleMode === 'DEG' && current % 180 === 0) result = 0;
                exprLabel = `sin(${current})`;
                break;
            case 'cos':
                const cosAngle = this.angleMode === 'DEG' ? (current * Math.PI) / 180 : current;
                result = Math.cos(cosAngle);
                if (this.angleMode === 'DEG' && (current - 90) % 180 === 0) result = 0;
                exprLabel = `cos(${current})`;
                break;
            case 'tan':
                if (this.angleMode === 'DEG' && (current - 90) % 180 === 0) {
                    this.showError('Undefined');
                    return;
                }
                const tanAngle = this.angleMode === 'DEG' ? (current * Math.PI) / 180 : current;
                result = Math.tan(tanAngle);
                if (this.angleMode === 'DEG' && current % 180 === 0) result = 0;
                exprLabel = `tan(${current})`;
                break;
            case 'ln':
                if (current <= 0) {
                    this.showError('Invalid input');
                    return;
                }
                result = Math.log(current);
                exprLabel = `ln(${current})`;
                break;
            case 'log':
                if (current <= 0) {
                    this.showError('Invalid input');
                    return;
                }
                result = Math.log10(current);
                exprLabel = `log(${current})`;
                break;
            case 'sqrt':
                if (current < 0) {
                    this.showError('Invalid input');
                    return;
                }
                result = Math.sqrt(current);
                exprLabel = `√(${current})`;
                break;
            case 'square':
                result = current * current;
                exprLabel = `sqr(${current})`;
                break;
            case 'exp':
                result = Math.exp(current);
                exprLabel = `e^(${current})`;
                break;
            case 'inverse':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = 1 / current;
                exprLabel = `1/(${current})`;
                break;
            case 'factorial':
                if (current < 0 || !Number.isInteger(current)) {
                    this.showError('Invalid input');
                    return;
                }
                if (current > 170) {
                    result = Infinity;
                } else {
                    result = this.calculateFactorial(current);
                }
                exprLabel = `fact(${current})`;
                break;
            default:
                return;
        }

        this.historyElement.textContent = `${exprLabel} =`;
        this.currentOperand = this.formatResult(result);
        this.shouldResetScreen = true;
        this.isEvaluated = true;
        this.updateDisplay();
    }

    calculateFactorial(n) {
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) {
            res *= i;
        }
        return res;
    }

    toggleAngleMode() {
        this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG';
        return this.angleMode;
    }

    showError(message) {
        this.currentOperand = 'Error';
        this.historyElement.textContent = message;
        this.shouldResetScreen = true;
        this.isEvaluated = true;
        this.updateDisplay();
    }

    formatResult(num) {
        if (!isFinite(num)) return 'Error';
        
        // Round floating point inaccuracies (e.g. 0.1 + 0.2 = 0.3)
        const precision = 12;
        let rounded = parseFloat(num.toPrecision(precision));

        // Format extreme numbers in exponential, otherwise standard string
        if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-7)) {
            return rounded.toExponential(6);
        }
        return rounded.toString();
    }

    getOperatorSymbol(op) {
        switch (op) {
            case '/': return '÷';
            case '*': return '×';
            case '-': return '−';
            case '+': return '+';
            case '^': return '^';
            default: return '';
        }
    }

    formatDisplayNumber(numberStr) {
        if (numberStr === 'Error' || !numberStr) return numberStr;
        if (numberStr.includes('e') || numberStr.includes('(') || numberStr.includes(')')) return numberStr;

        const parts = numberStr.toString().split('.');
        const integerPart = parseFloat(parts[0]);
        const decimalPart = parts[1];

        let formattedInteger;
        if (isNaN(integerPart)) {
            formattedInteger = parts[0] === '-' ? '-' : '';
        } else {
            formattedInteger = integerPart.toLocaleString('en-US');
        }

        if (decimalPart != null) {
            return `${formattedInteger}.${decimalPart}`;
        }
        return formattedInteger;
    }

    updateDisplay() {
        this.primaryElement.textContent = this.formatDisplayNumber(this.currentOperand);

        if (!this.isEvaluated) {
            if (this.operation != null) {
                const opSymbol = this.getOperatorSymbol(this.operation);
                this.historyElement.textContent = `${this.formatDisplayNumber(this.previousOperand)} ${opSymbol}`;
            } else {
                this.historyElement.textContent = '';
            }
        }

        // Adjust font size for very long numbers
        const charCount = this.primaryElement.textContent.length;
        if (charCount > 13) {
            this.primaryElement.style.fontSize = '1.7rem';
        } else if (charCount > 9) {
            this.primaryElement.style.fontSize = '2.1rem';
        } else {
            this.primaryElement.style.fontSize = '';
        }
    }

    async copyToClipboard() {
        if (this.currentOperand === 'Error') return;
        try {
            await navigator.clipboard.writeText(this.currentOperand);
            if (this.copyBadgeElement) {
                this.copyBadgeElement.classList.add('show');
                setTimeout(() => {
                    this.copyBadgeElement.classList.remove('show');
                }, 1500);
            }
        } catch (err) {
            console.warn('Copy to clipboard failed: ', err);
        }
    }
}

// -----------------------------------------------------------------------------
// Application Initialization & Event Listeners
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const historyDisplay = document.getElementById('historyDisplay');
    const primaryDisplay = document.getElementById('primaryDisplay');
    const copyBadge = document.getElementById('copyBadge');
    const displayWrapper = document.getElementById('displayWrapper');
    const keypad = document.getElementById('keypad');
    const angleModeBtn = document.getElementById('angleModeBtn');
    const calcModeBtn = document.getElementById('calcModeBtn');
    const calculatorCard = document.querySelector('.calculator-card');

    const calc = new Calculator(historyDisplay, primaryDisplay, copyBadge);

    // Click to copy result
    displayWrapper.addEventListener('click', () => {
        calc.copyToClipboard();
    });

    // Angle mode switch (DEG / RAD)
    angleModeBtn.addEventListener('click', () => {
        const currentMode = calc.toggleAngleMode();
        angleModeBtn.textContent = currentMode;
        angleModeBtn.classList.toggle('active', currentMode === 'RAD');
    });

    // Scientific mode switch
    const toggleSciMode = (forceState) => {
        const isSci = typeof forceState === 'boolean' 
            ? forceState 
            : !calculatorCard.classList.contains('scientific-active');
        calculatorCard.classList.toggle('scientific-active', isSci);
        calcModeBtn.classList.toggle('active', isSci);
        const modeText = calcModeBtn.querySelector('.mode-text');
        if (modeText) {
            modeText.textContent = isSci ? 'Basic' : 'Sci';
        }
    };

    calcModeBtn.addEventListener('click', () => toggleSciMode());

    if (window.location.hash === '#sci') {
        toggleSciMode(true);
    }

    // Keypad Click Event Delegation
    keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        // Button press visual animation
        btn.classList.add('btn-active');
        setTimeout(() => btn.classList.remove('btn-active'), 120);

        const num = btn.dataset.num;
        const action = btn.dataset.action;
        const value = btn.dataset.value;

        if (num !== undefined) {
            calc.appendNumber(num);
            return;
        }

        switch (action) {
            case 'clear':
                calc.clear();
                break;
            case 'delete':
                calc.delete();
                break;
            case 'decimal':
                calc.appendNumber('.');
                break;
            case 'operator':
                calc.chooseOperation(value);
                break;
            case 'equals':
                calc.compute();
                break;
            case 'percent':
                calc.percent();
                break;
            case 'negate':
                calc.negate();
                break;
            case 'pi':
            case 'e':
                calc.setConstant(action);
                break;
            case 'power':
                calc.chooseOperation('^');
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'ln':
            case 'log':
            case 'sqrt':
            case 'square':
            case 'exp':
            case 'inverse':
            case 'factorial':
                calc.applyScientific(action);
                break;
            case 'openParen':
                calc.appendParen('(');
                break;
            case 'closeParen':
                calc.appendParen(')');
                break;
            default:
                break;
        }
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        // Prevent default scrolling on space / slash
        if (['/', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
        }

        let matchedBtn = null;

        if (e.key >= '0' && e.key <= '9') {
            calc.appendNumber(e.key);
            matchedBtn = document.querySelector(`.btn-num[data-num="${e.key}"]`);
        } else if (e.key === '.' || e.key === ',') {
            calc.appendNumber('.');
            matchedBtn = document.querySelector(`.btn-num[data-action="decimal"]`);
        } else if (['+', '-', '*', '/'].includes(e.key)) {
            calc.chooseOperation(e.key);
            matchedBtn = document.querySelector(`.btn-operator[data-value="${e.key}"]`);
        } else if (e.key === 'Enter' || e.key === '=') {
            calc.compute();
            matchedBtn = document.querySelector('.btn-equals');
        } else if (e.key === 'Backspace') {
            calc.delete();
            matchedBtn = document.querySelector('.btn-action[data-action="delete"]');
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            calc.clear();
            matchedBtn = document.querySelector('.btn-action[data-action="clear"]');
        } else if (e.key === '%') {
            calc.percent();
            matchedBtn = document.querySelector('.btn-action[data-action="percent"]');
        } else if (e.key === '^') {
            calc.chooseOperation('^');
            matchedBtn = document.querySelector('.btn-sci[data-action="power"]');
        } else if (e.key === '(') {
            calc.appendParen('(');
            matchedBtn = document.querySelector('.btn-sci[data-action="openParen"]');
        } else if (e.key === ')') {
            calc.appendParen(')');
            matchedBtn = document.querySelector('.btn-sci[data-action="closeParen"]');
        }

        if (matchedBtn) {
            matchedBtn.classList.add('btn-active');
            setTimeout(() => matchedBtn.classList.remove('btn-active'), 140);
        }
    });
});
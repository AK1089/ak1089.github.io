function convertDecToHex() {
    var decimalInput = document.getElementById('decimal');
    var hexadecimalInput = document.getElementById('hexadecimal');
    var decimalValue = parseInt(decimalInput.value, 10);

    if (/^[0-9]+$/.test(decimalValue)) {
        hexadecimalInput.value = decimalValue.toString(16).toLowerCase();
    } else {
        hexadecimalInput.value = '';
    }
}

function convertHexToDec() {
    var decimalInput = document.getElementById('decimal');
    var hexadecimalInput = document.getElementById('hexadecimal');
    var hexadecimalValue = hexadecimalInput.value;

    if (/^[0-9A-Fa-f]+$/.test(hexadecimalValue)) {
        decimalInput.value = parseInt(hexadecimalValue, 16);
    } else {
        decimalInput.value = '';
    }
}

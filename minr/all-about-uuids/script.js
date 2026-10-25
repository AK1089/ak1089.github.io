function convertDecToHex() {
    var decimalInput = document.getElementById('decimal');
    var hexadecimalInput = document.getElementById('hexadecimal');
    var decimalValue = decimalInput.value.trim();

    if (/^-?[0-9]+$/.test(decimalValue)) {
        hexadecimalInput.value = parseInt(decimalValue, 10).toString(16).toLowerCase();
    } else {
        hexadecimalInput.value = '';
    }
}

function convertHexToDec() {
    var decimalInput = document.getElementById('decimal');
    var hexadecimalInput = document.getElementById('hexadecimal');
    var hexadecimalValue = hexadecimalInput.value.trim();

    if (/^-?[0-9A-Fa-f]+$/.test(hexadecimalValue)) {
        decimalInput.value = parseInt(hexadecimalValue, 16);
    } else {
        decimalInput.value = '';
    }
}

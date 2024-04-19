// title alternator
document.addEventListener('DOMContentLoaded', function() {
    var titleElement = document.getElementById('title');
    
    titleElement.addEventListener('click', function() {
        if (titleElement.textContent === 'Avish') {
            titleElement.textContent = 'AK1089';
        } else {
            titleElement.textContent = 'Avish';
        }
    });
});
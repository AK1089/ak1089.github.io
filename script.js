// on load
document.addEventListener('DOMContentLoaded', function() {

    // title updator
    var titleElement = document.getElementById('title');
    
    titleElement.addEventListener('click', function() {
        if (titleElement.textContent === 'Avish') {
            titleElement.textContent = 'AK1089';
        } else {
            titleElement.textContent = 'Avish';
        }
    });

    // age updator
    var ageElement = document.getElementById('agenumber');
    var tooltipElement = document.getElementById('agetooltip');
    var birthDate = new Date('2004-02-07');
    var currentDate = new Date();
    var age = currentDate.getFullYear() - birthDate.getFullYear();
    var monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    ageElement.textContent = age + ' ';
    tooltipElement.textContent = 'Birthday: ' + birthDate.toDateString();
});
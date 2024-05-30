function fill_out_variables() {

    var birthDate = new Date('2004-02-07');
    var currentDate = new Date();
    var age = currentDate.getFullYear() - birthDate.getFullYear();
    var monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }

    current_age_in_days = 'I was born on ' + birthDate.toDateString() + ', making me ' + (Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))).toString() + ' days old.';

    const expressions = [
        "\\[ \\oint_{C} (P \\, dx + Q \\, dy) = \\iint_{D} \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) \\, dA \\quad \\text{(Green's Theorem).} \\]",
        "\\[ \\frac{1}{\\pi} = \\frac{2\\sqrt{2}}{9801} \\sum_{k=0}^{\\infty} \\frac{(4k)!(1103 + 26390k)}{(k!)^4 396^{4k}} \\quad \\text{(Ramanujan's Identity).} \\]",
        "\\[ n! \\approx \\sqrt{2 \\pi n} \\left(\\frac{n}{e}\\right)^n \\quad \\text{(Stirling's Approximation).} \\]",
        "\\[ \\mathbb{P}(A|B) = \\frac{\\mathbb{P}(B|A) \\mathbb{P}(A)}{\\mathbb{P}(B)} \\quad \\text{(Bayes' Theorem).} \\]",
        "\\[ \\left( \\int_a^b f(x) g(x) \\, dx \\right)^2 \\leq \\left( \\int_a^b f(x)^2 \\, dx \\right) \\left( \\int_a^b g(x)^2 \\, dx \\right) \\quad \\text{(Cauchy-Schwarz Inequality).} \\]",
        "\\[ \\mathbb{P} \\left( |X-\\mu| \\geq k \\sigma \\right) \\leq \\frac{1}{k^2} \\quad \\text{(Chebyshev's Inequality).} \\]"
    ]

    // Define your global variable dictionary
    const variables = {
        current_age_in_years: age.toString(),
        current_age_in_days: current_age_in_days.toString(),
        current_date: currentDate.toLocaleTimeString(),
        mathematical_expression: expressions[Math.floor(Math.random()*expressions.length)]
    };

    return variables

}

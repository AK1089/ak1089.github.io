---
title: Fun Facts - Sources and Calculations
date: 2025-01-04
---

This page provides detailed calculations and commentary for facts on my [fun facts](/other/fun-facts) page that require more than a simple source link.

## Space and Astronomy

<h3 id="eclipses">Earth's Perfect Eclipses</h3>

The Sun's diameter is approximately $`1.393 \times 10^6`$ km ([NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html#:~:text=Volumetric%20mean%20radius%20(km)%20%20%20%20%20%20%20%20%20%20695700)), while the Moon's diameter is approximately $`3475`$ km ([NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html#:~:text=Volumetric%20mean%20radius%20(km)%20%20%20%20%20%20%20%20%201737.4)). The diameter ratio is thus $`1.393 \times 10^6 / 3475 = 400.9`$.

The Earth-Sun distance averages $`1.496 \times 10^8`$ km ([IAU](https://www.iau.org/static/resolutions/IAU2012_English.pdf)), and the Earth-Moon distance averages $`3.844 \times 10^5`$ km ([NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html#:~:text=Semimajor%20axis%20(10%5E6%20km)%20%20%20%20%20%20%20%200.3844)). The distance ratio is $`1.496 \times 10^8 / 3.844 \times 10^5 = 389.2`$.

The apparent angular size of an object is proportional to its diameter divided by its distance. Since the ratios nearly cancel ($`400.9 / 389.2 = 1.03`$), the Sun and Moon appear almost exactly the same size. The Moon's elliptical orbit (perigee $`356500`$ km, apogee $`406700`$ km) creates ~14% variation, giving apparent size ratios from about 90% (annular eclipse) to 108% (total eclipse).

<h3 id="sun-water">Sun's Peak Emission and Water Transparency</h3>

The Sun's surface temperature is approximately $`5772 ^\circ \text{K}`$ ([NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html#:~:text=Effective%20temperature%20(K)%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%205772)). Wien's displacement law gives peak wavelength $`\lambda_\text{max} = 2.898 \times 10^{-3} / T`$, which equals $`2.898 \times 10^{-3} / 5772 = 502 \ \text{nm}`$ ([HyperPhysics](http://hyperphysics.phy-astr.gsu.edu/hbase/wien.html)). Water's absorption coefficient is minimal between 400–700nm ([HyperPhysics](http://hyperphysics.phy-astr.gsu.edu/hbase/Chemical/watabs.html)).

<h3 id="neutron-star">Neutron Star Density</h3>

Neutron stars have a lower-bound density of $`3.7 \times 10^{17}`$ kg/m³ ([Wikipedia](https://en.wikipedia.org/wiki/Neutron_star#:~:text=3.7%C3%971017%20to%205.9%C3%971017%C2%A0kg/m3), citing Lattimer & Prakash 2004). A standard die is 16mm across ([Wikipedia](https://en.wikipedia.org/wiki/Dice#Arrangement:~:text=most%20often%201.6%C2%A0cm%20(0.63%C2%A0in)%20across)), which corresponds to a volume of $`(0.016)^3 = 4.096 \times 10^{-6} \ \text{m}^3`$. At the above density, this gives a mass of $`3.7 \times 10^{17} \times 4.096 \times 10^{-6} = 1.52 \times 10^{12} \ \text{kg}`$.

Meanwhile, the average adult weighs around $`62 \ \text{kg}`$ ([BMC Public Health](https://bmcpublichealth.biomedcentral.com/articles/10.1186/1471-2458-12-439)). At a 2025 population of around $`8.1 \times 10^9`$ people ([Worldometers](https://www.worldometers.info/world-population/)), the total weight of the human race is around $`5.0 \times 10^{11} \ \text{kg}`$ (using adult weight as an upper bound), or around a third of the weight of the die-sized piece of neutron star.

<h3 id="mercury-closest">Mercury is the Closest Planet on Average</h3>

This counterintuitive result arises because "closest on average" depends on orbital positions over time, not orbital radii. Venus has an orbit closer to Earth's, but spends significant time on the opposite side of the Sun. Mercury's small, fast orbit (88-day period) means it's never very far from the Sun, and thus never very far from Earth. When averaged over time, Mercury spends more time at moderate distances than Venus does.

A 2019 Physics Today article demonstrated this using simulation ([Physics Today](https://physicstoday.scitation.org/do/10.1063/pt.6.3.20190312a/full/)). The same logic applies to all planets: Mercury is closest on average to Venus, Mars, Jupiter, etc. Also explained by [CGP Grey](https://www.youtube.com/watch?v=SumDHcnCRuU).

## Geography

<h3 id="nyc-istanbul">NYC, Istanbul, and Paris Latitudes</h3>

New York City sits at 40.7128°N ([Wikipedia](https://en.wikipedia.org/wiki/New_York_City#:~:text=40.7128%C2%B0N)), while Istanbul is at 41.0082°N ([Wikipedia](https://en.wikipedia.org/wiki/Istanbul#:~:text=41%C2%B001%E2%80%B210%E2%80%B3N)). Paris is at 48.8566°N ([Wikipedia](https://en.wikipedia.org/wiki/Paris#:~:text=48%C2%B051%E2%80%B224%E2%80%B3N)), and Seattle—the northernmost major US city—is at 47.6062°N ([Wikipedia](https://en.wikipedia.org/wiki/Seattle#:~:text=47%C2%B036%E2%80%B222%E2%80%B3N)).

## Computers

<h3 id="gold-ewaste">Gold in Laptops vs. Gold Ore</h3>

Circuit boards contain approximately 200–350 g of gold per metric ton ([ACS](https://cen.acs.org/environment/recycling/Electronic-waste-gold-mine-waiting/102/i23#:~:text=One%20ton%20of%20PCBs%20contains%20at%20least%20200%20kg%20of%20copper%2C%200.4%20kg%20of%20silver%2C%20and%200.09%20kg%20of%20gold)). Average gold ore grade is 1–5 g per metric ton, with high-grade ore up to 10 g/ton ([USGS](https://www.usgs.gov/centers/national-minerals-information-center/gold-statistics-and-information)). 1 ton of laptops thus contains ~250g gold, while 10 tons of average ore (at 3g per ton) contains ~30g gold.

## Miscellaneous

<h3 id="child-poverty">UK Child Poverty</h3>

UK relative child poverty is measured as households below 60% of median income ([UK Government](https://www.gov.uk/government/statistics/households-below-average-income-199495-to-202223)). The 2008 financial crisis caused median incomes to fall significantly. Since the poverty threshold is defined relative to the median, the threshold itself dropped—meaning fewer people counted as poor even though their actual incomes hadn't risen. This is a known limitation of relative poverty measures ([IFS](https://ifs.org.uk/publications/child-poverty-trends-and-policy-options), [Economics Observatory](https://www.economicsobservatory.com/what-has-happened-to-child-poverty-in-the-uk-over-the-last-30-years)).

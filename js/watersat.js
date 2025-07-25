// for each in input
const inputs = document.querySelectorAll("input");

document.addEventListener("DOMContentLoaded", () => {
    const btncalc = document.querySelector("#btncalc");
    if (btncalc) {
        btncalc.addEventListener("click", () => {
            const GasTemp = Number(document.getElementById("GasTemp").value);
            const GasPres = Number(document.getElementById("GasPres").value);
            const resPara = document.getElementById("result");

            if (isNaN(GasTemp) || isNaN(GasPres)) {
                alert("Por favor, ingrese valores numéricos válidos en todos los campos.");
                return;
            }

            if (GasTemp > 100 || GasTemp < -40) {
                alert("La temperatura debe estar entre -40 y 100 °C.");
                clearres();
                return;
            }
            if (GasPres > 680) {
                alert("La presión debe ser menor de 680 kgf/cm²g.");
                clearres();
                return;
            }
            let WC = water_content(GasPres, GasTemp);
            // changing the result para to the result
            if (resPara) {
                resPara.innerHTML = `Water Content: ${WC.toFixed(3)} mg/Sm3`;
            }
        });
    }

    const btnclear = document.querySelector("#btnclear");
    if (btnclear) {
        btnclear.addEventListener("click", () => {
            clearres();
        });
    }
});


function clearres() {
    const resPara = document.getElementById("result");
    if (resPara) {
        resPara.innerHTML = "";
    }
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
        input.value = "";
    });
}

function water_content(pres, temp) {
    /*
      Return the Water of a gas, temperature range
      35 70 C, for other ranges see link
      Parameters
      ----------
      Temp : float
          Temperature of the gas in C
      Pressure : float
          Pressure Of gas in kgf/cm2g
      Returns
      -------
      float
          Water content in kg / MMSCM (10^6 Sm3)

      References
      ----------
      Ref:
      https://www.jmcampbell.com/tip-of-the-month/2014/09/lean-sweet-natural-gas-water-content-correlation/

     */

    pres = pres * 0.96784111;
    let coefA;
    let coefB;
    let coefC;
    let A;
    let B;
    if (temp < 0) {
        coefA = [163.1849, 0.556459];
        coefB = [99.1666, 100.2622];
        coefC = [37.18175, 44.00488];
    } else if (temp < 35) {
        coefA = [1011.528, 2.392205];
        coefB = [150.152, 153.4538];
        coefC = [46.04953, 53.93539];
    } else if (temp < 70) {
        coefA = [8012.09, 5.148325];
        coefB = [229.152, 186.1237];
        coefC = [60.06752, 59.92855];
    } else if (temp < 100) {
        coefA = [8101.695, 1.56];
        coefB = [232.5031, 108.4];
        coefC = [61.19779, 33.03525];
    } else {
        // Handle out of range temperatures explicitly if needed, or fall back
        // For now, let's just return 0 or show an error if not already handled by alert
        console.warn("Temperature out of typical correlation range for water content calculation.");
        return 0;
    }
    A = coefA[0] * Math.exp((-1 * (temp - coefB[0]) ** 2) / (2 * coefC[0] ** 2));
    B = coefA[1] * Math.exp((-1 * (temp - coefB[1]) ** 2) / (2 * coefC[1] ** 2));
    return (A / pres + B) * 1000;
}

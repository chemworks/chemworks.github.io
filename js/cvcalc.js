function convert_CtoRa(c) { return (c + 273.15) * (9 / 5); }

function convert_kgftopsi(P) { return (P * 14.223 + 14.223); }

function convert_m3tocuft(F) { return F * 35.314667; }

let calcmode = "cvmode";

// Event listeners for radio buttons
document.addEventListener("DOMContentLoaded", () => {
    let cvmodeRadio = document.getElementById("cvmode");
    let flowRadio = document.getElementById("flow");

    if (cvmodeRadio) {
        cvmodeRadio.addEventListener("change", () => { changecalcmode(); });
    }
    if (flowRadio) {
        flowRadio.addEventListener("change", () => { changecalcmode(); });
    }

    // Initial call to set the correct display
    changecalcmode();

    const btncalc = document.getElementById("btncalc");
    if (btncalc) {
        btncalc.addEventListener("click", () => {
            if (calcmode == "cvmode") {
                runCalcCv();
            }
            if (calcmode == "flow") {
                runCalcFlow();
            }
        });
    }

    const btnclear = document.getElementById("btnclear");
    if (btnclear) {
        btnclear.addEventListener("click", () => {
            clearinput();
        });
    }
});


function changecalcmode() {
    const calcCV = document.getElementById("classCV");
    const calcFlow = document.getElementById("classFlow");

    if (calcCV && calcFlow) {
        if (document.getElementById("cvmode").checked) {
            calcmode = "cvmode";
            calcCV.classList.add("is-hidden");
            calcFlow.classList.remove("is-hidden");
        } else {
            calcmode = "flow";
            calcFlow.classList.add("is-hidden");
            calcCV.classList.remove("is-hidden");
        }
    }
}

function runCalcFlow() {
    let cv = Number(document.getElementById("CV").value);
    let relativeDens = Number(document.getElementById("sg").value);
    let temp = Number(document.getElementById("GasTemp").value);
    let inletPress = Number(document.getElementById("GasPresIn").value);
    let outletPressure = Number(document.getElementById("GasPresOut").value);
    let constantK = Number(document.getElementById("k").value);

    // Basic validation
    if (isNaN(cv) || isNaN(relativeDens) || isNaN(temp) || isNaN(inletPress) || isNaN(outletPressure) || isNaN(constantK)) {
        alert("Por favor, ingrese valores numéricos válidos en todos los campos.");
        return;
    }
    if (inletPress <= outletPressure) {
        alert("La presión de entrada debe ser mayor que la presión de salida para calcular el flujo.");
        return;
    }

    const inletPressEng = convert_kgftopsi(inletPress);
    const outletPressEng = convert_kgftopsi(outletPressure);
    const tempR = convert_CtoRa(temp);

    let flow = calcFlow(cv, relativeDens, tempR, inletPressEng, outletPressEng, constantK) / 35.314667;
    const resPara = document.getElementById("result");
    if (resPara) {
        resPara.innerHTML = `Flow calculation: ${flow.toFixed(3)} Sm3/h`;
    }
}

function clearinput() {
    const resPara = document.getElementById("result");
    if (resPara) {
        resPara.innerHTML = "";
    }
    const inputs = document.querySelectorAll("input[type='text'], input[type='number']");
    inputs.forEach((input) => {
        input.value = "";
    });
}

function runCalcCv() {
    let flowMetric = Number(document.getElementById("GasFlow").value);
    let relativeDens = Number(document.getElementById("sg").value);
    let temp = Number(document.getElementById("GasTemp").value);
    let inletPress = Number(document.getElementById("GasPresIn").value);
    let outletPressure = Number(document.getElementById("GasPresOut").value);
    let constantK = Number(document.getElementById("k").value);

    // Basic validation
    if (isNaN(flowMetric) || isNaN(relativeDens) || isNaN(temp) || isNaN(inletPress) || isNaN(outletPressure) || isNaN(constantK)) {
        alert("Por favor, ingrese valores numéricos válidos en todos los campos.");
        return;
    }
    if (inletPress <= outletPressure) {
        alert("La presión de entrada debe ser mayor que la presión de salida para calcular el Cv.");
        return;
    }

    const flowEng = convert_m3tocuft(flowMetric);
    const inletPressEng = convert_kgftopsi(inletPress);
    const outletPressEng = convert_kgftopsi(outletPressure);
    const tempR = convert_CtoRa(temp);

    let CV = calcCV(flowEng, relativeDens, tempR, inletPressEng, outletPressEng, constantK);
    
    const resPara = document.getElementById("result");
    if (resPara) {
        resPara.innerHTML = `CV calculation: ${CV.toFixed(3)}`;
    }
}

function calcCV(Q, SG, T, P1, P2, k) {
    if (checkChoke(P1, P2, k)) {
        return (Q / (816 * P1)) * Math.sqrt(SG * T);
    } else {
        // Ensure P1*P1 - P2*P2 is not negative for Math.sqrt
        const pressureDiffSq = P1 * P1 - P2 * P2;
        if (pressureDiffSq < 0) {
            // This scenario should ideally be caught by P1 <= P2 check earlier,
            // but as a safeguard.
            return 0; 
        }
        return (Q / 962) * Math.sqrt((SG * T) / (pressureDiffSq));
    }
}

function calcFlow(CV, SG, T, P1, P2, k) {
    if (checkChoke(P1, P2, k)) {
        return (CV * (816 * P1)) / Math.sqrt(SG * T);
    } else {
        const pressureDiffSq = P1 * P1 - P2 * P2;
        if (pressureDiffSq < 0) {
            return 0;
        }
        return CV * 962 * Math.sqrt((pressureDiffSq) / (SG * T));
    }
}

function checkChoke(P1, P2, k) {
    if (k <= 1) return false; // k must be > 1 for this formula
    const P_choke = P1 * Math.pow((2 / (k + 1)), (k / (k - 1)));
    return P2 < P_choke;
}

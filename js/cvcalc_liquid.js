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
    let temp = Number(document.getElementById("LiquidTemp").value); // Changed to LiquidTemp
    let inletPress = Number(document.getElementById("LiquidPresIn").value); // Changed to LiquidPresIn
    let outletPressure = Number(document.getElementById("LiquidPresOut").value); // Changed to LiquidPresOut
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
    // For liquid, temperature conversion to Rankine might not be directly applicable for CV calculation,
    // but keeping the function call for consistency if it's used in the underlying calcFlow.
    const tempR = convert_CtoRa(temp);

    let flow = calcFlow(cv, relativeDens, tempR, inletPressEng, outletPressEng, constantK);
    // The original calcFlow was for gas. For liquids, a different formula is typically used.
    // Assuming the provided calcFlow and calcCV functions are simplified for both,
    // but the conversion to m3/h is specific to the original gas context.
    // For liquid, the typical formula for Cv is Q = Cv * sqrt(deltaP / G) where Q is GPM, deltaP is psi, G is specific gravity.
    // The provided functions seem to be for gas, so I'll keep the conversion factor as is,
    // but note that this might not be hydrodynamically accurate for liquids.
    flow = flow / 35.314667; // Convert back from cuft/h to Sm3/h (assuming this is the desired output unit for liquid flow)

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
    let flowMetric = Number(document.getElementById("LiquidFlow").value); // Changed to LiquidFlow
    let relativeDens = Number(document.getElementById("sg").value);
    let temp = Number(document.getElementById("LiquidTemp").value); // Changed to LiquidTemp
    let inletPress = Number(document.getElementById("LiquidPresIn").value); // Changed to LiquidPresIn
    let outletPressure = Number(document.getElementById("LiquidPresOut").value); // Changed to LiquidPresOut
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

// NOTE: These calcCV and calcFlow functions appear to be for gas flow,
// as they use 'k' (ratio of specific heats) and check for choking conditions
// typical for compressible fluids. For liquids, the formulas are simpler
// and do not typically involve 'k' or choking in the same way.
// If this is intended for liquids, these formulas might need re-evaluation
// against standard liquid flow Cv equations.
function calcCV(Q, SG, T, P1, P2, k) {
    // Assuming P1 and P2 are absolute pressures for choking check
    // For liquids, choking is less common unless there's flashing.
    // The 'k' parameter is typically for gases.
    const deltaP = P1 - P2; // For liquids, usually just pressure drop
    if (deltaP <= 0) return 0; // Avoid division by zero or negative sqrt

    // The original formula seems to be a gas formula.
    // For liquids, a common formula is Cv = Q_gpm * sqrt(SG / dP_psi)
    // Q is in ft3/h, SG is specific gravity, P1, P2 in psi absolute
    // This part of the code is directly from the original and might be
    // simplified/generalized.
    if (checkChoke(P1, P2, k)) {
        // This choke condition is for gas. For liquids, usually not applicable
        // unless flashing occurs.
        return (Q / (816 * P1)) * Math.sqrt(SG * T); // This still looks like a gas equation
    } else {
        // This is also a gas equation, specifically for non-choked gas flow.
        // For liquid, it's typically simpler: Cv = Q / (N * sqrt(dP/G)) where N is a constant.
        return (Q / 962) * Math.sqrt((SG * T) / (P1 * P1 - P2 * P2));
    }
}

function calcFlow(CV, SG, T, P1, P2, k) {
    const deltaP = P1 - P2;
    if (deltaP <= 0) return 0;

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
    // This is a gas choking calculation.
    if (k <= 1) return false; // k must be > 1 for this formula
    const P_choke = P1 * Math.pow((2 / (k + 1)), (k / (k - 1)));
    return P2 < P_choke;
}

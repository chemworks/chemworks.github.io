// ===============================================
// Archivo Unificado de Cálculo de Cv/Kv
// ===============================================

// --- Constantes ---
const DENSITY_WATER_KG_M3 = 1000;
const DENSITY_AIR_KG_SM3 = 1.225;
const INCH_TO_MM = 25.4;
const KV_TO_CV_FACTOR = 1.156;
const CV_TO_KV_FACTOR = 0.865;

// --- Variables Globales ---
let calcmode = "cvmode";
let calculatedCv = null;
let calculatedKv = null;

// --- Lógica Principal y Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    // Listeners para modos de cálculo
    document.getElementById("cvmode")?.addEventListener("change", changecalcmode);
    document.getElementById("flow")?.addEventListener("change", changecalcmode);

    // Listeners para unidades de flujo y tipo de coeficiente
    document.getElementsByName("flow_unit_gas")?.forEach(radio => radio.addEventListener("change", updateFlowLabel));
    document.getElementsByName("flow_unit_liquid")?.forEach(radio => radio.addEventListener("change", updateFlowLabel));
    document.getElementsByName("coeff_type")?.forEach(radio => radio.addEventListener("change", updateCoeffInputLabel));
    
    // Listeners para botones
    document.getElementById("btncalc")?.addEventListener("click", () => {
        if (calcmode === "cvmode") runCalcKvCv();
        else runCalcFlow();
    });
    document.getElementById("btnclear")?.addEventListener("click", clearinput);
    document.getElementById("btnCalcDiameter")?.addEventListener("click", calculateTrimDiameter);
    
    // Configuración inicial
    changecalcmode();
    updateFlowLabel();
    updateCoeffInputLabel();
});

/**
 * Función Unificada para Calcular Kv y Cv.
 */
function runCalcKvCv() {
    const relativeDens = Number(document.getElementById("sg").value);
    if (isNaN(relativeDens) || relativeDens <= 0) {
        alert("Por favor, ingrese una Gravedad Específica (sg) válida.");
        return;
    }
    
    // --- LÓGICA PARA GAS (Calcula Cv) ---
    if (document.getElementById('GasFlow')) {
        let flowInput = Number(document.getElementById("GasFlow").value);
        let flowSm3h = (document.getElementById('unit_mass').checked)
            ? flowInput / (relativeDens * DENSITY_AIR_KG_SM3)
            : flowInput / 24.0;
        
        let temp = Number(document.getElementById("GasTemp").value);
        let inletPress = Number(document.getElementById("GasPresIn").value);
        let outletPressure = Number(document.getElementById("GasPresOut").value);
        let constantK = Number(document.getElementById("k").value);

        if (inletPress <= outletPressure) {
            alert("La presión de entrada debe ser mayor que la de salida.");
            return;
        }

        const flowEng = convert_m3tocuft(flowSm3h);
        const inletPressEng = convert_kgftopsi(inletPress);
        const outletPressEng = convert_kgftopsi(outletPressure);
        const tempR = convert_CtoRa(temp);

        calculatedCv = calcCV_gas(flowEng, relativeDens, tempR, inletPressEng, outletPressEng, constantK);
        calculatedKv = calculatedCv * CV_TO_KV_FACTOR;
        
        const resultElGas = document.getElementById("result");
        const secondaryResultElGas = document.getElementById("secondaryResult");
        if (resultElGas) resultElGas.innerHTML = `Cv calculation: ${calculatedCv.toFixed(3)}`;
        if (secondaryResultElGas) secondaryResultElGas.innerHTML = `(Equivalent Kv: ${calculatedKv.toFixed(3)})`;

    // --- LÓGICA PARA LÍQUIDO (Calcula Kv y luego Cv) ---
    } else if (document.getElementById('LiquidFlow')) {
        let flowInput = Number(document.getElementById("LiquidFlow").value);
        let flowM3h = (document.getElementById('unit_mass').checked)
            ? flowInput / (relativeDens * DENSITY_WATER_KG_M3)
            : flowInput;
        
        let inletPress = Number(document.getElementById("LiquidPresIn").value);
        let outletPressure = Number(document.getElementById("LiquidPresOut").value);

        if (inletPress <= outletPressure) {
            alert("La presión de entrada debe ser mayor que la de salida.");
            return;
        }
    
        const deltaP = inletPress - outletPressure;
        if (deltaP > 0) {
            const kv = flowM3h * Math.sqrt(relativeDens / deltaP);
            calculatedKv = kv;
            calculatedCv = kv * KV_TO_CV_FACTOR; 
        } else {
            calculatedKv = 0;
            calculatedCv = 0;
        }
        
        const resultElLiq = document.getElementById("result");
        const secondaryResultElLiq = document.getElementById("secondaryResult");
        if(resultElLiq) resultElLiq.innerHTML = `Kv calculation: ${calculatedKv.toFixed(3)}`;
        if(secondaryResultElLiq) secondaryResultElLiq.innerHTML = `(Equivalent Cv: ${calculatedCv.toFixed(3)})`;
    }
}

/**
 * Función Unificada para Calcular el Flujo Inverso.
 */
function runCalcFlow() {
    if (document.getElementById('LiquidFlow')) {
        const coeffValue = Number(document.getElementById("coeffInput").value);
        const relativeDens = Number(document.getElementById("sg").value);
        const inletPress = Number(document.getElementById("LiquidPresIn").value);
        const outletPressure = Number(document.getElementById("LiquidPresOut").value);

        if (inletPress <= outletPressure) {
            alert("La presión de entrada debe ser mayor que la de salida.");
            return;
        }

        const deltaP = inletPress - outletPressure;
        let kv_val;

        if (document.getElementById('input_cv').checked) {
            kv_val = coeffValue * CV_TO_KV_FACTOR;
        } else {
            kv_val = coeffValue;
        }

        const flowM3h = kv_val * Math.sqrt(deltaP / relativeDens);

        const resultEl = document.getElementById("result");
        const secondaryResultEl = document.getElementById("secondaryResult");
        if(resultEl) resultEl.innerHTML = `Flow calculation: ${flowM3h.toFixed(3)} m³/h`;
        if(secondaryResultEl) secondaryResultEl.innerHTML = "";
    } else {
        alert("El cálculo de flujo inverso solo está implementado para líquidos por el momento.");
    }
}

// --- Fórmulas Específicas para Gas ---
function calcCV_gas(Q, SG, T, P1, P2, k) {
    if (checkChoke_gas(P1, P2, k)) {
        return (Q / (816 * P1)) * Math.sqrt(SG * T);
    } else {
        const pressureDiffSq = P1 * P1 - P2 * P2;
        return (pressureDiffSq > 0) ? (Q / 962) * Math.sqrt((SG * T) / pressureDiffSq) : 0;
    }
}

function checkChoke_gas(P1, P2, k) {
    if (k <= 1) return false;
    const P_choke = P1 * Math.pow((2 / (k + 1)), (k / (k - 1)));
    return P2 < P_choke;
}

// --- Funciones Genéricas / de UI ---
function calculateTrimDiameter() {
    const cd = Number(document.getElementById("dischargeCoeff").value);
    const diameterResultEl = document.getElementById("diameterResult");

    if (calculatedCv === null || calculatedCv <= 0) {
        alert("Por favor, calcule primero un valor de Cv/Kv válido.");
        return;
    }
    if (isNaN(cd) || cd <= 0) {
        alert("Por favor, ingrese un Coeficiente de Descarga (Cd) válido.");
        return;
    }

    const N = 29.9;
    const diameterInches = Math.sqrt(calculatedCv / (N * cd));
    const diameterMM = diameterInches * INCH_TO_MM;

    if(diameterResultEl) diameterResultEl.innerHTML = `<p class="title is-5">Diámetro de Trim Estimado: <strong>${diameterInches.toFixed(3)} pulgadas (${diameterMM.toFixed(2)} mm)</strong></p>`;
}

function clearinput() {
    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.innerHTML = "";

    const secondaryResultEl = document.getElementById("secondaryResult");
    if (secondaryResultEl) secondaryResultEl.innerHTML = "";

    const diameterResultEl = document.getElementById("diameterResult");
    if (diameterResultEl) diameterResultEl.innerHTML = "";
    
    document.querySelectorAll("input[type='text'], input[type='number']").forEach(input => {
        if(input.id !== 'dischargeCoeff') input.value = "";
    });
    calculatedCv = null;
    calculatedKv = null;
}

function changecalcmode() {
    const calcKvCvSection = document.getElementById("classFlow");
    const calcFlowSection = document.getElementById("classCV");
    const diameterSection = document.getElementById("diameter-section");

    if (document.getElementById("cvmode").checked) {
        calcmode = "cvmode";
        calcFlowSection?.classList.add("is-hidden");
        calcKvCvSection?.classList.remove("is-hidden");
        diameterSection?.classList.remove("is-hidden");
    } else {
        calcmode = "flow";
        calcKvCvSection?.classList.add("is-hidden");
        calcFlowSection?.classList.remove("is-hidden");
        diameterSection?.classList.add("is-hidden");
    }
}

function updateFlowLabel() {
    const gasLabel = document.getElementById('GasFlowLabel');
    if(gasLabel) {
        gasLabel.textContent = document.getElementById('unit_mass').checked ? "Gas Flow (kg/h)" : "Gas Flow (Sm³/D)";
    }
    
    const liquidLabel = document.getElementById('LiquidFlowLabel');
    if(liquidLabel) {
        liquidLabel.textContent = document.getElementById('unit_mass').checked ? "Liquid Flow (kg/h)" : "Liquid Flow (m³/h)";
    }
}

function updateCoeffInputLabel() {
    const label = document.getElementById("coeffInputLabel");
    if(label) {
        label.textContent = document.getElementById('input_cv').checked ? "Cv" : "Kv";
    }
}
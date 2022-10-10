function convert_CtoRa(c) { return (c + 273.15) * (9 / 5); }

function convert_kgftopsi(P) { return (P * 14.223 + 14.223); }

function convert_m3tocuft(F) { return F * 35.314667; }

let calcmode = "cvmode";

let cvmode = document.getElementById("cvmode");
cvmode.addEventListener("change", () => { changecalcmode(); });

let flow = document.getElementById("flow");
flow.addEventListener("change", () => { changecalcmode(); });

function changecalcmode() {
    const calcCV = document.getElementById("classCV");
    const calcFlow = document.getElementById("classFlow");
    calcCV.classList.replace("is-hidden", "not-hidden");
    calcFlow.classList.replace("is-hidden", "not-hidden");
    if (document.getElementById("cvmode").checked) {
        calcmode = "cvmode";
        console.log("cvmode");
        calcCV.classList.add("is-hidden");
    } else {
        calcmode = "flow";
        console.log("flow");
        calcFlow.classList.add("is-hidden");
    }
}

const btncalc = document.getElementById("btncalc")
btncalc.addEventListener("click", () => {
    if (calcmode == "cvmode") {
        runCalcCv()
    }
    if (calcmode == "flow") {
        runCalcFlow()
    }
})

function runCalcFlow() {
    let cv = Number(document.getElementById("CV").value);
    let relativeDens = Number(document.getElementById("sg").value);
    let temp = Number(document.getElementById("GasTemp").value);
    let inletPress = Number(document.getElementById("GasPresIn").value);
    let outletPressure = Number(document.getElementById("GasPresOut").value);
    let constantK = Number(document.getElementById("k").value);
    const inletPressEng = convert_kgftopsi(inletPress)
    const outletPressEng = convert_kgftopsi(outletPressure)
    const tempR = convert_CtoRa(temp)
    let flow = calcFlow(cv, relativeDens, tempR, inletPressEng, outletPressEng, constantK) / 35.314667
    const resPara = document.getElementById("result");
    resPara.innerHTML = `flow calculation ${flow} Sm3/h`
}
const btnclear = document.getElementById("btnclear")
btnclear.addEventListener("click", () => {
    clearinput()
})

function clearinput() {
    const resPara = document.getElementById("result")
    resPara.innerHTML=""
    const inputs = document.querySelectorAll("input")
    inputs.forEach((input) => {
        input.value = "";
    })
}

function runCalcCv() {
    let flowMetric = Number(document.getElementById("GasFlow").value);
    let relativeDens = Number(document.getElementById("sg").value);
    let temp = Number(document.getElementById("GasTemp").value);
    let inletPress = Number(document.getElementById("GasPresIn").value);
    let outletPressure = Number(document.getElementById("GasPresOut").value);
    let constantK = Number(document.getElementById("k").value);
    const flowEng = convert_m3tocuft(flowMetric)
    const inletPressEng = convert_kgftopsi(inletPress)
    const outletPressEng = convert_kgftopsi(outletPressure)
    const tempR = convert_CtoRa(temp)
    let CV = calcCV(flowEng, relativeDens, tempR, inletPressEng, outletPressEng, constantK)
    const resPara = document.getElementById("result");
    resPara.innerHTML = `CV calculation ${CV}`
}

function calcCV(Q, SG, T, P1, P2, k) {
    if (checkChoke(P1, P2, k)) {
        return (Q / (816 * P1)) * (SG * T) ** 0.5;
    } else {
        P1 = P1 ** 2;
        P2 = P2 ** 2;
        return (Q / 962) * ((SG * T) / (P1 - P2)) ** 0.5;
    }
}

function calcFlow(CV, SG, T, P1, P2, k) {
    if (checkChoke(P1, P2, k)) {
        return (CV * (816 * P1)) / (SG * T) ** 0.5;
    } else {
        P1 = P1 ** 2;
        P2 = P2 ** 2;
        return CV * 962 * ((P1 - P2) / (SG * T)) ** 0.5;
    }
}

function checkChoke(P1, P2, k) {
    P_choke = P1 * (2 / (k + 1)) ** (k / (k - 1));
    return P2 < P_choke ? true : false;
}

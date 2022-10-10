function convert_CtoRe(c) {
    return (c + 273.15) * (9 / 5);
}

function convert_kgftopsi(P) {
    return P * 14.223;
}

function convert_m3tocuft(F) {
    return F * 35.314667;
}

let calcmode = "cvmode";

let cvmode = document.getElementById("cvmode");
cvmode.addEventListener("change", () => {
    checkcalcmode();
});

let flow = document.getElementById("flow");
flow.addEventListener("change", () => {
    checkcalcmode();
});

function checkcalcmode() {
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

function calcCV(Q, SG, T, P1, P2, k) {
    if (checkChoke(P1, P2, k)) {
        console.log("Chocked");
        return (Q / (816 * P1)) * (SG * T) ** 0.5;
    } else {
        P1 = P1 ** 2;
        P2 = P2 ** 2;
        console.log("non cho");
        return (Q / 962) * ((SG * T) / (P1 - P2)) ** 0.5;
    }
}

function calcFlow(CV, SG, T, P1, P2, k) {
    if (checkChoke(P1, P2, k)) {
        console.log("Chocked");
        return (CV * (816 * P1)) / (SG * T) ** 0.5;
    } else {
        P1 = P1 ** 2;
        P2 = P2 ** 2;
        console.log("non cho");
        return CV * 962 * ((P1 - P2) / (SG * T)) ** 0.5;
    }
}

function checkChoke(P1, P2, k) {
    P_choke = P1 * (2 / (k + 1)) ** (k / (k - 1));
    return P2 < P_choke ? true : false;
}

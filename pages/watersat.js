function run() {
  // Function to call date
  let d = new Date();

  document.body.innerHTML = " <h1>Today's date is " + d + " </h1>";
}

// for each in input
const inputs = document.querySelectorAll("input");

const btncalc = document.querySelector("#btncalc");
btncalc.addEventListener("click", () => {
  // inputs.forEach((inp) => {
  // alert(inp.value);
  // alert(inp.id);
  // });

  const GasTemp = Number(document.getElementById("GasTemp").value);
  const GasPres = Number(document.getElementById("GasPres").value);
  const resPara = document.getElementById("result");
  if (GasTemp > 100 || GasTemp < 0) {
    alert("Temperature must be between 0 ans 100 C");
    clearres();
  }
  if (GasPres > 680) {
    alert("Pressure must be less that 680 atm");
    clearres();
  }
  let WC = water_content(GasPres, GasTemp);
  // changing the result para to the result
  resPara.innerHTML = `Water Content ${WC} mg/Sm3`;
});

const btnclear = document.querySelector("#btnclear");
btnclear.addEventListener("click", () => {
  clearres();
});

function clearres() {
  const resPara = document.getElementById("result");
  resPara.innerHTML = "";
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
  if (temp < 35) {
    coefA = [1011.528, 2.392205];
    coefB = [2.392205, 153.4538];
    coefC = [46.04953, 53.93539];
  } else if (temp < 70) {
    coefA = [8012.09, 5.148325];
    coefB = [229.152, 186.1237];
    coefC = [60.06752, 59.92855];
  } else if (temp < 100) {
    coefA = [8101.695, 1.56];
    coefB = [232.5031, 108.4];
    coefC = [61.19779, 33.03525];
  }
  A = coefA[0] * Math.exp((-1 * (temp - coefB[0]) ** 2) / (2 * coefC[0] ** 2));
  B = coefA[1] * Math.exp((-1 * (temp - coefB[1]) ** 2) / (2 * coefC[1] ** 2));
  return (A / pres + B) * 1000;
}

// Global variables for charts
let massChart, temperatureChart, massFlowChart, outletTemperatureChart,
    inletVelocityChart, inletMachChart, outletVelocityChart, outletMachChart,
    pressureChart, standardFlowChart; // Added standardFlowChart

// Global variable to store simulation data for CSV export
let simulationData = {
    times: [],
    masses: [],
    temperatures_K: [], // Store in Kelvin internally
    temperatures_C: [], // Store in Celsius for display/export
    pressures_kgfcm2: [],
    massFlowRates: [], // kg/s
    standardFlowRates_Sm3D: [], // Sm3/D (Standard Cubic Meters per Day)
    outletTemperatures_K: [],
    outletTemperatures_C: [],
    inletVelocities: [],
    inletMachNumbers: [],
    outletVelocities: [],
    outletMachNumbers: []
};

// --- Project Information variables ---
let projectInfo = {
    "Project Name": "Depressurization Study", // Default value
    "Prepared by": "Your Name", // Default value
    "Date": "" // Will be set on save
};

/**
 * Universal Gas Constant (Ru) in J/(mol·K)
 * @type {number}
 */
const Ru = 8.314;

/**
 * Conversion factor from kgf/cm^2 to Pascals
 * 1 kgf/cm^2 = 98066.5 Pascals
 * @type {number}
 */
const KGF_PER_CM2_TO_PA = 98066.5;

// Standard Conditions for Sm3/D (Standard Cubic Meters per Day)
// Typically 0°C (273.15 K) and 1 atm (101325 Pa)
const T_STP_K = 273.15; // Kelvin
const P_STP_PA = 101325; // Pascals (1 atm)
const SECONDS_PER_DAY = 24 * 3600; // Seconds in a day

/**
 * Converts Kelvin to Celsius.
 * @param {number} k - Temperature in Kelvin.
 * @returns {number} - Temperature in Celsius.
 */
function kelvinToCelsius(k) {
    return k - 273.15;
}

/**
 * Converts Celsius to Kelvin.
 * @param {number} c - Temperature in Celsius.
 * @returns {number} - Temperature in Kelvin.
 */
function celsiusToKelvin(c) {
    return c + 273.15;
}

/**
 * Calculates the mass flow rate through an orifice, considering choked or unchoked flow,
 * and also calculates outlet temperature, velocity, and Mach number.
 * @param {number} M - Current mass of gas in the vessel (kg).
 * @param {number} T - Current temperature of gas in the vessel (K).
 * @param {number} V - Volume of the vessel (m^3).
 * @param {number} gamma - Specific heat ratio of the gas.
 * @param {number} R_specific - Specific gas constant (J/(kg·K)).
 * @param {number} A_orifice - Area of the orifice (m^2).
 * @param {number} Cd - Discharge coefficient.
 * @param {number} P_back_Pa - Back pressure (outlet pressure) in Pascals.
 * @returns {Object} - Object containing the calculated mdot, T_throat_K, V_outlet_throat, and Mach_outlet_throat.
 */
function calculate_mdot_and_outlet_conditions(M, T, V, gamma, R_specific, A_orifice, Cd, P_back_Pa) {
    const P_vessel = (M / V) * R_specific * T; // Pressure in the vessel (Pa)

    // Critical pressure ratio for choked flow
    const critical_pressure_ratio = Math.pow(2 / (gamma + 1), gamma / (gamma - 1));
    const P_critical = P_vessel * critical_pressure_ratio;

    let mdot;
    let T_throat_K;
    let V_outlet_throat;
    let Mach_outlet_throat;

    // Ensure back pressure is not higher than vessel pressure for outflow
    if (P_back_Pa >= P_vessel) {
        return { mdot: 0, T_throat_K: T, V_outlet_throat: 0, Mach_outlet_throat: 0 };
    }

    if (P_back_Pa <= P_critical) {
        // Choked flow
        mdot = Cd * A_orifice * P_vessel *
               Math.sqrt(gamma / (R_specific * T)) *
               Math.pow(2 / (gamma + 1), (gamma + 1) / (2 * (gamma - 1)));

        T_throat_K = T * (2 / (gamma + 1));
        V_outlet_throat = Math.sqrt(gamma * R_specific * T_throat_K); // Velocity is speed of sound at throat
        Mach_outlet_throat = 1.0;
    } else {
        // Isentropic (unchoked) flow
        const P_ratio = P_back_Pa / P_vessel;
        mdot = Cd * A_orifice * P_vessel *
               Math.sqrt((2 * gamma / (R_specific * T)) * (1 / (gamma - 1)) *
               (Math.pow(P_ratio, 2 / gamma) - Math.pow(P_ratio, (gamma + 1) / gamma)));

        T_throat_K = T * Math.pow(P_ratio, (gamma - 1) / gamma);
        V_outlet_throat = Math.sqrt(2 * gamma / (gamma - 1) * R_specific * T * (1 - Math.pow(P_ratio, (gamma - 1) / gamma)));
        Mach_outlet_throat = V_outlet_throat / Math.sqrt(gamma * R_specific * T_throat_K);
    }

    // Ensure mdot, temperatures, velocities, and Mach numbers are non-negative and valid
    if (isNaN(mdot) || mdot < 0) mdot = 0;
    if (isNaN(T_throat_K) || T_throat_K < 1) T_throat_K = 1; // Floor at 1K
    if (isNaN(V_outlet_throat) || V_outlet_throat < 0) V_outlet_throat = 0;
    if (isNaN(Mach_outlet_throat) || Mach_outlet_throat < 0) Mach_outlet_throat = 0;


    return { mdot, T_throat_K, V_outlet_throat, Mach_outlet_throat };
}

/**
 * Performs the Runge-Kutta 4th order integration for the system of ODEs.
 * @param {Function} f_M - Function for dM/dt.
 * @param {Function} f_T - Function for dT/dt.
 * @param {number} M - Current mass.
 * @param {number} T - Current temperature.
 * @param {number} dt - Time step.
 * @returns {Object} - Object containing the new mass and temperature { newM, newT }.
 */
function rungeKutta4(f_M, f_T, M, T, dt) {
    // k1 for M and T
    const k1_M = dt * f_M(M, T);
    const k1_T = dt * f_T(M, T);

    // k2 for M and T
    const k2_M = dt * f_M(M + k1_M / 2, T + k1_T / 2);
    const k2_T = dt * f_T(M + k1_M / 2, T + k1_T / 2);

    // k3 for M and T
    const k3_M = dt * f_M(M + k2_M / 2, T + k2_T / 2);
    const k3_T = dt * f_T(M + k2_M / 2, T + k2_T / 2);

    // k4 for M and T
    const k4_M = dt * f_M(M + k3_M, T + k3_T);
    const k4_T = dt * f_T(M + k3_M, T + k3_T);

    // Update M and T
    const newM = M + (k1_M + 2 * k2_M + 2 * k3_M + k4_M) / 6;
    const newT = T + (k1_T + 2 * k2_T + 2 * k3_T + k4_T) / 6;

    return { newM, newT };
}

/**
 * Displays a custom message box.
 * @param {string} message - The message to display.
 */
function showMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        text-align: center;
        font-family: 'Inter', sans-serif;
        color: #334155;
    `;
    messageBox.innerHTML = `
        <p>${message}</p>
        <button style="
            background-color: #6366f1;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            border: none;
        " onclick="this.parentNode.remove()">OK</button>
    `;
    document.body.appendChild(messageBox);
}

/**
 * Converts mass flow rate (kg/s) to Standard Cubic Meters per Day (Sm3/D).
 * @param {number} mdot_kgs - Mass flow rate in kg/s.
 * @param {number} MW_kg_kmol - Molecular weight in kg/kmol.
 * @returns {number} - Flow rate in Sm3/D.
 */
function convert_kgs_to_Sm3D(mdot_kgs, MW_kg_kmol) {
    const MW_kg_mol = MW_kg_kmol / 1000; // Convert kg/kmol to kg/mol

    // Molar volume at STP (m^3/mol)
    const V_m_STP = (Ru * T_STP_K) / P_STP_PA;

    // Density at STP (kg/m^3)
    let rho_STP = 0;
    if (V_m_STP > 0) { // Avoid division by zero
        rho_STP = MW_kg_mol / V_m_STP;
    }

    // Volume flow rate at STP (m^3/s)
    let Vdot_STP_m3s = 0;
    if (rho_STP > 0) { // Avoid division by zero
        Vdot_STP_m3s = mdot_kgs / rho_STP;
    }

    // Volume flow rate at STP (Sm3/D)
    const Vdot_Sm3D = Vdot_STP_m3s * SECONDS_PER_DAY;

    return Vdot_Sm3D;
}


/**
 * Finds the value in an array corresponding to the closest time.
 * @param {Array<number>} times - Array of time values.
 * @param {Array<number>} values - Array of values corresponding to times.
 * @param {number} targetTime - The target time to find the value for.
 * @returns {number|string} - The value at the closest time, or '--' if no data.
 */
function getValueAtClosestTime(times, values, targetTime) {
    if (!times || times.length === 0) return '--';
    let closestIndex = 0;
    for (let i = 0; i < times.length; i++) {
        if (times[i] >= targetTime) {
            closestIndex = i;
            break;
        }
    }
    return values[closestIndex] ? values[closestIndex].toFixed(2) : '--';
}

/**
 * Renders the project information from the projectInfo object to the display area.
 */
function renderProjectInfo() {
    const container = document.getElementById('project-info-display');
    if (!container) return; // Defensive check

    let html = '<ul>';
    html += `<li><strong>Project Name:</strong> ${projectInfo["Project Name"]}</li>`;
    html += `<li><strong>Prepared by:</strong> ${projectInfo["Prepared by"]}</li>`;
    if (projectInfo["Date"]) { // Only display date if it exists
        html += `<li><strong>Date:</strong> ${projectInfo["Date"]}</li>`;
    }
    html += '</ul>';
    container.innerHTML = html;
}

/**
 * Calculates the depressurization process and plots the results.
 */
function calculateDepressurization() {
    // Get input values
    const initialMethod = document.querySelector('input[name="initialMethod"]:checked').value;
    const P0_kgfcm2 = parseFloat(document.getElementById('initialPressure').value);
    const T0_C_input = parseFloat(document.getElementById('initialTemperature').value); // Initial temperature in Celsius from input
    const gamma = parseFloat(document.getElementById('gamma').value);
    const MW = parseFloat(document.getElementById('molecularWeight').value);
    let d_orifice_mm = parseFloat(document.getElementById('orificeDiameter').value);
    const Cd = parseFloat(document.getElementById('dischargeCoefficient').value);
    let d_inlet_pipe_mm = parseFloat(document.getElementById('inletPipeDiameter').value);
    const P_back_kgfcm2 = parseFloat(document.getElementById('backPressure').value); // New input for backpressure
    const dt = parseFloat(document.getElementById('timeStep').value);
    const maxSimulationTime = parseFloat(document.getElementById('maxSimulationTime').value); // New input

    // Heat Exchange parameters
    const enableHeatExchange = document.getElementById('enableHeatExchange').checked;
    let U_total = 0; // Represents U*A total
    let T_amb_K = 0;

    if (enableHeatExchange) {
        const uMethod = document.querySelector('input[name="uMethod"]:checked').value;
        if (uMethod === 'global') {
            U_total = parseFloat(document.getElementById('heatTransferCoefficientTotal').value);
        } else {
            const uValue = parseFloat(document.getElementById('heatTransferCoefficient').value);
            const area = parseFloat(document.getElementById('heatTransferArea').value);
            U_total = uValue * area;
        }
        const T_amb_C = parseFloat(document.getElementById('ambientTemperature').value);
        T_amb_K = celsiusToKelvin(T_amb_C);
    }

    // Convert initial temperature from Celsius to Kelvin for calculations
    const T0_K = celsiusToKelvin(T0_C_input);

    // Get progress bar element
    const progressBar = document.getElementById('calculationProgress');

    // Validate inputs
    if (isNaN(P0_kgfcm2) || isNaN(T0_C_input) || isNaN(gamma) || isNaN(MW) || isNaN(d_orifice_mm) || isNaN(Cd) ||
        isNaN(d_inlet_pipe_mm) || isNaN(P_back_kgfcm2) || isNaN(dt) || isNaN(maxSimulationTime) ||
        (enableHeatExchange && (isNaN(U_total) || isNaN(T_amb_K))) ||
        P0_kgfcm2 <= 0 || T0_K <= 0 || gamma <= 1 || MW <= 0 || d_orifice_mm <= 0 || Cd <= 0 ||
        d_inlet_pipe_mm <= 0 || P_back_kgfcm2 < 0 || dt <= 0 || maxSimulationTime <= 0 ||
        (enableHeatExchange && (U_total < 0 || T_amb_K < 0))) {
        showMessageBox('Please enter valid and positive values for all parameters. Outlet pressure and total U*A can be zero or positive. Ambient temperature must be a valid number.');
        return;
    }

    const R_specific = Ru / (MW / 1000); // MW is kg/kmol, so convert to kg/mol by dividing by 1000

    let V, M0;
    if (initialMethod === 'volume') {
        V = parseFloat(document.getElementById('volume').value);
        if (isNaN(V) || V <= 0) {
             showMessageBox('Please enter a valid positive volume for the vessel.');
             return;
        }
        M0 = (P0_kgfcm2 * KGF_PER_CM2_TO_PA * V) / (R_specific * T0_K);
        document.getElementById('initialMass').value = M0.toFixed(2); // Update mass field
    } else { // initialMethod === 'mass'
        M0 = parseFloat(document.getElementById('initialMass').value);
        if (isNaN(M0) || M0 <= 0) {
            showMessageBox('Please enter a valid positive initial mass.');
            return;
        }
        V = (M0 * R_specific * T0_K) / (P0_kgfcm2 * KGF_PER_CM2_TO_PA);
        document.getElementById('volume').value = V.toFixed(4); // Update volume field
    }


    // Unit conversions
    const P0_Pa = P0_kgfcm2 * KGF_PER_CM2_TO_PA; // Convert initial pressure to Pascals
    const P_back_Pa = P_back_kgfcm2 * KGF_PER_CM2_TO_PA; // Convert backpressure to Pascals
    const d_orifice_m = d_orifice_mm / 1000; // Convert orifice diameter to meters
    const d_inlet_pipe_m = d_inlet_pipe_mm / 1000; // Convert inlet pipe diameter to meters
    // d_outlet_pipe_mm is not directly used for flow calculation, but for velocity/Mach if needed for a pipe after orifice.
    // In this model, outlet conditions refer to the orifice throat.

    const c_v = R_specific / (gamma - 1); // Specific heat at constant volume (J/(kg·K))


    // Calculate orifice area
    const A_orifice = Math.PI * Math.pow(d_orifice_m / 2, 2);
    const A_inlet_pipe = Math.PI * Math.pow(d_inlet_pipe_m / 2, 2);
    

    // Clear previous simulation data
    simulationData = {
        times: [],
        masses: [],
        temperatures_K: [],
        temperatures_C: [],
        pressures_kgfcm2: [],
        massFlowRates: [],
        standardFlowRates_Sm3D: [], // Clear for new simulation
        outletTemperatures_K: [],
        outletTemperatures_C: [],
        inletVelocities: [],
        inletMachNumbers: [],
        outletVelocities: [],
        outletMachNumbers: []
    };

    let currentTime = 0;
    let currentM = M0;
    let currentT_K = T0_K; // Use Kelvin for internal calculations
    let currentP_Pa = P0_Pa;

    // Define the differential functions for Runge-Kutta
    const f_M = (M, T_K) => {
        if (M <= 0) return 0; // Prevent division by zero or negative mass
        // Use the new function to get mdot
        const { mdot } = calculate_mdot_and_outlet_conditions(M, T_K, V, gamma, R_specific, A_orifice, Cd, P_back_Pa);
        return -mdot;
    };

    const f_T = (M, T_K) => {
        if (M <= 0 || T_K <= 0) return 0; // Prevent division by zero or negative values
        const { mdot } = calculate_mdot_and_outlet_conditions(M, T_K, V, gamma, R_specific, A_orifice, Cd, P_back_Pa);

        let dTdt_adiabatic = (mdot * T_K * (1 - gamma)) / M;
        let dTdt_heat_exchange = 0;

        if (enableHeatExchange) {
            // Q_dot = U_total * (T_amb_K - T_K)
            // dT/dt_heat = Q_dot / (M * c_v)
            dTdt_heat_exchange = (U_total * (T_amb_K - T_K)) / (M * c_v);
        }

        return dTdt_adiabatic + dTdt_heat_exchange;
    };

    // Initial data point
    const initial_outlet_conditions = calculate_mdot_and_outlet_conditions(M0, T0_K, V, gamma, R_specific, A_orifice, Cd, P_back_Pa);
    const initial_mdot_kgs = initial_outlet_conditions.mdot;
    const initial_Sm3D = convert_kgs_to_Sm3D(initial_mdot_kgs, MW);

    simulationData.times.push(currentTime);
    simulationData.masses.push(M0);
    simulationData.temperatures_K.push(T0_K);
    simulationData.temperatures_C.push(kelvinToCelsius(T0_K));
    simulationData.pressures_kgfcm2.push(P0_kgfcm2);
    simulationData.massFlowRates.push(initial_mdot_kgs);
    simulationData.standardFlowRates_Sm3D.push(initial_Sm3D); // Store Sm3/D
    simulationData.outletTemperatures_K.push(initial_outlet_conditions.T_throat_K);
    simulationData.outletTemperatures_C.push(kelvinToCelsius(initial_outlet_conditions.T_throat_K));
    simulationData.inletVelocities.push(0); // Initial inlet velocity is 0
    simulationData.inletMachNumbers.push(0); // Initial inlet Mach is 0
    simulationData.outletVelocities.push(initial_outlet_conditions.V_outlet_throat);
    simulationData.outletMachNumbers.push(initial_outlet_conditions.Mach_outlet_throat);

    // Reset progress bar
    progressBar.value = 0;
    progressBar.textContent = '0%';

    // Simulation loop
    let iterationCount = 0;
    const maxIterations = 100000; // Safety break to prevent infinite loops

    let minSimTemperatureC = kelvinToCelsius(T0_K);
    let lastTransitionTime = null;
    let wasChoked = true;
    const critical_pressure_ratio_const = Math.pow(2 / (gamma + 1), gamma / (gamma - 1));

    // Continue simulation as long as vessel pressure is above backpressure and within max simulation time/iterations
    while (currentP_Pa > P_back_Pa && iterationCount < maxIterations && currentTime < maxSimulationTime) {
        // Perform one RK4 step
        const { newM, newT } = rungeKutta4(f_M, f_T, currentM, currentT_K, dt);

        currentTime += dt;
        currentM = Math.max(0, newM); // Mass cannot be negative
        currentT_K = Math.max(1, newT); // Temperature cannot be negative, set a floor of 1K (approx -272.15 C)

        // Update current pressure based on new mass and temperature
        currentP_Pa = (currentM / V) * R_specific * currentT_K;

        // Recalculate outlet conditions for plotting based on current vessel state
        const current_outlet_conditions = calculate_mdot_and_outlet_conditions(currentM, currentT_K, V, gamma, R_specific, A_orifice, Cd, P_back_Pa);
        const current_mdot_kgs = current_outlet_conditions.mdot;
        const current_Sm3D = convert_kgs_to_Sm3D(current_mdot_kgs, MW);

        // Calculate speed of sound in the vessel
        const speed_of_sound_vessel = Math.sqrt(gamma * R_specific * currentT_K);

        // Calculate inlet pipe velocity and Mach number
        let V_inlet_pipe = 0;
        let Mach_inlet_pipe = 0;
        if (currentM > 0 && A_inlet_pipe > 0) {
            const rho_vessel = currentM / V;
            V_inlet_pipe = current_mdot_kgs / (rho_vessel * A_inlet_pipe);
            Mach_inlet_pipe = V_inlet_pipe / speed_of_sound_vessel;
        }

        // Check for choked flow transition
        const P_critical_now = currentP_Pa * critical_pressure_ratio_const;
        const isChokedNow = P_back_Pa <= P_critical_now;
        if (wasChoked && !isChokedNow && lastTransitionTime === null) {
            lastTransitionTime = currentTime;
        }
        wasChoked = isChokedNow;

        // Store data for plotting and CSV export
        simulationData.times.push(currentTime);
        simulationData.masses.push(currentM);
        simulationData.temperatures_K.push(currentT_K);
        let currentT_C = kelvinToCelsius(currentT_K);
        simulationData.temperatures_C.push(currentT_C);
        minSimTemperatureC = Math.min(minSimTemperatureC, currentT_C); // Update min temperature

        simulationData.pressures_kgfcm2.push(currentP_Pa / KGF_PER_CM2_TO_PA);
        simulationData.massFlowRates.push(current_mdot_kgs);
        simulationData.standardFlowRates_Sm3D.push(current_Sm3D); // Store Sm3/D
        simulationData.outletTemperatures_K.push(current_outlet_conditions.T_throat_K);
        simulationData.outletTemperatures_C.push(kelvinToCelsius(current_outlet_conditions.T_throat_K));
        simulationData.inletVelocities.push(V_inlet_pipe);
        simulationData.inletMachNumbers.push(Mach_inlet_pipe);
        simulationData.outletVelocities.push(current_outlet_conditions.V_outlet_throat);
        simulationData.outletMachNumbers.push(current_outlet_conditions.Mach_outlet_throat);

        iterationCount++;

        // Update progress bar
        const progress = (currentTime / maxSimulationTime) * 100;
        progressBar.value = progress;
        progressBar.textContent = `${Math.round(progress)}%`;
    }

    // Ensure progress bar is full at the end
    progressBar.value = 100;
    progressBar.textContent = '100%';

    // Display results
    document.getElementById('depressurizationTime').textContent = `${currentTime.toFixed(2)} seconds`;
    document.getElementById('finalPressure').textContent = `${(currentP_Pa / KGF_PER_CM2_TO_PA).toExponential(2)} kgf/cm²`;
    document.getElementById('finalTemperature').textContent = `${kelvinToCelsius(currentT_K).toFixed(2)} °C`; // Display in Celsius
    document.getElementById('minTemperature').textContent = `${minSimTemperatureC.toFixed(2)} °C`; // Display min temp
    document.getElementById('initialMassFlowRate').textContent = `${initial_mdot_kgs.toFixed(4)} kg/s`;
    document.getElementById('initialStandardFlowRate').textContent = `${initial_Sm3D.toFixed(2)} Sm³/D`;

    // Render charts
    renderCharts(lastTransitionTime);
}

/**
 * Renders or updates the Chart.js graphs.
 * @param {number|null} transitionTime - Time when choked flow transitioned to unchoked flow, or null.
 */
function renderCharts(transitionTime = null) {
    // Destroy existing charts if they exist
    if (massChart) massChart.destroy();
    if (temperatureChart) temperatureChart.destroy();
    if (massFlowChart) massFlowChart.destroy();
    if (outletTemperatureChart) outletTemperatureChart.destroy();
    if (inletVelocityChart) inletVelocityChart.destroy();
    if (inletMachChart) inletMachChart.destroy();
    if (outletVelocityChart) outletVelocityChart.destroy();
    if (outletMachChart) outletMachChart.destroy();
    if (pressureChart) pressureChart.destroy();
    if (standardFlowChart) standardFlowChart.destroy(); // Destroy standard flow chart

    const showTransition = document.getElementById('showTransition').checked;
    const show7Min = document.getElementById('show7Min').checked;
    const show15Min = document.getElementById('show15Min').checked;

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false, // Changed from true to false for better height control
        scales: {
            x: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Time (s)',
                    color: '#475569'
                },
                grid: {
                    color: '#e2e8f0'
                },
                ticks: {
                    color: '#64748b'
                }
            },
            y: {
                title: {
                    display: true,
                    color: '#475569'
                },
                grid: {
                    color: '#e2e8f0'
                },
                ticks: {
                    color: '#64748b'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#6366f1',
                borderWidth: 1,
                cornerRadius: 5
            },
            annotation: {
                annotations: {}
            },
            zoom: {
                pan: { enabled: true, mode: 'x' },
                zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'x' }
            }
        }
    };

    if (showTransition && transitionTime !== null) {
        commonOptions.plugins.annotation.annotations.transitionLine = {
            type: 'line',
            scaleID: 'x',
            value: transitionTime,
            borderColor: 'rgb(255, 99, 132)', // Red
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
                content: 'Choked/Unchoked Transition',
                enabled: true,
                position: 'start',
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                color: 'white'
            }
        };
    }

    if (show7Min && simulationData.times.length > 0 && simulationData.times[simulationData.times.length - 1] >= 7 * 60) {
        commonOptions.plugins.annotation.annotations.sevenMinLine = {
            type: 'line',
            scaleID: 'x',
            value: 7 * 60,
            borderColor: 'rgb(54, 162, 235)', // Blue
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
                content: '7 Min',
                enabled: true,
                position: 'center',
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                color: 'white'
            }
        };
    }

    if (show15Min && simulationData.times.length > 0 && simulationData.times[simulationData.times.length - 1] >= 15 * 60) {
        commonOptions.plugins.annotation.annotations.fifteenMinLine = {
            type: 'line',
            scaleID: 'x',
            value: 15 * 60,
            borderColor: 'rgb(75, 192, 192)', // Teal
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
                content: '15 Min',
                enabled: true,
                position: 'end',
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                color: 'white'
            }
        };
    }

    // Mass Chart
    massChart = new Chart(document.getElementById('massChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Mass (kg)',
                data: simulationData.masses,
                borderColor: '#6366f1', // Indigo
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        ...commonOptions.scales.y.title,
                        text: 'Mass (kg)'
                    }
                }
            }
        }
    });

    // Temperature Chart (now in Celsius)
    temperatureChart = new Chart(document.getElementById('temperatureChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Temperature (°C)',
                data: simulationData.temperatures_C, // This is now Celsius data
                borderColor: '#ef4444', // Red
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        ...commonOptions.scales.y.title,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });

    // Pressure Chart
    pressureChart = new Chart(document.getElementById('pressureChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Pressure (kgf/cm²)',
                data: simulationData.pressures_kgfcm2,
                borderColor: '#3b82f6', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        ...commonOptions.scales.y.title,
                        text: 'Pressure (kgf/cm²)'
                    }
                }
            }
        }
    });

    // Mass Flow Rate Chart
    massFlowChart = new Chart(document.getElementById('massFlowChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Mass Flow (kg/s)',
                data: simulationData.massFlowRates,
                borderColor: '#22c55e', // Green
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y.title,
                    text: 'Mass Flow (kg/s)'
                }
            }
        }
    });

    // Standard Flow Rate Chart (Sm3/D)
    standardFlowChart = new Chart(document.getElementById('standardFlowChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Standard Flow (Sm³/D)',
                data: simulationData.standardFlowRates_Sm3D, // Pass Sm3/D data to charts
                borderColor: '#9333ea', // Purple
                backgroundColor: 'rgba(147, 51, 234, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y.title,
                    text: 'Standard Flow (Sm³/D)'
                }
            }
        }
    });


    // Outlet Temperature Chart (now in Celsius)
    outletTemperatureChart = new Chart(document.getElementById('outletTemperatureChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Outlet Temperature (°C)',
                data: simulationData.outletTemperatures_C, // This is now Celsius data
                borderColor: '#f97316', // Orange
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y.title,
                    text: 'Outlet Temperature (°C)'
                    }
                }
            }
        }
    );

    // Inlet Velocity Chart
    inletVelocityChart = new Chart(document.getElementById('inletVelocityChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Inlet Pipe Velocity (m/s)',
                data: simulationData.inletVelocities,
                borderColor: '#06b6d4', // Cyan
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y.title,
                    text: 'Velocity (m/s)'
                }
            }
        }
    });

    // Inlet Mach Number Chart
    inletMachChart = new Chart(document.getElementById('inletMachChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Inlet Pipe Mach Number',
                data: simulationData.inletMachNumbers,
                borderColor: '#8b5cf6', // Violet
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y.title,
                    text: 'Mach Number'
                }
            }
        }
    });

    // Outlet Velocity Chart (at orifice throat)
    outletVelocityChart = new Chart(document.getElementById('outletVelocityChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Outlet Orifice Velocity (m/s)',
                data: simulationData.outletVelocities,
                borderColor: '#ec4899', // Pink
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y.title,
                    text: 'Velocity (m/s)'
                }
            }
        }
    });

    // Outlet Mach Number Chart (at orifice throat)
    outletMachChart = new Chart(document.getElementById('outletMachChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: simulationData.times,
            datasets: [{
                label: 'Outlet Orifice Mach Number',
                data: simulationData.outletMachNumbers,
                borderColor: '#10b981', // Emerald
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y.title, // This spreads the properties of the title object
                    text: 'Mach Number' // This overrides the text property if it exists in commonOptions.scales.y.title
                }
            }
        }
    });

    // Set chart container heights based on slider
    const newHeight = document.getElementById('chartHeightSlider').value;
    document.querySelectorAll('.chart-container').forEach(container => {
        container.style.height = `${newHeight}px`;
    });
}

/**
 * Exports the simulation data to a CSV file.
 */
function exportToCSV() {
    if (simulationData.times.length === 0) {
        showMessageBox('No data to export. Please perform a calculation first.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    // Add header row
    const headers = [
        "Time (s)",
        "Mass (kg)",
        "Temperature (K)", // Still export Kelvin for raw data
        "Temperature (C)", // Add Celsius for export
        "Pressure (kgf/cm2)",
        "Mass Flow Rate (kg/s)",
        "Standard Flow Rate (Sm3/D)", // New header for Sm3/D
        "Outlet Temperature (K)", // Still export Kelvin for raw data
        "Outlet Temperature (C)", // Add Celsius for export
        "Inlet Pipe Velocity (m/s)",
        "Inlet Pipe Mach Number",
        "Outlet Orifice Velocity (m/s)",
        "Outlet Orifice Mach Number"
    ];
    csvContent += headers.join(",") + "\n";

    // Add data rows
    for (let i = 0; i < simulationData.times.length; i++) {
        const row = [
            simulationData.times[i].toFixed(4),
            simulationData.masses[i].toFixed(4),
            simulationData.temperatures_K[i].toFixed(4), // Export Kelvin
            simulationData.temperatures_C[i].toFixed(4), // Export Celsius
            simulationData.pressures_kgfcm2[i].toFixed(4),
            simulationData.massFlowRates[i].toFixed(4),
            simulationData.standardFlowRates_Sm3D[i].toFixed(2), // Export Sm3/D
            simulationData.outletTemperatures_K[i].toFixed(4), // Export Kelvin
            simulationData.outletTemperatures_C[i].toFixed(4), // Export Celsius
            simulationData.inletVelocities[i].toFixed(4),
            simulationData.inletMachNumbers[i].toFixed(4),
            simulationData.outletVelocities[i].toFixed(4),
            simulationData.outletMachNumbers[i].toFixed(4)
        ];
        csvContent += row.join(",") + "\n";
    }

    // Create a temporary link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "depressurization_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
}

// Initial calculation on page load for default values
window.onload = function() {
    // Register Chart.js plugins
    if (typeof ChartAnnotation !== 'undefined') {
        Chart.register(ChartAnnotation);
    }
    if (typeof ChartZoom !== 'undefined') {
        Chart.register(ChartZoom);
    }

    // Event listeners for input method radio buttons (Volume vs. Mass)
    document.querySelectorAll('input[name="initialMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const volumeGroup = document.getElementById('volumeInputGroup');
            const massGroup = document.getElementById('massInputGroup');
            const volumeInput = document.getElementById('volume');
            const massInput = document.getElementById('initialMass');
            if (this.value === 'volume') {
                volumeGroup.classList.remove('hidden');
                massGroup.classList.add('hidden');
                volumeInput.disabled = false;
                massInput.disabled = true;
            } else {
                volumeGroup.classList.add('hidden');
                massGroup.classList.remove('hidden');
                volumeInput.disabled = true;
                massInput.disabled = false;
            }
        });
    });

    // Event listeners for heat exchange calculation method radio buttons (Global U*A vs. U & Area)
    document.querySelectorAll('input[name="uMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('uGlobalGroup').classList.toggle('hidden', this.value !== 'global');
            document.getElementById('uDetailedGroup').classList.toggle('hidden', this.value !== 'detailed');
        });
    });

    // Event listener for enabling/disabling heat exchange inputs
    document.getElementById('enableHeatExchange').addEventListener('change', function() {
        document.getElementById('heatExchangeInputs').classList.toggle('hidden', !this.checked);
    });
    
    // Listen for changes on visualization options to re-render charts
    document.getElementById('showTransition').addEventListener('change', () => renderCharts());
    document.getElementById('show7Min').addEventListener('change', () => renderCharts());
    document.getElementById('show15Min').addEventListener('change', () => renderCharts());
    document.getElementById('chartHeightSlider').addEventListener('input', (event) => {
        const newHeight = event.target.value;
        document.querySelectorAll('.chart-container').forEach(container => {
            container.style.height = `${newHeight}px`;
        });
    });

    // --- Collapsible Card Headers ---
    document.querySelectorAll('.card-header.is-clickable').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.closest('.card').querySelector('.card-content');
            content.classList.toggle('is-hidden');
            const icon = header.querySelector('.fas');
            icon.classList.toggle('fa-angle-down');
            icon.classList.toggle('fa-angle-up');
        });
    });

    // --- Project Info Form Submission ---
    // Populate Project Info Form with initial data on load
    document.getElementById('project-name').value = projectInfo["Project Name"];
    document.getElementById('prepared-by').value = projectInfo["Prepared by"];
    renderProjectInfo(); // Initial render of project info

    document.getElementById('project-info-form').addEventListener('submit', function(event) {
        event.preventDefault();
        projectInfo["Project Name"] = document.getElementById('project-name').value.trim();
        projectInfo["Prepared by"] = document.getElementById('prepared-by').value.trim();
        // Set date to current date when saved
        projectInfo["Date"] = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
        renderProjectInfo();
        alert("Project information saved.");
    });


    // Initial calculation on page load for default values
    calculateDepressurization();
    
    // Ensure MathJax typesets after content is rendered
    if (typeof MathJax !== 'undefined') {
        MathJax.startup.promise.then(() => {
            MathJax.typesetPromise();
        });
    }
};
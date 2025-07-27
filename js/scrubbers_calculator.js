// --- Global Data Store ---
let projectInfo = { "Project Name": "Scrubber Sizing Study", "Date": "" };
let conditions = []; // Array to store all condition cases

// --- Constants ---
const K_VALUE_PRESETS = { "C": 0.18, "B": 0.25, "A": 0.35 };
const L_PER_MIN_TO_M3_PER_S = 1 / 60000;
const SM3_PER_D_TO_SM3_PER_S = 1 / (24 * 3600);
const KGFCMA_TO_PA = 98066.5;
const CELSIUS_TO_KELVIN = 273.15;
const R_UNIVERSAL_J_MOLK = 8.31446;
const P_STANDARD_KGF_CM2A = 1.03323;
const T_STANDARD_K = 273.15;
const FT_PER_S_TO_M_PER_S = 0.3048;

// --- DOMContentLoaded: Initial Setup ---
window.addEventListener('DOMContentLoaded', () => {
    renderConditionsTable();
    renderDynamicInputs();

    document.getElementById('numStages').addEventListener('change', renderDynamicInputs);
    document.getElementById('condition-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('clear-form-btn').addEventListener('click', clearForm);
    document.getElementById('calculateBtn').addEventListener('click', calculateScrubbers);
});

/**
 * Sets up the interactive logic for a K-value selector group.
 */
function setupKValueControlsForStage(stageIdPrefix) {
    const optionsSelect = document.getElementById(`${stageIdPrefix}-k-options`);
    const valueInput = document.getElementById(`${stageIdPrefix}-k-input`);

    if (!optionsSelect || !valueInput) return;

    optionsSelect.addEventListener('change', () => {
        if (optionsSelect.value === 'custom') {
            valueInput.disabled = false;
            valueInput.value = '';
            valueInput.focus();
        } else {
            valueInput.disabled = true;
            valueInput.value = optionsSelect.value;
        }
    });
    if (optionsSelect.value !== 'custom') {
        valueInput.value = optionsSelect.value;
    }
}

/**
 * Renders the input fields for each scrubber stage and the discharge stage.
 */
function renderDynamicInputs() {
    const numStages = parseInt(document.getElementById('numStages').value);
    const container = document.getElementById('dynamic-scrubber-inputs');
    container.innerHTML = '';

    const totalSections = numStages + 1;

    for (let i = 1; i <= totalSections; i++) {
        const isDischarge = i > numStages;
        const stageName = isDischarge ? 'Discharge Scrubber' : `Scrubber ${i}`;
        const stageIdPrefix = `sc-${i}`;
        const defaultKValue = (i === 1) ? K_VALUE_PRESETS.C : K_VALUE_PRESETS.B;

        const kValueSection = `
            <div class="field">
                <label class="label">Sizing Coefficient (K-value)</label>
                <div class="field has-addons">
                    <div class="control">
                        <div class="select">
                            <select id="${stageIdPrefix}-k-options">
                                <option value="0.18" ${defaultKValue === 0.18 ? 'selected' : ''}>Class C (0.18 ft/s)</option>
                                <option value="0.25" ${defaultKValue === 0.25 ? 'selected' : ''}>Class B (0.25 ft/s)</option>
                                <option value="0.35">Class A (0.35 ft/s)</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                    </div>
                    <div class="control is-expanded">
                        <input class="input" type="number" step="any" id="${stageIdPrefix}-k-input" placeholder="Custom ft/s" disabled>
                    </div>
                </div>
            </div>`;

        const stageHtml = `
            <div class="box mt-4">
                <h4 class="title is-6">${stageName} Parameters</h4>
                ${kValueSection}
                <div class="columns is-multiline mt-2">
                    <div class="column is-one-third"><div class="field"><label class="label">Gas Flow (Sm³/D)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-gasFlow"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">Gas SG (-)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-gasSg"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">Temperature (°C)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-opTemp"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">Light Liquid (L/min)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-lightLiqFlow"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">Heavy Liquid (L/min)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-heavyLiqFlow"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">Operative P (kgf/cm²g)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-opPress"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">Light Liq Density (kg/m³)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-lightLiqDens"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">Heavy Liq Density (kg/m³)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-heavyLiqDens"></div></div></div>
                    <div class="column is-one-third"><div class="field"><label class="label">MAWP (kgf/cm²g)</label><div class="control"><input class="input" type="number" step="any" id="${stageIdPrefix}-mawp"></div></div></div>
                </div>
            </div>`;
        container.innerHTML += stageHtml;
    }

    for (let i = 1; i <= totalSections; i++) {
        setupKValueControlsForStage(`sc-${i}`);
    }
}

/**
 * Handles the submission of the main condition form.
 */
function handleFormSubmit(event) {
    event.preventDefault();
    const conditionName = document.getElementById('condition-name').value.trim();
    if (!conditionName) { alert('Please provide a name for the condition case.'); return; }

    const numStages = parseInt(document.getElementById('numStages').value);
    const totalSections = numStages + 1;
    const conditionCase = { name: conditionName, stages: numStages, parameters: [] };

    for (let i = 1; i <= totalSections; i++) {
        const stageIdPrefix = `sc-${i}`;
        const kInput = document.getElementById(`${stageIdPrefix}-k-input`);
        const kValue = parseFloat(kInput.value);
        if (isNaN(kValue) || kValue <= 0) {
            const stageName = i > numStages ? 'Discharge Scrubber' : `Scrubber ${i}`;
            alert(`Please provide a valid K-value for ${stageName}.`);
            return;
        }

        const stageData = {
            kValue: kValue,
            gasFlow: parseFloat(document.getElementById(`${stageIdPrefix}-gasFlow`).value) || 0,
            gasSg: parseFloat(document.getElementById(`${stageIdPrefix}-gasSg`).value) || 0,
            opTemp: parseFloat(document.getElementById(`${stageIdPrefix}-opTemp`).value) || 0,
            lightLiqFlow: parseFloat(document.getElementById(`${stageIdPrefix}-lightLiqFlow`).value) || 0,
            heavyLiqFlow: parseFloat(document.getElementById(`${stageIdPrefix}-heavyLiqFlow`).value) || 0,
            opPress: parseFloat(document.getElementById(`${stageIdPrefix}-opPress`).value) || 0,
            lightLiqDens: parseFloat(document.getElementById(`${stageIdPrefix}-lightLiqDens`).value) || 0,
            heavyLiqDens: parseFloat(document.getElementById(`${stageIdPrefix}-heavyLiqDens`).value) || 0,
            mawp: parseFloat(document.getElementById(`${stageIdPrefix}-mawp`).value) || 0,
        };
        conditionCase.parameters.push(stageData);
    }

    const editIndex = document.getElementById('edit-index').value;
    if (editIndex > -1) {
        conditions[editIndex] = conditionCase;
    } else {
        if (conditions.some(c => c.name === conditionName)) {
            alert(`A condition case with the name "${conditionName}" already exists.`);
            return;
        }
        conditions.push(conditionCase);
    }

    renderConditionsTable();
    clearForm();
}

/**
 * Renders the table of saved condition cases.
 */
function renderConditionsTable() {
    const container = document.getElementById('conditions-table-container');
    if (!container) return;
    if (conditions.length === 0) {
        container.innerHTML = '<p class="has-text-grey">No condition cases have been added yet.</p>';
        return;
    }

    let maxStages = 0;
    conditions.forEach(c => { if (c.stages > maxStages) maxStages = c.stages; });

    let headerHtml = '<th>Actions</th><th>Case Name</th>';
    for (let i = 1; i <= maxStages; i++) {
        headerHtml += `<th>SC-${i} K-Val</th><th>SC-${i} P (kgf/cm²g)</th>`;
    }
    headerHtml += '<th>Discharge K-Val</th><th>Discharge P</th>';

    let bodyHtml = '';
    conditions.forEach((cond, index) => {
        let rowHtml = `
            <td class="action-buttons">
                <button class="button is-small is-info" onclick="loadCaseForEdit(${index})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="button is-small is-link" onclick="copyCase(${index})" title="Copy"><i class="fas fa-copy"></i></button>
                <button class="button is-small is-danger" onclick="deleteCase(${index})" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
            <td><strong>${cond.name}</strong></td>`;

        for (let i = 0; i < maxStages; i++) {
            const params = cond.parameters[i];
            rowHtml += `<td>${params && params.kValue ? params.kValue.toFixed(2) : '-'}</td>`;
            rowHtml += `<td>${params ? params.opPress.toFixed(2) : '-'}</td>`;
        }
        
        const dischargeData = cond.parameters[cond.stages];
        rowHtml += `<td>${dischargeData && dischargeData.kValue ? dischargeData.kValue.toFixed(2) : '-'}</td>`;
        rowHtml += `<td>${dischargeData ? dischargeData.opPress.toFixed(2) : '-'}</td>`;
        
        bodyHtml += `<tr>${rowHtml}</tr>`;
    });

    container.innerHTML = `<table class="table is-fullwidth is-bordered is-striped is-narrow is-hoverable"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

/**
 * Loads a case into the form for editing.
 */
function loadCaseForEdit(index) {
    const conditionCase = conditions[index];
    if (!conditionCase) return;

    document.getElementById('condition-form-title').textContent = 'Edit Condition Case';
    document.getElementById('edit-index').value = index;
    document.getElementById('condition-name').value = conditionCase.name;
    document.getElementById('numStages').value = conditionCase.stages;
    
    renderDynamicInputs();

    setTimeout(() => {
        for (let i = 0; i < conditionCase.parameters.length; i++) {
            const params = conditionCase.parameters[i];
            const stageIdPrefix = `sc-${i + 1}`;

            const optionsSelect = document.getElementById(`${stageIdPrefix}-k-options`);
            const valueInput = document.getElementById(`${stageIdPrefix}-k-input`);
            const presetMatch = Object.values(K_VALUE_PRESETS).find(val => val === params.kValue);
            
            optionsSelect.value = presetMatch !== undefined ? presetMatch : 'custom';
            valueInput.value = params.kValue;
            optionsSelect.dispatchEvent(new Event('change'));
            
            document.getElementById(`${stageIdPrefix}-gasFlow`).value = params.gasFlow;
            document.getElementById(`${stageIdPrefix}-gasSg`).value = params.gasSg;
            document.getElementById(`${stageIdPrefix}-opTemp`).value = params.opTemp;
            document.getElementById(`${stageIdPrefix}-lightLiqFlow`).value = params.lightLiqFlow;
            document.getElementById(`${stageIdPrefix}-heavyLiqFlow`).value = params.heavyLiqFlow;
            document.getElementById(`${stageIdPrefix}-opPress`).value = params.opPress;
            document.getElementById(`${stageIdPrefix}-lightLiqDens`).value = params.lightLiqDens;
            document.getElementById(`${stageIdPrefix}-heavyLiqDens`).value = params.heavyLiqDens;
            document.getElementById(`${stageIdPrefix}-mawp`).value = params.mawp;
        }
        document.getElementById('condition-form').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('condition-name').focus();
    }, 100);
}

/**
 * Duplicates a case and loads it into the form.
 */
function copyCase(index) {
    const originalCase = conditions[index];
    if (!originalCase) return;
    const newCase = JSON.parse(JSON.stringify(originalCase));
    let newName = `${originalCase.name} (Copy)`;
    let counter = 2;
    while (conditions.some(c => c.name === newName)) {
        newName = `${originalCase.name} (Copy ${counter})`;
        counter++;
    }
    newCase.name = newName;
    conditions.push(newCase);
    renderConditionsTable();
    loadCaseForEdit(conditions.length - 1);
}

/**
 * Deletes a case.
 */
function deleteCase(index) {
    if (confirm(`Are you sure you want to delete the "${conditions[index].name}" case?`)) {
        conditions.splice(index, 1);
        renderConditionsTable();
        clearForm();
    }
}

/**
 * Clears the form.
 */
function clearForm() {
    document.getElementById('condition-form').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('condition-form-title').textContent = 'Add New Condition Case';
    renderDynamicInputs();
}

/**
 * Checks if a stage's data is empty.
 */
function isStageDataEmpty(stageData) {
    if (!stageData) return true;
    const { gasFlow, lightLiqFlow, heavyLiqFlow, opPress } = stageData;
    return (gasFlow === 0 || !gasFlow) &&
           (lightLiqFlow === 0 || !lightLiqFlow) &&
           (heavyLiqFlow === 0 || !heavyLiqFlow) &&
           (opPress === 0 || !opPress);
}

// --- CALCULATION LOGIC ---

function calculateActualGasFlow(sm3d, pres_g, temp_c) {
    if (sm3d === 0) return 0;
    const P_abs_kgf_cm2a = pres_g + P_STANDARD_KGF_CM2A;
    const T_kelvin = temp_c + CELSIUS_TO_KELVIN;
    const V_actual_m3_per_day = (sm3d * (P_STANDARD_KGF_CM2A / P_abs_kgf_cm2a) * (T_kelvin / T_STANDARD_K));
    return V_actual_m3_per_day / (24 * 3600);
}

function calculateGasDensity(pres_g, temp_c, sg) {
    if (sg === 0) return 0;
    const MW_AIR = 28.96;
    const mw_gas = sg * MW_AIR;
    const pressure_pa_abs = (pres_g + P_STANDARD_KGF_CM2A) * KGFCMA_TO_PA;
    const temperature_k = temp_c + CELSIUS_TO_KELVIN;
    return (pressure_pa_abs * mw_gas) / (R_UNIVERSAL_J_MOLK * 1000 * temperature_k);
}

function calculateMeanLiquidDensity(params) {
    const total_flow = params.lightLiqFlow + params.heavyLiqFlow;
    if (total_flow === 0) return (params.lightLiqDens > 0) ? params.lightLiqDens : (params.heavyLiqDens > 0) ? params.heavyLiqDens : 0;
    const weighted_density = (params.lightLiqFlow * params.lightLiqDens + params.heavyLiqFlow * params.heavyLiqDens) / total_flow;
    return weighted_density;
}

function calculateMaxVelocity(k_fts, rho_l, rho_g) {
    if (rho_g === 0) return Infinity;
    const k_si = k_fts * FT_PER_S_TO_M_PER_S;
    return k_si * Math.sqrt((rho_l - rho_g) / rho_g);
}

function calculateScrubbers() {
    if (conditions.length === 0) {
        alert("No conditions to calculate. Please add at least one condition case.");
        return;
    }

    let results = [];
    conditions.forEach(conditionCase => {
        const totalSections = conditionCase.stages + 1;
        for (let i = 0; i < totalSections; i++) {
            const params = conditionCase.parameters[i];
            const stageName = (i < conditionCase.stages) ? `Scrubber ${i + 1}` : 'Discharge Scrubber';

            if (isStageDataEmpty(params)) continue;

            const q_g_actual = calculateActualGasFlow(params.gasFlow, params.opPress, params.opTemp);
            const q_l_total_actual = (params.lightLiqFlow + params.heavyLiqFlow) * L_PER_MIN_TO_M3_PER_S;
            const q_total = q_g_actual + q_l_total_actual;
            const rho_g = calculateGasDensity(params.opPress, params.opTemp, params.gasSg);
            let rho_l = calculateMeanLiquidDensity(params);
            
            // Handle cases with gas but no liquid (common)
            if (rho_l === 0 && q_g_actual > 0) {
                rho_l = 1000; // Use a default liquid density (e.g., water) for the formula's stability
            }

            const v_max = calculateMaxVelocity(params.kValue, rho_l, rho_g);
            const area_req = (v_max > 0 && v_max !== Infinity) ? q_total / v_max : 0;
            const diameter_req_m = (area_req > 0) ? Math.sqrt(4 * area_req / Math.PI) : 0;
            const diameter_req_mm = diameter_req_m * 1000;

            results.push({
                caseName: conditionCase.name,
                stageName: stageName,
                requiredDiameter: diameter_req_mm
            });
        }
    });

    renderResultsTable(results);
}

/**
 * Renders the final results table in the UI.
 */
function renderResultsTable(results) {
    const container = document.getElementById('resultsDisplay');
    const section = document.getElementById('resultsSection');

    if (!container || !section) {
        console.error("Results container not found!");
        return;
    }

    if (results.length === 0) {
        container.innerHTML = '<p class="has-text-grey">No valid results to display. Check input data.</p>';
        section.style.display = 'block';
        return;
    }

    let tableHtml = `
        <table class="table is-fullwidth is-bordered is-striped is-hoverable">
            <thead>
                <tr>
                    <th>Condition Case</th>
                    <th>Equipment</th>
                    <th>Required Diameter (mm)</th>
                </tr>
            </thead>
            <tbody>`;
    
    results.forEach(res => {
        tableHtml += `
            <tr>
                <td>${res.caseName}</td>
                <td>${res.stageName}</td>
                <td><strong>${res.requiredDiameter.toFixed(2)}</strong></td>
            </tr>`;
    });

    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}
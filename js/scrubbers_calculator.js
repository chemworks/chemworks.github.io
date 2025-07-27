// --- Global Data Store ---
let projectInfo = {
    "Project Name": "Scrubber Sizing Study", "Project Number": "SCB-2025-001",
    "Client": "Acme Inc.", "Prepared by": "Engineering Dept.", "Reviewed by": "Reviewer's Name",
    "Date": new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
};
let designCriteria = { "minNllMm": 250, "minLiqOutletIn": 2 };
let conditions = []; 
const originalConditions = []; 

// --- Constants ---
const K_VALUE_PRESETS = { "C": 0.18, "B": 0.25, "A": 0.35 };
const L_PER_MIN_TO_M3_PER_S = 1 / 60000;
const P_STANDARD_KGF_CM2A = 1.03323;
const T_STANDARD_K = 273.15;
const FT_PER_S_TO_M_PER_S = 0.3048;
const M_TO_IN = 39.3701;
const KGFCMA_TO_PA = 98066.5;
const R_UNIVERSAL_J_MOLK = 8.31446;
const CELSIUS_TO_KELVIN = 273.15;
const INLET_MOMENTUM_LIMIT = 2976; 
const GAS_OUTLET_VELOCITY_LIMIT = 20; 
const LIQUID_OUTLET_VELOCITY_LIMIT = 1; 
const LIQUID_RESIDENCE_TIME_S = 5 * 60; 

// --- DOMContentLoaded: Initial Setup ---
window.addEventListener('DOMContentLoaded', () => {
    renderProjectInfo();
    renderDesignCriteria();
    renderConditionsTable();
    renderDynamicInputs();
    
    document.getElementById('project-info-form').addEventListener('submit', handleProjectInfoSubmit);
    document.getElementById('numStages').addEventListener('change', renderDynamicInputs);
    document.getElementById('condition-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('clear-form-btn').addEventListener('click', clearForm);

    document.querySelectorAll('.card-header.is-clickable').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.closest('.card').querySelector('.card-content');
            if (content) content.classList.toggle('is-hidden');
            const icon = header.querySelector('.icon .fas');
            if (icon) {
                icon.classList.toggle('fa-angle-down');
                icon.classList.toggle('fa-angle-up');
            }
        });
    });

    document.getElementById('calculateBtn').addEventListener('click', calculateScrubbers);
    document.getElementById('save-project-btn').addEventListener('click', saveProjectData);
    document.getElementById('load-project-btn').addEventListener('click', () => document.getElementById('load-project-file-input').click());
    document.getElementById('load-project-file-input').addEventListener('change', loadProjectData);
    document.getElementById('reset-data-btn').addEventListener('click', resetData);
    document.getElementById('min-nll').addEventListener('change', () => designCriteria.minNllMm = parseFloat(document.getElementById('min-nll').value) || 250);
    document.getElementById('min-liq-outlet').addEventListener('change', () => designCriteria.minLiqOutletIn = parseFloat(document.getElementById('min-liq-outlet').value) || 2);
});

function handleProjectInfoSubmit(event) {
    event.preventDefault();
    projectInfo["Project Name"] = document.getElementById('project-name').value;
    projectInfo["Project Number"] = document.getElementById('project-number').value;
    projectInfo["Client"] = document.getElementById('client').value;
    projectInfo["Prepared by"] = document.getElementById('prepared-by').value;
    projectInfo["Reviewed by"] = document.getElementById('reviewed-by').value;
    projectInfo["Date"] = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    renderProjectInfo();
    alert("Project information saved.");
}

function renderProjectInfo() {
    const container = document.getElementById('project-info-display');
    if (!container) return;
    let html = '<ul>';
    for (const key in projectInfo) {
        html += `<li><strong>${key}:</strong> ${projectInfo[key]}</li>`;
    }
    html += '</ul>';
    container.innerHTML = html;
    
    document.getElementById('project-name').value = projectInfo["Project Name"];
    document.getElementById('project-number').value = projectInfo["Project Number"];
    document.getElementById('client').value = projectInfo["Client"];
    document.getElementById('prepared-by').value = projectInfo["Prepared by"];
    document.getElementById('reviewed-by').value = projectInfo["Reviewed by"];
}

function renderDesignCriteria() {
    document.getElementById('min-nll').value = designCriteria.minNllMm;
    document.getElementById('min-liq-outlet').value = designCriteria.minLiqOutletIn;
}

function setupKValueControlsForStage(stageIdPrefix) {
    const optionsSelect = document.getElementById(`${stageIdPrefix}-k-options`);
    const valueInput = document.getElementById(`${stageIdPrefix}-k-input`);
    if (!optionsSelect || !valueInput) return;

    optionsSelect.addEventListener('change', () => {
        valueInput.disabled = optionsSelect.value !== 'custom';
        valueInput.value = optionsSelect.value === 'custom' ? '' : optionsSelect.value;
        if (optionsSelect.value === 'custom') valueInput.focus();
    });
    optionsSelect.dispatchEvent(new Event('change'));
}

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
                    <div class="control"><div class="select">
                        <select id="${stageIdPrefix}-k-options">
                            <option value="0.18" ${defaultKValue === 0.18 ? 'selected' : ''}>Class C (0.18 ft/s)</option>
                            <option value="0.25" ${defaultKValue === 0.25 ? 'selected' : ''}>Class B (0.25 ft/s)</option>
                            <option value="0.35">Class A (0.35 ft/s)</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div></div>
                    <div class="control is-expanded"><input class="input" type="number" step="any" id="${stageIdPrefix}-k-input" placeholder="Custom ft/s" disabled></div>
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

function handleFormSubmit(event) {
    event.preventDefault();
    const conditionName = document.getElementById('condition-name').value.trim();
    if (!conditionName) { alert('Please provide a name for the condition case.'); return; }

    const numStages = parseInt(document.getElementById('numStages').value);
    const totalSections = numStages + 1;
    const conditionCase = { name: conditionName, stages: numStages, parameters: [] };

    for (let i = 1; i <= totalSections; i++) {
        const stageIdPrefix = `sc-${i}`;
        const kValue = parseFloat(document.getElementById(`${stageIdPrefix}-k-input`).value);
        if (isNaN(kValue) || kValue <= 0) {
            const stageName = i > numStages ? 'Discharge Scrubber' : `Scrubber ${i}`;
            alert(`Please provide a valid K-value for ${stageName}.`);
            return;
        }

        conditionCase.parameters.push({
            kValue,
            gasFlow: parseFloat(document.getElementById(`${stageIdPrefix}-gasFlow`).value) || 0,
            gasSg: parseFloat(document.getElementById(`${stageIdPrefix}-gasSg`).value) || 0,
            opTemp: parseFloat(document.getElementById(`${stageIdPrefix}-opTemp`).value) || 0,
            lightLiqFlow: parseFloat(document.getElementById(`${stageIdPrefix}-lightLiqFlow`).value) || 0,
            heavyLiqFlow: parseFloat(document.getElementById(`${stageIdPrefix}-heavyLiqFlow`).value) || 0,
            opPress: parseFloat(document.getElementById(`${stageIdPrefix}-opPress`).value) || 0,
            lightLiqDens: parseFloat(document.getElementById(`${stageIdPrefix}-lightLiqDens`).value) || 0,
            heavyLiqDens: parseFloat(document.getElementById(`${stageIdPrefix}-heavyLiqDens`).value) || 0,
            mawp: parseFloat(document.getElementById(`${stageIdPrefix}-mawp`).value) || 0,
        });
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
            rowHtml += `<td>${params && params.kValue ? params.kValue.toFixed(2) : '-'}</td><td>${params ? params.opPress.toFixed(2) : '-'}</td>`;
        }
        const dischargeData = cond.parameters[cond.stages];
        rowHtml += `<td>${dischargeData && dischargeData.kValue ? dischargeData.kValue.toFixed(2) : '-'}</td><td>${dischargeData ? dischargeData.opPress.toFixed(2) : '-'}</td>`;
        bodyHtml += `<tr>${rowHtml}</tr>`;
    });
    container.innerHTML = `<table class="table is-fullwidth is-bordered is-striped is-narrow is-hoverable"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

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
            
            for (const key in params) {
                const input = document.getElementById(`${stageIdPrefix}-${key.replace(/_/g, '')}`);
                if (input) input.value = params[key];
            }
        }
        document.getElementById('condition-form').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('condition-name').focus();
    }, 100);
}

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

function deleteCase(index) {
    if (confirm(`Are you sure you want to delete the "${conditions[index].name}" case?`)) {
        conditions.splice(index, 1);
        renderConditionsTable();
        clearForm();
    }
}

function clearForm() {
    document.getElementById('condition-form').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('condition-form-title').textContent = 'Add New Condition Case';
    renderDynamicInputs();
}

function isStageDataEmpty(stageData) {
    if (!stageData) return true;
    return (stageData.gasFlow === 0 || !stageData.gasFlow) && (stageData.opPress === 0 || !stageData.opPress);
}

// --- CALCULATION LOGIC ---

function calculateActualGasFlow(sm3d, pres_g, temp_c) {
    if (sm3d === 0) return 0;
    const P_abs_kgf_cm2a = pres_g + P_STANDARD_KGF_CM2A;
    const T_kelvin = temp_c + CELSIUS_TO_KELVIN;
    return (sm3d * (P_STANDARD_KGF_CM2A / P_abs_kgf_cm2a) * (T_kelvin / T_STANDARD_K)) / (24 * 3600);
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
    if (total_flow === 0) return (params.lightLiqDens || params.heavyLiqDens || 1000);
    return (params.lightLiqFlow * params.lightLiqDens + params.heavyLiqFlow * params.heavyLiqDens) / total_flow;
}

function calculateMaxVelocity(k_fts, rho_l, rho_g) {
    if (rho_g === 0) return Infinity;
    const k_si = k_fts * FT_PER_S_TO_M_PER_S;
    return k_si * Math.sqrt((rho_l - rho_g) / rho_g);
}

function calculateScrubbers() {
    if (conditions.length === 0) {
        alert("No conditions to calculate.");
        return;
    }

    let results = [];
    conditions.forEach(conditionCase => {
        for (let i = 0; i < conditionCase.parameters.length; i++) {
            const params = conditionCase.parameters[i];
            const stageName = (i < conditionCase.stages) ? `Scrubber ${i + 1}` : 'Discharge Scrubber';
            if (isStageDataEmpty(params)) continue;

            const q_g_actual = calculateActualGasFlow(params.gasFlow, params.opPress, params.opTemp);
            if (q_g_actual === 0) continue;

            const q_l_total_actual = (params.lightLiqFlow + params.heavyLiqFlow) * L_PER_MIN_TO_M3_PER_S;
            const rho_g = calculateGasDensity(params.opPress, params.opTemp, params.gasSg);
            let rho_l = calculateMeanLiquidDensity(params);
            
            const v_max = calculateMaxVelocity(params.kValue, rho_l, rho_g);
            const area_req = (v_max > 0 && v_max !== Infinity) ? q_g_actual / v_max : 0;
            const diameter_req_m = (area_req > 0) ? Math.sqrt(4 * area_req / Math.PI) : 0;
            
            const rho_m_inlet = (rho_g * q_g_actual + rho_l * q_l_total_actual) / (q_g_actual + q_l_total_actual || 1);
            const inlet_area = (q_g_actual + q_l_total_actual) * Math.sqrt(rho_m_inlet / INLET_MOMENTUM_LIMIT);
            const gas_outlet_area = q_g_actual / GAS_OUTLET_VELOCITY_LIMIT;
            const liquid_outlet_area = q_l_total_actual / LIQUID_OUTLET_VELOCITY_LIMIT;
            
            let liqOutletIn = Math.sqrt(4 * liquid_outlet_area / Math.PI) * M_TO_IN;
            liqOutletIn = Math.max(liqOutletIn, designCriteria.minLiqOutletIn);

            const liquid_volume = q_l_total_actual * LIQUID_RESIDENCE_TIME_S;
            let nll_m = (area_req > 0) ? liquid_volume / area_req : 0;
            nll_m = Math.max(nll_m, designCriteria.minNllMm / 1000);

            results.push({
                caseName: conditionCase.name, stageName: stageName,
                requiredDiameterIn: diameter_req_m * M_TO_IN, requiredDiameterMm: diameter_req_m * 1000,
                inletNozzleIn: Math.sqrt(4 * inlet_area / Math.PI) * M_TO_IN, inletNozzleMm: Math.sqrt(4 * inlet_area / Math.PI) * 1000,
                gasOutletNozzleIn: Math.sqrt(4 * gas_outlet_area / Math.PI) * M_TO_IN, gasOutletNozzleMm: Math.sqrt(4 * gas_outlet_area / Math.PI) * 1000,
                liquidOutletNozzleIn: liqOutletIn, liquidOutletNozzleMm: liqOutletIn / M_TO_IN * 1000,
                nllIn: nll_m * M_TO_IN, nllMm: nll_m * 1000
            });
        }
    });
    renderResultsTable(results);
}

function renderResultsTable(results) {
    const container = document.getElementById('resultsDisplay');
    const section = document.getElementById('resultsSection');
    if (!container || !section) return;

    if (results.length === 0) {
        container.innerHTML = '<p class="has-text-grey">No valid results to display. Check input data.</p>';
        section.style.display = 'block';
        return;
    }

    const tableData = {};
    const caseNames = [...new Set(results.map(r => r.caseName))];
    const stageNames = [...new Set(results.map(r => r.stageName))];

    const parameters = [
        { key: 'requiredDiameter', label: 'Vessel ID in (mm)' },
        { key: 'inletNozzle', label: 'Inlet Nozzle in (mm)' },
        { key: 'gasOutletNozzle', label: 'Gas Outlet Nozzle in (mm)' },
        { key: 'liquidOutletNozzle', label: 'Liquid Outlet Nozzle in (mm)' },
        { key: 'nll', label: 'Normal Liquid Level in (mm)' }
    ];

    stageNames.forEach(stage => {
        tableData[stage] = {};
        parameters.forEach(param => {
            tableData[stage][`${param.key}Max`] = 0;
        });

        results.filter(r => r.stageName === stage).forEach(res => {
            tableData[stage][res.caseName] = res;
            parameters.forEach(param => {
                if (res[`${param.key}In`] > tableData[stage][`${param.key}Max`]) {
                    tableData[stage][`${param.key}Max`] = res[`${param.key}In`];
                }
            });
        });
    });

    let headerHtml = '<th>Parameter</th>';
    caseNames.forEach(name => headerHtml += `<th>${name}</th>`);

    let bodyHtml = '';
    stageNames.forEach(stage => {
        bodyHtml += `<tr><td colspan="${caseNames.length + 1}" class="has-background-light"><strong>${stage}</strong></td></tr>`;
        parameters.forEach(param => {
            bodyHtml += `<tr><td>${param.label}</td>`;
            caseNames.forEach(caseName => {
                const result = tableData[stage][caseName];
                if (result) {
                    const isMax = result[`${param.key}In`] === tableData[stage][`${param.key}Max`];
                    const valueIn = result[`${param.key}In`];
                    const valueMm = result[`${param.key}Mm`];
                    const cellContent = `${valueIn.toFixed(2)} (${valueMm.toFixed(2)})`;
                    bodyHtml += `<td>${isMax ? `<strong>${cellContent}</strong>` : cellContent}</td>`;
                } else {
                    bodyHtml += '<td>-</td>';
                }
            });
            bodyHtml += '</tr>';
        });
    });

    const fullTableHtml = `
        <h3 class="title is-5">Sizing Summary</h3>
        <p class="subtitle is-6">The controlling case for each parameter is marked in <strong>bold</strong>. All diameters are internal.</p>
        <div class="table-container">
            <table class="table is-fullwidth is-bordered is-striped is-hoverable">
                <thead><tr>${headerHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        </div>`;
    
    container.innerHTML = fullTableHtml;
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}

// --- Project Data Functions ---
function getFormattedFileName(extension) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}_${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}`;
    const projectName = (projectInfo["Project Name"] || "Project").replace(/[^a-z0-9]/gi, '_');
    return `${projectName}_${dateStr}.${extension}`;
}

function saveProjectData() {
    const projectData = { projectInfo, conditions, designCriteria };
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = getFormattedFileName('json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function loadProjectData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            projectInfo = loadedData.projectInfo || projectInfo;
            conditions = loadedData.conditions || [];
            designCriteria = loadedData.designCriteria || designCriteria;
            renderProjectInfo();
            renderDesignCriteria();
            renderConditionsTable();
            clearForm();
            alert("Project loaded successfully.");
        } catch (error) {
            alert(`Error loading JSON file: ${error.message}`);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function resetData() {
    if (confirm("Are you sure you want to reset all data?")) {
        conditions = [];
        designCriteria = { "minNllMm": 250, "minLiqOutletIn": 2 };
        renderDesignCriteria();
        renderConditionsTable();
        clearForm();
        document.getElementById('resultsSection').style.display = 'none';
        alert("Data has been reset.");
    }
}
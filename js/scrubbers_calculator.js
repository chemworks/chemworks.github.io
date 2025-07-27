// --- Global Data Store ---
let projectInfo = { "Project Name": "Scrubber Sizing Study", "Date": "" };
let conditions = []; // Array to store all condition cases

// --- Constants ---
const L_PER_MIN_TO_M3_PER_D = 1.44;

// --- DOMContentLoaded: Initial Setup ---
window.addEventListener('DOMContentLoaded', () => {
    renderConditionsTable();
    renderDynamicInputs();

    // --- Event Listeners ---
    document.getElementById('numStages').addEventListener('change', renderDynamicInputs);
    document.getElementById('condition-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('clear-form-btn').addEventListener('click', clearForm);
    document.getElementById('calculateBtn').addEventListener('click', calculateScrubbers);
});

/**
 * Renders the input fields for each scrubber stage plus one for Discharge.
 */
function renderDynamicInputs() {
    const numStages = parseInt(document.getElementById('numStages').value);
    const container = document.getElementById('dynamic-scrubber-inputs');
    container.innerHTML = ''; // Clear existing inputs

    const totalSections = numStages + 1; // N scrubbers + 1 Discharge stage

    for (let i = 1; i <= totalSections; i++) {
        const isDischargeStage = (i > numStages);
        const stageName = isDischargeStage ? 'Discharge' : `Scrubber ${i}`;
        const stageIdPrefix = `sc-${i}`;

        const stageHtml = `
            <div class="box mt-4">
                <h4 class="title is-6">${stageName} Parameters</h4>
                <div class="columns is-multiline">
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
}

/**
 * Handles the submission of the main condition form (add or update).
 */
function handleFormSubmit(event) {
    event.preventDefault();
    const conditionName = document.getElementById('condition-name').value.trim();
    if (!conditionName) {
        alert('Please provide a name for the condition case.');
        return;
    }

    const numStages = parseInt(document.getElementById('numStages').value);
    const totalSections = numStages + 1;

    const conditionCase = {
        name: conditionName,
        stages: numStages,
        parameters: []
    };

    for (let i = 1; i <= totalSections; i++) {
        const stageIdPrefix = `sc-${i}`;
        const stageData = {
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
 * Renders the main table displaying all saved condition cases.
 */
function renderConditionsTable() {
    const container = document.getElementById('conditions-table-container');
    if (conditions.length === 0) {
        container.innerHTML = '<p class="has-text-grey">No condition cases have been added yet.</p>';
        return;
    }

    let maxStages = 0;
    conditions.forEach(c => { if (c.stages > maxStages) maxStages = c.stages; });

    let headerHtml = '<th>Actions</th><th>Case Name</th>';
    for (let i = 1; i <= maxStages; i++) {
        headerHtml += `<th>SC-${i} Gas Flow</th><th>SC-${i} Op. Press</th>`;
    }
    headerHtml += '<th>Discharge Gas Flow</th><th>Discharge Op. Press</th>';

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
            rowHtml += `<td>${params ? params.gasFlow.toFixed(2) : '-'}</td><td>${params ? params.opPress.toFixed(2) : '-'}</td>`;
        }
        
        const dischargeData = cond.parameters[cond.stages];
        rowHtml += `<td>${dischargeData ? dischargeData.gasFlow.toFixed(2) : '-'}</td><td>${dischargeData ? dischargeData.opPress.toFixed(2) : '-'}</td>`;
        
        bodyHtml += `<tr>${rowHtml}</tr>`;
    });

    container.innerHTML = `<table class="table is-fullwidth is-bordered is-striped is-narrow is-hoverable"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

/**
 * Loads a saved condition case into the form for editing.
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
        // Scroll to the form and focus on the name field for a better user experience
        document.getElementById('condition-form').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('condition-name').focus();
    }, 100);
}

/**
 * Duplicates a condition case and loads it into the form for editing.
 * @param {number} index - The index of the case to copy.
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

    // Add the new case to the array and find its index
    conditions.push(newCase);
    const newIndex = conditions.length - 1;

    // Re-render the table to show the new entry
    renderConditionsTable();

    // Load the newly created case into the form for immediate editing
    loadCaseForEdit(newIndex);
}


/**
 * Deletes a condition case.
 */
function deleteCase(index) {
    if (confirm(`Are you sure you want to delete the "${conditions[index].name}" case?`)) {
        conditions.splice(index, 1);
        renderConditionsTable();
        clearForm();
    }
}

/**
 * Clears the form fields.
 */
function clearForm() {
    document.getElementById('condition-form').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('condition-form-title').textContent = 'Add New Condition Case';
    renderDynamicInputs();
}

/**
 * Checks if a stage's data is essentially empty.
 */
function isStageDataEmpty(stageData) {
    if (!stageData) return true;
    const { gasFlow, lightLiqFlow, heavyLiqFlow, opPress } = stageData;
    return (gasFlow === 0 || !gasFlow) &&
           (lightLiqFlow === 0 || !lightLiqFlow) &&
           (heavyLiqFlow === 0 || !heavyLiqFlow) &&
           (opPress === 0 || !opPress);
}

/**
 * Main calculation logic.
 */
function calculateScrubbers() {
    if (conditions.length === 0) {
        alert("No conditions to calculate. Please add at least one condition case.");
        return;
    }

    console.log("--- Starting Calculation ---");
    conditions.forEach(conditionCase => {
        console.log(`\nProcessing Case: "${conditionCase.name}"`);
        
        for (let i = 0; i < conditionCase.stages; i++) {
            const scrubberData = conditionCase.parameters[i];
            console.log(`  Scrubber ${i + 1} Data:`, scrubberData);
        }

        const dischargeData = conditionCase.parameters[conditionCase.stages];
        if (!isStageDataEmpty(dischargeData)) {
            console.log(`  Discharge Data:`, dischargeData);
        } else {
            console.log(`  Discharge stage for "${conditionCase.name}" is empty and will be ignored.`);
        }
    });

    alert("Calculation logic initiated. Check the browser console (F12) for details.");
}
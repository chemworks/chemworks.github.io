// js/script.js
// --- Lógica para activar el enlace de navegación actual ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPageUrl = window.location.href;
    const navLinks = document.querySelectorAll('.navbar-item');

    navLinks.forEach(link => {
        // Compara el href del enlace con la URL actual
        if (link.href === currentPageUrl) {
            link.classList.add('is-active');

            // Si el enlace está en un dropdown, activa también el menú principal
            const dropdown = link.closest('.has-dropdown');
            if (dropdown) {
                const parentLink = dropdown.querySelector('.navbar-link');
                parentLink.classList.add('is-active');
            }
        }
    });

    // ... (El resto del código de script.js que ya tenías)
    // ... (Se mantiene igual desde la línea 'const constants = ...' en adelante)
});

// --- Global Constants ---
const constants = {
    MM_TO_M: 0.001,
    KGFCMA_TO_PA: 98066.5,
    PSI_TO_PA: 6894.76, // 1 psi = 6894.76 Pa
    CELSIUS_TO_KELVIN: 273.15,
    R_UNIVERSAL_J_MOLK: 8.314462618,
    T_STANDARD_K: 273.15,
    P_STANDARD_KGF_CM2A: 1.03323, // 1 atm approx in kgf/cm2a
    DAYS_TO_SECONDS: 24 * 3600,
    M3_PER_D_TO_M3_PER_S: 1 / (24 * 3600),
    KG_PER_M3_TO_LB_PER_FT3: 0.062428,
    FT_PER_S_TO_M_PER_S: 0.3048,
    PA_TO_BAR: 1e-5,
    CP_TO_PAS: 0.001,
    KGFCM2_TO_BAR: 0.980665
};

// --- LOGO BASE64 (PNG Base64 para compatibilidad con jsPDF) ---
// Este es el Base64 de tu logo SVG, convertido a PNG para que jsPDF lo maneje mejor.
// Si el logo original es SVG, la conversión a PNG Base64 es la forma más fiable para jsPDF.
const myLogoBase64 = "data:image/png;base64,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";

let designCriteria = {
    // Flow Criteria
    "max_velocity_gas_mps": 20.0,
    "max_velocity_liquid_mps": 3.0,
    "max_velocity_multiphase_mps": 18.0,
    "max_rhov2_kg_per_m_s2": 3750.0,
    "max_mach_vent_lines": 0.7,
    "api14e_c_factor_nnf": 125.0,
    "api14e_c_factor_cf": 100.0,
    "pipe_roughness_mm": 0.045,
    // Thickness Criteria
    "allowable_stress_psi": 20000.0,
    "quality_factor_E": 1.0,
    "temp_coefficient_Y": 0.4,
    "corrosion_allowance_mm": 1.5
};

// Data for pipe diameters (as provided previously)
const diametersData = {
    "1/8-40": {"DN": "1/8", "DE_mm": 10.29, "DI_mm": 6.83, "e_mm": 1.73}, "1/8-80": {"DN": "1/8", "DE_mm": 10.29, "DI_mm": 5.41, "e_mm": 2.44}, "1/8-XS": {"DN": "1/8", "DE_mm": 10.29, "DI_mm": 5.41, "e_mm": 2.44}, "1/8-160": {"DN": "1/8", "DE_mm": 10.29, "DI_mm": 3.43, "e_mm": 3.43}, "1/4-40": {"DN": "1/4", "DE_mm": 13.72, "DI_mm": 9.25, "e_mm": 2.24}, "1/4-80": {"DN": "1/4", "DE_mm": 13.72, "DI_mm": 7.37, "e_mm": 3.18}, "1/4-XS": {"DN": "1/4", "DE_mm": 13.72, "DI_mm": 7.37, "e_mm": 3.18}, "1/4-160": {"DN": "1/4", "DE_mm": 13.72, "DI_mm": 5.82, "e_mm": 3.95}, "3/8-40": {"DN": "3/8", "DE_mm": 17.15, "DI_mm": 12.87, "e_mm": 2.14}, "3/8-80": {"DN": "3/8", "DE_mm": 17.15, "DI_mm": 10.99, "e_mm": 3.08}, "3/8-XS": {"DN": "3/8", "DE_mm": 17.15, "DI_mm": 10.99, "e_mm": 3.08}, "3/8-160": {"DN": "3/8", "DE_mm": 17.15, "DI_mm": 8.08, "e_mm": 4.53}, "1/2-10S": {"DN": "1/2", "DE_mm": 21.34, "DI_mm": 18.04, "e_mm": 1.65}, "1/2-40": {"DN": "1/2", "DE_mm": 21.34, "DI_mm": 15.80, "e_mm": 2.77}, "1/2-STD": {"DN": "1/2", "DE_mm": 21.34, "DI_mm": 15.80, "e_mm": 2.77}, "1/2-80": {"DN": "1/2", "DE_mm": 21.34, "DI_mm": 13.90, "e_mm": 3.73}, "1/2-XS": {"DN": "1/2", "DE_mm": 21.34, "DI_mm": 13.90, "e_mm": 3.73}, "1/2-160": {"DN": "1/2", "DE_mm": 21.34, "DI_mm": 11.78, "e_mm": 4.78}, "1/2-XXS": {"DN": "1/2", "DE_mm": 21.34, "DI_mm": 6.40, "e_mm": 7.47}, "3/4-10S": {"DN": "3/4", "DE_mm": 26.67, "DI_mm": 23.37, "e_mm": 1.65}, "3/4-40": {"DN": "3/4", "DE_mm": 26.67, "DI_mm": 20.93, "e_mm": 2.87}, "3/4-STD": {"DN": "3/4", "DE_mm": 26.67, "DI_mm": 20.93, "e_mm": 2.87}, "3/4-80": {"DN": "3/4", "DE_mm": 26.67, "DI_mm": 18.85, "e_mm": 3.91}, "3/4-XS": {"DN": "3/4", "DE_mm": 26.67, "DI_mm": 18.85, "e_mm": 3.91}, "3/4-160": {"DN": "3/4", "DE_mm": 26.67, "DI_mm": 15.55, "e_mm": 5.56}, "3/4-XXS": {"DN": "3/4", "DE_mm": 26.67, "DI_mm": 11.03, "e_mm": 7.82}, "1-10S": {"DN": "1", "DE_mm": 33.40, "DI_mm": 30.10, "e_mm": 1.65}, "1-40": {"DN": "1", "DE_mm": 33.40, "DI_mm": 26.64, "e_mm": 3.38}, "1-STD": {"DN": "1", "DE_mm": 33.40, "DI_mm": 26.64, "e_mm": 3.38}, "1-80": {"DN": "1", "DE_mm": 33.40, "DI_mm": 24.30, "e_mm": 4.55}, "1-XS": {"DN": "1", "DE_mm": 33.40, "DI_mm": 24.30, "e_mm": 4.55}, "1-160": {"DN": "1", "DE_mm": 33.40, "DI_mm": 20.70, "e_mm": 6.35}, "1-XXS": {"DN": "1", "DE_mm": 33.40, "DI_mm": 15.22, "e_mm": 9.09}, "1 1/4-10S": {"DN": "1 1/4", "DE_mm": 42.16, "DI_mm": 38.86, "e_mm": 1.65}, "1 1/4-40": {"DN": "1 1/4", "DE_mm": 42.16, "DI_mm": 35.05, "e_mm": 3.56}, "1 1/4-STD": {"DN": "1 1/4", "DE_mm": 42.16, "DI_mm": 35.05, "e_mm": 3.56}, "1 1/4-80": {"DN": "1 1/4", "DE_mm": 42.16, "DI_mm": 32.46, "e_mm": 4.85}, "1 1/4-XS": {"DN": "1 1/4", "DE_mm": 42.16, "DI_mm": 32.46, "e_mm": 4.85}, "1 1/4-160": {"DN": "1 1/4", "DE_mm": 42.16, "DI_mm": 29.46, "e_mm": 6.35}, "1 1/4-XXS": {"DN": "1 1/4", "DE_mm": 42.16, "DI_mm": 22.22, "e_mm": 9.97}, "1 1/2-10S": {"DN": "1 1/2", "DE_mm": 48.26, "DI_mm": 44.96, "e_mm": 1.65}, "1 1/2-40": {"DN": "1 1/2", "DE_mm": 48.26, "DI_mm": 40.89, "e_mm": 3.68}, "1 1/2-STD": {"DN": "1 1/2", "DE_mm": 48.26, "DI_mm": 40.89, "e_mm": 3.68}, "1 1/2-80": {"DN": "1 1/2", "DE_mm": 48.26, "DI_mm": 38.10, "e_mm": 5.08}, "1 1/2-XS": {"DN": "1 1/2", "DE_mm": 48.26, "DI_mm": 38.10, "e_mm": 5.08}, "1 1/2-160": {"DN": "1 1/2", "DE_mm": 48.26, "DI_mm": 34.04, "e_mm": 7.11}, "1 1/2-XXS": {"DN": "1 1/2", "DE_mm": 48.26, "DI_mm": 27.94, "e_mm": 10.16}, "2-10S": {"DN": "2", "DE_mm": 60.33, "DI_mm": 56.93, "e_mm": 1.70}, "2-40": {"DN": "2", "DE_mm": 60.33, "DI_mm": 52.53, "e_mm": 3.91}, "2-STD": {"DN": "2", "DE_mm": 60.33, "DI_mm": 52.53, "e_mm": 3.91}, "2-80": {"DN": "2", "DE_mm": 60.33, "DI_mm": 49.25, "e_mm": 5.54}, "2-XS": {"DN": "2", "DE_mm": 60.33, "DI_mm": 49.25, "e_mm": 5.54}, "2-160": {"DN": "2", "DE_mm": 60.33, "DI_mm": 42.84, "e_mm": 8.74}, "2-XXS": {"DN": "2", "DE_mm": 60.33, "DI_mm": 38.17, "e_mm": 11.07}, "2 1/2-10S": {"DN": "2 1/2", "DE_mm": 73.03, "DI_mm": 69.93, "e_mm": 1.55}, "2 1/2-40": {"DN": "2 1/2", "DE_mm": 73.03, "DI_mm": 62.71, "e_mm": 5.16}, "2 1/2-STD": {"DN": "2 1/2", "DE_mm": 73.03, "DI_mm": 62.71, "e_mm": 5.16}, "2 1/2-80": {"DN": "2 1/2", "DE_mm": 73.03, "DI_mm": 59.70, "e_mm": 7.01}, "2 1/2-XS": {"DN": "2 1/2", "DE_mm": 73.03, "DI_mm": 59.70, "e_mm": 7.01}, "2 1/2-160": {"DN": "2 1/2", "DE_mm": 73.03, "DI_mm": 53.97, "e_mm": 9.53}, "2 1/2-XXS": {"DN": "2 1/2", "DE_mm": 73.03, "DI_mm": 44.99, "e_mm": 14.02}, "3-10S": {"DN": "3", "DE_mm": 88.90, "DI_mm": 85.80, "e_mm": 1.55}, "3-40": {"DN": "3", "DE_mm": 88.90, "DI_mm": 77.93, "e_mm": 5.49}, "3-STD": {"DN": "3", "DE_mm": 88.90, "DI_mm": 77.93, "e_mm": 5.49}, "3-80": {"DN": "3", "DE_mm": 88.90, "DI_mm": 73.86, "e_mm": 7.62}, "3-XS": {"DN": "3", "DE_mm": 88.90, "DI_mm": 73.86, "e_mm": 7.62}, "3-160": {"DN": "3", "DE_mm": 88.90, "DI_mm": 66.50, "e_mm": 11.20}, "3-XXS": {"DN": "3", "DE_mm": 88.90, "DI_mm": 58.42, "e_mm": 15.24}, "3 1/2-10S": {"DN": "3 1/2", "DE_mm": 101.60, "DI_mm": 98.40, "e_mm": 1.60}, "3 1/2-40": {"DN": "3 1/2", "DE_mm": 101.60, "DI_mm": 90.17, "e_mm": 5.71}, "3 1/2-STD": {"DN": "3 1/2", "DE_mm": 101.60, "DI_mm": 90.17, "e_mm": 5.71}, "3 1/2-80": {"DN": "3 1/2", "DE_mm": 101.60, "DI_mm": 85.34, "e_mm": 8.13}, "3 1/2-XS": {"DN": "3 1/2", "DE_mm": 101.60, "DI_mm": 85.34, "e_mm": 8.13}, "4-10S": {"DN": "4", "DE_mm": 114.30, "DI_mm": 111.00, "e_mm": 1.65}, "4-40": {"DN": "4", "DE_mm": 114.30, "DI_mm": 102.26, "e_mm": 6.02}, "4-STD": {"DN": "4", "DE_mm": 114.30, "DI_mm": 102.26, "e_mm": 6.02}, "4-80": {"DN": "4", "DE_mm": 114.30, "DI_mm": 97.23, "e_mm": 8.56}, "4-XS": {"DN": "4", "DE_mm": 114.30, "DI_mm": 97.23, "e_mm": 8.56}, "4-120": {"DN": "4", "DE_mm": 114.30, "DI_mm": 92.10, "e_mm": 11.10}, "4-160": {"DN": "4", "DE_mm": 114.30, "DI_mm": 87.48, "e_mm": 13.41}, "4-XXS": {"DN": "4", "DE_mm": 114.30, "DI_mm": 80.06, "e_mm": 17.12}, "5-10S": {"DN": "5", "DE_mm": 141.30, "DI_mm": 137.90, "e_mm": 1.70}, "5-40": {"DN": "5", "DE_mm": 141.30, "DI_mm": 128.19, "e_mm": 6.55}, "5-STD": {"DN": "5", "DE_mm": 141.30, "DI_mm": 128.19, "e_mm": 6.55}, "5-80": {"DN": "5", "DE_mm": 141.30, "DI_mm": 122.20, "e_mm": 9.55}, "5-XS": {"DN": "5", "DE_mm": 141.30, "DI_mm": 122.20, "e_mm": 9.55}, "5-120": {"DN": "5", "DE_mm": 141.30, "DI_mm": 115.89, "e_mm": 12.70}, "5-160": {"DN": "5", "DE_mm": 141.30, "DI_mm": 109.54, "e_mm": 15.88}, "5-XXS": {"DN": "5", "DE_mm": 141.30, "DI_mm": 103.20, "e_mm": 19.05}, "6-10S": {"DN": "6", "DE_mm": 168.27, "DI_mm": 164.77, "e_mm": 1.75}, "6-40": {"DN": "6", "DE_mm": 168.27, "DI_mm": 154.05, "e_mm": 7.11}, "6-STD": {"DN": "6", "DE_mm": 168.27, "DI_mm": 154.05, "e_mm": 7.11}, "6-80": {"DN": "6", "DE_mm": 168.27, "DI_mm": 146.33, "e_mm": 10.97}, "6-XS": {"DN": "6", "DE_mm": 168.27, "DI_mm": 146.33, "e_mm": 10.97}, "6-120": {"DN": "6", "DE_mm": 168.27, "DI_mm": 139.70, "e_mm": 14.27}, "6-160": {"DN": "6", "DE_mm": 168.27, "DI_mm": 131.70, "e_mm": 18.28}, "6-XXS": {"DN": "6", "DE_mm": 168.27, "DI_mm": 124.38, "e_mm": 21.95}, "8-10S": {"DN": "8", "DE_mm": 219.08, "DI_mm": 215.42, "e_mm": 1.83}, "8-20": {"DN": "8", "DE_mm": 219.08, "DI_mm": 214.08, "e_mm": 2.50}, "8-30": {"DN": "8", "DE_mm": 219.08, "DI_mm": 213.54, "e_mm": 2.77}, "8-40": {"DN": "8", "DE_mm": 219.08, "DI_mm": 206.28, "e_mm": 6.35}, "8-STD": {"DN": "8", "DE_mm": 219.08, "DI_mm": 206.28, "e_mm": 6.35}, "8-60": {"DN": "8", "DE_mm": 219.08, "DI_mm": 202.72, "e_mm": 8.18}, "8-80": {"DN": "8", "DE_mm": 219.08, "DI_mm": 202.72, "e_mm": 8.18}, "8-XS": {"DN": "8", "DE_mm": 219.08, "DI_mm": 202.72, "e_mm": 8.18}, "8-100": {"DN": "8", "DE_mm": 219.08, "DI_mm": 188.88, "e_mm": 15.10}, "8-120": {"DN": "8", "DE_mm": 219.08, "DI_mm": 174.62, "e_mm": 22.23}, "8-140": {"DN": "8", "DE_mm": 219.08, "DI_mm": 173.05, "e_mm": 23.01}, "8-160": {"DN": "8", "DE_mm": 219.08, "DI_mm": 173.05, "e_mm": 23.01}, "8-XXS": {"DN": "8", "DE_mm": 219.08, "DI_mm": 173.05, "e_mm": 23.01}, "10-10S": {"DN": "10", "DE_mm": 273.05, "DI_mm": 269.45, "e_mm": 1.80}, "10-20": {"DN": "10", "DE_mm": 273.05, "DI_mm": 268.05, "e_mm": 2.50}, "10-30": {"DN": "10", "DE_mm": 273.05, "DI_mm": 267.01, "e_mm": 3.02}, "10-40": {"DN": "10", "DE_mm": 273.05, "DI_mm": 260.35, "e_mm": 6.35}, "10-STD": {"DN": "10", "DE_mm": 273.05, "DI_mm": 260.35, "e_mm": 6.35}, "10-60": {"DN": "10", "DE_mm": 273.05, "DI_mm": 254.51, "e_mm": 9.27}, "10-80": {"DN": "10", "DE_mm": 273.05, "DI_mm": 242.93, "e_mm": 15.06}, "10-XS": {"DN": "10", "DE_mm": 273.05, "DI_mm": 242.93, "e_mm": 15.06}, "10-100": {"DN": "10", "DE_mm": 273.05, "DI_mm": 236.57, "e_mm": 18.24}, "10-120": {"DN": "10", "DE_mm": 273.05, "DI_mm": 229.11, "e_mm": 21.97}, "10-140": {"DN": "10", "DE_mm": 273.05, "DI_mm": 222.25, "e_mm": 25.40}, "10-160": {"DN": "10", "DE_mm": 273.05, "DI_mm": 215.92, "e_mm": 28.575}, "10-XXS": {"DN": "10", "DE_mm": 273.05, "DI_mm": 222.25, "e_mm": 25.40}, "12-10S": {"DN": "12", "DE_mm": 323.85, "DI_mm": 320.05, "e_mm": 1.90}, "12-20": {"DN": "12", "DE_mm": 323.85, "DI_mm": 318.85, "e_mm": 2.50}, "12-30": {"DN": "12", "DE_mm": 323.85, "DI_mm": 317.25, "e_mm": 3.30}, "12-40": {"DN": "12", "DE_mm": 323.85, "DI_mm": 311.15, "e_mm": 6.35}, "12-STD": {"DN": "12", "DE_mm": 323.85, "DI_mm": 311.15, "e_mm": 6.35}, "12-60": {"DN": "12", "DE_mm": 323.85, "DI_mm": 303.23, "e_mm": 10.31}, "12-80": {"DN": "12", "DE_mm": 323.85, "DI_mm": 288.95, "e_mm": 17.45}, "12-XS": {"DN": "12", "DE_mm": 323.85, "DI_mm": 288.95, "e_mm": 17.45}, "12-100": {"DN": "12", "DE_mm": 323.85, "DI_mm": 273.05, "e_mm": 25.40}, "12-120": {"DN": "12", "DE_mm": 323.85, "DI_mm": 257.20, "e_mm": 33.324}, "12-140": {"DN": "12", "DE_mm": 323.85, "DI_mm": 247.90, "e_mm": 37.97}, "12-160": {"DN": "12", "DE_mm": 323.85, "DI_mm": 236.57, "e_mm": 43.64}, "12-XXS": {"DN": "12", "DE_mm": 323.85, "DI_mm": 273.05, "e_mm": 25.40}, "14-10S": {"DN": "14", "DE_mm": 355.60, "DI_mm": 351.60, "e_mm": 2.00}, "14-20": {"DN": "14", "DE_mm": 355.60, "DI_mm": 349.08, "e_mm": 3.26}, "14-30": {"DN": "14", "DE_mm": 355.60, "DI_mm": 346.88, "e_mm": 4.36}, "14-40": {"DN": "14", "DE_mm": 355.60, "DI_mm": 339.75, "e_mm": 7.92}, "14-STD": {"DN": "14", "DE_mm": 355.60, "DI_mm": 339.75, "e_mm": 7.92}, "14-60": {"DN": "14", "DE_mm": 355.60, "DI_mm": 333.40, "e_mm": 11.10}, "14-80": {"DN": "14", "DE_mm": 355.60, "DI_mm": 317.50, "e_mm": 19.05}, "14-XS": {"DN": "14", "DE_mm": 355.60, "DI_mm": 317.50, "e_mm": 19.05}, "14-100": {"DN": "14", "DE_mm": 355.60, "DI_mm": 306.90, "e_mm": 24.35}, "14-120": {"DN": "14", "DE_mm": 355.60, "DI_mm": 298.45, "e_mm": 28.57}, "14-140": {"DN": "14", "DE_mm": 355.60, "DI_mm": 289.89, "e_mm": 32.85}, "14-160": {"DN": "14", "DE_mm": 355.60, "DI_mm": 284.17, "e_mm": 35.71}, "14-XXS": {"DN": "14", "DE_mm": 355.60, "DI_mm": 284.17, "e_mm": 35.71}, "16-10S": {"DN": "16", "DE_mm": 406.40, "DI_mm": 402.40, "e_mm": 2.00}, "16-20": {"DN": "16", "DE_mm": 406.40, "DI_mm": 399.78, "e_mm": 3.31}, "16-30": {"DN": "16", "DE_mm": 406.40, "DI_mm": 398.20, "e_mm": 4.10}, "16-40": {"DN": "16", "DE_mm": 406.40, "DI_mm": 390.56, "e_mm": 7.92}, "16-STD": {"DN": "16", "DE_mm": 406.40, "DI_mm": 390.56, "e_mm": 7.92}, "16-60": {"DN": "16", "DE_mm": 406.40, "DI_mm": 381.00, "e_mm": 12.70}, "16-80": {"DN": "16", "DE_mm": 406.40, "DI_mm": 363.52, "e_mm": 21.44}, "16-XS": {"DN": "16", "DE_mm": 406.40, "DI_mm": 363.52, "e_mm": 21.44}, "16-100": {"DN": "16", "DE_mm": 406.40, "DI_mm": 349.25, "e_mm": 28.57}, "16-120": {"DN": "16", "DE_mm": 406.40, "DI_mm": 333.38, "e_mm": 36.51}, "16-140": {"DN": "16", "DE_mm": 406.40, "DI_mm": 320.04, "e_mm": 43.18}, "16-160": {"DN": "16", "DE_mm": 406.40, "DI_mm": 307.98, "e_mm": 49.21}, "16-XXS": {"DN": "16", "DE_mm": 406.40, "DI_mm": 317.50, "e_mm": 44.45}, "18-10S": {"DN": "18", "DE_mm": 457.20, "DI_mm": 453.20, "e_mm": 2.00}, "18-20": {"DN": "18", "DE_mm": 457.20, "DI_mm": 450.48, "e_mm": 3.36}, "18-30": {"DN": "18", "DE_mm": 457.20, "DI_mm": 448.78, "e_mm": 4.21}, "18-40": {"DN": "18", "DE_mm": 457.20, "DI_mm": 441.76, "e_mm": 7.72}, "18-STD": {"DN": "18", "DE_mm": 457.20, "DI_mm": 441.76, "e_mm": 7.72}, "18-60": {"DN": "18", "DE_mm": 457.20, "DI_mm": 429.06, "e_mm": 14.07}, "18-80": {"DN": "18", "DE_mm": 457.20, "DI_mm": 409.94, "e_mm": 23.63}, "18-XS": {"DN": "18", "DE_mm": 457.20, "DI_mm": 409.94, "e_mm": 23.63}, "18-100": {"DN": "18", "DE_mm": 457.20, "DI_mm": 390.52, "e_mm": 33.34}, "18-120": {"DN": "18", "DE_mm": 457.20, "DI_mm": 376.22, "e_mm": 40.49}, "18-140": {"DN": "18", "DE_mm": 457.20, "DI_mm": 363.52, "e_mm": 46.84}, "18-160": {"DN": "18", "DE_mm": 457.20, "DI_mm": 350.84, "e_mm": 53.18}, "18-XXS": {"DN": "18", "DE_mm": 457.20, "DI_mm": 350.84, "e_mm": 53.18}, "20-10S": {"DN": "20", "DE_mm": 508.00, "DI_mm": 503.80, "e_mm": 2.10}, "20-20": {"DN": "20", "DE_mm": 508.00, "DI_mm": 500.00, "e_mm": 4.00}, "20-30": {"DN": "20", "DE_mm": 508.00, "DI_mm": 498.40, "e_mm": 4.80}, "20-40": {"DN": "20", "DE_mm": 508.00, "DI_mm": 488.96, "e_mm": 9.52}, "20-STD": {"DN": "20", "DE_mm": 508.00, "DI_mm": 488.96, "e_mm": 9.52}, "20-60": {"DN": "20", "DE_mm": 508.00, "DI_mm": 477.82, "e_mm": 15.09}, "20-80": {"DN": "20", "DE_mm": 508.00, "DI_mm": 455.62, "e_mm": 26.19}, "20-XS": {"DN": "20", "DE_mm": 508.00, "DI_mm": 455.62, "e_mm": 26.19}, "20-100": {"DN": "20", "DE_mm": 508.00, "DI_mm": 435.00, "e_mm": 36.50}, "20-120": {"DN": "20", "DE_mm": 508.00, "DI_mm": 412.75, "e_mm": 47.62}, "20-140": {"DN": "20", "DE_mm": 508.00, "DI_mm": 393.70, "e_mm": 57.15}, "20-160": {"DN": "20", "DE_mm": 508.00, "DI_mm": 377.94, "e_mm": 65.03}, "20-XXS": {"DN": "20", "DE_mm": 508.00, "DI_mm": 400.05, "e_mm": 53.97}, "24-10S": {"DN": "24", "DE_mm": 609.60, "DI_mm": 605.20, "e_mm": 2.20}, "24-20": {"DN": "24", "DE_mm": 609.60, "DI_mm": 600.00, "e_mm": 4.80}, "24-30": {"DN": "24", "DE_mm": 609.60, "DI_mm": 597.20, "e_mm": 6.20}, "24-40": {"DN": "24", "DE_mm": 609.60, "DI_mm": 590.56, "e_mm": 9.52}, "24-STD": {"DN": "24", "DE_mm": 609.60, "DI_mm": 590.56, "e_mm": 9.52}, "24-60": {"DN": "24", "DE_mm": 609.60, "DI_mm": 574.64, "e_mm": 17.48}, "24-80": {"DN": "24", "DE_mm": 609.60, "DI_mm": 547.68, "e_mm": 30.96}, "24-XS": {"DN": "24", "DE_mm": 609.60, "DI_mm": 547.68, "e_mm": 30.96}, "24-100": {"DN": "24", "DE_mm": 609.60, "DI_mm": 517.50, "e_mm": 46.05}, "24-120": {"DN": "24", "DE_mm": 609.60, "DI_mm": 490.00, "e_mm": 59.80}, "24-140": {"DN": "24", "DE_mm": 609.60, "DI_mm": 470.00, "e_mm": 69.80}, "24-160": {"DN": "24", "DE_mm": 609.60, "DI_mm": 450.00, "e_mm": 79.80}, "24-XXS": {"DN": "24", "DE_mm": 609.60, "DI_mm": 488.96, "e_mm": 60.32}
};

let currentProcessConditions = {
    "0_inlet_hot": {
        "Gas_Flow_Sm3_D": 180000.0, "Pressure_kgf_cm2g": 80.0, "Temperature_C": 45.0,
        "MW": 20.0, "Z_Factor": 0.95, "Gamma": 1.3, "Viscosity_cP": 0.012,
        "Light_Liquid_Flow_m3_D": 2.0, "Light_Liquid_Density_kg_m3": 650.0,
        "Heavy_Liquid_Flow_m3_D": 2.0, "Heavy_Liquid_Density_kg_m3": 1000.0,
        "Fluid_Type": "Multiphase"
    },
    "1_disch_hot_gas": {
        "Gas_Flow_Sm3_D": 180000.0, "Pressure_kgf_cm2g": 100.0, "Temperature_C": 135.0,
        "MW": 20.0, "Z_Factor": 0.98, "Gamma": 1.25, "Viscosity_cP": 0.015,
        "Light_Liquid_Flow_m3_D": 0.0, "Light_Liquid_Density_kg_m3": 0.0,
        "Heavy_Liquid_Flow_m3_D": 0.0, "Heavy_Liquid_Density_kg_m3": 0.0,
        "Fluid_Type": "Gas"
    },
    "2_pump_suction_liquid": {
        "Gas_Flow_Sm3_D": 0.0, "Pressure_kgf_cm2g": 5.0, "Temperature_C": 40.0,
        "MW": 0.0, "Z_Factor": 1.0, "Gamma": 1.3, "Viscosity_cP": 1.0,
        "Light_Liquid_Flow_m3_D": 50.0, "Light_Liquid_Density_kg_m3": 750.0,
        "Heavy_Liquid_Flow_m3_D": 0.0, "Heavy_Liquid_Density_kg_m3": 0.0,
        "Fluid_Type": "Liquid"
    },
    "vent": {
        "Gas_Flow_Sm3_D": 180000.0, "Pressure_kgf_cm2g": 0.50, "Temperature_C": 50.0,
        "MW": 20.0, "Z_Factor": 0.9, "Gamma": 1.3, "Viscosity_cP": 0.011,
        "Light_Liquid_Flow_m3_D": 0.0, "Light_Liquid_Density_kg_m3": 0.0,
        "Heavy_Liquid_Flow_m3_D": 0.0, "Heavy_Liquid_Density_kg_m3": 0.0,
        "Fluid_Type": "Gas"
    },
    "startup": {
        "Gas_Flow_Sm3_D": 215000.0, "Pressure_kgf_cm2g": 8.50, "Temperature_C": 50.0,
        "MW": 20.0, "Z_Factor": 0.9, "Gamma": 1.3, "Viscosity_cP": 0.011,
        "Light_Liquid_Flow_m3_D": 0.0, "Light_Liquid_Density_kg_m3": 0.0,
        "Heavy_Liquid_Flow_m3_D": 0.0, "Heavy_Liquid_Density_kg_m3": 0.0,
        "Fluid_Type": "Gas"
    },
};

let currentLinesData = {
    "10-GH-001-CA11": {
        "Selected_Diameter_ID": "10-80", "Stream_Names": ["0_inlet_hot"], "Type": "CF", "Design_Pressure_kgf_cm2g": 100.0
    },
    "6-GH-003-CA11": {
        "Selected_Diameter_ID": "6-80", "Stream_Names": ["1_disch_hot_gas"], "Type": "CF", "Design_Pressure_kgf_cm2g": 105.0
    },
    "4-L-005-CA21": {
        "Selected_Diameter_ID": "4-80", "Stream_Names": ["2_pump_suction_liquid"], "Type": "CF", "Design_Pressure_kgf_cm2g": 15.0
    },
    "4-V-009-CA11": {
        "Selected_Diameter_ID": "4-40", "Stream_Names": ["vent"], "Type": "VL", "Design_Pressure_kgf_cm2g": 10.0
    },
    "4-NNF-010-CA11": {
        "Selected_Diameter_ID": "4-40", "Stream_Names": ["startup"], "Type": "NNF", "Design_Pressure_kgf_cm2g": 10.0
    },
};

let projectInfo = {
    "Project Name": "Gas Network Optimization Project",
    "Project Number": "PRJ-2025-001",
    "Client": "Future Energy Inc.",
    "Date": new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }),
    "Prepared by": "Engineering Department",
    "Reviewed by": "Head of Engineering"
};

const originalProcessConditions = JSON.parse(JSON.stringify(currentProcessConditions));
const originalLinesData = JSON.parse(JSON.stringify(currentLinesData));


// --- Helper Functions ---

function calculateRequiredThickness(P_kgfcm2g, D_ext_mm, S_psi, E, Y, c_mm) {
    const P_pa = P_kgfcm2g * constants.KGFCMA_TO_PA;
    const S_pa = S_psi * constants.PSI_TO_PA;
    const t_pressure_mm = (P_pa * D_ext_mm) / (2 * (S_pa * E + P_pa * Y));
    const t_required_mm = t_pressure_mm + c_mm;
    return { t_required_mm, t_pressure_mm };
}

function calculateActualFlowRateGas(caudal_sm3_d, presion_kgf_cm2g, temperatura_c, z) {
    const P_abs_kgf_cm2a = presion_kgf_cm2g + constants.P_STANDARD_KGF_CM2A;
    const T_kelvin = temperatura_c + constants.CELSIUS_TO_KELVIN;
    const V_actual_m3_per_day = (caudal_sm3_d * (constants.P_STANDARD_KGF_CM2A / P_abs_kgf_cm2a) * (T_kelvin / constants.T_STANDARD_K) * z);
    return V_actual_m3_per_day / constants.DAYS_TO_SECONDS;
}

function calculateActualFlowRateLiquid(flow_m3_d) {
    return flow_m3_d * constants.M3_PER_D_TO_M3_PER_S;
}

function calculateGasDensity(pressure_pa_abs, temperature_k, mw_kg_kmol, z) {
    if (mw_kg_kmol === 0) return 0;
    return (pressure_pa_abs * mw_kg_kmol / 1000) / (z * constants.R_UNIVERSAL_J_MOLK * temperature_k);
}

function calculateSpeedOfSound(gamma, z, temperature_k, mw_kg_mol) {
    if (mw_kg_mol === 0) return 0;
    return Math.sqrt(gamma * z * constants.R_UNIVERSAL_J_MOLK * temperature_k / mw_kg_mol);
}

function calculateMixtureProperties(gas_flow_m3_s, gas_density_kg_m3, light_liquid_flow_m3_s, light_liquid_density_kg_m3, heavy_liquid_flow_m3_s, heavy_liquid_density_kg_m3) {
    const total_volume_flow = gas_flow_m3_s + light_liquid_flow_m3_s + heavy_liquid_flow_m3_s;
    const mass_flow_gas = gas_flow_m3_s * gas_density_kg_m3;
    const mass_flow_ll = light_liquid_flow_m3_s * light_liquid_density_kg_m3;
    const mass_flow_hl = heavy_liquid_flow_m3_s * heavy_liquid_density_kg_m3;
    const total_mass_flow = mass_flow_gas + mass_flow_ll + mass_flow_hl;
    const mixture_density = total_volume_flow > 0 ? total_mass_flow / total_volume_flow : 0;
    return { total_volume_flow, mixture_density };
}

function calculateApi14eErosionalVelocity(c_factor, mixture_density_kg_m3) {
    const mixture_density_lb_ft3 = mixture_density_kg_m3 * constants.KG_PER_M3_TO_LB_PER_FT3;
    if (mixture_density_lb_ft3 <= 0) return Infinity;
    const erosional_velocity_ft_s = c_factor / Math.sqrt(mixture_density_lb_ft3);
    return erosional_velocity_ft_s * constants.FT_PER_S_TO_M_PER_S;
}

function calculatePressureDrop(density_kg_m3, velocity_mps, diameter_m, viscosity_cP, roughness_mm) {
    if (density_kg_m3 === 0 || velocity_mps === 0 || diameter_m === 0) {
        return { pressure_drop_bar_m: 0, friction_factor: 0, reynolds: 0 };
    }
    const viscosity_Pa_s = viscosity_cP * constants.CP_TO_PAS;
    const roughness_m = roughness_mm * constants.MM_TO_M;
    const reynolds = (density_kg_m3 * velocity_mps * diameter_m) / viscosity_Pa_s;
    let friction_factor;

    if (reynolds < 2300) { // Laminar
        friction_factor = 64 / reynolds;
    } else { // Turbulent - Haaland approximation
        const term = Math.pow((roughness_m / (3.7 * diameter_m)), 1.11) + (6.9 / reynolds);
        friction_factor = Math.pow(-1.8 * Math.log10(term), -2);
    }
    
    const pressure_drop_Pa_m = (friction_factor * density_kg_m3 * Math.pow(velocity_mps, 2)) / (2 * diameter_m);
    const pressure_drop_bar_m = pressure_drop_Pa_m * constants.PA_TO_BAR;
    
    return { pressure_drop_bar_m, friction_factor, reynolds };
}

function getLineFluidType(line) {
    // Determine fluid type based on associated streams
    let hasGas = false;
    let hasLiquid = false;

    if (!line || !line.Stream_Names || line.Stream_Names.length === 0) {
        return "Undefined";
    }

    for (const streamName of line.Stream_Names) {
        const stream = currentProcessConditions[streamName];
        if (stream) {
            if (stream.Gas_Flow_Sm3_D > 0) hasGas = true;
            if (stream.Light_Liquid_Flow_m3_D > 0 || stream.Heavy_Liquid_Flow_m3_D > 0) hasLiquid = true;
        }
    }

    if (hasGas && hasLiquid) return "Multiphase";
    if (hasGas) return "Gas";
    if (hasLiquid) return "Liquid";
    return "Undefined"; // Should not happen if streams are properly defined
}


// --- Main Calculation Logic ---

let allLineCalculationResults = [];

function performCalculations() {
    console.log("Performing calculations...");
    allLineCalculationResults = [];
    let consoleOutput = "";

    // 1. Process Conditions: Calculate actual flows for *current* conditions
    for (const streamName in currentProcessConditions) {
        const data = currentProcessConditions[streamName];
        
        data.Actual_Gas_Flow_m3_s = calculateActualFlowRateGas(data.Gas_Flow_Sm3_D, data.Pressure_kgf_cm2g, data.Temperature_C, data.Z_Factor);
        data.Actual_Light_Liquid_Flow_m3_s = calculateActualFlowRateLiquid(data.Light_Liquid_Flow_m3_D);
        data.Actual_Heavy_Liquid_Flow_m3_s = calculateActualFlowRateLiquid(data.Heavy_Liquid_Flow_m3_D);
    }

    // Sort diameters for optimization suggestions (create a fresh filtered list)
    const filteredDiametersForOptimization = Object.entries(diametersData)
        .filter(([tag, info]) => !["1 1/2", "5"].includes(info.DN)) // Exclude DN 1 1/2" and 5"
        .sort((a, b) => {
            // Defensive check: Ensure a[1] and b[1] exist and DI_mm is a number
            const diA = a[1] && typeof a[1].DI_mm === 'number' ? a[1].DI_mm : -Infinity;
            const diB = b[1] && typeof b[1].DI_mm === 'number' ? b[1].DI_mm : -Infinity;

            if (diA !== diB) {
                return diA - diB;
            }
            // Fallback to string comparison if DI_mm is the same or invalid
            // Ensure a[0] and b[0] are strings before calling localeCompare
            const keyA = String(a[0]);
            const keyB = String(b[0]);
            return keyA.localeCompare(keyB);
        });

    for (const lineTag in currentLinesData) {
        const lineInfo = currentLinesData[lineTag];
        const { Selected_Diameter_ID, Stream_Names, Type, Design_Pressure_kgf_cm2g } = lineInfo;

        const diameterInfo = diametersData[Selected_Diameter_ID];
        if (!diameterInfo) {
            consoleOutput += `\nERROR: Diámetro ID '${Selected_Diameter_ID}' para línea '${lineTag}' no encontrado. Saltando esta línea.\n`;
            continue; // Skip this line if diameter not found
        }
        if (Stream_Names.length === 0) {
            consoleOutput += `\nERROR: Línea '${lineTag}' no tiene corrientes asociadas. Saltando esta línea.\n`;
            continue; // Skip this line if no streams associated
        }

        const { DE_mm, DI_mm, e_mm } = diameterInfo;
        const di_meters = DI_mm * constants.MM_TO_M;
        const flow_area_m2 = Math.PI * Math.pow((di_meters / 2), 2);
        const lineFluidType = getLineFluidType(lineInfo); // Determine overall fluid type for the line

        consoleOutput += `\n=========================================================\n`;
        consoleOutput += `     MEMORIA DE CÁLCULO - LÍNEA: ${lineTag}\n`;
        consoleOutput += `=========================================================\n`;
        consoleOutput += `1. Datos de la Línea:\n`;
        consoleOutput += `    - Tipo de Servicio: ${Type}, Tipo de Fluido: ${lineFluidType}\n`;
        consoleOutput += `    - Presión de Diseño: ${Design_Pressure_kgf_cm2g.toFixed(2)} kgf/cm²g\n`;
        consoleOutput += `    - Diámetro: ${Selected_Diameter_ID} (DE: ${DE_mm.toFixed(2)}mm, DI: ${DI_mm.toFixed(2)}mm, Espesor: ${e_mm.toFixed(2)}mm)\n`;
        consoleOutput += `    - Área de Flujo (A): ${flow_area_m2.toFixed(6)} m²\n`;

        // Mechanical Design Verification (Thickness)
        const { t_required_mm } = calculateRequiredThickness(Design_Pressure_kgf_cm2g, DE_mm, designCriteria.allowable_stress_psi, designCriteria.quality_factor_E, designCriteria.temp_coefficient_Y, designCriteria.corrosion_allowance_mm);
        const thickness_check_status = e_mm >= t_required_mm ? "OK" : "NO OK";
        
        let line_overall_status = thickness_check_status;
        let line_comments_aggregated = [];
        if (line_overall_status === "NO OK") {
            line_comments_aggregated.push(`Espesor de pared insuficiente (${e_mm.toFixed(2)}mm < ${t_required_mm.toFixed(3)}mm).`);
        }
        
        consoleOutput += `\n2. Verificación de Diseño Mecánico:\n`;
        consoleOutput += `    - Espesor Mínimo Requerido (ASME B31.3): ${t_required_mm.toFixed(3)} mm -> **${thickness_check_status}**\n`;

        // Pressure Verification
        let pressure_check_status_overall = "OK";
        let pressure_comments = [];
        for (const streamName of Stream_Names) {
            const streamInfo = currentProcessConditions[streamName];
            if (!streamInfo) continue;
            const op_press = streamInfo.Pressure_kgf_cm2g;
            if (op_press > Design_Pressure_kgf_cm2g) {
                pressure_check_status_overall = "NO OK";
                pressure_comments.push(`P.Op (${op_press.toFixed(2)}) > P.Diseño (${Design_Pressure_kgf_cm2g.toFixed(2)}) para ${streamName}.`);
            }
        }
        consoleOutput += `    - Verificación de Presión: ${pressure_comments.length > 0 ? pressure_comments.join(' ') : `P.Operación <= P.Diseño para todas las corrientes.`} -> **${pressure_check_status_overall}**\n`;
        if(pressure_check_status_overall === "NO OK") {
            line_overall_status = "NO OK";
            line_comments_aggregated.push(...pressure_comments);
        }

        consoleOutput += `\n3. Verificación de Flujo (para cada escenario de operación):\n`;

        let line_stream_specific_results = [];
        let flow_check_status_overall = "OK";
        let max_mach_for_line = 0;
        let max_dp_for_line = 0;
        let max_dp_10m_percent_for_line = 0;

        for (const streamName of Stream_Names) {
            const streamInfo = currentProcessConditions[streamName];
            if (!streamInfo) {
                consoleOutput += `  --- WARNING: Corriente '${streamName}' no encontrada para línea '${lineTag}'. Saltando verificación de flujo para esta corriente. ---\n`;
                continue;
            }

            consoleOutput += `\n  --- Escenario de Operación: Corriente '${streamName}' ---\n`;
            
            const actualGasFlow = streamInfo.Actual_Gas_Flow_m3_s;
            const actualLLFlow = streamInfo.Actual_Light_Liquid_Flow_m3_s;
            const actualHLFlow = streamInfo.Actual_Heavy_Liquid_Flow_m3_s;
            const totalActualFlow = actualGasFlow + actualLLFlow + actualHLFlow;

            const { Temperature_C, MW, Z_Factor, Gamma, Light_Liquid_Density_kg_m3, Heavy_Liquid_Density_kg_m3, Viscosity_cP } = streamInfo;
            const pressure_pa_abs = (streamInfo.Pressure_kgf_cm2g + constants.P_STANDARD_KGF_CM2A) * constants.KGFCMA_TO_PA;
            const temperature_k = Temperature_C + constants.CELSIUS_TO_KELVIN;
            const mw_kg_mol = MW / 1000;

            const gas_density_at_cond = calculateGasDensity(pressure_pa_abs, temperature_k, MW, Z_Factor);
            const { mixture_density } = calculateMixtureProperties(actualGasFlow, gas_density_at_cond, actualLLFlow, Light_Liquid_Density_kg_m3, actualHLFlow, Heavy_Liquid_Density_kg_m3);
            
            const velocity_mps = flow_area_m2 > 0 ? totalActualFlow / flow_area_m2 : 0;
            const rho_v2_calc = mixture_density * Math.pow(velocity_mps, 2);

            let stream_flow_status = "OK";
            let stream_comments = [];
            let mach_number = null;
            
            consoleOutput += `      - Verificación Hidráulica:\n`;
            consoleOutput += `          - Densidad de Mezcla (ρ_m): ${mixture_density.toFixed(3)} kg/m³\n`;
            consoleOutput += `          - Velocidad (V): ${velocity_mps.toFixed(2)} m/s\n`;
            consoleOutput += `          - RhoV² (ρ_m * V²): ${rho_v2_calc.toFixed(2)} kg/m·s²\n`;

            const { pressure_drop_bar_m, friction_factor, reynolds } = calculatePressureDrop(mixture_density, velocity_mps, di_meters, Viscosity_cP, designCriteria.pipe_roughness_mm);
            max_dp_for_line = Math.max(max_dp_for_line, pressure_drop_bar_m);
            consoleOutput += `          - Caída de Presión (dP/L): ${pressure_drop_bar_m.toExponential(3)} bar/m (Re: ${reynolds.toExponential(2)}, f: ${friction_factor.toFixed(4)})\n`;

            const pressure_in_bar = streamInfo.Pressure_kgf_cm2g * constants.KGFCM2_TO_BAR;
            const dp_10m_bar = pressure_drop_bar_m * 10;
            const dp_10m_percent = pressure_in_bar > 0 ? (dp_10m_bar / pressure_in_bar) * 100 : 0;
            max_dp_10m_percent_for_line = Math.max(max_dp_10m_percent_for_line, dp_10m_percent);

            if (Type === "CF") {
                let max_velocity_limit;
                if (lineFluidType === "Gas") max_velocity_limit = designCriteria.max_velocity_gas_mps;
                else if (lineFluidType === "Liquid") max_velocity_limit = designCriteria.max_velocity_liquid_mps;
                else max_velocity_limit = designCriteria.max_velocity_multiphase_mps;
                
                if (velocity_mps > max_velocity_limit) { stream_flow_status = "NO OK"; stream_comments.push(`Velocidad excede límite (${velocity_mps.toFixed(2)} > ${max_velocity_limit.toFixed(1)} m/s)`); }
                if (lineFluidType !== "Liquid" && rho_v2_calc > designCriteria.max_rhov2_kg_per_m_s2) { stream_flow_status = "NO OK"; stream_comments.push(`RhoV² excede límite (${rho_v2_calc.toFixed(2)} > ${designCriteria.max_rhov2_kg_per_m_s2.toFixed(1)})`); }
            
                const api14e_vel = calculateApi14eErosionalVelocity(designCriteria.api14e_c_factor_cf, mixture_density);
                if (velocity_mps > api14e_vel) { stream_flow_status = "NO OK"; stream_comments.push(`Velocidad erosional API 14E excedida (${velocity_mps.toFixed(2)} > ${api14e_vel.toFixed(2)} m/s)`); }

            } else if (Type === "NNF") {
                const api14e_vel = calculateApi14eErosionalVelocity(designCriteria.api14e_c_factor_nnf, mixture_density);
                if (velocity_mps > api14e_vel) { stream_flow_status = "NO OK"; stream_comments.push(`Velocidad erosional API 14E excedida (${velocity_mps.toFixed(2)} > ${api14e_vel.toFixed(2)} m/s)`); }
            } else if (Type === "VL") {
                const speed_of_sound = calculateSpeedOfSound(Gamma, Z_Factor, temperature_k, mw_kg_mol);
                mach_number = speed_of_sound > 0 ? velocity_mps / speed_of_sound : 0;
                max_mach_for_line = Math.max(max_mach_for_line, mach_number);
                
                consoleOutput += `          - Velocidad del Sonido: ${speed_of_sound.toFixed(2)} m/s, Mach: ${mach_number.toFixed(3)}\n`;
                if (mach_number > designCriteria.max_mach_vent_lines) { stream_flow_status = "NO OK"; stream_comments.push(`Mach excede límite (${mach_number.toFixed(3)} > ${designCriteria.max_mach_vent_lines.toFixed(1)})`); }
            }
            
            if (stream_flow_status === "NO OK") {
                flow_check_status_overall = "NO OK";
                line_overall_status = "NO OK";
                line_comments_aggregated.push(`Flujo NO OK para ${streamName}: ${stream_comments.join('. ')}`);
            }
            
            line_stream_specific_results.push({
                 "Stream Name": streamName, 
                 "Velocity (m/s)": velocity_mps,
                 "RhoV2 (kg/m.s²)": rho_v2_calc, 
                 "Flow Status": stream_flow_status,
                 "Mach Number": mach_number, 
                 "Pressure Drop (bar/m)": pressure_drop_bar_m,
                 "Pressure Drop 10m Percent": dp_10m_percent,
                 "Actual Gas Flow (m3/s)": actualGasFlow,
                 "Actual Light Liquid Flow (m3/s)": actualLLFlow,
                 "Actual Heavy Liquid Flow (m3/s)": actualHLFlow,
                 "Gas Density (kg/m3)": gas_density_at_cond,
                 "Mixture Density (kg/m3)": mixture_density
            });
        }

        consoleOutput += `\n4. Estado General de Verificación de Línea: **${line_overall_status}**\n`;
        
        let optimizationSuggestion = "N/A";
        const currentDiIndex = filteredDiametersForOptimization.findIndex(([di, tag]) => tag === Selected_Diameter_ID);
        
        if (line_overall_status === "OK") {
            let foundSmaller = false;
            if (currentDiIndex > 0) {
                for (let i = currentDiIndex - 1; i >= 0; i--) {
                    const [candidate_di_mm_opt, candidate_tag_opt] = filteredDiametersForOptimization[i];
                    
                    // For optimization check, we need to re-evaluate for the worst-case stream
                    let allStreamsVerify = true;
                    for (const streamName of Stream_Names) {
                        const streamInfo = currentProcessConditions[streamName];
                        if (!streamInfo) { allStreamsVerify = false; break; }

                        const actualGasFlow = streamInfo.Gas_Flow_Sm3_D; // Use original Sm3/D for checkSingleDiameter
                        const actualLLFlow = streamInfo.Light_Liquid_Flow_m3_D;
                        const actualHLFlow = streamInfo.Heavy_Liquid_Flow_m3_D;
                        
                        const pressure_pa_abs = (streamInfo.Pressure_kgf_cm2g + constants.P_STANDARD_KGF_CM2A) * constants.KGFCMA_TO_PA;
                        const temperature_k = streamInfo.Temperature_C + constants.CELSIUS_TO_KELVIN;
                        const gas_density_at_cond = calculateGasDensity(pressure_pa_abs, temperature_k, streamInfo.MW, streamInfo.Z_Factor);
                        const { total_volume_flow: check_total_volume_flow, mixture_density: check_mixture_density } = calculateMixtureProperties(
                            calculateActualFlowRateGas(actualGasFlow, streamInfo.Pressure_kgf_cm2g, streamInfo.Temperature_C, streamInfo.Z_Factor),
                            gas_density_at_cond,
                            calculateActualFlowRateLiquid(actualLLFlow),
                            streamInfo.Light_Liquid_Density_kg_m3,
                            calculateActualFlowRateLiquid(actualHLFlow),
                            streamInfo.Heavy_Liquid_Density_kg_m3
                        );
                        const mw_kg_mol_check = streamInfo.MW / 1000;

                        if (!checkSingleDiameter(candidate_di_mm_opt, Type, check_total_volume_flow, check_mixture_density,
                                                gas_density_at_cond, streamInfo.Gamma, temperature_k, mw_kg_mol_check, designCriteria)) {
                            allStreamsVerify = false;
                            break;
                        }
                    }

                    if (allStreamsVerify) {
                        optimizationSuggestion = `Considerar menor: ${candidate_tag_opt} (DI: ${candidate_di_mm_opt.toFixed(2)}mm) - aún verifica.`;
                        foundSmaller = true;
                    } else {
                        if (foundSmaller) break;
                    }
                }
                if (!foundSmaller) {
                    optimizationSuggestion = "Tamaño de tubería actual óptimo o no hay opciones menores válidas.";
                }
            } else {
                optimizationSuggestion = "Tamaño de tubería actual óptimo o no hay opciones menores válidas.";
            }
        } else if (line_overall_status === "NO OK") {
            let foundLarger = false;
            if (currentDiIndex !== -1) {
                for (let i = currentDiIndex + 1; i < filteredDiametersForOptimization.length; i++) {
                    const [candidate_di_mm_opt, candidate_tag_opt] = filteredDiametersForOptimization[i];
                    
                    let allStreamsVerify = true;
                    for (const streamName of Stream_Names) {
                        const streamInfo = currentProcessConditions[streamName];
                        if (!streamInfo) { allStreamsVerify = false; break; }

                        const actualGasFlow = streamInfo.Gas_Flow_Sm3_D; // Use original Sm3/D for checkSingleDiameter
                        const actualLLFlow = streamInfo.Light_Liquid_Flow_m3_D;
                        const actualHLFlow = streamInfo.Heavy_Liquid_Flow_m3_D;
                        
                        const pressure_pa_abs = (streamInfo.Pressure_kgf_cm2g + constants.P_STANDARD_KGF_CM2A) * constants.KGFCMA_TO_PA;
                        const temperature_k = streamInfo.Temperature_C + constants.CELSIUS_TO_KELVIN;
                        const gas_density_at_cond = calculateGasDensity(pressure_pa_abs, temperature_k, streamInfo.MW, streamInfo.Z_Factor);
                        const { total_volume_flow: check_total_volume_flow, mixture_density: check_mixture_density } = calculateMixtureProperties(
                            calculateActualFlowRateGas(actualGasFlow, streamInfo.Pressure_kgf_cm2g, streamInfo.Temperature_C, streamInfo.Z_Factor),
                            gas_density_at_cond,
                            calculateActualFlowRateLiquid(actualLLFlow),
                            streamInfo.Light_Liquid_Density_kg_m3,
                            calculateActualFlowRateLiquid(actualHLFlow),
                            streamInfo.Heavy_Liquid_Density_kg_m3
                        );
                        const mw_kg_mol_check = streamInfo.MW / 1000;

                        if (!checkSingleDiameter(candidate_di_mm_opt, Type, check_total_volume_flow, check_mixture_density,
                                                gas_density_at_cond, streamInfo.Gamma, temperature_k, mw_kg_mol_check, designCriteria)) {
                            allStreamsVerify = false;
                            break;
                        }
                    }

                    if (allStreamsVerify) {
                        optimizationSuggestion = `Considerar mayor: ${candidate_tag_opt} (DI: ${candidate_di_mm_opt.toFixed(2)}mm) - ahora verifica.`;
                        foundLarger = true;
                        break;
                    }
                }
                if (!foundLarger) {
                    optimizationSuggestion = "No se encontró un tamaño de tubería estándar mayor que verifique.";
                }
            } else {
                optimizationSuggestion = "Tamaño de tubería actual inválido o no encontrado en opciones estándar; no se puede optimizar.";
            }
        }
        consoleOutput += `5. Sugerencia de Optimización: ${optimizationSuggestion}\n`;
        consoleOutput += `=========================================================\n\n`;

        // Store all calculated data for CSV and PDF export
        allLineCalculationResults.push({
            "Line TAG": lineTag,
            "Line Type": Type,
            "Line Fluid Type": lineFluidType,
            "Stream Names": Stream_Names.join(', '),
            "DN": diameterInfo.DN,
            "Selected Diameter ID": Selected_Diameter_ID,
            "DI (mm)": DI_mm,
            "OD (mm)": DE_mm,
            "Nominal Thickness (mm)": e_mm,
            "Design Pressure (kgf/cm²g)": Design_Pressure_kgf_cm2g,
            "Required Thickness (mm)": t_required_mm,
            "Thickness Check Status": thickness_check_status,
            "Pressure Check Status": pressure_check_status_overall,
            "Flow Check Status": flow_check_status_overall,
            "Overall Status": line_overall_status,
            "Comments": line_comments_aggregated.join("; "),
            "Mach Number": Type === 'VL' ? max_mach_for_line : null, // Only store if VL
            "Pressure Drop (bar/m)": max_dp_for_line,
            "Pressure Drop 10m Percent": max_dp_10m_percent_for_line,
            "Optimization Suggestion": optimizationSuggestion,
            "Stream Details": line_stream_specific_results // Detailed results per stream
        });
    }

    // Update UI elements
    document.getElementById('calculation-output').textContent = consoleOutput;
    renderEngineeringListTable(allLineCalculationResults);

    // Enable download buttons
    document.getElementById('download-csv-btn').disabled = false;
    document.getElementById('download-pdf-btn').disabled = false;
    document.getElementById('download-all-btn').disabled = false;
    document.getElementById('results-section').style.display = 'block';
}


// --- UI Management Functions ---

function renderProjectInfo() {
    const container = document.getElementById('project-info-display');
    let html = '<ul>';
    for (const key in projectInfo) {
        html += `<li><strong>${key}:</strong> ${projectInfo[key]}</li>`;
    }
    html += '</ul>';
    container.innerHTML = html;
}

function renderDesignCriteria() {
    const container = document.getElementById('design-criteria-display');
    container.innerHTML = `
        <form id="design-criteria-form" class="box">
            <h4 class="title is-5">Criterios de Flujo</h4>
            <div class="columns is-multiline">
                <div class="column is-one-third"><div class="field"><label class="label">Vel. Máx. Gas (m/s)</label><div class="control"><input class="input" type="number" step="any" id="max_velocity_gas_mps" value="${designCriteria.max_velocity_gas_mps}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">Vel. Máx. Líquido (m/s)</label><div class="control"><input class="input" type="number" step="any" id="max_velocity_liquid_mps" value="${designCriteria.max_velocity_liquid_mps}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">Vel. Máx. Multifase (m/s)</label><div class="control"><input class="input" type="number" step="any" id="max_velocity_multiphase_mps" value="${designCriteria.max_velocity_multiphase_mps}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">RhoV² Máx. (kg/m·s²)</label><div class="control"><input class="input" type="number" step="any" id="max_rhov2_kg_per_m_s2" value="${designCriteria.max_rhov2_kg_per_m_s2}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">Mach Máx. (VL)</label><div class="control"><input class="input" type="number" step="any" id="max_mach_vent_lines" value="${designCriteria.max_mach_vent_lines}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">Rugosidad Tubería (mm)</label><div class="control"><input class="input" type="number" step="any" id="pipe_roughness_mm" value="${designCriteria.pipe_roughness_mm}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">API 14E C-NNF</label><div class="control"><input class="input" type="number" step="any" id="api14e_c_factor_nnf" value="${designCriteria.api14e_c_factor_nnf}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">API 14E C-CF</label><div class="control"><input class="input" type="number" step="any" id="api14e_c_factor_cf" value="${designCriteria.api14e_c_factor_cf}"></div></div></div>
            </div>
            <h4 class="title is-5 mt-4">Criterios de Espesor (ASME B31.3)</h4>
            <div class="columns is-multiline">
                <div class="column is-one-third"><div class="field"><label class="label">Esfuerzo Admisible (S) (psi)</label><div class="control"><input class="input" type="number" step="any" id="allowable_stress_psi" value="${designCriteria.allowable_stress_psi}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">Factor Calidad (E)</label><div class="control"><input class="input" type="number" step="any" id="quality_factor_E" value="${designCriteria.quality_factor_E}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">Coef. Temp. (Y)</label><div class="control"><input class="input" type="number" step="any" id="temp_coefficient_Y" value="${designCriteria.temp_coefficient_Y}"></div></div></div>
                <div class="column is-one-third"><div class="field"><label class="label">Corrosión (c) (mm)</label><div class="control"><input class="input" type="number" step="any" id="corrosion_allowance_mm" value="${designCriteria.corrosion_allowance_mm}"></div></div></div>
            </div>
            <div class="field is-grouped"><div class="control"><button type="submit" class="button is-link">Guardar Criterios</button></div></div>
        </form>`;
    
    document.getElementById('design-criteria-form').addEventListener('submit', function(event) {
        event.preventDefault();
        designCriteria.max_velocity_gas_mps = parseFloat(document.getElementById('max_velocity_gas_mps').value);
        designCriteria.max_velocity_liquid_mps = parseFloat(document.getElementById('max_velocity_liquid_mps').value);
        designCriteria.max_velocity_multiphase_mps = parseFloat(document.getElementById('max_velocity_multiphase_mps').value);
        designCriteria.max_rhov2_kg_per_m_s2 = parseFloat(document.getElementById('max_rhov2_kg_per_m_s2').value);
        designCriteria.max_mach_vent_lines = parseFloat(document.getElementById('max_mach_vent_lines').value);
        designCriteria.pipe_roughness_mm = parseFloat(document.getElementById('pipe_roughness_mm').value);
        designCriteria.allowable_stress_psi = parseFloat(document.getElementById('allowable_stress_psi').value);
        designCriteria.quality_factor_E = parseFloat(document.getElementById('quality_factor_E').value);
        designCriteria.temp_coefficient_Y = parseFloat(document.getElementById('temp_coefficient_Y').value);
        designCriteria.corrosion_allowance_mm = parseFloat(document.getElementById('corrosion_allowance_mm').value);
        alert("Criterios de diseño guardados.");
        renderDesignCriteria(); // Re-render to show updated values
    });
}

function renderProcessConditionsTable() {
    const container = document.getElementById('process-conditions-display');
    let html = '<table class="table is-fullwidth is-striped is-hoverable"><thead><tr><th>Acciones</th><th>Corriente</th><th>Tipo Fluido</th><th>Caudal Total Actual (m³/s)</th><th>Presión Op. (kgf/cm²g)</th><th>Temp (°C)</th><th>MW</th><th>Z</th><th>Gamma</th><th>Viscosidad (cP)</th></tr></thead><tbody>';
    for (const streamName in currentProcessConditions) {
        const stream = currentProcessConditions[streamName];
        const fluidTypeClass = stream.Fluid_Type === 'Gas' ? 'fluid-gas' : stream.Fluid_Type === 'Liquid' ? 'fluid-liquid' : stream.Fluid_Type === 'Multiphase' ? 'fluid-multiphase' : 'fluid-undefined';
        
        // Calculate total actual flow for display in table
        const actualGasFlow = calculateActualFlowRateGas(stream.Gas_Flow_Sm3_D, stream.Pressure_kgf_cm2g, stream.Temperature_C, stream.Z_Factor);
        const actualLLFlow = calculateActualFlowRateLiquid(stream.Light_Liquid_Flow_m3_D);
        const actualHLFlow = calculateActualFlowRateLiquid(stream.Heavy_Liquid_Flow_m3_D);
        const totalActualFlow = actualGasFlow + actualLLFlow + actualHLFlow;

        html += `<tr data-stream-name="${streamName}">
            <td class="action-buttons">
                <button class="button is-small is-info is-outlined edit-pc-btn" title="Editar" data-stream-name="${streamName}"><span class="icon is-small"><i class="fas fa-edit"></i></span></button>
                <button class="button is-small is-link is-outlined copy-pc-btn" title="Copiar" data-stream-name="${streamName}"><span class="icon is-small"><i class="fas fa-copy"></i></span></button>
                <button class="button is-small is-danger is-outlined delete-pc-btn" title="Eliminar" data-stream-name="${streamName}"><span class="icon is-small"><i class="fas fa-trash"></i></span></button>
            </td>
            <td><strong>${streamName}</strong></td>
            <td><span class="tag ${fluidTypeClass}">${stream.Fluid_Type}</span></td>
            <td>${totalActualFlow.toFixed(4)}</td>
            <td>${stream.Pressure_kgf_cm2g.toFixed(2)}</td>
            <td>${stream.Temperature_C.toFixed(1)}</td>
            <td>${stream.MW.toFixed(2)}</td>
            <td>${stream.Z_Factor.toFixed(3)}</td>
            <td>${stream.Gamma.toFixed(2)}</td>
            <td>${stream.Viscosity_cP.toFixed(3)}</td>
        </tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;

    // Attach event listeners for edit/delete/copy buttons
    document.querySelectorAll('.edit-pc-btn').forEach(button => {
        button.addEventListener('click', loadProcessConditionForEdit);
    });
    document.querySelectorAll('.copy-pc-btn').forEach(button => {
        button.addEventListener('click', copyProcessCondition);
    });
    document.querySelectorAll('.delete-pc-btn').forEach(button => {
        button.addEventListener('click', deleteProcessCondition);
    });

    populateStreamDropdown(); // Update dropdown for line form after process conditions change
}

function loadProcessConditionForEdit(event) {
    const streamName = event.currentTarget.dataset.streamName;
    const stream = currentProcessConditions[streamName];
    const form = document.getElementById('process-condition-form');

    document.getElementById('pc-stream-name').value = streamName;
    document.getElementById('pc-gas-flow').value = stream.Gas_Flow_Sm3_D;
    document.getElementById('pc-pressure').value = stream.Pressure_kgf_cm2g;
    document.getElementById('pc-temperature').value = stream.Temperature_C;
    document.getElementById('pc-mw').value = stream.MW;
    document.getElementById('pc-z-factor').value = stream.Z_Factor;
    document.getElementById('pc-gamma').value = stream.Gamma;
    document.getElementById('pc-viscosity').value = stream.Viscosity_cP;
    document.getElementById('pc-light-liq-flow').value = stream.Light_Liquid_Flow_m3_D;
    document.getElementById('pc-light-liq-density').value = stream.Light_Liquid_Density_kg_m3;
    document.getElementById('pc-heavy-liq-flow').value = stream.Heavy_Liquid_Flow_m3_D;
    document.getElementById('pc-heavy-liq-density').value = stream.Heavy_Liquid_Density_kg_m3;
    
    // Store the original name in a dataset attribute for renaming
    form.dataset.originalName = streamName;
    document.getElementById('pc-stream-name').focus(); // Focus on the name field
}

function copyProcessCondition(event) {
    const originalName = event.currentTarget.dataset.streamName;
    const originalStream = currentProcessConditions[originalName];
    
    let newName = `${originalName}_copy`;
    let counter = 1;
    while(currentProcessConditions[newName]) {
        newName = `${originalName}_copy${counter}`;
        counter++;
    }

    currentProcessConditions[newName] = JSON.parse(JSON.stringify(originalStream)); // Deep copy
    
    renderProcessConditionsTable(); // Re-render table to show the new entry
    
    // Optionally, load the copied stream into the form for immediate editing
    const newRowEditBtn = document.querySelector(`tr[data-stream-name="${newName}"] .edit-pc-btn`);
    if(newRowEditBtn) {
       newRowEditBtn.click();
    }
}

function deleteProcessCondition(event) {
    const streamName = event.currentTarget.dataset.streamName;
    if (confirm(`¿Estás seguro de que quieres eliminar la corriente '${streamName}'? Esto también eliminará las líneas asociadas.`)) {
        delete currentProcessConditions[streamName];
        // Remove associated lines
        for (const lineTag in currentLinesData) {
            currentLinesData[lineTag].Stream_Names = currentLinesData[lineTag].Stream_Names.filter(name => name !== streamName);
            // If a line has no more streams, delete it
            if (currentLinesData[lineTag].Stream_Names.length === 0) {
                delete currentLinesData[lineTag];
            }
        }
        renderProcessConditionsTable(); // Re-render process conditions table
        renderLinesTable(); // Re-render lines table as some might be deleted
    }
}


function renderLinesTable() {
    const container = document.getElementById('lines-display');
    let html = '<table class="table is-fullwidth is-striped is-hoverable"><thead><tr><th>Acciones</th><th>TAG</th><th>Tipo Fluido</th><th>DI (mm)</th><th>Área (m²)</th><th>Presión Diseño (kgf/cm²g)</th><th>Corriente(s)</th><th>Tipo Línea</th></tr></thead><tbody>';
    for (const lineTag in currentLinesData) {
        const line = currentLinesData[lineTag];
        const lineFluidType = getLineFluidType(line); // Get fluid type for display
        const fluidTypeClass = lineFluidType === 'Gas' ? 'fluid-gas' : lineFluidType === 'Liquid' ? 'fluid-liquid' : lineFluidType === 'Multiphase' ? 'fluid-multiphase' : 'fluid-undefined';
        
        const diameterInfo = diametersData[line.Selected_Diameter_ID];
        const di_mm = diameterInfo ? diameterInfo.DI_mm : 0;
        const di_meters = di_mm * constants.MM_TO_M;
        const flow_area_m2 = Math.PI * Math.pow((di_meters / 2), 2);

        html += `<tr data-line-tag="${lineTag}">
            <td class="action-buttons">
                <button class="button is-small is-info is-outlined edit-line-btn" title="Editar" data-line-tag="${lineTag}"><span class="icon is-small"><i class="fas fa-edit"></i></span></button>
                <button class="button is-small is-link is-outlined copy-line-btn" title="Copiar" data-line-tag="${lineTag}"><span class="icon is-small"><i class="fas fa-copy"></i></span></button>
                <button class="button is-small is-danger is-outlined delete-line-btn" title="Eliminar" data-line-tag="${lineTag}"><span class="icon is-small"><i class="fas fa-trash"></i></span></button>
            </td>
            <td><strong>${lineTag}</strong></td>
            <td><span class="tag ${fluidTypeClass}">${lineFluidType}</span></td>
            <td>${di_mm.toFixed(2)}</td>
            <td>${flow_area_m2.toFixed(6)}</td>
            <td>${(line.Design_Pressure_kgf_cm2g || 0).toFixed(2)}</td>
            <td>${line.Stream_Names.join(', ')}</td>
            <td>${line.Type}</td>
        </tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;

    // Attach event listeners for edit/delete/copy buttons
    document.querySelectorAll('.edit-line-btn').forEach(button => {
        button.addEventListener('click', loadLineForEdit);
    });
    document.querySelectorAll('.copy-line-btn').forEach(button => {
        button.addEventListener('click', copyLine);
    });
    document.querySelectorAll('.delete-line-btn').forEach(button => {
        button.addEventListener('click', deleteLine);
    });
}

function loadLineForEdit(event) {
    const lineTag = event.currentTarget.dataset.lineTag;
    const line = currentLinesData[lineTag];
    const form = document.getElementById('line-form');

    document.getElementById('line-tag').value = lineTag;
    document.getElementById('line-design-pressure').value = line.Design_Pressure_kgf_cm2g || 0;
    document.getElementById('line-type').value = line.Type;
    
    // Populate and select streams in the multi-select dropdown
    const streamSelect = document.getElementById('line-stream-name');
    Array.from(streamSelect.options).forEach(opt => {
        opt.selected = line.Stream_Names.includes(opt.value);
    });
    
    document.getElementById('line-diameter-id').value = line.Selected_Diameter_ID;
    
    // Store the original TAG in a dataset attribute for renaming
    form.dataset.originalTag = lineTag;
    document.getElementById('line-tag').focus();
    suggestPipeDiameter(); // Suggest diameter based on loaded line
}

function copyLine(event) {
    const originalTag = event.currentTarget.dataset.lineTag;
    const originalLine = currentLinesData[originalTag];

    let newTag = `${originalTag}_copy`;
    let counter = 1;
    while(currentLinesData[newTag]) {
        newTag = `${originalTag}_copy${counter}`;
        counter++;
    }

    currentLinesData[newTag] = JSON.parse(JSON.stringify(originalLine)); // Deep copy
    
    renderLinesTable(); // Re-render table to show the new entry

    // Optionally, load the copied line into the form for immediate editing
    const newRowEditBtn = document.querySelector(`tr[data-line-tag="${newTag}"] .edit-line-btn`);
    if(newRowEditBtn) {
        newRowEditBtn.click();
    }
}

function deleteLine(event) {
    const lineTag = event.currentTarget.dataset.lineTag;
    if (confirm(`¿Estás seguro de que quieres eliminar la línea '${lineTag}'?`)) {
        delete currentLinesData[lineTag];
        renderLinesTable(); // Re-render lines table
    }
}

function populateStreamDropdown() {
    console.log("Populating stream dropdown...");
    const select = document.getElementById('line-stream-name');
    if (!select) {
        console.error("Elemento 'line-stream-name' no encontrado para el dropdown de corrientes.");
        return;
    }
    const selectedValues = Array.from(select.selectedOptions).map(opt => opt.value); // Preserve selected options
    select.innerHTML = ''; // Clear existing options
    
    const initialOption = document.createElement('option');
    initialOption.value = "";
    initialOption.textContent = "Seleccione Corriente(s)...";
    initialOption.disabled = true;
    select.appendChild(initialOption);

    const streamNames = Object.keys(currentProcessConditions).sort(); // Sort for consistent order
    if (streamNames.length === 0) {
        const noStreamsOption = document.createElement('option');
        noStreamsOption.value = "";
        noStreamsOption.textContent = "No hay corrientes disponibles";
        noStreamsOption.disabled = true;
        select.appendChild(noStreamsOption);
        console.warn("No streams available to populate dropdown.");
        return;
    }

    for (const streamName of streamNames) {
        const option = document.createElement('option');
        option.value = streamName;
        option.textContent = `${streamName} (${currentProcessConditions[streamName].Fluid_Type})`;
        if (selectedValues.includes(streamName)) {
            option.selected = true; // Re-select previously selected options
        }
        select.appendChild(option);
    }
    console.log(`Finished populating stream dropdown. Total options: ${select.options.length -1} (excluding placeholder).`);
}

function populateDiameterDropdown() {
    console.log("Populating diameter dropdown...");
    const select = document.getElementById('line-diameter-id');
    if (!select) {
        console.error("Elemento 'line-diameter-id' no encontrado para el dropdown de diámetros.");
        return;
    }
    select.innerHTML = '<option value="">Seleccione Diámetro</option>'; // Clear existing options
    
    // Create a sorted list of diameters for the dropdown
    const sortedDiameters = Object.entries(diametersData).sort((a, b) => {
        // Defensive check: Ensure a[1] and b[1] exist and DI_mm is a number
        const diA = a[1] && typeof a[1].DI_mm === 'number' ? a[1].DI_mm : -Infinity;
        const diB = b[1] && typeof b[1].DI_mm === 'number' ? b[1].DI_mm : -Infinity;

        if (diA !== diB) {
            return diA - diB;
        }
        // Fallback to string comparison if DI_mm is the same or invalid
        // Ensure a[0] and b[0] are strings before calling localeCompare
        const keyA = String(a[0]);
        const keyB = String(b[0]);
        return keyA.localeCompare(keyB);
    });

    for (const [diameterId, info] of sortedDiameters) {
        const option = document.createElement('option');
        option.value = diameterId;
        option.textContent = `${diameterId} (DN: ${info.DN}, DI: ${info.DI_mm}mm, e: ${info.e_mm}mm)`;
        select.appendChild(option);
    }
    console.log(`Finished populating diameter dropdown. Total options: ${select.options.length - 1} (excluding placeholder).`);
}


function renderEngineeringListTable(results) {
    const container = document.getElementById('engineering-list-table');
    if (results.length === 0) {
        container.innerHTML = '<p class="has-text-grey">No hay resultados para mostrar.</p>';
        return;
    }

    const headers = ["Ver", "Línea", "Tipo Fluido", "Diámetro", "Verif. Espesor", "Verif. Flujo", "Mach", "dP/L (bar/m)", "dP (10m) [%]", "Estado General", "Comentarios"];
    let html = `<table class="table is-fullwidth is-bordered is-striped is-narrow is-hoverable"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;

    results.forEach((row, index) => {
        const thicknessStatusClass = row["Thickness Check Status"] === 'OK' ? 'status-ok' : 'status-no-ok';
        const flowStatusClass = row["Flow Check Status"] === 'OK' ? 'status-ok' : 'status-no-ok';
        const overallStatusClass = row["Overall Status"] === 'OK' ? 'status-ok' : 'status-no-ok';
        const mach = row["Mach Number"];
        const dp = row["Pressure Drop (bar/m)"];
        const dp_10m_percent = row["Pressure Drop 10m Percent"];

        html += `
            <tr>
                <td><button class="button is-small is-info is-outlined toggle-details-btn" data-target="details-${index}"><span class="icon is-small"><i class="fas fa-eye"></i></span></button></td>
                <td><strong>${row["Line TAG"]}</strong></td>
                <td>${row["Line Fluid Type"]}</td>
                <td>${row["Selected Diameter ID"]}</td>
                <td class="${thicknessStatusClass}">${row["Thickness Check Status"]}</td>
                <td class="${flowStatusClass}">${row["Flow Check Status"]}</td>
                <td>${mach !== null ? mach.toFixed(3) : 'N/A'}</td>
                <td>${dp !== null ? dp.toExponential(3) : 'N/A'}</td>
                <td>${dp_10m_percent !== null ? dp_10m_percent.toFixed(2) + '%' : 'N/A'}</td>
                <td class="${overallStatusClass}">${row["Overall Status"]}</td>
                <td>${row["Comments"]}</td>
            </tr>
            <tr id="details-${index}" class="line-details-row is-hidden"><td colspan="${headers.length}"><div class="box">`;
        
        html += `<h4 class="title is-6">Detalles de Verificación de Flujo por Corriente</h4>
                 <table class="table is-fullwidth is-bordered"><thead><tr><th>Corriente</th><th>Velocidad (m/s)</th><th>RhoV² (kg/m.s²)</th><th>Mach</th><th>dP/L (bar/m)</th><th>dP (10m) [%]</th><th>Estado Flujo</th></tr></thead><tbody>`;
        row["Stream Details"].forEach(sd => {
            html += `<tr>
                        <td>${sd["Stream Name"]}</td>
                        <td>${sd["Velocity (m/s)"].toFixed(2)}</td>
                        <td>${sd["RhoV2 (kg/m.s²)"].toFixed(2)}</td>
                        <td>${sd["Mach Number"] !== null ? sd["Mach Number"].toFixed(3) : 'N/A'}</td>
                        <td>${sd["Pressure Drop (bar/m)"] !== null ? sd["Pressure Drop (bar/m)"].toExponential(3) : 'N/A'}</td>
                        <td>${sd["Pressure Drop 10m Percent"] !== null ? sd["Pressure Drop 10m Percent"].toFixed(2) + '%' : 'N/A'}</td>
                        <td class="${sd["Flow Status"] === 'OK' ? 'status-ok' : 'status-no-ok'}">${sd["Flow Status"]}</td>
                    </tr>`;
        });
        html += `</tbody></table></div></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;

    document.querySelectorAll('.toggle-details-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetRow = document.getElementById(button.dataset.target);
            targetRow.classList.toggle('is-hidden');
            const icon = button.querySelector('.fas');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });
}


// --- Download Functions ---

function getFormattedFileName(extension) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}_${month}_${year}`;
    
    const projectName = (projectInfo["Project Name"] || "Project").replace(/[^a-z0-9]/gi, '_');
    const projectNumber = (projectInfo["Project Number"] || "Num").replace(/[^a-z0-9]/gi, '_');

    return `${projectNumber}-${projectName}-${dateStr}.${extension}`;
}

function downloadCSV() {
    if (allLineCalculationResults.length === 0) { alert("No hay datos para exportar."); return; }

    const headers = [
        "Line TAG", "Line Type", "Line Fluid Type", "Selected Diameter ID", "DI (mm)", "OD (mm)", "Nominal Thickness (mm)",
        "Design Pressure (kgf/cm²g)", "Required Thickness (mm)", "Thickness Check Status", "Flow Check Status", 
        "Mach Number", "Pressure Drop (bar/m)", "Pressure Drop 10m Percent", "Overall Status", "Comments",
        // Include some stream details for CSV, but keep it flat
        "Stream Names", "Stream_Gas_Flow_Sm3_D", "Stream_Pressure_kgf_cm2g", "Stream_Temperature_C", "Stream_MW",
        "Stream_Z_Factor", "Stream_Gamma", "Stream_Light_Liquid_Flow_m3_D", "Stream_Light_Liquid_Density_kg_m3",
        "Stream_Heavy_Liquid_Flow_m3_D", "Stream_Heavy_Liquid_Density_kg_m3"
    ];
    let csv = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n'; // Quote headers

    allLineCalculationResults.forEach(row => {
        const values = headers.map(header => {
            let value = row[header];
            if (typeof value === 'number') {
                value = isFinite(value) ? value.toFixed(6) : 'N/A'; // Format numbers, handle Infinity/NaN
            } else if (value === null) {
                value = 'N/A';
            } else if (value === "") {
                value = 'N/A';
            }
            return `"${String(value).replace(/"/g, '""')}"`; // Quote all values
        });
        csv += values.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', getFormattedFileName('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadPDF() {
    if (allLineCalculationResults.length === 0) {
        alert("No hay datos para exportar. Por favor, realiza los cálculos primero.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 40;
    let finalY = 0;
    let pageNumber = 1;
    // URL de la página principal de ChemWorks
    const chemWorksMainUrl = "https://chemworks.github.io/"; 

    const logoWidth = 50;
    const logoHeight = 50;

    const addHeaderFooter = () => {
        // Logo en la esquina superior derecha
        try {
            doc.addImage(myLogoBase64, 'PNG', pageWidth - margin - logoWidth, 20, logoWidth, logoHeight);
        } catch (e) {
            console.error("No se pudo añadir el logo al encabezado del PDF:", e);
        }
        
        // Título principal del documento
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("MEMORIA DE CÁLCULO DE LÍNEAS", pageWidth / 2, 40, { align: 'center' });
        
        // Pie de página: URL de ChemWorks, número de página y fecha
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        doc.setTextColor(0, 0, 255); // Color azul para el enlace
        doc.textWithLink("ChemWorks: " + chemWorksMainUrl, margin, pageHeight - 20, { url: chemWorksMainUrl });
        doc.setTextColor(0, 0, 0); // Volver a color negro

        doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
        doc.text(projectInfo["Date"], pageWidth / 2, pageHeight - 20, { align: 'center' });
    };

    const checkNewPage = (requiredHeight) => {
        if (finalY + requiredHeight > pageHeight - 60) { // 60pt for footer
            doc.addPage();
            pageNumber++;
            addHeaderFooter();
            finalY = 80; // Start Y for new page content
        }
    };
    
    // --- PÁGINA DE TÍTULO ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Memoria de Cálculo de Líneas", pageWidth / 2, pageHeight / 2 - 60, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Proyecto: ${projectInfo["Project Name"]}`, pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
    doc.text(`Número: ${projectInfo["Project Number"]}`, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
    doc.text(`Cliente: ${projectInfo["Client"]}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
    addHeaderFooter(); // Añadir encabezado y pie de página a la primera página

    // --- PÁGINA DE CRITERIOS ---
    doc.addPage();
    pageNumber++;
    addHeaderFooter();
    finalY = 80; // Reset Y for new page
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("1. Criterios de Diseño Aplicados", margin, finalY);
    finalY += 20;

    const criteriaBody = [
        [{ content: 'Criterios de Flujo', colSpan: 2, styles: { halign: 'center', fillColor: [220, 220, 220] } }],
        ["Velocidad Máxima Gas (CF)", `${designCriteria.max_velocity_gas_mps} m/s`],
        ["Velocidad Máxima Líquido (CF)", `${designCriteria.max_velocity_liquid_mps} m/s`],
        ["Velocidad Máxima Multifase (CF)", `${designCriteria.max_velocity_multiphase_mps} m/s`],
        ["RhoV² Máximo", `${designCriteria.max_rhov2_kg_per_m_s2} kg/(m·s²)`],
        ["Mach Máximo (VL)", `${designCriteria.max_mach_vent_lines}`],
        ["Rugosidad Tubería", `${designCriteria.pipe_roughness_mm} mm`],
        ["Factor C API 14E (NNF)", `${designCriteria.api14e_c_factor_nnf}`],
        ["Factor C API 14E (CF)", `${designCriteria.api14e_c_factor_cf}`],
        [{ content: 'Criterios de Espesor (ASME B31.3)', colSpan: 2, styles: { halign: 'center', fillColor: [220, 220, 220] } }],
        ["Esfuerzo Admisible (S)", `${designCriteria.allowable_stress_psi} psi`],
        ["Factor de Calidad (E)", `${designCriteria.quality_factor_E}`],
        ["Coeficiente de Temperatura (Y)", `${designCriteria.temp_coefficient_Y}`],
        ["Margen de Corrosión (c)", `${designCriteria.corrosion_allowance_mm} mm`]
    ];
    doc.autoTable({ startY: finalY, body: criteriaBody, theme: 'grid', styles: { fontSize: 9 }, headStyles: { fontStyle: 'bold', fontSize: 10 }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: 200 } } });
    finalY = doc.autoTable.previous.finalY;

    // --- PÁGINA DE FÓRMULAS ---
    doc.addPage();
    pageNumber++;
    addHeaderFooter();
    finalY = 80;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("2. Fórmulas Utilizadas", margin, finalY);
    finalY += 25;
    
    const formulas = [
        { title: "Espesor Requerido (ASME B31.3)", formula: "t_req = (P * D_o) / (2 * (S*E + P*Y)) + c" },
        { title: "Caudal Actual Gas", formula: "Q_act = Q_std * (P_std / P_act) * (T_act / T_std) * Z" },
        { title: "Velocidad del Fluido", formula: "V = Q_total_act / A" },
        { title: "Caída de Presión (Darcy-Weisbach)", formula: "dP/L = (f * rho * V^2) / (2 * D_i)" },
        { title: "Número de Reynolds", formula: "Re = (rho * V * D_i) / mu" },
        { title: "Factor de Fricción (Haaland)", formula: "1/sqrt(f) = -1.8 * log10( (eps/(3.7*D_i))^1.11 + 6.9/Re )" },
        { title: "Velocidad del Sonido (Gas)", formula: "a = sqrt(gamma * Z * R * T / MW)" },
        { title: "Número de Mach", formula: "Ma = V / a" },
        { title: "Velocidad Erosional API 14E", formula: "V_e = C / sqrt(rho_m_lb/ft3)" }
    ];

    doc.setFontSize(9);
    formulas.forEach(f => {
        checkNewPage(40);
        doc.setFont('helvetica', 'bold');
        doc.text(f.title, margin, finalY);
        finalY += 12;
        doc.setFont('courier', 'normal');
        doc.text(f.formula, margin + 10, finalY);
        finalY += 20;
    });

    // --- PÁGINAS DE RESULTADOS ---
    doc.addPage();
    pageNumber++;
    addHeaderFooter();
    finalY = 80;

    allLineCalculationResults.forEach((line, index) => {
        checkNewPage(20);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`3.${index + 1} Verificación de Línea: ${line['Line TAG']}`, margin, finalY);
        finalY += 20;

        // --- Datos Generales de la Línea ---
        checkNewPage(60);
        const lineDataBody = [
            ['Tipo de Servicio', line['Line Type'], 'Tipo de Fluido', line['Line Fluid Type']],
            ['Diámetro', line['Selected Diameter ID'], 'Área de Flujo (A)', `${(Math.PI * Math.pow(line['DI (mm)'] * constants.MM_TO_M / 2, 2)).toFixed(6)} m²`],
            ['Presión Diseño', `${line['Design Pressure (kgf/cm²g)']} kgf/cm²g`, 'DE / DI', `${line['OD (mm)']} mm / ${line['DI (mm)']} mm`],
            ['Espesor Nominal', `${line['Nominal Thickness (mm)']} mm`, 'Corrientes', line['Stream Names']]
        ];
        doc.autoTable({ startY: finalY, body: lineDataBody, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } } });
        finalY = doc.autoTable.previous.finalY + 15;

        // --- Cálculo de Espesor ASME B31.3 ---
        checkNewPage(100);
        const t_required_mm_calc = calculateRequiredThickness(line['Design Pressure (kgf/cm2g)'], line['OD (mm)'], designCriteria.allowable_stress_psi, designCriteria.quality_factor_E, designCriteria.temp_coefficient_Y, designCriteria.corrosion_allowance_mm).t_required_mm;
        const thickness_status_color = line['Thickness Check Status'] === 'OK' ? [0, 128, 0] : [255, 0, 0];
        const asmeBody = [
            [{ content: 'Cálculo de Espesor ASME B31.3', colSpan: 2, styles: { halign: 'center', fillColor: [230, 230, 230] } }],
            ['Espesor Requerido (t_req)', `${t_required_mm_calc.toFixed(3)} mm`],
            ['Espesor Nominal (t_nom)', `${line['Nominal Thickness (mm)'].toFixed(3)} mm`],
            ['Resultado', { content: line['Thickness Check Status'], styles: { textColor: thickness_status_color } }]
        ];
        doc.autoTable({ startY: finalY, body: asmeBody, theme: 'grid', styles: { fontSize: 8, cellPadding: 2 }, columnStyles: { 0: { fontStyle: 'bold' } } });
        finalY = doc.autoTable.previous.finalY + 15;

        // --- Verificación de Presión ---
        checkNewPage(40);
        const pressure_status_color = line['Pressure Check Status'] === 'OK' ? [0, 128, 0] : [255, 0, 0];
        doc.autoTable({
            startY: finalY,
            body: [[{content: 'Verificación de Presión', styles: {fontStyle: 'bold'}}, {content: line['Pressure Check Status'], styles: {textColor: pressure_status_color}}]],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 }
        });
        finalY = doc.autoTable.previous.finalY + 15;

        // --- Detalles de Flujo por Corriente ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Detalles de Verificación de Flujo por Corriente:", margin, finalY);
        finalY += 15;

        const flowDetailsHead = [['Corriente', 'Vel. (m/s)', 'RhoV² (kg/m·s²)', 'Mach', 'dP/L (bar/m)', 'dP (10m) [%]', 'Estado']];
        const flowDetailsBody = line['Stream Details'].map(sd => {
            const sd_flow_status_color = sd['Flow Status'] === 'OK' ? [0, 128, 0] : [255, 0, 0];
            return [
                sd['Stream Name'],
                sd['Velocity (m/s)'].toFixed(2),
                sd['RhoV2 (kg/m.s²)'].toFixed(2),
                sd['Mach Number'] !== null ? sd['Mach Number'].toFixed(3) : 'N/A',
                sd['Pressure Drop (bar/m)'] !== null ? sd['Pressure Drop (bar/m)'].toExponential(3) : 'N/A',
                sd['Pressure Drop 10m Percent'] !== null ? sd['Pressure Drop 10m Percent'].toFixed(2) + '%' : 'N/A',
                { content: sd['Flow Status'], styles: { textColor: sd_flow_status_color } }
            ];
        });
        doc.autoTable({
            startY: finalY,
            head: flowDetailsHead,
            body: flowDetailsBody,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });
        finalY = doc.autoTable.previous.finalY + 15;

        // --- Estado General, Comentarios y Sugerencia ---
        checkNewPage(60);
        const overall_status_color = line['Overall Status'] === 'OK' ? [0, 128, 0] : [255, 0, 0];
        doc.autoTable({
            startY: finalY,
            body: [
                [{content: 'Estado General de Línea', styles: {fontStyle: 'bold'}}, {content: line['Overall Status'], styles: {textColor: overall_status_color}}],
                [{content: 'Comentarios', styles: {fontStyle: 'bold'}}, line['Comments'] || 'N/A'],
                [{content: 'Sugerencia de Optimización', styles: {fontStyle: 'bold'}}, line['Optimization Suggestion'] || 'N/A']
            ],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 }
        });
        finalY = doc.autoTable.previous.finalY + 20;

        if (index < allLineCalculationResults.length - 1) {
             doc.addPage();
             pageNumber++;
             addHeaderFooter();
             finalY = 80;
        }
    });

    doc.save(getFormattedFileName('pdf'));
}


// --- Project Save/Load Functions ---

function saveProjectData() {
    const projectData = { projectInfo, processConditions: currentProcessConditions, linesData: currentLinesData, designCriteria };
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = getFormattedFileName('json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function loadProjectData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            // Update global data objects
            Object.assign(projectInfo, loadedData.projectInfo || {});
            currentProcessConditions = loadedData.processConditions || {};
            currentLinesData = loadedData.linesData || {};
            Object.assign(designCriteria, loadedData.designCriteria || {});
            
            // Ensure new properties are set for older loaded data if missing
            for (const streamName in currentProcessConditions) {
                const stream = currentProcessConditions[streamName];
                stream.Viscosity_cP = stream.Viscosity_cP !== undefined ? stream.Viscosity_cP : 0.012;
                stream.Fluid_Type = stream.Fluid_Type || getLineFluidType({ Stream_Names: [streamName] }); // Re-determine if missing
            }
            for (const lineTag in currentLinesData) {
                const line = currentLinesData[lineTag];
                line.Design_Pressure_kgf_cm2g = line.Design_Pressure_kgf_cm2g !== undefined ? line.Design_Pressure_kgf_cm2g : 0;
                // Ensure Stream_Names is an array
                if (!Array.isArray(line.Stream_Names)) {
                    line.Stream_Names = [line.Stream_Names].filter(Boolean); // Convert to array, remove null/undefined
                }
            }

            // Update UI forms and tables
            document.getElementById('project-name').value = projectInfo["Project Name"];
            document.getElementById('project-number').value = projectInfo["Project Number"];
            document.getElementById('client').value = projectInfo["Client"];
            document.getElementById('prepared-by').value = projectInfo["Prepared by"];
            document.getElementById('reviewed-by').value = projectInfo["Reviewed by"];
            
            // Re-render all UI components
            renderProjectInfo();
            renderDesignCriteria();
            renderProcessConditionsTable();
            renderLinesTable();
            populateStreamDropdown();
            populateDiameterDropdown();

            // Reset results display
            document.getElementById('calculation-output').textContent = '';
            document.getElementById('engineering-list-table').innerHTML = '<p class="has-text-grey">No hay resultados para mostrar.</p>';
            document.getElementById('download-csv-btn').disabled = true;
            document.getElementById('download-pdf-btn').disabled = true;
            document.getElementById('download-all-btn').disabled = true;
            document.getElementById('results-section').style.display = 'none';
            alert("Proyecto cargado exitosamente.");
        } catch (error) {
            alert(`Error al cargar el archivo JSON: ${error.message}. Asegúrate de que el formato del archivo es correcto.`);
            console.error("Error loading project data:", error);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Clear file input
}


// --- Event Listeners and Initial Display ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial rendering of static info and dynamic tables
    renderProjectInfo();
    renderDesignCriteria();
    renderProcessConditionsTable(); // Render table with initial data
    renderLinesTable(); // Render table with initial data
    populateStreamDropdown(); // Fill stream dropdown for line form
    populateDiameterDropdown(); // Fill diameter dropdown for line form

    // Populate Project Info Form with initial data
    document.getElementById('project-name').value = projectInfo["Project Name"];
    document.getElementById('project-number').value = projectInfo["Project Number"];
    document.getElementById('client').value = projectInfo["Client"];
    document.getElementById('prepared-by').value = projectInfo["Prepared by"];
    document.getElementById('reviewed-by').value = projectInfo["Reviewed by"];

    // Collapsible Card Headers
    document.querySelectorAll('.card-header.is-clickable').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.closest('.card').querySelector('.card-content');
            content.classList.toggle('is-hidden');
            const icon = header.querySelector('.fas');
            icon.classList.toggle('fa-angle-down');
            icon.classList.toggle('fa-angle-up');
        });
    });

    // Project Info Form Submission
    document.getElementById('project-info-form').addEventListener('submit', function(event) {
        event.preventDefault();
        projectInfo["Project Name"] = document.getElementById('project-name').value.trim();
        projectInfo["Project Number"] = document.getElementById('project-number').value.trim();
        projectInfo["Client"] = document.getElementById('client').value.trim();
        projectInfo["Prepared by"] = document.getElementById('prepared-by').value.trim();
        projectInfo["Reviewed by"] = document.getElementById('reviewed-by').value.trim();
        projectInfo["Date"] = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
        renderProjectInfo();
        alert("Información del proyecto guardada.");
    });

    // Process Condition Form Submission
    document.getElementById('process-condition-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const form = this;
        const newStreamName = document.getElementById('pc-stream-name').value.trim();
        const originalStreamName = form.dataset.originalName; // Get original name if editing

        if (!newStreamName) {
            alert("El nombre de la corriente es obligatorio.");
            return;
        }

        // Check for duplicate name if adding new, or if renaming to an existing name
        if ((!originalStreamName && currentProcessConditions[newStreamName]) || 
            (originalStreamName && originalStreamName !== newStreamName && currentProcessConditions[newStreamName])) {
            alert(`Error: La corriente '${newStreamName}' ya existe. Por favor, elija otro nombre.`);
            return;
        }

        const gasFlow = parseFloat(document.getElementById('pc-gas-flow').value) || 0;
        const lightLiqFlow = parseFloat(document.getElementById('pc-light-liq-flow').value) || 0;
        const heavyLiqFlow = parseFloat(document.getElementById('pc-heavy-liq-flow').value) || 0;
        const totalLiqFlow = lightLiqFlow + heavyLiqFlow;

        let fluidType = "Gas"; // Default to Gas
        if (gasFlow > 0 && totalLiqFlow > 0) fluidType = "Multiphase";
        else if (gasFlow === 0 && totalLiqFlow > 0) fluidType = "Liquid";
        else if (gasFlow === 0 && totalLiqFlow === 0) fluidType = "Undefined"; // No flow

        const streamData = {
            Gas_Flow_Sm3_D: gasFlow,
            Pressure_kgf_cm2g: parseFloat(document.getElementById('pc-pressure').value) || 0,
            Temperature_C: parseFloat(document.getElementById('pc-temperature').value) || 0,
            MW: parseFloat(document.getElementById('pc-mw').value) || 0,
            Z_Factor: parseFloat(document.getElementById('pc-z-factor').value) || 1,
            Gamma: parseFloat(document.getElementById('pc-gamma').value) || 1.3,
            Viscosity_cP: parseFloat(document.getElementById('pc-viscosity').value) || 0.012,
            Light_Liquid_Flow_m3_D: lightLiqFlow,
            Light_Liquid_Density_kg_m3: parseFloat(document.getElementById('pc-light-liq-density').value) || 0,
            Heavy_Liquid_Flow_m3_D: heavyLiqFlow,
            Heavy_Liquid_Density_kg_m3: parseFloat(document.getElementById('pc-heavy-liq-density').value) || 0,
            Fluid_Type: fluidType // Store determined fluid type
        };

        if (originalStreamName && originalStreamName !== newStreamName) {
            // Rename operation
            currentProcessConditions[newStreamName] = streamData;
            delete currentProcessConditions[originalStreamName];

            // Update associated lines
            for (const lineTag in currentLinesData) {
                const line = currentLinesData[lineTag];
                const streamIndex = line.Stream_Names.indexOf(originalStreamName);
                if (streamIndex > -1) {
                    line.Stream_Names[streamIndex] = newStreamName;
                }
            }
        } else {
            // Add new or update existing with same name
            currentProcessConditions[newStreamName] = streamData;
        }

        renderProcessConditionsTable(); // Re-render process conditions table
        renderLinesTable(); // Re-render lines table (in case stream names changed)
        form.reset(); // Clear form
        delete form.dataset.originalName; // Clear original name reference
    });

    document.getElementById('pc-clear-form-btn').addEventListener('click', function() {
        const form = document.getElementById('process-condition-form');
        form.reset();
        delete form.dataset.originalName;
    });

    // Line Form Submission
    document.getElementById('line-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const form = this;
        const newLineTag = document.getElementById('line-tag').value.trim();
        const originalLineTag = form.dataset.originalTag;

        if (!newLineTag) {
            alert("El TAG de línea es obligatorio.");
            return;
        }

        const selectedDiameterID = document.getElementById('line-diameter-id').value;
        const selectedStreamNames = Array.from(document.getElementById('line-stream-name').selectedOptions).map(opt => opt.value);
        const lineType = document.getElementById('line-type').value;
        const designPressure = parseFloat(document.getElementById('line-design-pressure').value) || 0;

        if (!selectedDiameterID || selectedStreamNames.length === 0 || !lineType) {
            alert("Por favor, complete todos los campos obligatorios para la línea (Diámetro, Corriente(s), Tipo).");
            return;
        }

        // Check for duplicate TAG if adding new, or if renaming to an existing TAG
        if ((!originalLineTag && currentLinesData[newLineTag]) || 
            (originalLineTag && originalLineTag !== newLineTag && currentLinesData[newLineTag])) {
            alert(`Error: La línea con TAG '${newLineTag}' ya existe. Por favor, elija otro TAG.`);
            return;
        }
        
        const lineData = {
            "Selected_Diameter_ID": selectedDiameterID,
            "Stream_Names": selectedStreamNames, // This is now an array
            "Type": lineType,
            "Design_Pressure_kgf_cm2g": designPressure,
        };

        if (originalLineTag && originalLineTag !== newLineTag) {
            // Rename operation
            currentLinesData[newLineTag] = lineData;
            delete currentLinesData[originalLineTag];
        } else {
            // Add new or update existing with same TAG
            currentLinesData[newLineTag] = lineData;
        }

        renderLinesTable(); // Re-render lines table
        form.reset(); // Clear form
        delete form.dataset.originalTag; // Clear original tag reference
        suggestPipeDiameter(); // Clear or update suggestion
    });

    document.getElementById('line-clear-form-btn').addEventListener('click', function() {
        const form = document.getElementById('line-form');
        form.reset();
        delete form.dataset.originalTag;
        suggestPipeDiameter(); // Clear or update suggestion
    });
    
    // Delete All Streams Button
    document.getElementById('delete-all-streams-btn').addEventListener('click', () => {
        if(confirm("¿Estás seguro de que quieres eliminar TODAS las corrientes? Esta acción también eliminará todas las líneas asociadas.")) {
            currentProcessConditions = {}; // Clear all streams
            currentLinesData = {}; // Clear all lines as they depend on streams
            renderProcessConditionsTable();
            renderLinesTable();
            // Also reset results display
            document.getElementById('calculation-output').textContent = '';
            document.getElementById('engineering-list-table').innerHTML = '<p class="has-text-grey">No hay resultados para mostrar.</p>';
            document.getElementById('download-csv-btn').disabled = true;
            document.getElementById('download-pdf-btn').disabled = true;
            document.getElementById('download-all-btn').disabled = true;
            document.getElementById('results-section').style.display = 'none';
        }
    });

    // Delete All Lines Button
    document.getElementById('delete-all-lines-btn').addEventListener('click', () => {
        if(confirm("¿Estás seguro de que quieres eliminar TODAS las líneas?")) {
            currentLinesData = {}; // Clear all lines
            renderLinesTable();
            // Also reset results display
            document.getElementById('calculation-output').textContent = '';
            document.getElementById('engineering-list-table').innerHTML = '<p class="has-text-grey">No hay resultados para mostrar.</p>';
            document.getElementById('download-csv-btn').disabled = true;
            document.getElementById('download-pdf-btn').disabled = true;
            document.getElementById('download-all-btn').disabled = true;
            document.getElementById('results-section').style.display = 'none';
        }
    });


    // Main Action Buttons
    document.getElementById('calculate-btn').addEventListener('click', performCalculations);
    document.getElementById('save-project-btn').addEventListener('click', () => {
        saveProjectData();
        alert("Proyecto guardado exitosamente.");
    });
    document.getElementById('load-project-btn').addEventListener('click', () => document.getElementById('load-project-file-input').click());
    document.getElementById('load-project-file-input').addEventListener('change', loadProjectData);
    document.getElementById('download-csv-btn').addEventListener('click', downloadCSV);
    document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
    document.getElementById('download-all-btn').addEventListener('click', () => {
        saveProjectData();
        downloadCSV();
        downloadPDF();
    });
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm("¿Estás seguro de que quieres reiniciar todos los datos a sus valores iniciales?")) {
            currentProcessConditions = JSON.parse(JSON.stringify(originalProcessConditions));
            currentLinesData = JSON.parse(JSON.stringify(originalLinesData));
            renderProcessConditionsTable();
            renderLinesTable();
            populateStreamDropdown(); // Re-populate after reset
            document.getElementById('calculation-output').textContent = '';
            document.getElementById('engineering-list-table').innerHTML = '<p class="has-text-grey">No hay resultados para mostrar.</p>';
            document.getElementById('download-csv-btn').disabled = true;
            document.getElementById('download-pdf-btn').disabled = true;
            document.getElementById('download-all-btn').disabled = true;
            document.getElementById('results-section').style.display = 'none';
        }
    });

    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = darkModeToggle.querySelector('i');

    const setTheme = (theme) => {
        if (theme === 'dark') {
            htmlElement.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.classList.remove('dark-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    };

    // Set initial theme based on saved preference or system setting
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }

    // --- Line Suggestion based on selected stream(s) and type ---
    document.getElementById('line-stream-name').addEventListener('change', suggestPipeDiameter);
    document.getElementById('line-type').addEventListener('change', suggestPipeDiameter);
});

function suggestPipeDiameter() {
    const suggestionEl = document.getElementById('line-suggestion-display');
    const selectedStreamNames = Array.from(document.getElementById('line-stream-name').selectedOptions).map(opt => opt.value);
    const lineType = document.getElementById('line-type').value;

    if (selectedStreamNames.length === 0 || !lineType) {
        suggestionEl.textContent = 'Seleccione al menos una corriente y un tipo de línea para la sugerencia de diámetro.';
        return;
    }

    let maxRequiredDI_mm = 0;

    for (const streamName of selectedStreamNames) {
        const streamInfo = currentProcessConditions[streamName];
        if (!streamInfo) continue;

        const actualGasFlow = calculateActualFlowRateGas(streamInfo.Gas_Flow_Sm3_D, streamInfo.Pressure_kgf_cm2g, streamInfo.Temperature_C, streamInfo.Z_Factor);
        const actualLLFlow = calculateActualFlowRateLiquid(streamInfo.Light_Liquid_Flow_m3_D);
        const actualHLFlow = calculateActualFlowRateLiquid(streamInfo.Heavy_Liquid_Flow_m3_D);
        const totalActualFlow = actualGasFlow + actualLLFlow + actualHLFlow;

        if (totalActualFlow === 0) {
            // If there's no flow, no diameter is "required" by flow criteria.
            // This might mean the line is NNF or VL, but for sizing, it's not limiting.
            // We'll just continue to the next stream or finish if this is the only one.
            continue; 
        }
        
        const tempLineInfoForFluidType = { Stream_Names: [streamName] }; // Create a temp object to get fluid type
        const streamFluidType = getLineFluidType(tempLineInfoForFluidType);

        let requiredArea_m2 = 0;
        let requiredArea_by_Velocity = 0;
        let requiredArea_by_RhoV2 = 0;

        // Calculate required area based on velocity criteria
        if (lineType === 'VL') {
            const { Temperature_C, MW, Z_Factor, Gamma } = streamInfo;
            const temperature_k = Temperature_C + constants.CELSIUS_TO_KELVIN;
            const mw_kg_mol = MW / 1000;
            const speed_of_sound = calculateSpeedOfSound(Gamma, Z_Factor, temperature_k, mw_kg_mol);
            const velocityLimit = designCriteria.max_mach_vent_lines * speed_of_sound;
            if (velocityLimit > 0) {
                requiredArea_by_Velocity = totalActualFlow / velocityLimit;
            }
        } else { // CF or NNF
            let velocityLimit = 0;
            if (streamFluidType === "Gas") velocityLimit = designCriteria.max_velocity_gas_mps;
            else if (streamFluidType === "Liquid") velocityLimit = designCriteria.max_velocity_liquid_mps;
            else if (streamFluidType === "Multiphase") velocityLimit = designCriteria.max_velocity_multiphase_mps;
            
            if (velocityLimit > 0) {
                requiredArea_by_Velocity = totalActualFlow / velocityLimit;
            }
        }
        
        // Calculate required area based on RhoV2 criteria (only for Gas/Multiphase, not Liquid, and not NNF)
        if (streamFluidType !== "Liquid" && lineType !== "NNF") {
            const { Temperature_C, MW, Z_Factor, Light_Liquid_Density_kg_m3, Heavy_Liquid_Density_kg_m3 } = streamInfo;
            const pressure_pa_abs = (streamInfo.Pressure_kgf_cm2g + constants.P_STANDARD_KGF_CM2A) * constants.KGFCMA_TO_PA;
            const temperature_k = Temperature_C + constants.CELSIUS_TO_KELVIN;
            const gas_density_at_cond = calculateGasDensity(pressure_pa_abs, temperature_k, MW, Z_Factor);
            const { mixture_density } = calculateMixtureProperties(actualGasFlow, gas_density_at_cond, actualLLFlow, Light_Liquid_Density_kg_m3, actualHLFlow, Heavy_Liquid_Density_kg_m3);
            
            if (designCriteria.max_rhov2_kg_per_m_s2 > 0 && mixture_density > 0) {
                // V = Q/A => rho * (Q/A)^2 <= rhoV2_max => A^2 >= rho * Q^2 / rhoV2_max => A >= sqrt(rho * Q^2 / rhoV2_max)
                requiredArea_by_RhoV2 = Math.sqrt((mixture_density * Math.pow(totalActualFlow, 2)) / designCriteria.max_rhov2_kg_per_m_s2);
            }
        }

        requiredArea_m2 = Math.max(requiredArea_by_Velocity, requiredArea_by_RhoV2);
        
        if (requiredArea_m2 > 0) {
            const requiredDI_m = Math.sqrt(4 * requiredArea_m2 / Math.PI);
            const requiredDI_mm = requiredDI_m / constants.MM_TO_M;
            if (requiredDI_mm > maxRequiredDI_mm) {
                maxRequiredDI_mm = requiredDI_mm;
            }
        }
    }

    if (maxRequiredDI_mm === 0) {
        suggestionEl.textContent = 'No se requiere diámetro (caudal cero o datos insuficientes).';
        return;
    }

    let bestFit = null;
    const sortedDiameters = Object.entries(diametersData).sort(([, a], [, b]) => a.DI_mm - b.DI_mm);

    for (const [id, pipe] of sortedDiameters) {
        if (pipe.DI_mm >= maxRequiredDI_mm) {
            bestFit = id;
            break; 
        }
    }

    if (bestFit) {
        suggestionEl.textContent = `Diámetro sugerido (por criterios de flujo): ${bestFit} (DI: ${diametersData[bestFit].DI_mm.toFixed(2)}mm)`;
    } else {
        suggestionEl.textContent = 'El caudal es demasiado grande para los diámetros disponibles.';
    }
}
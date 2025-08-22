// Función para mostrar el modal
function showModal(title, message) {
    const modal = document.getElementById('messageModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modal.classList.add('show');
}

// Función para ocultar el modal
function hideModal() {
    const modal = document.getElementById('messageModal');
    modal.classList.remove('show');
}

// Event listener para cerrar el modal
document.getElementById('closeModalBtn').addEventListener('click', hideModal);

document.getElementById('calculateBtn').addEventListener('click', () => {
    const gender = document.getElementById('gender').value;
    const age = parseFloat(document.getElementById('age').value);
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activity = document.getElementById('activity').value;
    const goal = document.getElementById('goal').value;

    // Validación de entradas
    if (isNaN(age) || isNaN(height) || isNaN(weight) || age <= 0 || height <= 0 || weight <= 0) {
        showModal('Error de Entrada', 'Por favor, ingresa valores válidos y positivos para edad, altura y peso.');
        return;
    }

    // 1. Calcular Tasa Metabólica Basal (TMB) - Fórmula de Mifflin-St Jeor
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else { // female
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // 2. Factores de Actividad Física
    let activityFactor;
    switch (activity) {
        case 'sedentary':
            activityFactor = 1.2;
            break;
        case 'light':
            activityFactor = 1.375;
            break;
        case 'moderate':
            activityFactor = 1.55;
            break;
        case 'intense':
            activityFactor = 1.725;
            break;
        case 'very_intense':
            activityFactor = 1.9;
            break;
        default:
            activityFactor = 1.2; // Valor por defecto
    }

    // 3. Calcular Gasto Energético Diario Total (TDEE) - Calorías de Mantenimiento
    const maintenanceCalories = bmr * activityFactor;

    // 4. Ajustar Calorías según el Objetivo
    let recommendedCalories;
    let proteinPct, carbsPct, fatPct; // Porcentajes de macronutrientes

    switch (goal) {
        case 'maintain':
            recommendedCalories = maintenanceCalories;
            proteinPct = 0.30; // 30%
            carbsPct = 0.50;  // 50%
            fatPct = 0.20;    // 20%
            break;
        case 'cut':
            recommendedCalories = maintenanceCalories - 400; // Déficit de 400 kcal
            proteinPct = 0.35; // 35%
            carbsPct = 0.35;  // 35%
            fatPct = 0.30;    // 30%
            break;
        case 'bulk':
            recommendedCalories = maintenanceCalories + 400; // Superávit de 400 kcal
            proteinPct = 0.30; // 30%
            carbsPct = 0.55;  // 55%
            fatPct = 0.15;    // 15%
            break;
        default:
            recommendedCalories = maintenanceCalories;
            proteinPct = 0.30;
            carbsPct = 0.50;
            fatPct = 0.20;
    }

    // Asegurar que las calorías recomendadas no sean negativas
    if (recommendedCalories < 1200 && goal !== 'cut') {
        recommendedCalories = 1200;
    } else if (recommendedCalories < 1000 && goal === 'cut') {
        recommendedCalories = 1000;
    }

    // 5. Calcular Macronutrientes en Gramos
    const proteinGrams = (recommendedCalories * proteinPct) / 4;
    const carbsGrams = (recommendedCalories * carbsPct) / 4;
    const fatGrams = (recommendedCalories * fatPct) / 9;

    // 6. Mostrar Resultados
    document.getElementById('maintenanceCalories').textContent = `${Math.round(maintenanceCalories)} kcal`;
    document.getElementById('recommendedCalories').textContent = `${Math.round(recommendedCalories)} kcal`;
    document.getElementById('proteinGrams').textContent = `${Math.round(proteinGrams)} g`;
    document.getElementById('carbsGrams').textContent = `${Math.round(carbsGrams)} g`;
    document.getElementById('fatGrams').textContent = `${Math.round(fatGrams)} g`;

    // Actualizar barras de macronutrientes
    document.getElementById('proteinBar').style.width = `${proteinPct * 100}%`;
    document.getElementById('proteinBar').textContent = `${Math.round(proteinPct * 100)}%`;
    document.getElementById('carbsBar').style.width = `${carbsPct * 100}%`;
    document.getElementById('carbsBar').textContent = `${Math.round(carbsPct * 100)}%`;
    document.getElementById('fatBar').style.width = `${fatPct * 100}%`;
    document.getElementById('fatBar').textContent = `${Math.round(fatPct * 100)}%`;

    // Mostrar la sección de resultados
    document.getElementById('resultsSection').classList.remove('hidden');

    // Almacenar los resultados para el generador de plan de comidas
    window.currentRecommendedCalories = Math.round(recommendedCalories);
    window.currentProteinGrams = Math.round(proteinGrams);
    window.currentCarbsGrams = Math.round(carbsGrams);
    window.currentFatGrams = Math.round(fatGrams);
});

// Event listener para el botón de generar plan de comidas
document.getElementById('generateMealPlanBtn').addEventListener('click', async () => {
    const recommendedCalories = window.currentRecommendedCalories;
    const proteinGrams = window.currentProteinGrams;
    const carbsGrams = window.currentCarbsGrams;
    const fatGrams = window.currentFatGrams;

    if (!recommendedCalories) {
        showModal('Información', 'Por favor, calcula tus calorías y macronutrientes primero.');
        return;
    }

    const generateMealPlanBtn = document.getElementById('generateMealPlanBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Mostrar spinner y deshabilitar botón
    loadingSpinner.classList.remove('hidden');
    generateMealPlanBtn.disabled = true;
    generateMealPlanBtn.textContent = 'Generando Plan...';

    try {
        const prompt = `Genera un plan de comidas de un día (desayuno, almuerzo, cena y un snack) para una persona con los siguientes objetivos nutricionales: ${recommendedCalories} calorías, ${proteinGrams}g de proteínas, ${carbsGrams}g de carbohidratos y ${fatGrams}g de grasas. El plan debe ser simple y fácil de seguir. No incluyas explicaciones adicionales, solo el plan de comidas.`;

        // Aquí es donde harías la llamada a la API de Gemini.
        // Dado que el entorno de GitHub Pages es público, no se puede exponer la API Key.
        // Por eso, la llamada a la API de Gemini es un ejemplo que necesitarías adaptar.
        // Si tienes una API Key y un servidor, puedes hacer la llamada desde tu servidor
        // para mantener tu clave segura.
        // Para este ejemplo, simplemente simularemos la respuesta.

        // Simulación de la respuesta de la API (por seguridad)
        const mockResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: `Desayuno: Avena con frutas y nueces (350 kcal, 15g proteína, 50g carbohidratos, 10g grasas).
Almuerzo: Pechuga de pollo a la plancha con arroz integral y brócoli (500 kcal, 40g proteína, 60g carbohidratos, 12g grasas).
Snack: Yogur griego con un puñado de almendras (200 kcal, 25g proteína, 10g carbohidratos, 8g grasas).
Cena: Salmón al horno con patata dulce y espárragos (600 kcal, 30g proteína, 45g carbohidratos, 25g grasas).`
                    }]
                }
            }]
        };

        // Simula un tiempo de espera para que se vea el spinner
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mealPlanText = mockResponse.candidates[0].content.parts[0].text;
        showModal('Tu Plan de Comidas Personalizado', mealPlanText);

    } catch (error) {
        console.error('Error al generar el plan de comidas:', error);
        showModal('Error de Conexión', 'Hubo un problema al generar el plan. Por favor, inténtalo más tarde.');
    } finally {
        // Ocultar spinner y habilitar botón
        loadingSpinner.classList.add('hidden');
        generateMealPlanBtn.disabled = false;
        generateMealPlanBtn.innerHTML = '✨ Generar Plan de Comidas ✨ <div id="loadingSpinner" class="spinner ml-3 hidden"></div>';
    }
});

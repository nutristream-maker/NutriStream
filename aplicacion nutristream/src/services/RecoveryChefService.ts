/**
 * RecoveryChefService
 * AI-powered recovery recipe generation based on biometric data
 * Generates personalized nutrition plans to restore glycogen and optimize recovery
 */

import type {
    DailyEnergyExpenditure,
    RecoveryRecipe,
    RecipeIngredient
} from '../types/BiometricTypes';

// ============================================================================
// INGREDIENT DATABASE
// ============================================================================

const INGREDIENT_DATABASE: Record<string, RecipeIngredient> = {
    // High-glycemic carbs for glycogen restoration
    white_rice: {
        name: 'Arroz Blanco',
        quantity: 100,
        unit: 'g',
        macros: { carbs: 28, protein: 2.7, fat: 0.3, calories: 130 }
    },
    sweet_potato: {
        name: 'Boniato',
        quantity: 150,
        unit: 'g',
        macros: { carbs: 30, protein: 2, fat: 0.1, calories: 129 }
    },
    banana: {
        name: 'Plátano',
        quantity: 120,
        unit: 'g (1 unidad)',
        macros: { carbs: 27, protein: 1.3, fat: 0.4, calories: 105 }
    },
    oats: {
        name: 'Avena',
        quantity: 80,
        unit: 'g',
        macros: { carbs: 54, protein: 10, fat: 5, calories: 303 }
    },
    honey: {
        name: 'Miel',
        quantity: 30,
        unit: 'g',
        macros: { carbs: 25, protein: 0.1, fat: 0, calories: 92 }
    },

    // Protein sources for muscle repair
    chicken_breast: {
        name: 'Pechuga de Pollo',
        quantity: 150,
        unit: 'g',
        macros: { carbs: 0, protein: 31, fat: 3.6, calories: 165 }
    },
    salmon: {
        name: 'Salmón',
        quantity: 150,
        unit: 'g',
        macros: { carbs: 0, protein: 25, fat: 13, calories: 208 }
    },
    eggs: {
        name: 'Huevos',
        quantity: 100,
        unit: 'g (2 unidades)',
        macros: { carbs: 1.1, protein: 13, fat: 11, calories: 155 }
    },
    greek_yogurt: {
        name: 'Yogur Griego',
        quantity: 170,
        unit: 'g',
        macros: { carbs: 6, protein: 17, fat: 0.7, calories: 100 }
    },
    whey_protein: {
        name: 'Proteína Whey',
        quantity: 30,
        unit: 'g',
        macros: { carbs: 3, protein: 24, fat: 1.5, calories: 120 }
    },

    // Healthy fats
    avocado: {
        name: 'Aguacate',
        quantity: 100,
        unit: 'g',
        macros: { carbs: 9, protein: 2, fat: 15, calories: 160 }
    },
    olive_oil: {
        name: 'Aceite de Oliva',
        quantity: 15,
        unit: 'ml',
        macros: { carbs: 0, protein: 0, fat: 14, calories: 119 }
    },
    almonds: {
        name: 'Almendras',
        quantity: 30,
        unit: 'g',
        macros: { carbs: 6, protein: 6, fat: 14, calories: 164 }
    },

    // Hydration & electrolytes
    coconut_water: {
        name: 'Agua de Coco',
        quantity: 250,
        unit: 'ml',
        macros: { carbs: 9, protein: 0.4, fat: 0.5, calories: 46 }
    },
    orange: {
        name: 'Naranja',
        quantity: 150,
        unit: 'g',
        macros: { carbs: 14, protein: 1.4, fat: 0.2, calories: 70 }
    },
    spinach: {
        name: 'Espinacas',
        quantity: 100,
        unit: 'g',
        macros: { carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23 }
    },

    // Anti-inflammatory
    blueberries: {
        name: 'Arándanos',
        quantity: 100,
        unit: 'g',
        macros: { carbs: 14, protein: 0.7, fat: 0.3, calories: 57 }
    },
    turmeric: {
        name: 'Cúrcuma',
        quantity: 5,
        unit: 'g',
        macros: { carbs: 3.3, protein: 0.4, fat: 0.2, calories: 16 }
    },
    ginger: {
        name: 'Jengibre',
        quantity: 10,
        unit: 'g',
        macros: { carbs: 1.8, protein: 0.2, fat: 0.1, calories: 8 }
    }
};

// ============================================================================
// RECIPE TEMPLATES
// ============================================================================

interface RecipeTemplate {
    id: string;
    name: string;
    description: string;
    focus: 'GLYCOGEN' | 'MUSCLE_REPAIR' | 'HYDRATION' | 'BALANCED';
    baseIngredients: string[];
    instructions: string[];
    preparationTime: number;
}

const RECIPE_TEMPLATES: RecipeTemplate[] = [
    {
        id: 'power_bowl',
        name: 'Power Recovery Bowl',
        description: 'Combinación óptima de carbohidratos de alto índice glucémico y proteína magra para máxima recuperación de glucógeno',
        focus: 'GLYCOGEN',
        baseIngredients: ['white_rice', 'chicken_breast', 'sweet_potato', 'spinach', 'olive_oil'],
        instructions: [
            'Cocinar el arroz blanco según instrucciones del paquete',
            'Asar la pechuga de pollo a la plancha con especias al gusto',
            'Cocinar el boniato al horno a 200°C durante 25 minutos',
            'Saltear las espinacas con ajo en aceite de oliva',
            'Montar el bowl con todos los ingredientes y servir caliente'
        ],
        preparationTime: 35
    },
    {
        id: 'recovery_smoothie',
        name: 'Smoothie de Recuperación Rápida',
        description: 'Batido de rápida absorción con proteína whey y carbohidratos simples para la ventana anabólica post-entreno',
        focus: 'GLYCOGEN',
        baseIngredients: ['whey_protein', 'banana', 'oats', 'greek_yogurt', 'honey', 'blueberries'],
        instructions: [
            'Añadir todos los ingredientes a la batidora',
            'Agregar 200ml de leche de almendras o agua',
            'Batir hasta obtener una consistencia homogénea',
            'Consumir inmediatamente para máxima absorción',
            'Ideal en los primeros 30 minutos post-entreno'
        ],
        preparationTime: 5
    },
    {
        id: 'omega_salmon',
        name: 'Salmón Omega Recovery',
        description: 'Plato antiinflamatorio rico en omega-3 para reparación muscular profunda',
        focus: 'MUSCLE_REPAIR',
        baseIngredients: ['salmon', 'sweet_potato', 'avocado', 'spinach', 'turmeric', 'ginger'],
        instructions: [
            'Marinar el salmón con cúrcuma, jengibre y aceite de oliva',
            'Hornear a 180°C durante 15-18 minutos',
            'Preparar puré de boniato con un toque de canela',
            'Servir con aguacate en rodajas y espinacas frescas',
            'Añadir limón al gusto antes de servir'
        ],
        preparationTime: 30
    },
    {
        id: 'hydration_bowl',
        name: 'Hydration Recovery Bowl',
        description: 'Bowl hidratante con electrolitos naturales para recuperar minerales perdidos',
        focus: 'HYDRATION',
        baseIngredients: ['coconut_water', 'orange', 'banana', 'greek_yogurt', 'almonds', 'blueberries'],
        instructions: [
            'Cortar las frutas en trozos medianos',
            'Colocar el yogur griego como base del bowl',
            'Añadir las frutas y las almendras picadas',
            'Rociar con agua de coco fría',
            'Consumir fresco para máxima hidratación'
        ],
        preparationTime: 10
    },
    {
        id: 'balanced_plate',
        name: 'Plato Equilibrado del Atleta',
        description: 'Comida completa con balance perfecto de macronutrientes para recuperación integral',
        focus: 'BALANCED',
        baseIngredients: ['chicken_breast', 'white_rice', 'avocado', 'eggs', 'spinach', 'olive_oil'],
        instructions: [
            'Cocinar el arroz y reservar',
            'Asar la pechuga de pollo con hierbas provenzales',
            'Preparar huevos revueltos con espinacas',
            'Cortar el aguacate en láminas',
            'Montar el plato con todos los componentes',
            'Aliñar con aceite de oliva virgen extra'
        ],
        preparationTime: 25
    }
];

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate target macros based on energy expenditure and glycogen depletion
 */
function calculateTargetMacros(expenditure: DailyEnergyExpenditure): {
    carbohydrates: number;
    protein: number;
    fat: number;
    totalCalories: number;
} {
    const { totalCalories, glycogenDepletion, primaryFuelSource } = expenditure;

    // Base recovery needs: 1.2x calories burned for recovery
    const recoveryCalories = Math.round(totalCalories * 1.2);

    // Macro distribution based on glycogen depletion
    let carbRatio: number;
    let proteinRatio: number;
    let fatRatio: number;

    if (glycogenDepletion > 70) {
        // Severe depletion: prioritize carbs
        carbRatio = 0.65;
        proteinRatio = 0.25;
        fatRatio = 0.10;
    } else if (glycogenDepletion > 40) {
        // Moderate depletion: balanced with carb emphasis
        carbRatio = 0.55;
        proteinRatio = 0.28;
        fatRatio = 0.17;
    } else {
        // Light depletion: standard recovery ratios
        carbRatio = 0.45;
        proteinRatio = 0.30;
        fatRatio = 0.25;
    }

    // Adjust based on primary fuel source
    if (primaryFuelSource === 'CARBS') {
        carbRatio += 0.05;
        fatRatio -= 0.05;
    } else if (primaryFuelSource === 'FAT') {
        fatRatio += 0.05;
        carbRatio -= 0.05;
    }

    // Calculate grams (carbs/protein = 4kcal/g, fat = 9kcal/g)
    const carbohydrates = Math.round((recoveryCalories * carbRatio) / 4);
    const protein = Math.round((recoveryCalories * proteinRatio) / 4);
    const fat = Math.round((recoveryCalories * fatRatio) / 9);

    return {
        carbohydrates,
        protein,
        fat,
        totalCalories: recoveryCalories
    };
}

/**
 * Select best recipe template based on the recovery focus
 */
function selectRecipeTemplate(
    glycogenDepletion: number,
    zoneBreakdown: DailyEnergyExpenditure['zoneBreakdown']
): RecipeTemplate {
    // High-intensity training = prioritize glycogen
    const highIntensityMinutes = zoneBreakdown.zone4 + zoneBreakdown.zone5;
    const totalMinutes = Object.values(zoneBreakdown).reduce((a, b) => a + b, 0);
    const highIntensityRatio = totalMinutes > 0 ? highIntensityMinutes / totalMinutes : 0;

    let focus: RecipeTemplate['focus'];

    if (glycogenDepletion > 60) {
        focus = 'GLYCOGEN';
    } else if (highIntensityRatio > 0.4) {
        focus = 'MUSCLE_REPAIR';
    } else if (totalMinutes > 90) {
        focus = 'HYDRATION';
    } else {
        focus = 'BALANCED';
    }

    // Find matching template
    const matchingTemplates = RECIPE_TEMPLATES.filter(t => t.focus === focus);
    return matchingTemplates[0] || RECIPE_TEMPLATES[RECIPE_TEMPLATES.length - 1];
}

/**
 * Scale ingredient quantities to match target macros
 */
function scaleIngredients(
    template: RecipeTemplate,
    targetMacros: ReturnType<typeof calculateTargetMacros>
): RecipeIngredient[] {
    const ingredients = template.baseIngredients.map(key => ({
        ...INGREDIENT_DATABASE[key]
    }));

    // Calculate total macros from base recipe
    const baseMacros = ingredients.reduce(
        (acc, ing) => ({
            carbs: acc.carbs + ing.macros.carbs,
            protein: acc.protein + ing.macros.protein,
            fat: acc.fat + ing.macros.fat,
            calories: acc.calories + ing.macros.calories
        }),
        { carbs: 0, protein: 0, fat: 0, calories: 0 }
    );

    // Calculate scaling factor (average of macro ratios)
    const carbScale = baseMacros.carbs > 0 ? targetMacros.carbohydrates / baseMacros.carbs : 1;
    const proteinScale = baseMacros.protein > 0 ? targetMacros.protein / baseMacros.protein : 1;
    const avgScale = (carbScale + proteinScale) / 2;

    // Apply reasonable scaling limits (0.5x to 2x)
    const clampedScale = Math.max(0.5, Math.min(2, avgScale));

    // Scale quantities
    return ingredients.map(ing => ({
        ...ing,
        quantity: Math.round(ing.quantity * clampedScale),
        macros: {
            carbs: Math.round(ing.macros.carbs * clampedScale),
            protein: Math.round(ing.macros.protein * clampedScale),
            fat: Math.round(ing.macros.fat * clampedScale),
            calories: Math.round(ing.macros.calories * clampedScale)
        }
    }));
}

/**
 * Estimate glycogen restoration percentage based on recipe
 */
function estimateGlycogenRestoration(
    totalCarbs: number,
    glycogenDepletion: number
): number {
    // Typical muscle glycogen capacity: ~400-500g for trained athletes
    // Liver glycogen: ~100-120g
    // Total: ~500-620g
    const totalCapacity = 500;

    // Calculate grams of glycogen that can be restored from carbs
    // Approximately 1g carb = 0.8g glycogen in recovery state
    const potentialRestoration = totalCarbs * 0.8;
    const depletedAmount = (glycogenDepletion / 100) * totalCapacity;

    // Calculate percentage restored
    const restorationPercent = (potentialRestoration / depletedAmount) * 100;

    return Math.min(100, Math.round(restorationPercent));
}

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

/**
 * Generate a personalized recovery recipe based on daily energy expenditure
 */
export function generateRecoveryRecipe(
    expenditure: DailyEnergyExpenditure
): RecoveryRecipe {
    // Calculate target macros
    const targetMacros = calculateTargetMacros(expenditure);

    // Select best recipe template
    const template = selectRecipeTemplate(
        expenditure.glycogenDepletion,
        expenditure.zoneBreakdown
    );

    // Scale ingredients to match targets
    const scaledIngredients = scaleIngredients(template, targetMacros);

    // Calculate actual macros after scaling
    const actualMacros = scaledIngredients.reduce(
        (acc, ing) => ({
            carbohydrates: acc.carbohydrates + ing.macros.carbs,
            protein: acc.protein + ing.macros.protein,
            fat: acc.fat + ing.macros.fat,
            totalCalories: acc.totalCalories + ing.macros.calories
        }),
        { carbohydrates: 0, protein: 0, fat: 0, totalCalories: 0 }
    );

    // Estimate glycogen restoration
    const glycogenRestoration = estimateGlycogenRestoration(
        actualMacros.carbohydrates,
        expenditure.glycogenDepletion
    );

    return {
        id: `recipe_${Date.now()}`,
        name: template.name,
        description: template.description,
        targetMacros: actualMacros,
        ingredients: scaledIngredients,
        instructions: template.instructions,
        glycogenRestoration,
        recoveryFocus: template.focus,
        preparationTime: template.preparationTime
    };
}

/**
 * Quick function to get a recipe suggestion based on simple inputs
 */
export function getQuickRecoveryRecipe(
    caloriesBurned: number,
    intensityLevel: 'LOW' | 'MODERATE' | 'HIGH'
): RecoveryRecipe {
    const intensityToDepletion: Record<string, number> = {
        LOW: 25,
        MODERATE: 50,
        HIGH: 75
    };

    const expenditure: DailyEnergyExpenditure = {
        totalCalories: caloriesBurned,
        activeCalories: caloriesBurned * 0.7,
        bmrCalories: caloriesBurned * 0.3,
        glycogenDepletion: intensityToDepletion[intensityLevel],
        primaryFuelSource: intensityLevel === 'LOW' ? 'FAT' : 'CARBS',
        zoneBreakdown: {
            zone1: intensityLevel === 'LOW' ? 30 : 10,
            zone2: intensityLevel === 'MODERATE' ? 30 : 15,
            zone3: 15,
            zone4: intensityLevel === 'HIGH' ? 20 : 5,
            zone5: intensityLevel === 'HIGH' ? 10 : 0
        }
    };

    return generateRecoveryRecipe(expenditure);
}

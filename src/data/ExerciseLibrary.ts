import joggingGuide from '../assets/exercises/jogging_guide.png';
import hipMobilityGuide from '../assets/exercises/hip_mobility_guide.png';
import backSquatGuide from '../assets/exercises/back_squat_anatomy.png';
import inclineBenchGuide from '../assets/exercises/incline_bench_press_anatomy.png';
import deadliftGuide from '../assets/exercises/deadlift_anatomy.png';
import overheadPressGuide from '../assets/exercises/overhead_press_anatomy.png';
import barbellRowGuide from '../assets/exercises/barbell_row_anatomy.png';
import pullUpGuide from '../assets/exercises/pull_up_anatomy.png';
import yogaFlowGuide from '../assets/exercises/yoga_flow_guide.png';
import breathworkGuide from '../assets/exercises/breathwork_guide.png';
import dumbbellCurlGuide from '../assets/exercises/dumbbell_curl_anatomy.png';
import pushUpGuide from '../assets/exercises/push_up_guide.png';
import kettlebellSwingGuide from '../assets/exercises/kettlebell_swing_guide.png';
import legPressGuide from '../assets/exercises/leg_press_guide.png';
import plankGuide from '../assets/exercises/plank_anatomy.png';
import latPulldownGuide from '../assets/exercises/lat_pulldown_guide.png';
import declineBenchGuide from '../assets/exercises/decline_bench_press.png';
import barbellBenchGuide from '../assets/exercises/barbell_bench_press_anatomy.png';
import tricepDipGuide from '../assets/exercises/tricep_dip_anatomy.png';
import lungeGuide from '../assets/exercises/lunge_anatomy.png';

export const exerciseLibrary = [
    // CHEST EXERCISES
    { id: 1, name: 'Barbell Bench Press', category: 'strength', muscle: 'chest', difficulty: 'intermediate', image: barbellBenchGuide, primary: 'Pectoral', secondary: 'Tríceps' },
    { id: 2, name: 'Incline Bench Press', category: 'strength', muscle: 'chest', difficulty: 'intermediate', image: inclineBenchGuide, primary: 'Pectoral Superior', secondary: 'Deltoides' },
    { id: 3, name: 'Decline Bench Press', category: 'strength', muscle: 'chest', difficulty: 'intermediate', image: declineBenchGuide, primary: 'Pectoral Inferior', secondary: 'Tríceps' },
    { id: 4, name: 'Dumbbell Fly', category: 'strength', muscle: 'chest', difficulty: 'beginner', image: inclineBenchGuide, primary: 'Pectoral', secondary: 'Deltoides Anterior' },
    { id: 5, name: 'Cable Crossover', category: 'strength', muscle: 'chest', difficulty: 'intermediate', image: inclineBenchGuide, primary: 'Pectoral', secondary: 'Core' },
    { id: 6, name: 'Push-Ups', category: 'strength', muscle: 'chest', difficulty: 'beginner', image: pushUpGuide, primary: 'Pectoral', secondary: 'Core' },

    // BACK EXERCISES
    { id: 7, name: 'Deadlift', category: 'strength', muscle: 'back', difficulty: 'advanced', image: deadliftGuide, primary: 'Lumbares', secondary: 'Isquiotibiales' },
    { id: 8, name: 'Pull-Up', category: 'strength', muscle: 'back', difficulty: 'intermediate', image: pullUpGuide, primary: 'Dorsales', secondary: 'Bíceps' },
    { id: 9, name: 'Barbell Row', category: 'strength', muscle: 'back', difficulty: 'intermediate', image: barbellRowGuide, primary: 'Dorsales', secondary: 'Trapecio' },
    { id: 10, name: 'Lat Pulldown', category: 'strength', muscle: 'back', difficulty: 'beginner', image: latPulldownGuide, primary: 'Dorsales', secondary: 'Bíceps' },
    { id: 11, name: 'T-Bar Row', category: 'strength', muscle: 'back', difficulty: 'intermediate', image: barbellRowGuide, primary: 'Dorsales', secondary: 'Trapecio' },
    { id: 12, name: 'Seated Cable Row', category: 'strength', muscle: 'back', difficulty: 'beginner', image: latPulldownGuide, primary: 'Dorsales', secondary: 'Romboides' },
    { id: 13, name: 'Face Pulls', category: 'strength', muscle: 'back', difficulty: 'beginner', image: latPulldownGuide, primary: 'Trapecio', secondary: 'Deltoides Posterior' },

    // LEG EXERCISES
    { id: 14, name: 'Back Squat', category: 'strength', muscle: 'legs', difficulty: 'intermediate', image: backSquatGuide, primary: 'Cuádriceps', secondary: 'Glúteos' },
    { id: 15, name: 'Front Squat', category: 'strength', muscle: 'legs', difficulty: 'advanced', image: backSquatGuide, primary: 'Cuádriceps', secondary: 'Core' },
    { id: 16, name: 'Leg Press', category: 'strength', muscle: 'legs', difficulty: 'beginner', image: legPressGuide, primary: 'Cuádriceps', secondary: 'Glúteos' },
    { id: 17, name: 'Bulgarian Split Squat', category: 'strength', muscle: 'legs', difficulty: 'intermediate', image: backSquatGuide, primary: 'Cuádriceps', secondary: 'Glúteos' },
    { id: 18, name: 'Leg Extension', category: 'strength', muscle: 'legs', difficulty: 'beginner', image: legPressGuide, primary: 'Cuádriceps', secondary: 'N/A' },
    { id: 19, name: 'Leg Curl', category: 'strength', muscle: 'legs', difficulty: 'beginner', image: legPressGuide, primary: 'Isquiotibiales', secondary: 'N/A' },
    { id: 20, name: 'Romanian Deadlift', category: 'strength', muscle: 'legs', difficulty: 'intermediate', image: deadliftGuide, primary: 'Isquiotibiales', secondary: 'Glúteos' },
    { id: 21, name: 'Hip Thrust', category: 'strength', muscle: 'legs', difficulty: 'beginner', image: backSquatGuide, primary: 'Glúteos', secondary: 'Isquiotibiales' },
    { id: 22, name: 'Calf Raise', category: 'strength', muscle: 'legs', difficulty: 'beginner', image: backSquatGuide, primary: 'Gemelos', secondary: 'N/A' },

    // SHOULDER EXERCISES
    { id: 23, name: 'Overhead Press', category: 'strength', muscle: 'shoulders', difficulty: 'intermediate', image: overheadPressGuide, primary: 'Deltoides', secondary: 'Tríceps' },
    { id: 24, name: 'Dumbbell Shoulder Press', category: 'strength', muscle: 'shoulders', difficulty: 'beginner', image: overheadPressGuide, primary: 'Deltoides', secondary: 'Tríceps' },
    { id: 25, name: 'Lateral Raises', category: 'strength', muscle: 'shoulders', difficulty: 'beginner', image: overheadPressGuide, primary: 'Deltoides Lateral', secondary: 'Trapecio' },
    { id: 26, name: 'Front Raises', category: 'strength', muscle: 'shoulders', difficulty: 'beginner', image: overheadPressGuide, primary: 'Deltoides Anterior', secondary: 'Pectoral Superior' },
    { id: 27, name: 'Rear Delt Fly', category: 'strength', muscle: 'shoulders', difficulty: 'beginner', image: overheadPressGuide, primary: 'Deltoides Posterior', secondary: 'Trapecio' },
    { id: 28, name: 'Arnold Press', category: 'strength', muscle: 'shoulders', difficulty: 'intermediate', image: overheadPressGuide, primary: 'Deltoides', secondary: 'Tríceps' },

    // ARM EXERCISES
    { id: 29, name: 'Barbell Curl', category: 'strength', muscle: 'arms', difficulty: 'beginner', image: dumbbellCurlGuide, primary: 'Bíceps', secondary: 'Antebrazo' },
    { id: 30, name: 'Hammer Curl', category: 'strength', muscle: 'arms', difficulty: 'beginner', image: dumbbellCurlGuide, primary: 'Bíceps', secondary: 'Braquial' },
    { id: 31, name: 'Triceps Dips', category: 'strength', muscle: 'arms', difficulty: 'intermediate', image: tricepDipGuide, primary: 'Tríceps', secondary: 'Pectoral' },
    { id: 32, name: 'Skull Crushers', category: 'strength', muscle: 'arms', difficulty: 'intermediate', image: inclineBenchGuide, primary: 'Tríceps', secondary: 'N/A' },
    { id: 33, name: 'Cable Triceps Pushdown', category: 'strength', muscle: 'arms', difficulty: 'beginner', image: inclineBenchGuide, primary: 'Tríceps', secondary: 'N/A' },

    // CORE EXERCISES
    { id: 34, name: 'Plank', category: 'core', muscle: 'all', difficulty: 'beginner', image: plankGuide, primary: 'Core', secondary: 'Hombros' },
    { id: 35, name: 'Ab Wheel Rollout', category: 'core', muscle: 'all', difficulty: 'advanced', image: yogaFlowGuide, primary: 'Abdominales', secondary: 'Lumbares' },
    { id: 36, name: 'Hanging Leg Raise', category: 'core', muscle: 'all', difficulty: 'intermediate', image: pullUpGuide, primary: 'Abdominales', secondary: 'Flexores de Cadera' },

    // CARDIO & FLEXIBILITY
    { id: 37, name: 'Zone 2 Jog', category: 'cardio', muscle: 'legs', difficulty: 'beginner', image: joggingGuide, primary: 'Cardio', secondary: 'Piernas' },
    { id: 38, name: 'Yoga Flow', category: 'flexibility', muscle: 'all', difficulty: 'beginner', image: yogaFlowGuide, primary: 'Todo el cuerpo', secondary: 'Core' },
    { id: 39, name: 'Hip Mobility Sequence', category: 'flexibility', muscle: 'legs', difficulty: 'beginner', image: hipMobilityGuide, primary: 'Caderas', secondary: 'Lumbares' },

    // ADVANCED STRENGTH & POWER
    { id: 40, name: 'Clean and Jerk', category: 'strength', muscle: 'all', difficulty: 'advanced', image: overheadPressGuide, primary: 'Todo el cuerpo', secondary: 'Potencia' },
    { id: 41, name: 'Snatch', category: 'strength', muscle: 'all', difficulty: 'advanced', image: overheadPressGuide, primary: 'Todo el cuerpo', secondary: 'Potencia' },
    { id: 42, name: 'Box Jumps', category: 'cardio', muscle: 'legs', difficulty: 'intermediate', image: backSquatGuide, primary: 'Piernas', secondary: 'Potencia' },
    { id: 43, name: 'Kettlebell Swings', category: 'strength', muscle: 'legs', difficulty: 'intermediate', image: kettlebellSwingGuide, primary: 'Cadena Posterior', secondary: 'Cardio' },
    { id: 44, name: 'Farmer Carry', category: 'strength', muscle: 'all', difficulty: 'intermediate', image: deadliftGuide, primary: 'Core', secondary: 'Agarre' },

    // FUNCTIONAL & BODYWEIGHT
    { id: 45, name: 'Burpees', category: 'cardio', muscle: 'all', difficulty: 'intermediate', image: pushUpGuide, primary: 'Cardio', secondary: 'Todo el cuerpo' },
    { id: 46, name: 'Mountain Climbers', category: 'cardio', muscle: 'core', difficulty: 'beginner', image: yogaFlowGuide, primary: 'Core', secondary: 'Cardio' },
    { id: 47, name: 'Jump Rope', category: 'cardio', muscle: 'legs', difficulty: 'beginner', image: joggingGuide, primary: 'Gemelos', secondary: 'Cardio' },
    { id: 48, name: 'Pistol Squat', category: 'strength', muscle: 'legs', difficulty: 'advanced', image: backSquatGuide, primary: 'Cuádriceps', secondary: 'Equilibrio' },
    { id: 49, name: 'Muscle Up', category: 'strength', muscle: 'back', difficulty: 'advanced', image: pullUpGuide, primary: 'Dorsales', secondary: 'Tríceps' },
    { id: 50, name: 'Handstand Push-Up', category: 'strength', muscle: 'shoulders', difficulty: 'advanced', image: overheadPressGuide, primary: 'Hombros', secondary: 'Tríceps' },

    // ISOLATION VARIATIONS
    { id: 51, name: 'Preacher Curl', category: 'strength', muscle: 'arms', difficulty: 'intermediate', image: dumbbellCurlGuide, primary: 'Bíceps', secondary: 'N/A' },
    { id: 52, name: 'Concentration Curl', category: 'strength', muscle: 'arms', difficulty: 'beginner', image: dumbbellCurlGuide, primary: 'Bíceps', secondary: 'N/A' },
    { id: 53, name: 'Reverse Fly', category: 'strength', muscle: 'shoulders', difficulty: 'intermediate', image: overheadPressGuide, primary: 'Deltoides Posterior', secondary: 'Trapecio' },
    { id: 54, name: 'Shrugs', category: 'strength', muscle: 'back', difficulty: 'beginner', image: deadliftGuide, primary: 'Trapecio', secondary: 'Agarre' },
    { id: 55, name: 'Lunges', category: 'strength', muscle: 'legs', difficulty: 'beginner', image: lungeGuide, primary: 'Cuádriceps', secondary: 'Glúteos' },
    { id: 56, name: 'Sumo Deadlift', category: 'strength', muscle: 'back', difficulty: 'intermediate', image: deadliftGuide, primary: 'Isquiotibiales', secondary: 'Aductores' },
    { id: 57, name: 'Close-Grip Bench Press', category: 'strength', muscle: 'arms', difficulty: 'intermediate', image: inclineBenchGuide, primary: 'Tríceps', secondary: 'Pectoral' },
    { id: 58, name: 'Chest Dips', category: 'strength', muscle: 'chest', difficulty: 'intermediate', image: inclineBenchGuide, primary: 'Pectoral Inferior', secondary: 'Tríceps' },
    { id: 59, name: 'Good Mornings', category: 'strength', muscle: 'back', difficulty: 'advanced', image: deadliftGuide, primary: 'Lumbares', secondary: 'Isquiotibiales' },

    // STRETCHING & MOBILITY
    { id: 60, name: 'Cat-Cow', category: 'flexibility', muscle: 'back', difficulty: 'beginner', image: yogaFlowGuide, primary: 'Columna', secondary: 'Core' },
    { id: 61, name: 'Pigeon Pose', category: 'flexibility', muscle: 'legs', difficulty: 'intermediate', image: yogaFlowGuide, primary: 'Glúteos', secondary: 'Caderas' },
    { id: 62, name: 'Child\'s Pose', category: 'flexibility', muscle: 'back', difficulty: 'beginner', image: yogaFlowGuide, primary: 'Espalda Baja', secondary: 'Hombros' },
    { id: 63, name: 'Foam Rolling', category: 'flexibility', muscle: 'all', difficulty: 'beginner', image: yogaFlowGuide, primary: 'Tejido Profundo', secondary: 'Recuperación' },
    { id: 64, name: 'Dynamic Warmup', category: 'warmup', muscle: 'all', difficulty: 'beginner', image: joggingGuide, primary: 'Activación', secondary: 'Movilidad' },
];

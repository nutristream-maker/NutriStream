import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiX, FiChevronsRight, FiSave, FiTrash2, FiChevronDown, FiAlertCircle, FiPlusCircle, FiPieChart, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { SchemaType } from "@google/generative-ai";
import { Card, Button } from '../ui/Shared';
import { genAI } from '../../services/ai';

import { useSensorStore } from '../../store/useSensorStore';
import { mockMedicalData, initialUserData } from '../../data/mockData';
import { useNutritionLogs, NutritionEntry } from '../../hooks/useNutritionLogs';

const Select: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children?: React.ReactNode, className?: string }> = ({ value, onChange, children, className }) => {
    return (
        <div className={`relative ${className}`}>
            <select value={value} onChange={onChange} className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary" > {children} </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center"><FiChevronDown /></span>
        </div>
    );
};

// ============ Main Tabs ============
type MainTab = 'recetas' | 'analizador';
type SummaryPeriod = 'today' | 'week' | 'month';

const ChefAI: React.FC<{}> = React.memo(() => {
    // Main Tab State
    const [mainTab, setMainTab] = useState<MainTab>('recetas');

    // Recipe Generator States
    const [isLoading, setIsLoading] = useState(false);
    const [viewingRecipe, setViewingRecipe] = useState<any>(null);
    const [ingredients, setIngredients] = useState('');
    const [diet, setDiet] = useState('equilibrada');
    const [inputMode, setInputMode] = useState('text');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [savedRecipes, setSavedRecipes] = useState<any[]>([]);

    // Food Analyzer States
    const [analyzerImageFile, setAnalyzerImageFile] = useState<File | null>(null);
    const [analyzerImageBase64, setAnalyzerImageBase64] = useState<string | null>(null);
    const analyzerFileInputRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{
        foodName: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        analysis: string;
    } | null>(null);
    const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [summaryPeriod, setSummaryPeriod] = useState<SummaryPeriod>('today');

    // Nutrition Logs Hook
    const { addEntry, deleteEntry, todaySummary, weeklySummary, monthlySummary, entries } = useNutritionLogs();

    // NS POD Integration
    const { muscleFatigue } = useSensorStore();
    const fatigueInfo = useMemo(() => {
        const fatigueValues = Object.values(muscleFatigue) as number[];
        if (fatigueValues.length === 0) return { isHighFatigue: false, avgFatigue: 0 };
        const avgFatigue = fatigueValues.reduce((a: number, b: number) => a + b, 0) / fatigueValues.length;
        return { isHighFatigue: avgFatigue > 50, avgFatigue: Math.round(avgFatigue) };
    }, [muscleFatigue]);

    // Load/Save Recipes from localStorage
    useEffect(() => { const storedRecipes = localStorage.getItem('savedNutriStreamRecipes'); if (storedRecipes) { setSavedRecipes(JSON.parse(storedRecipes)); } }, []);
    useEffect(() => { localStorage.setItem('savedNutriStreamRecipes', JSON.stringify(savedRecipes)); }, [savedRecipes]);

    // ============ Recipe Logic ============
    const handleSaveRecipe = () => { if (!viewingRecipe || savedRecipes.some(r => r.nombre === viewingRecipe.nombre)) { alert(savedRecipes.some(r => r.nombre === viewingRecipe.nombre) ? 'Receta ya guardada.' : 'No hay receta para guardar.'); return; } setSavedRecipes(prev => [...prev, viewingRecipe]); };
    const handleDeleteRecipe = (recipeNameToDelete: string) => { setSavedRecipes(prev => prev.filter(r => r.nombre !== recipeNameToDelete)); if (viewingRecipe && viewingRecipe.nombre === recipeNameToDelete) { setViewingRecipe(null); } };

    const handleShare = (platform: string) => {
        if (!viewingRecipe) return; const recipeName = viewingRecipe.nombre; const recipeDescription = viewingRecipe.descripcion; const appUrl = "https://nutristream.app"; const shareText = `¡Mira esta receta que generé con Chef IA en NutriStream! 🍽️\n\n*${recipeName}*\n${recipeDescription}\n\n`; const encodedText = encodeURIComponent(shareText); const encodedUrl = encodeURIComponent(appUrl); let url = '';
        switch (platform) { case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=NutriStreamAI,RecetasSaludables`; break; case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`; break; case 'whatsapp': url = `https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`; break; default: return; }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
        return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type }, };
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => { setImageBase64(reader.result as string); }; reader.readAsDataURL(file); }
    };

    const handleGenerateRecipe = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((inputMode === 'text' && !ingredients) || (inputMode === 'image' && !imageFile)) return;
        setIsLoading(true); setViewingRecipe(null);
        try {
            let prompt;
            const jsonSchema = { type: SchemaType.OBJECT, properties: { nombre: { type: SchemaType.STRING }, descripcion: { type: SchemaType.STRING }, tiempo: { type: SchemaType.STRING }, porciones: { type: SchemaType.STRING }, ingredientes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }, instrucciones: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }, consejo: { type: SchemaType.STRING }, } };

            const recoveryContext = fatigueInfo.isHighFatigue
                ? ` IMPORTANTE: El usuario tiene alta fatiga muscular (${fatigueInfo.avgFatigue}% según sensores). Prioriza ingredientes ricos en: magnesio (espinacas, almendras), potasio (plátano, batata), antioxidantes (frutas rojas, chocolate negro), y proteínas de alta calidad para recuperación muscular.`
                : '';

            // @ts-ignore
            const { allergies, healthAlert } = mockMedicalData;
            // @ts-ignore
            const { monthlyGoals } = initialUserData;
            const allergens = allergies.map((a: any) => a.name).join(', ');
            const healthCondition = healthAlert ? `${healthAlert.title}: ${healthAlert.message}` : '';
            const goalContext = monthlyGoals.muscleMass.goal > monthlyGoals.muscleMass.current ? 'Objetivo: Ganancia Muscular (Hipertrofia)' : 'Objetivo: Mantenimiento';
            const medicalContext = `CONTEXTO DE SALUD DEL USUARIO: Alergias: ${allergens || 'Ninguna'}. Alertas: ${healthCondition}. Meta: ${goalContext}.`;

            let result;
            const modelConfig = { model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json", responseSchema: jsonSchema, } };
            const model = genAI.getGenerativeModel(modelConfig);

            if (inputMode === 'image' && imageFile) {
                prompt = `Identifica los ingredientes en esta foto y crea una receta de cocina saludable y deliciosa. La dieta debe ser ${diet}.${recoveryContext} ${medicalContext} La respuesta debe ser un objeto JSON.`;
                const imagePart = await fileToGenerativePart(imageFile);
                result = await model.generateContent([prompt, imagePart]);
            } else {
                prompt = `Crea una receta de cocina saludable y deliciosa con dieta ${diet} y estos ingredientes: ${ingredients}.${recoveryContext} ${medicalContext} La respuesta debe ser un objeto JSON.`;
                result = await model.generateContent(prompt);
            }

            const response = await result.response;
            const recipeJson = JSON.parse(response.text());
            setViewingRecipe(recipeJson);
            setIngredients(''); setImageFile(null); setImageBase64(null); if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) { console.error("Error al generar la receta:", error); alert("Hubo un error al generar la receta."); } finally { setIsLoading(false); }
    };

    // ============ Food Analyzer Logic ============
    const handleAnalyzerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAnalyzerImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setAnalyzerImageBase64(reader.result as string); };
            reader.readAsDataURL(file);
            setAnalysisResult(null); // Clear previous result
        }
    };

    const handleAnalyzeFood = async () => {
        if (!analyzerImageFile) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const analysisSchema = {
                type: SchemaType.OBJECT,
                properties: {
                    foodName: { type: SchemaType.STRING, description: "Nombre del plato o alimento identificado" },
                    calories: { type: SchemaType.NUMBER, description: "Calorías estimadas (kcal)" },
                    protein: { type: SchemaType.NUMBER, description: "Proteínas en gramos" },
                    carbs: { type: SchemaType.NUMBER, description: "Carbohidratos en gramos" },
                    fat: { type: SchemaType.NUMBER, description: "Grasas en gramos" },
                    analysis: { type: SchemaType.STRING, description: "Breve análisis nutricional (1-2 frases)" },
                },
                required: ["foodName", "calories", "protein", "carbs", "fat", "analysis"]
            };

            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: analysisSchema,
                }
            });

            const prompt = `Analiza esta imagen de comida. Identifica el plato y proporciona una estimación de sus valores nutricionales (calorías, proteínas, carbohidratos, grasas). Si hay varios alimentos, proporciona los valores totales combinados. Sé lo más preciso posible basándote en porciones típicas. Responde en español.`;
            const imagePart = await fileToGenerativePart(analyzerImageFile);
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const data = JSON.parse(response.text());
            setAnalysisResult(data);

        } catch (error) {
            console.error("Error al analizar la comida:", error);
            alert("Error al analizar la imagen. Intenta de nuevo.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddToLog = () => {
        if (!analysisResult) return;
        addEntry({
            mealType: selectedMealType,
            foodName: analysisResult.foodName,
            calories: analysisResult.calories,
            protein: analysisResult.protein,
            carbs: analysisResult.carbs,
            fat: analysisResult.fat,
            imageUrl: analyzerImageBase64 || undefined,
        });
        // Reset
        setAnalysisResult(null);
        setAnalyzerImageFile(null);
        setAnalyzerImageBase64(null);
        if (analyzerFileInputRef.current) analyzerFileInputRef.current.value = '';
        alert('¡Registrado correctamente!');
    };

    // Get Summary based on period
    const currentSummary = useMemo(() => {
        switch (summaryPeriod) {
            case 'week': return { ...weeklySummary, label: 'Última Semana' };
            case 'month': return { ...monthlySummary, label: 'Último Mes' };
            default: return { ...todaySummary, totalCalories: todaySummary.totalCalories, totalProtein: todaySummary.totalProtein, totalCarbs: todaySummary.totalCarbs, totalFat: todaySummary.totalFat, label: 'Hoy' };
        }
    }, [summaryPeriod, todaySummary, weeklySummary, monthlySummary]);

    const mealTypeLabels: Record<string, string> = { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Snack' };

    // ============ RENDER ============
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Chef IA - Asistente de Nutrición</h2>

            {/* Main Tabs */}
            <div className="flex bg-slate-200 dark:bg-slate-700 rounded-full p-1 max-w-md">
                <button onClick={() => setMainTab('recetas')} className={`w-full py-2.5 rounded-full font-semibold transition-colors ${mainTab === 'recetas' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
                    🍳 Generar Recetas
                </button>
                <button onClick={() => setMainTab('analizador')} className={`w-full py-2.5 rounded-full font-semibold transition-colors ${mainTab === 'analizador' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
                    📊 Analizador
                </button>
            </div>

            <AnimatePresence mode="wait">
                {/* =============== RECETAS TAB =============== */}
                {mainTab === 'recetas' && (
                    <motion.div key="recetas" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 !p-6">
                                <form onSubmit={handleGenerateRecipe} className="space-y-6"> <h3 className="text-xl font-bold">Genera tu Receta</h3>
                                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-full p-1"> <button type="button" onClick={() => setInputMode('text')} className={`w-full py-2 rounded-full font-semibold transition-colors ${inputMode === 'text' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>Texto</button> <button type="button" onClick={() => setInputMode('image')} className={`w-full py-2 rounded-full font-semibold transition-colors ${inputMode === 'image' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>Imagen</button> </div>
                                    <AnimatePresence mode="wait">
                                        {inputMode === 'text' ? (<motion.div key="text-input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}> <label htmlFor="ingredients" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ingredientes Principales</label> <textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={4} className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: pollo, arroz, brócoli" /> </motion.div>) : (<motion.div key="image-input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}> <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sube una foto</label> <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-primary"> {imageBase64 ? (<div className="relative w-full h-full"> <img src={imageBase64} alt="Ingredientes" className="w-full h-full object-cover rounded-lg" /> <button type="button" onClick={(e) => { e.stopPropagation(); setImageBase64(null); setImageFile(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><FiX /></button> </div>) : (<div className="text-center text-slate-500"> <div className="mx-auto text-3xl flex justify-center"><FiCamera /></div> <p>Haz clic para subir</p> </div>)} <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" /> </div> </motion.div>)}
                                    </AnimatePresence>
                                    <div> <label htmlFor="diet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Dieta</label> <Select value={diet} onChange={(e) => setDiet(e.target.value)}> <option value="equilibrada">Equilibrada</option> <option value="baja en carbohidratos">Baja en Carbohidratos</option> <option value="vegetariana">Vegetariana</option> <option value="vegana">Vegana</option> <option value="alta en proteínas">Alta en Proteínas</option> </Select> </div>
                                    <Button type="submit" disabled={isLoading || (inputMode === 'text' && !ingredients) || (inputMode === 'image' && !imageFile)} className="w-full"> {isLoading ? 'Generando...' : 'Crear Receta'} </Button>
                                    {fatigueInfo.isHighFatigue && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg text-sm"> <FiAlertCircle className="flex-shrink-0" /> <span><strong>Modo Recuperación:</strong> Tu NS Pod detecta alta fatiga ({fatigueInfo.avgFatigue}%).</span> </motion.div>)}
                                </form>
                            </Card>
                            <div className="lg:col-span-2">
                                <AnimatePresence mode="wait">
                                    {!viewingRecipe && !isLoading && (<motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-card rounded-2xl p-8 text-center"> <div className="text-6xl mb-4">🍽️</div> <h3 className="text-2xl font-bold">Tu receta aparecerá aquí</h3> <p className="text-slate-500 dark:text-slate-400 mt-2">Introduce los ingredientes y deja que la IA cree algo delicioso.</p> </motion.div>)}
                                    {isLoading && (<motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-card rounded-2xl p-8"> <motion.div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> <p className="mt-4 font-semibold text-lg">Buscando la receta perfecta...</p> </motion.div>)}
                                    {viewingRecipe && (<motion.div key={viewingRecipe.nombre} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 h-full overflow-y-auto relative">
                                        <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-4 mb-6">
                                            <div> <h3 className="text-3xl font-bold mb-2">{viewingRecipe.nombre}</h3> <p className="text-slate-600 dark:text-slate-300">{viewingRecipe.descripcion}</p> </div>
                                            <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                                                <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-700/50">
                                                    <button onClick={() => handleShare('twitter')} title="Compartir en Twitter" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-[#1DA1F2]"><FaTwitter /></button>
                                                    <button onClick={() => handleShare('facebook')} title="Compartir en Facebook" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-[#1877F2]"><FaFacebook /></button>
                                                    <button onClick={() => handleShare('whatsapp')} title="Compartir en WhatsApp" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-[#25D366]"><FaWhatsapp /></button>
                                                </div>
                                                <Button onClick={handleSaveRecipe} icon={FiSave} className="!py-2 !px-4 text-sm">Guardar</Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-6 mb-6 text-center"> <div><p className="font-bold text-lg">{viewingRecipe.tiempo}</p><p className="text-sm text-slate-500">Tiempo</p></div> <div><p className="font-bold text-lg">{viewingRecipe.porciones}</p><p className="text-sm text-slate-500">Porciones</p></div> </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div> <h4 className="text-xl font-bold mb-3">Ingredientes</h4> <ul className="space-y-2"> {viewingRecipe.ingredientes.map((ing: string, i: number) => <li key={i} className="flex items-start gap-2"><span className="text-primary mt-1 shrink-0 flex items-center"><FiChevronsRight /></span><span>{ing}</span></li>)} </ul> </div>
                                            <div> <h4 className="text-xl font-bold mb-3">Instrucciones</h4> <ol className="space-y-3"> {viewingRecipe.instrucciones.map((step: string, i: number) => <li key={i} className="flex items-start gap-3"><div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div><span>{step}</span></li>)} </ol> </div>
                                        </div>
                                        <div className="mt-8 p-4 bg-primary/10 rounded-lg"> <h4 className="font-bold text-primary mb-1">Consejo del Chef IA</h4> <p className="text-sm text-primary/80">{viewingRecipe.consejo}</p> </div>
                                    </motion.div>)}
                                </AnimatePresence>
                            </div>
                        </div>
                        <Card className="lg:col-span-3 !p-6"> <h3 className="text-xl font-bold mb-4">Recetas Guardadas</h3> {savedRecipes.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> {savedRecipes.map((r, i) => (<motion.div key={i} className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex flex-col justify-between" whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} > <div className="cursor-pointer" onClick={() => setViewingRecipe(r)}> <p className="font-bold text-primary">{r.nombre}</p> <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{r.tiempo}</p> </div> <div className="flex justify-end mt-2"> <button onClick={() => handleDeleteRecipe(r.nombre)} className="p-1 text-slate-400 hover:text-red-500 rounded-full"><FiTrash2 size={14} /></button> </div> </motion.div>))} </div>) : (<p className="text-slate-500 dark:text-slate-400">No tienes recetas guardadas.</p>)} </Card>
                    </motion.div>
                )}

                {/* =============== ANALIZADOR TAB =============== */}
                {mainTab === 'analizador' && (
                    <motion.div key="analizador" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Analyzer Input */}
                            <Card className="lg:col-span-1 !p-6 space-y-5">
                                <h3 className="text-xl font-bold flex items-center gap-2"><FiCamera className="text-emerald-500" /> Analizar Comida</h3>
                                <div onClick={() => analyzerFileInputRef.current?.click()} className="w-full aspect-square bg-slate-100 dark:bg-slate-700/50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-emerald-500 transition-colors">
                                    {analyzerImageBase64 ? (
                                        <div className="relative w-full h-full">
                                            <img src={analyzerImageBase64} alt="Comida" className="w-full h-full object-cover rounded-xl" />
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setAnalyzerImageBase64(null); setAnalyzerImageFile(null); setAnalysisResult(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"><FiX /></button>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500 p-4">
                                            <FiCamera size={40} className="mx-auto mb-2 text-emerald-500" />
                                            <p className="font-semibold">Sube foto de tu comida</p>
                                            <p className="text-xs mt-1">La IA identificará los nutrientes</p>
                                        </div>
                                    )}
                                    <input type="file" ref={analyzerFileInputRef} onChange={handleAnalyzerImageChange} accept="image/*" className="hidden" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Comida</label>
                                    <Select value={selectedMealType} onChange={(e) => setSelectedMealType(e.target.value as any)}>
                                        <option value="breakfast">🌅 Desayuno</option>
                                        <option value="lunch">☀️ Almuerzo</option>
                                        <option value="dinner">🌙 Cena</option>
                                        <option value="snack">🍎 Snack</option>
                                    </Select>
                                </div>

                                <Button onClick={handleAnalyzeFood} disabled={isAnalyzing || !analyzerImageFile} className="w-full !bg-emerald-500 hover:!bg-emerald-600">
                                    {isAnalyzing ? 'Analizando...' : '🔍 Analizar Imagen'}
                                </Button>
                            </Card>

                            {/* Analysis Result / Placeholder */}
                            <Card className="lg:col-span-2 !p-6">
                                <AnimatePresence mode="wait">
                                    {isAnalyzing && (
                                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[300px] flex flex-col items-center justify-center">
                                            <motion.div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                            <p className="mt-4 font-semibold text-lg">Identificando alimentos...</p>
                                        </motion.div>
                                    )}
                                    {!isAnalyzing && !analysisResult && (
                                        <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
                                            <FiPieChart size={50} className="text-slate-300 dark:text-slate-600 mb-4" />
                                            <h3 className="text-xl font-bold text-slate-500">Resultado del Análisis</h3>
                                            <p className="text-slate-400 mt-2">Sube una foto y pulsa "Analizar" para ver los nutrientes.</p>
                                        </motion.div>
                                    )}
                                    {!isAnalyzing && analysisResult && (
                                        <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-emerald-500 font-bold">Alimento Detectado</p>
                                                    <h3 className="text-2xl font-bold">{analysisResult.foodName}</h3>
                                                </div>
                                                <Button onClick={handleAddToLog} icon={FiPlusCircle} className="!bg-emerald-500 hover:!bg-emerald-600">
                                                    Añadir a Registro
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-xl text-center">
                                                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{analysisResult.calories}</p>
                                                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase">Kcal</p>
                                                </div>
                                                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl text-center">
                                                    <p className="text-2xl font-black text-red-600 dark:text-red-400">{analysisResult.protein}g</p>
                                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase">Proteína</p>
                                                </div>
                                                <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-xl text-center">
                                                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{analysisResult.carbs}g</p>
                                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase">Carbos</p>
                                                </div>
                                                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl text-center">
                                                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{analysisResult.fat}g</p>
                                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">Grasas</p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                <p className="text-sm text-emerald-800 dark:text-emerald-200"><strong>Análisis:</strong> {analysisResult.analysis}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </div>

                        {/* Nutrition Summary */}
                        <Card className="!p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2"><FiBarChart2 className="text-emerald-500" /> Resumen Nutricional</h3>
                                <div className="flex bg-slate-200 dark:bg-slate-700 rounded-full p-1">
                                    <button onClick={() => setSummaryPeriod('today')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${summaryPeriod === 'today' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>Hoy</button>
                                    <button onClick={() => setSummaryPeriod('week')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${summaryPeriod === 'week' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>Semana</button>
                                    <button onClick={() => setSummaryPeriod('month')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${summaryPeriod === 'month' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>Mes</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-5 rounded-xl text-center shadow-lg">
                                    <p className="text-3xl font-black">{currentSummary.totalCalories}</p>
                                    <p className="text-xs font-semibold opacity-80 uppercase">Calorías Totales</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-5 rounded-xl text-center shadow-lg">
                                    <p className="text-3xl font-black">{currentSummary.totalProtein}g</p>
                                    <p className="text-xs font-semibold opacity-80 uppercase">Proteína</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white p-5 rounded-xl text-center shadow-lg">
                                    <p className="text-3xl font-black">{currentSummary.totalCarbs}g</p>
                                    <p className="text-xs font-semibold opacity-80 uppercase">Carbohidratos</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-5 rounded-xl text-center shadow-lg">
                                    <p className="text-3xl font-black">{currentSummary.totalFat}g</p>
                                    <p className="text-xs font-semibold opacity-80 uppercase">Grasas</p>
                                </div>
                            </div>

                            {/* Recent Entries (Today) */}
                            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Registros de Hoy</h4>
                            {todaySummary.entries.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {todaySummary.entries.map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {entry.imageUrl && <img src={entry.imageUrl} alt={entry.foodName} className="w-10 h-10 rounded-lg object-cover" />}
                                                <div>
                                                    <p className="font-semibold text-sm">{entry.foodName}</p>
                                                    <p className="text-xs text-slate-500">{mealTypeLabels[entry.mealType]} • {entry.calories} kcal</p>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteEntry(entry.id)} className="text-slate-400 hover:text-red-500 p-1"><FiTrash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm">No hay registros para hoy. ¡Sube una foto de tu comida!</p>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
});

export default ChefAI;

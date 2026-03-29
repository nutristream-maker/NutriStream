import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiActivity, FiHeart } from 'react-icons/fi';
import { GiWeightLiftingUp, GiBodyBalance } from 'react-icons/gi';
import WorkoutLogForm from '../forms/WorkoutLogForm';
import WeightLogForm from '../forms/WeightLogForm';
import BiometricLogForm from '../forms/BiometricLogForm';

interface QuickLogWidgetProps {
    onSaveWorkout: (data: any) => Promise<void>;
    onSaveWeight: (data: any) => Promise<void>;
    onSaveBiometric: (data: any) => Promise<void>;
    previousWeight?: number;
}

const QuickLogWidget: React.FC<QuickLogWidgetProps> = ({
    onSaveWorkout,
    onSaveWeight,
    onSaveBiometric,
    previousWeight
}) => {
    const [activeForm, setActiveForm] = useState<'workout' | 'weight' | 'biometric' | null>(null);

    const logOptions = [
        {
            id: 'workout',
            icon: GiWeightLiftingUp,
            label: 'Entrenamiento',
            description: 'Registrar sesión',
            gradient: 'from-cyan-500 to-blue-600',
            bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
            border: 'border-cyan-500/30'
        },
        {
            id: 'weight',
            icon: GiBodyBalance,
            label: 'Peso',
            description: 'Actualizar peso',
            gradient: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            border: 'border-emerald-500/30'
        },
        {
            id: 'biometric',
            icon: FiHeart,
            label: 'Salud',
            description: 'Datos biométricos',
            gradient: 'from-violet-500 to-purple-600',
            bg: 'bg-violet-500/10 hover:bg-violet-500/20',
            border: 'border-violet-500/30'
        }
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                            <FiPlus className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Registro Rápido</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Añade datos de tu progreso</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {logOptions.map((option, index) => (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setActiveForm(option.id as any)}
                            className={`p-4 rounded-xl border ${option.border} ${option.bg} transition-all group`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                <option.icon className="text-white text-xl" />
                            </div>
                            <p className="font-semibold text-slate-800 dark:text-white text-xs md:text-sm truncate w-full">{option.label}</p>
                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate w-full">{option.description}</p>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Forms */}
            <WorkoutLogForm
                isOpen={activeForm === 'workout'}
                onClose={() => setActiveForm(null)}
                onSave={onSaveWorkout}
            />
            <WeightLogForm
                isOpen={activeForm === 'weight'}
                onClose={() => setActiveForm(null)}
                onSave={onSaveWeight}
                previousWeight={previousWeight}
            />
            <BiometricLogForm
                isOpen={activeForm === 'biometric'}
                onClose={() => setActiveForm(null)}
                onSave={onSaveBiometric}
            />
        </>
    );
};

export default QuickLogWidget;

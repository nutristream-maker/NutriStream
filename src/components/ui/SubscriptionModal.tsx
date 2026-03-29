import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { Card, Button } from './Shared';

const subscriptionPlans = [
    { id: 'basico', name: 'Básico', price: 0, priceAnnual: 0, description: 'Empieza a registrar tu bienestar y accede a funciones esenciales.', features: ['Seguimiento de 4 métricas', 'Acceso limitado a Chef IA', 'Análisis corporal básico', 'Sincronización con 1 dispositivo',], },
    { id: 'plus', name: 'Plus', price: 9.99, priceAnnual: 99.99, description: 'Desbloquea análisis avanzados y personalización.', features: ['Seguimiento de métricas ilimitado', 'Uso completo de Chef IA', 'Análisis corporal 2D interactivo', 'Sincronización hasta 3 dispositivos', 'Contenido de especialistas', 'Soporte prioritario',], highlight: true, },
    { id: 'premium', name: 'Premium', price: 19.99, priceAnnual: 199.99, description: 'La experiencia completa con acceso total y soporte exclusivo.', features: ['Todo lo del plan Plus', 'Chat directo con especialistas', 'Planes de entrenamiento personalizados', 'Descuentos exclusivos en Marketplace', 'Soporte 24/7',], },
];

const SubscriptionModal: React.FC<{ onClose: () => void, currentUserPlan: string }> = ({ onClose, currentUserPlan }) => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 text-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-3xl font-bold">Elige tu Plan Ideal</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Desbloquea tu máximo potencial con el plan que mejor se adapte a ti.</p>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FiX /></button>
                </div>

                <div className="p-6 flex justify-center">
                    <div className="flex items-center gap-4 p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                        <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
                            Mensual
                        </button>
                        <button onClick={() => setBillingCycle('annual')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors relative ${billingCycle === 'annual' ? 'bg-primary text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
                            Anual
                            <span className="absolute -top-2 -right-2 text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">Ahorra 16%</span>
                        </button>
                    </div>
                </div>

                <div className="flex-grow p-8 pt-0 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        {subscriptionPlans.map(plan => (
                            <Card key={plan.id} className={`flex flex-col !p-8 ${plan.highlight ? 'border-2 border-primary' : ''}`}>
                                {plan.highlight && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">Más Popular</span>}
                                <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
                                <p className="text-center text-slate-500 dark:text-slate-400 text-sm h-12 mt-2">{plan.description}</p>
                                <div className="text-center my-6">
                                    <span className="text-5xl font-extrabold">
                                        ${billingCycle === 'monthly' ? plan.price : (plan.priceAnnual / 12).toFixed(2)}
                                    </span>
                                    <span className="text-slate-500">/mes</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-green-500 mt-1 shrink-0"><FiCheckCircle /></span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                {plan.id === currentUserPlan ? (
                                    <Button disabled variant="secondary" className="w-full mt-auto">Tu Plan Actual</Button>
                                ) : (
                                    <Button className="w-full mt-auto">
                                        {plan.price === 0 ? 'Empezar Gratis' : `Actualizar a ${plan.name}`}
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SubscriptionModal;

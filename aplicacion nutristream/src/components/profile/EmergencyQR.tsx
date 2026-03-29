import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import { Card } from '../ui/Shared';

interface EmergencyData {
    name: string;
    bloodType: string;
    allergies: string[];
    emergencyContact: string;
    conditions: string[];
}

const EmergencyQR: React.FC<{ data: EmergencyData }> = ({ data }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <Card className="!p-8 flex flex-col items-center justify-center text-center bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/50">
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm relative overflow-hidden">
                <div className={`transition-all duration-300 w-48 h-48 bg-slate-900 flex items-center justify-center ${isVisible ? 'blur-0' : 'blur-xl opacity-50'}`}>
                    <BsQrCode className="text-white text-9xl" />
                </div>
                {!isVisible && (
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30">
                        <FiShield className="text-slate-600 text-6xl" />
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tarjeta SOS Digital</h3>
            <p className="text-slate-500 mb-6 max-w-sm">
                Muestra este código a los servicios de emergencia para compartir rápidamente tus datos vitales y alergias.
            </p>

            <button
                onClick={() => setIsVisible(!isVisible)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-colors shadow-lg shadow-red-500/30"
            >
                {isVisible ? <><FiEyeOff /> Ocultar Código</> : <><FiEye /> Mostrar Código SOS</>}
            </button>
        </Card>
    );
};

export default EmergencyQR;

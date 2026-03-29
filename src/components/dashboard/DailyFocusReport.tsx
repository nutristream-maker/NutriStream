import React from 'react';
import { Card, Button } from '../ui/Shared';
import { FiTarget, FiCheckCircle } from 'react-icons/fi';

import { useLanguage } from '../../context/LanguageContext';

const DailyFocusReport: React.FC<{ userData: any }> = ({ userData }) => {
    const { t } = useLanguage();
    return (
        <Card className="mb-8 !p-6 bg-gradient-to-r from-primary to-secondary text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="text-9xl text-white transform rotate-12 inline-block"><FiTarget /></span>
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{t('informeDiario')}</h2>
                        <p className="text-blue-100">{t('basadoEnObjetivos')}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <span className="font-bold text-2xl">{userData.wellnessScore}</span>
                        <span className="text-xs block text-blue-100">Wellness Score</span>
                    </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20 mb-6">
                    <p className="text-lg font-medium leading-relaxed">
                        "Hoy tu recuperación es alta en el tren superior. Es el día perfecto para priorizar la <span className="font-bold text-white border-b-2 border-white/50">Hipertrofia de Pectoral y Tríceps</span>. Mantén la intensidad alta."
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" className="!bg-white !text-primary hover:!bg-blue-50">{t('verSesion')}</Button>
                    <Button variant="secondary" className="!bg-transparent !text-white border border-white/30 hover:!bg-white/10">{t('ajustarObjetivo')}</Button>
                </div>
            </div>
        </Card>
    );
};

export default DailyFocusReport;

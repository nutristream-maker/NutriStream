import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWatch, FiCpu, FiX, FiEye, FiWind, FiBluetooth } from 'react-icons/fi';
import { FaApple, FaGoogle, FaShoePrints } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { Card, Button } from '../ui/Shared';

const ConnectivityModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('wearables');

    const tabs = [
        { id: 'wearables', label: 'Wearables', icon: <FiWatch /> },
        { id: 'hardware', label: 'Hardware NutriStream', icon: <FiCpu /> },
    ];

    const handleManageDevice = (path: string) => {
        navigate(`/${path}`);
        onClose();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'wearables':
                return (
                    <motion.div key="wearables" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-bold mb-4">Conecta tus Wearables</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border dark:border-slate-700 rounded-lg text-center flex flex-col items-center justify-between"><div className="text-4xl mb-2"><FaApple /></div><p>Apple Health</p><Button className="w-full mt-2 text-sm py-2">Conectar</Button></div>
                            <div className="p-4 border dark:border-slate-700 rounded-lg text-center flex flex-col items-center justify-between"><div className="text-4xl mb-2"><FiWatch /></div><p>Garmin</p><Button className="w-full mt-2 text-sm py-2">Conectar</Button></div>
                            <div className="p-4 border dark:border-slate-700 rounded-lg text-center flex flex-col items-center justify-between"><div className="text-4xl mb-2"><FaGoogle /></div><p>Fitbit</p><Button className="w-full mt-2 text-sm py-2">Conectar</Button></div>
                            <div className="p-4 border dark:border-slate-700 rounded-lg text-center flex flex-col items-center justify-between"><div className="text-4xl mb-2">⌚</div><p>Samsung Health</p><Button className="w-full mt-2 text-sm py-2">Conectar</Button></div>
                        </div>
                    </motion.div>
                );
            case 'hardware':
                return (
                    <motion.div key="hardware" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-bold mb-4">Conecta Dispositivos Propietarios</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Gestiona tu ecosistema de hardware NutriStream.</p>
                        <div className="space-y-3">
                            <Card className="!p-3 flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-2"><GiMuscleUp /> Neural-Skin POD</span>
                                <Button onClick={() => handleManageDevice('ns-pod')} className="!py-1 !px-3 text-xs">Gestionar</Button>
                            </Card>
                            <Card className="!p-3 flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-2"><FiEye /> Gafas AeroVision</span>
                                <Button onClick={() => handleManageDevice('aerovision')} className="!py-1 !px-3 text-xs">Gestionar</Button>
                            </Card>
                            <Card className="!p-3 flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-2"><FiWind /> Máscara AeroLung</span>
                                <Button onClick={() => handleManageDevice('aerolung')} className="!py-1 !px-3 text-xs">Gestionar</Button>
                            </Card>
                            <Card className="!p-3 flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-2"><FaShoePrints /> Plantillas GroundTruth</span>
                                <Button onClick={() => handleManageDevice('groundtruth')} className="!py-1 !px-3 text-xs">Gestionar</Button>
                            </Card>
                        </div>
                        <Button variant="secondary" className="w-full mt-6" icon={FiBluetooth}>Buscar nuevos dispositivos</Button>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold">Conexiones de Dispositivos</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FiX /></button>
                </div>
                <div className="flex p-6 gap-6">
                    <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 pr-6">
                        <ul className="space-y-2">
                            {tabs.map(tab => (
                                <li
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeTab === tab.id ? 'bg-primary/20 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                >
                                    {tab.icon}
                                    <span className="font-semibold">{tab.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-2/3">
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConnectivityModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiDownload, FiAlertTriangle, FiUser, FiFileText, FiShield, FiActivity, FiCheckCircle, FiX, FiClock, FiGrid, FiTrendingUp } from 'react-icons/fi';
import { Card, Button } from '../ui/Shared';
import { mockMedicalData, mockSpecialists, initialUserData, mockRecoveryData } from '../../data/mockData';
import { Specialist } from '../../types';

// New Components
import MedicalTimeline from './MedicalTimeline';
import AnalyticsInsights from './AnalyticsInsights';
import EmergencyQR from './EmergencyQR';
import DocumentManager from './DocumentManager';

const ShareHistoryModal: React.FC<{ onClose: () => void, specialists: Specialist[] }> = ({ onClose, specialists }) => {
    const [selectedIds, setSelectedIds] = useState(new Set<number>());
    const [isShared, setIsShared] = useState(false);
    const handleToggleConnection = (id: number) => { setSelectedIds(prev => { const newSet = new Set(prev); if (newSet.has(id)) { newSet.delete(id); } else { newSet.add(id); } return newSet; }); };
    const handleShare = () => { if (selectedIds.size === 0) return; setIsShared(true); setTimeout(() => { onClose(); }, 2500); };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()} >
                <AnimatePresence mode="wait">
                    {isShared ? (<motion.div key="confirmation" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center text-center p-12 h-80" > <div className="text-6xl text-green-500 mb-4 flex justify-center"><FiCheckCircle /></div> <h2 className="text-2xl font-bold">¡Historial Compartido!</h2> <p className="text-slate-600 dark:text-slate-300 mt-2"> Tu historial médico ha sido enviado de forma segura a los especialistas seleccionados. </p> </motion.div>) : (<motion.div key="selection" className="flex flex-col h-full"> <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700"> <h2 className="text-2xl font-bold">Compartir Historial Médico</h2> <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FiX /></button> </div> <div className="flex-grow p-6 overflow-y-auto"> <p className="text-slate-500 dark:text-slate-400 mb-4">Selecciona con qué especialistas quieres compartir de forma segura tu información médica.</p> <div className="space-y-3"> {specialists.map(specialist => (<label key={specialist.id} className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all border-2 ${selectedIds.has(specialist.id) ? 'border-primary bg-primary/10' : 'border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}> <input type="checkbox" checked={selectedIds.has(specialist.id)} onChange={() => handleToggleConnection(specialist.id)} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary shrink-0" /> <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-primary shrink-0"> {specialist.name.split(' ').map(n => n[0]).slice(1).join('')} </div> <div className="flex-grow"> <p className="font-bold">{specialist.name}</p> <p className="text-sm text-slate-500 dark:text-slate-400">{specialist.specialty}</p> </div> </label>))} </div> </div> <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4"> <Button onClick={onClose} variant="secondary">Cancelar</Button> <Button onClick={handleShare} disabled={selectedIds.size === 0} icon={FiShare2}> Compartir ({selectedIds.size}) </Button> </div> </motion.div>)}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LOGO_BASE64 } from '../../assets/LogoBase64';

const HistorialMedico: React.FC<{}> = React.memo(() => {
    // @ts-ignore
    const { personal, history, allergies, analytics, healthAlert, vaccinations, medications, familyHistory, documents, analyticsHistory } = mockMedicalData;
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'timeline' | 'analiticas' | 'documentos' | 'sos'>('general');

    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();

            // Colors
            const PRIMARY_COLOR: [number, number, number] = [15, 23, 42]; // Slate 900
            const ACCENT_COLOR: [number, number, number] = [16, 185, 129]; // Emerald 500
            const TEXT_COLOR: [number, number, number] = [51, 65, 85]; // Slate 700
            const LIGHT_TEXT_COLOR: [number, number, number] = [100, 116, 139]; // Slate 500

            // --- HEADER ---
            // Dark Sidebar/Header Background
            doc.setFillColor(...PRIMARY_COLOR);
            doc.rect(0, 0, 210, 40, 'F');

            // Logo (White Version)
            try {
                doc.addImage(LOGO_BASE64, 'JPEG', 15, 5, 30, 30);
            } catch (e) {
                console.warn("Logo add failed", e);
            }

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("HISTORIAL MÉDICO", 60, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(203, 213, 225); // Slate 300
            doc.text("INFORME INTEGRAL DE SALUD NUTRISTREAM", 60, 28);
            doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, 5)}`, 150, 28);

            let finalY = 55;

            // --- PACIENTE INFO (Grid Layout) ---
            doc.setFontSize(10);
            doc.setTextColor(...TEXT_COLOR);

            const col1X = 15;
            const col2X = 80;
            const col3X = 140;

            // Row 1
            doc.setFont(undefined, 'bold'); doc.text("PACIENTE", col1X, finalY);
            doc.setFont(undefined, 'normal'); doc.text(personal.name || 'Usuario NutriStream', col1X, finalY + 5);

            doc.setFont(undefined, 'bold'); doc.text("EDAD / SEXO", col2X, finalY);
            doc.setFont(undefined, 'normal'); doc.text(`${personal.age || 'N/A'}`, col2X, finalY + 5);

            doc.setFont(undefined, 'bold'); doc.text("ID USUARIO", col3X, finalY);
            doc.setFont(undefined, 'normal'); doc.text(`NS-${Math.floor(Math.random() * 10000)}`, col3X, finalY + 5);

            // Row 2
            finalY += 15;
            doc.setFont(undefined, 'bold'); doc.text("ALTURA / PESO", col1X, finalY);
            doc.setFont(undefined, 'normal'); doc.text(`${personal.height} / ${personal.weight}`, col1X, finalY + 5);

            doc.setFont(undefined, 'bold'); doc.text("GRUPO SANGUÍNEO", col2X, finalY);
            doc.setFont(undefined, 'normal'); doc.text(personal.bloodType || 'N/A', col2X, finalY + 5);

            doc.setFont(undefined, 'bold'); doc.text("ALERGIAS", col3X, finalY);
            const allergiesText = allergies.length > 0 ? allergies.map((a: any) => a.name).join(", ") : "Ninguna conocida";
            doc.setFont(undefined, 'normal'); doc.text(allergiesText, col3X, finalY + 5);

            // Line Separator
            finalY += 15;
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.line(15, finalY, 195, finalY);
            finalY += 10;

            // --- SECTION HELPER ---
            const addSectionHeader = (title: string, y: number) => {
                doc.setFillColor(241, 245, 249); // Slate 100
                doc.roundedRect(15, y - 6, 180, 8, 1, 1, 'F');
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(...PRIMARY_COLOR);
                doc.text(title.toUpperCase(), 20, y);
                return y + 15;
            };

            // --- 1. RESUMEN DE ESTADO FÍSICO (NUEVO) ---
            finalY = addSectionHeader("Estado Físico Actual", finalY);

            const stats = initialUserData.stats;
            const goals = initialUserData.monthlyGoals;

            // Vitals Grid
            const vitals = [
                { label: "Frec. Cardíaca", val: `${stats.heartRate} bpm` },
                { label: "Pasos (Hoy)", val: stats.steps.toLocaleString() },
                { label: "Calorías (Hoy)", val: `${stats.calories} kcal` },
                { label: "Sueño (Avg)", val: `${stats.sleep} hrs` },
            ];

            vitals.forEach((v, i) => {
                const x = 15 + (i * 45);
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(226, 232, 240);
                doc.roundedRect(x, finalY, 40, 20, 2, 2, 'FD');

                doc.setFontSize(8);
                doc.setTextColor(...LIGHT_TEXT_COLOR);
                doc.text(v.label, x + 5, finalY + 6);

                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(...TEXT_COLOR);
                doc.text(v.val, x + 5, finalY + 15);
            });

            finalY += 30;

            // Goals Bars
            doc.setFontSize(9);
            doc.setTextColor(...TEXT_COLOR);
            doc.setFont(undefined, 'bold');
            doc.text("Progreso de Objetivos:", 15, finalY);
            finalY += 5;

            const drawGoalBar = (label: string, current: number, goal: number, y: number, color: [number, number, number]) => {
                doc.setFontSize(8);
                doc.setFont(undefined, 'normal');
                doc.text(label, 15, y);

                // Bg Bar
                doc.setFillColor(226, 232, 240);
                doc.roundedRect(60, y - 3, 100, 4, 1, 1, 'F');

                // Progress Bar
                const pct = Math.min(1, current / goal);
                doc.setFillColor(...color);
                doc.roundedRect(60, y - 3, 100 * pct, 4, 1, 1, 'F');

                doc.text(`${current} / ${goal}`, 165, y);
            };

            drawGoalBar("Masa Muscular (kg)", goals.muscleMass.current, goals.muscleMass.goal, finalY, [16, 185, 129]);
            finalY += 8;
            drawGoalBar("VO2 Max", goals.vo2Max.current, goals.vo2Max.goal, finalY, [59, 130, 246]); // Blue
            finalY += 8;
            drawGoalBar("Adherencia Plan (%)", 87, 100, finalY, [249, 115, 22]); // Orange

            finalY += 20;


            // --- 2. RECUPERACIÓN MUSCULAR (NUEVO) ---
            finalY = addSectionHeader("Recuperación Muscular", finalY);

            const musclKeys = Object.keys(mockRecoveryData).slice(0, 8);

            let mRow = 0;
            let mCol = 0;
            musclKeys.forEach((key, i) => {
                if (i > 0 && i % 4 === 0) {
                    mRow++;
                    mCol = 0;
                }
                const data = mockRecoveryData[key];
                const x = 15 + (mCol * 45);
                const y = finalY + (mRow * 15);

                doc.setFontSize(9);
                doc.setFont(undefined, 'bold');
                doc.text(key, x, y);

                // Recovery Bar
                doc.setFillColor(226, 232, 240);
                doc.rect(x, y + 2, 35, 3, 'F');

                let rColor: [number, number, number] = [16, 185, 129];
                if (data.recovery < 40) rColor = [239, 68, 68];
                else if (data.recovery < 70) rColor = [234, 179, 8];

                doc.setFillColor(...rColor);
                doc.rect(x, y + 2, 35 * (data.recovery / 100), 3, 'F');

                doc.setFontSize(7);
                doc.setFont(undefined, 'normal');
                doc.text(`${data.recovery}%`, x + 37, y + 4.5);

                mCol++;
            });

            finalY += (mRow + 1) * 15 + 10;

            // Check Page break
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }

            // --- 3. ANALÍTICAS RECIENTES ---
            finalY = addSectionHeader("Últimas Analíticas", finalY);

            autoTable(doc, {
                startY: finalY,
                head: [['Analito', 'Valor', 'Rango Ref.', 'Estado']],
                body: analytics.map((item: any) => [item.name, item.value, item.range, item.status]),
                theme: 'striped',
                headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
                columnStyles: {
                    0: { fontStyle: 'bold' },
                    3: { halign: 'center', fontStyle: 'bold' }
                },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 3) {
                        const status = data.cell.raw;
                        if (status === 'Alto') data.cell.styles.textColor = [220, 38, 38];
                        else if (status === 'Bajo') data.cell.styles.textColor = [202, 138, 4];
                        else data.cell.styles.textColor = [22, 163, 74];
                    }
                }
            });

            finalY = (doc as any).lastAutoTable.finalY + 15;

            // --- 4. HISTORIAL CLÍNICO & VACUNACIÓN ---
            if (finalY > 230) { doc.addPage(); finalY = 20; }

            finalY = addSectionHeader("Antecedentes y Vacunación", finalY);

            autoTable(doc, {
                startY: finalY,
                head: [['Condición', 'Fecha', 'Estado']],
                body: history.map((item: any) => [item.condition, item.date, item.status]),
                theme: 'grid',
                headStyles: { fillColor: [71, 85, 105] },
                styles: { fontSize: 8 }
            });

            finalY = (doc as any).lastAutoTable.finalY + 10;

            if (vaccinations) {
                autoTable(doc, {
                    startY: finalY,
                    head: [['Vacuna', 'Fecha', 'Vencimiento']],
                    body: vaccinations.map((vac: any) => [vac.name, vac.date, vac.status]),
                    theme: 'grid',
                    headStyles: { fillColor: [71, 85, 105] },
                    styles: { fontSize: 8 }
                });
                finalY = (doc as any).lastAutoTable.finalY + 10;
            }

            // --- FOOTER ---
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(...LIGHT_TEXT_COLOR);
                doc.text(`NutriStream Digital Health - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
            }

            doc.save(`NutriStream_Reporte_${(personal.name || 'Usuario').replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            alert("Error al generar el PDF. Por favor intente nuevamente. Detalles: " + (error.message || error));
        }
    };

    const AnalyticStatus: React.FC<{ status: string }> = ({ status }) => { const styles: any = { Normal: 'text-green-500', Bajo: 'text-yellow-500', Alto: 'text-red-500', }; return <span className={`font-bold ${styles[status]}`}>{status}</span>; };

    const tabs = [
        { id: 'general', label: 'Resumen General', icon: FiGrid },
        { id: 'timeline', label: 'Timeline', icon: FiClock },
        { id: 'analiticas', label: 'Evolución', icon: FiTrendingUp },
        { id: 'documentos', label: 'Documentos', icon: FiFileText },
        { id: 'sos', label: 'Tarjeta SOS', icon: FiShield },
    ];

    const emergencyData = {
        name: personal.name,
        bloodType: personal.bloodType,
        allergies: allergies.map((a: any) => a.name),
        emergencyContact: "+34 600 123 456", // Mock contact
        conditions: history.filter((h: any) => h.status !== 'Recuperado').map((h: any) => h.condition)
    };

    const timelineEvents = [
        ...history.map((h: any) => ({ date: h.date, title: h.condition, type: 'condition', status: h.status })),
        ...vaccinations.map((v: any) => ({ date: v.date, title: `Vacuna: ${v.name}`, type: 'vaccine', status: v.status })),
        // Add some checkups to timeline
        { date: '2023-11-20', title: 'Analítica General', type: 'checkup', description: 'Revisión anual rutinaria.' },
        { date: '2024-01-15', title: 'Visita Cardiología', type: 'checkup', description: 'Revisión post-esfuerzo.' }
    ];

    return (
        <>
            <AnimatePresence>
                {isShareModalOpen && <ShareHistoryModal onClose={() => setShareModalOpen(false)} specialists={mockSpecialists} />}
            </AnimatePresence>

            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                        Historial Médico Digital
                    </h2>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => setShareModalOpen(true)} icon={FiShare2} variant="secondary" className="!py-2 !px-4 text-sm">Compartir</Button>
                        <Button onClick={handleDownloadPDF} icon={FiDownload} className="!py-2 !px-4 text-sm">Descargar PDF</Button>
                    </div>
                </div>

                {/* TABS NAVIGATION */}
                <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide border-b border-slate-200 dark:border-slate-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                                ? 'border-primary text-primary bg-slate-50 dark:bg-slate-800/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <tab.icon />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <Card className="!bg-red-50 dark:!bg-red-900/30 border border-red-200 dark:border-red-800 !p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-red-500 text-3xl mt-1 shrink-0"><FiAlertTriangle /></div>
                                        <div>
                                            <h3 className="text-xl font-bold text-red-800 dark:text-red-300">{healthAlert.title}</h3>
                                            <p className="text-red-700 dark:text-red-400 mt-1">{healthAlert.message}</p>
                                            <ul className="mt-3 space-y-1 list-disc list-inside text-red-700 dark:text-red-400">
                                                {healthAlert.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-8">
                                        <Card className="!p-6">
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiUser /> Información Personal</h3>
                                            <div className="space-y-2">
                                                {Object.entries(personal).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between text-xs sm:text-sm">
                                                        <span className="text-slate-500 dark:text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                                                        <span className="font-semibold">{value as any}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>

                                        <Card className="!p-6">
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiFileText /> Antecedentes Familiares</h3>
                                            <div className="space-y-3">
                                                {familyHistory?.map((item: any, i: number) => (
                                                    <div key={i} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                                        <p className="font-semibold">{item.condition}</p>
                                                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <span>{item.relative}</span>
                                                            <span className="text-orange-500 font-bold">{item.risk}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card className="!p-6">
                                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiShield /> Vacunación</h3>
                                                <div className="space-y-3">
                                                    {vaccinations?.map((vac: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                                                            <div><p className="font-semibold">{vac.name}</p><p className="text-xs text-slate-500">{vac.date}</p></div>
                                                            <span className="text-green-600 dark:text-green-400 font-bold text-xs">{vac.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                            <Card className="!p-6">
                                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiActivity /> Medicación Activa</h3>
                                                <div className="space-y-3">
                                                    {medications?.map((med: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                                                            <div><p className="font-semibold">{med.name}</p><p className="text-xs text-slate-500">{med.dose} - {med.frequency}</p></div>
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{med.type}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>

                                        <Card className="!p-6">
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiActivity /> Últimas Analíticas</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                                                        <tr>
                                                            <th className="p-3">Analito</th>
                                                            <th className="p-3 text-right">Valor</th>
                                                            <th className="p-3 hidden sm:table-cell">Rango de Referencia</th>
                                                            <th className="p-3 text-right">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {analytics.map((item: any, i: number) => (
                                                            <tr key={i} className={`border-b border-slate-200 dark:border-slate-700 last:border-0 transition-colors ${item.status === 'Bajo' ? 'bg-yellow-50 dark:bg-yellow-900/30' : item.status === 'Alto' ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
                                                                <td className="p-3 font-semibold">{item.name}</td>
                                                                <td className="p-3 font-semibold text-right">{item.value}</td>
                                                                <td className="p-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{item.range}</td>
                                                                <td className="p-3 text-right"><AnalyticStatus status={item.status} /></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <MedicalTimeline events={timelineEvents} />
                        )}

                        {activeTab === 'analiticas' && (
                            <AnalyticsInsights history={analyticsHistory} />
                        )}

                        {activeTab === 'documentos' && (
                            <DocumentManager documents={documents || []} />
                        )}

                        {activeTab === 'sos' && (
                            <div className="flex justify-center">
                                <div className="w-full max-w-xl">
                                    <EmergencyQR data={emergencyData} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
});

export default HistorialMedico;

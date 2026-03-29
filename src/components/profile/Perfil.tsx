import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertTriangle, FiUser, FiCamera, FiChevronDown, FiShield, FiFileText, FiActivity, FiSave, FiEdit3, FiLogOut, FiCpu, FiHardDrive, FiStar, FiCreditCard, FiPlus, FiTrash2, FiCalendar, FiFilter, FiXCircle, FiDownload, FiPackage, FiTruck, FiMapPin, FiClock, FiGlobe, FiSmartphone, FiBell, FiMail, FiMoon, FiZap } from 'react-icons/fi';
import { Card, Button, Toggle } from '../ui/Shared';
import { mockOrderHistory } from '../../data/mockData';

const TwoFactorAuthModal: React.FC<{ onClose: () => void, onConfirm: () => void }> = ({ onClose, onConfirm }) => {
    const [code, setCode] = useState('');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()} >
                <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl font-bold">Configurar 2FA</h2> <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FiX /></button> </div>
                <div className="space-y-6"> <div className="flex items-start gap-3"> <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div> <p className="text-slate-600 dark:text-slate-300">Instala una app de autenticación (Google Authenticator, Authy, etc.).</p> </div> <div className="flex items-start gap-3"> <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div> <p className="text-slate-600 dark:text-slate-300">Escanea este código QR con tu aplicación.</p> </div> <div className="flex justify-center p-4 bg-white rounded-lg"> <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/NutriStream:alex.morgan@example.com?secret=JBSWY3DPEHPK3PXP&issuer=NutriStream" alt="QR Code para 2FA" /> </div> <div className="flex items-start gap-3"> <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div> <p className="text-slate-600 dark:text-slate-300">Introduce el código de 6 dígitos para verificar.</p> </div>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="123456" className="w-full p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-center font-bold text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary" />
                    <Button onClick={onConfirm} disabled={code.length !== 6} className="w-full" > Verificar y Activar </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const DeleteAccountModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const isConfirmed = confirmationText === 'ELIMINAR';
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()} >
                <div className="text-center"> <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full mx-auto flex items-center justify-center mb-4"> <div className="text-3xl text-red-500"><FiAlertTriangle /></div> </div> <h2 className="text-2xl font-bold mb-2">¿Estás seguro?</h2> <p className="text-slate-600 dark:text-slate-300 mb-4"> Esta acción es irreversible. Se eliminarán todos tus datos. </p> </div>
                <div className="space-y-4 mt-6"> <p className="text-sm text-center">Para confirmar, escribe <strong className="text-red-500">ELIMINAR</strong> en el campo.</p> <input type="text" value={confirmationText} onChange={(e) => setConfirmationText(e.target.value)} className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-bold tracking-widest" /> <div className="flex gap-4"> <Button onClick={onClose} variant="secondary" className="w-full">Cancelar</Button> <Button onClick={() => { alert('Cuenta eliminada.'); onClose(); }} disabled={!isConfirmed} className="w-full !bg-red-500 hover:!bg-red-600 focus:!ring-red-500 disabled:!bg-slate-300 dark:disabled:!bg-slate-600" > Eliminar mi cuenta </Button> </div> </div>
            </motion.div>
        </motion.div>
    )
};

const Select: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children?: React.ReactNode, className?: string }> = ({ value, onChange, children, className }) => {
    return (
        <div className={`relative ${className}`}>
            <select value={value} onChange={onChange} className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary" > {children} </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><FiChevronDown /></div>
        </div>
    );
};

const PaymentModal: React.FC<{ onClose: () => void, mode: 'add' | 'edit' }> = ({ onClose, mode }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 overflow-y-auto" onClick={onClose}>
            <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 500 }} className="bg-white dark:bg-slate-900 rounded-t-2xl rounded-b-none sm:rounded-2xl shadow-xl w-full max-w-md p-6 shrink-0 sm:max-h-[85vh] sm:overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{mode === 'add' ? 'Añadir Tarjeta' : 'Editar Tarjeta'}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FiX /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl text-white">
                            <p className="text-xs opacity-70 mb-6">Número de Tarjeta</p>
                            <p className="text-lg font-mono tracking-widest">{cardNumber || '•••• •••• •••• ••••'}</p>
                            <div className="flex justify-between mt-4">
                                <div><p className="text-xs opacity-70">Titular</p><p className="text-sm font-semibold">{name || 'TU NOMBRE'}</p></div>
                                <div><p className="text-xs opacity-70">Expira</p><p className="text-sm font-semibold">{expiry || 'MM/AA'}</p></div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número de Tarjeta</label>
                            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} placeholder="1234 5678 9012 3456" className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Titular</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} placeholder="NOMBRE APELLIDO" className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Expiración</label>
                                <input type="text" value={expiry} onChange={(e) => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2); setExpiry(v); }} placeholder="MM/AA" className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                                <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="•••" className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-center" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                            <Button onClick={() => { alert('Tarjeta guardada'); onClose(); }} className="flex-1">{mode === 'add' ? 'Añadir' : 'Guardar'}</Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import { useUI } from '../../context/UIContext';
import SubscriptionModal from '../ui/SubscriptionModal';
import SEO from '../common/SEO';

import { useSearchParams } from 'react-router-dom';

const Perfil: React.FC<{ setActivePage: (p: string) => void }> = ({ setActivePage }) => {
    const { language, setLanguage, t } = useLanguage();
    const { userData, setUserData } = useUser();
    const { setSubscriptionModalOpen } = useUI();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'cuenta');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isTwoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [isTwoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [billingFilter, setBillingFilter] = useState('all');

    const [formData, setFormData] = useState({ name: userData.name, email: userData.email, dob: userData.dob, height: userData.height, weight: userData.weight, });

    // Security Section State
    const [newPassword, setNewPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const calculateStrength = (pass: string) => {
        let strength = 0;
        if (pass.length > 7) strength++;
        if (pass.match(/[A-Z]/)) strength++;
        if (pass.match(/[0-9]/)) strength++;
        if (pass.match(/[^A-Za-z0-9]/)) strength++;
        setPasswordStrength(strength);
    };
    const loginHistory = [
        { id: 1, device: 'Chrome on Windows', location: 'Barcelona, España', ip: '192.168.1.1', date: 'Hace 2 minutos', current: true },
        { id: 2, device: 'NutriStream App on iPhone', location: 'Barcelona, España', ip: '192.168.1.1', date: 'Ayer, 18:30' },
        { id: 3, device: 'Safari on Mac', location: 'Madrid, España', ip: '10.0.0.1', date: '12 Oct, 2023' }
    ];

    // Notification State
    const [doNotDisturb, setDoNotDisturb] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState({ news: true, security: true, marketing: false });
    const [pushNotifications, setPushNotifications] = useState({ tips: true, goals: true, reminders: true });
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSaveChanges = (e: React.FormEvent) => { e.preventDefault(); setUserData(prev => ({ ...prev, ...formData })); alert('Perfil actualizado!'); };
    const handleTwoFactorToggle = () => { if (isTwoFactorEnabled) { setTwoFactorEnabled(false); } else { setTwoFactorModalOpen(true); } };
    const billingHistory = [{ id: 'inv_123', date: '2024-06-15', amount: '$19.99', status: 'Pagado' }, { id: 'inv_122', date: '2024-05-15', amount: '$19.99', status: 'Pagado' }, { id: 'inv_121', date: '2024-04-15', amount: '$19.99', status: 'Pagado' },];
    const TabButton: React.FC<{ id: string, label: string }> = ({ id, label }) => (<button onClick={() => setActiveTab(id)} className={`px-4 py-2 font-semibold rounded-lg transition-colors ${activeTab === id ? 'text-primary' : 'text-slate-500 hover:text-primary'}`} > {label} </button>);
    const InputField: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }> = ({ label, name, value, onChange, type = 'text' }) => (<div> <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label> <input type={type} id={name} name={name} value={value} onChange={onChange} className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /> </div>);

    const renderContent = () => {
        switch (activeTab) {
            case 'cuenta': return (<motion.div key="cuenta" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}> <form onSubmit={handleSaveChanges} className="space-y-6"> <h3 className="text-xl font-bold">{t('detallesCuenta')}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <InputField label={t('nombreCompleto')} name="name" value={formData.name} onChange={handleInputChange} /> <InputField label={t('correoElectronico')} name="email" value={formData.email} onChange={handleInputChange} type="email" /> <InputField label={t('fechaNacimiento')} name="dob" value={formData.dob} onChange={handleInputChange} type="date" /> <InputField label={t('altura')} name="height" value={formData.height} onChange={handleInputChange} /> <InputField label={t('peso')} name="weight" value={formData.weight} onChange={handleInputChange} /> <div> <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('idioma')}</label> <Select value={language} onChange={(e: any) => setLanguage(e.target.value)}> <option value="es">{t('espanol')}</option> <option value="en">{t('ingles')}</option> <option value="ca">{t('catalan')}</option> <option value="fr">{t('frances')}</option> </Select> </div> </div> <Button type="submit" className="w-full md:w-auto">{t('guardarCambios')}</Button> </form> </motion.div>);
            case 'seguridad': {
                return (
                    <motion.div key="seguridad" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        {/* Password Change Section */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiShield className="text-primary" /> {t('cambiarContrasena')}</h3>
                            <form className="space-y-5 max-w-lg">
                                <InputField label={t('contrasenaActual')} name="currentPassword" value="" onChange={() => { }} type="password" />
                                <div>
                                    <InputField
                                        label={t('nuevaContrasena')}
                                        name="newPassword"
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); calculateStrength(e.target.value); }}
                                        type="password"
                                    />
                                    {/* Strength Meter */}
                                    <div className="mt-2 flex gap-1 h-1.5 overflow-hidden rounded-full">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div key={level} className={`flex-1 transition-all duration-300 ${level <= passwordStrength ? (passwordStrength < 2 ? 'bg-red-500' : passwordStrength < 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-slate-200 dark:bg-slate-700'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 text-right">
                                        {passwordStrength === 0 ? '' : passwordStrength < 2 ? 'Débil' : passwordStrength < 3 ? 'Media' : passwordStrength < 4 ? 'Fuerte' : 'Muy Fuerte'}
                                    </p>
                                </div>
                                <InputField label={t('confirmarNuevaContrasena')} name="confirmPassword" value="" onChange={() => { }} type="password" />
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" variant="primary">{t('actualizarContrasena')}</Button>
                                </div>
                            </form>
                        </div>

                        {/* 2FA Section */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><FiSmartphone className="text-primary" /> {t('2fa')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mb-4">{t('2faDesc')}</p>
                                </div>
                                <Toggle isEnabled={isTwoFactorEnabled} onToggle={handleTwoFactorToggle} />
                            </div>
                            <div className={`flex items-center gap-4 p-4 rounded-xl border ${isTwoFactorEnabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isTwoFactorEnabled ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-slate-300 text-slate-500 dark:bg-slate-600 dark:text-slate-300'}`}>
                                    <FiShield size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{isTwoFactorEnabled ? t('2faActivado') : t('2faDesactivado')}</p>
                                    <p className="text-xs opacity-70">{isTwoFactorEnabled ? 'Tu cuenta está protegida.' : 'Mejora tu seguridad activándolo.'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Login History */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiClock className="text-primary" /> Historial de Sesiones</h3>
                            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="p-4 font-semibold">Dispositivo</th>
                                            <th className="p-4 font-semibold hidden sm:table-cell">Ubicación</th>
                                            <th className="p-4 font-semibold hidden sm:table-cell">Fecha</th>
                                            <th className="p-4 font-semibold text-right">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loginHistory.map((login) => (
                                            <tr key={login.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {login.device.toLowerCase().includes('phone') ? <FiSmartphone className="text-slate-400 shrink-0" /> : <FiGlobe className="text-slate-400 shrink-0" />}
                                                        <div>
                                                            <span className="font-medium text-sm block">{login.device}</span>
                                                            <div className="text-xs text-slate-500 mt-0.5 sm:hidden">
                                                                {login.date} • {login.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-500 hidden sm:table-cell">{login.location} <span className="text-xs opacity-50 block">{login.ip}</span></td>
                                                <td className="p-4 text-sm text-slate-500 hidden sm:table-cell">{login.date}</td>
                                                <td className="p-4 text-right">
                                                    {login.current ?
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Actual</span> :
                                                        <button className="text-red-500 text-xs font-semibold hover:underline">Cerrar sesión</button>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-6 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-2xl">
                            <h4 className="text-red-600 font-bold text-lg flex items-center gap-2 mb-2"><FiAlertTriangle /> {t('zonaPeligro')}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-xl">{t('zonaPeligroDesc')}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button onClick={() => setDeleteModalOpen(true)} className="!bg-white hover:!bg-red-50 !text-red-600 border border-red-200 shadow-sm">{t('eliminarCuenta')}</Button>
                            </div>
                        </div>
                    </motion.div>
                );
            }
            case 'suscripcion': {
                const plans = [
                    { id: 'free', name: 'Gratis', price: '0', period: '/mes', features: ['5 consultas IA/día', '1GB almacenamiento', 'Análisis básico', 'Soporte comunidad'], gradient: 'from-slate-400 to-slate-600', popular: false },
                    { id: 'pro', name: 'Pro', price: '9.99', period: '/mes', features: ['50 consultas IA/día', '25GB almacenamiento', 'Análisis avanzado', 'Soporte prioritario', 'Chef IA ilimitado'], gradient: 'from-indigo-500 to-purple-600', popular: true },
                    { id: 'premium', name: 'Premium', price: '19.99', period: '/mes', features: ['Consultas IA ilimitadas', '100GB almacenamiento', 'Análisis completo', 'Soporte 24/7 dedicado', 'Todas las funciones', 'Acceso anticipado'], gradient: 'from-amber-500 to-orange-600', popular: false },
                ];
                const usageStats = [
                    { label: 'Consultas IA', used: 32, total: 50, icon: FiCpu, color: 'from-indigo-500 to-purple-500', iconColor: 'text-indigo-500' },
                    { label: 'Almacenamiento', used: 8.2, total: 25, unit: 'GB', icon: FiHardDrive, color: 'from-cyan-500 to-blue-500', iconColor: 'text-cyan-500' },
                    { label: 'Funciones Premium', used: 7, total: 10, icon: FiStar, color: 'from-amber-500 to-orange-500', iconColor: 'text-amber-500' },
                ];
                const paymentMethod = { brand: 'Visa', last4: '4242', expiry: '12/26' };
                const filteredBilling = billingFilter === 'all' ? billingHistory : billingHistory.filter(b => b.date.includes(billingFilter));

                return (
                    <motion.div key="suscripcion" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        {/* Payment Modal */}
                        <AnimatePresence>
                            {isPaymentModalOpen && <PaymentModal onClose={() => setPaymentModalOpen(false)} mode="add" />}
                        </AnimatePresence>

                        {/* Current Plan Card - Premium Design */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">{t('tuPlanActual')} <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>✨</motion.span></h3>
                            <motion.div whileHover={{ scale: 1.01 }} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${userData.plan === 'premium' ? 'from-amber-500 to-orange-600' : userData.plan === 'pro' ? 'from-indigo-500 to-purple-600' : 'from-slate-400 to-slate-600'} p-6 text-white shadow-xl`}>
                                <motion.div animate={{ x: [0, 100, 0], y: [0, -50, 0] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full" />
                                <motion.div animate={{ x: [0, -80, 0], y: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full" />
                                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl shadow-lg">👑</motion.div>
                                        <div>
                                            <p className="text-white/80 text-sm font-medium">Plan Actual</p>
                                            <h4 className="text-3xl font-bold capitalize">{userData.plan}</h4>
                                            <p className="text-white/70 text-sm">{t('proximaFacturacion')}: 15 de Julio, 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <Button onClick={() => setSubscriptionModalOpen(true)} className="!bg-white/20 hover:!bg-white/30 !text-white border border-white/30 flex-1 sm:flex-none !text-sm">{t('gestionarPlan')}</Button>
                                        <Button onClick={() => { if (confirm('¿Seguro que deseas cancelar tu suscripción?')) alert('Suscripción cancelada'); }} className="!bg-red-500/80 hover:!bg-red-600 !text-white flex-1 sm:flex-none !text-sm"><FiXCircle className="sm:mr-1" /><span className="hidden sm:inline"> Cancelar</span></Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Usage Statistics - With Icons */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiActivity className="text-primary" /> Uso del Plan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {usageStats.map((stat, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                        <Card className="!p-4 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                                                    <stat.icon size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-semibold text-sm">{stat.label}</span>
                                                    <p className="text-xs text-slate-500">{stat.used}{stat.unit || ''} / {stat.total}{stat.unit || ''}</p>
                                                </div>
                                                <span className={`text-lg font-bold ${stat.iconColor}`}>{Math.round((stat.used / stat.total) * 100)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${(stat.used / stat.total) * 100}%` }} transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }} className={`h-full bg-gradient-to-r ${stat.color} rounded-full`} />
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Plan Comparison - Elaborate Animations */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Comparar Planes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map((plan, idx) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                                        whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative rounded-2xl border-2 ${plan.popular ? 'border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-500/20' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 overflow-hidden cursor-pointer transition-colors`}
                                    >
                                        {plan.popular && (
                                            <motion.div animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ repeat: Infinity, duration: 3 }} style={{ backgroundSize: '200% 200%' }} className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white text-xs font-bold text-center py-1.5">
                                                ⭐ MÁS POPULAR
                                            </motion.div>
                                        )}
                                        <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xl font-bold">{plan.name}</h4>
                                                {userData.plan === plan.id && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full font-semibold">Activo</span>}
                                            </div>
                                            <div className="my-4">
                                                <span className="text-4xl font-bold">${plan.price}</span>
                                                <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                                            </div>
                                            <ul className="space-y-3 mb-6">
                                                {plan.features.map((f, i) => (
                                                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 + i * 0.05 }} className="flex items-center gap-2 text-sm">
                                                        <FiCheckCircle className="text-green-500 shrink-0" />
                                                        <span className="text-slate-600 dark:text-slate-300">{f}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                            <Button
                                                onClick={() => setSubscriptionModalOpen(true)}
                                                variant={userData.plan === plan.id ? 'secondary' : 'primary'}
                                                className={`w-full ${plan.popular && userData.plan !== plan.id ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 hover:!from-indigo-600 hover:!to-purple-700' : ''}`}
                                            >
                                                {userData.plan === plan.id ? 'Plan Actual' : 'Elegir Plan'}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method - With Modal */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiCreditCard className="text-primary" /> Método de Pago</h3>
                            <Card className="!p-5">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 0.6 }} className="w-14 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">{paymentMethod.brand}</motion.div>
                                        <div>
                                            <p className="font-semibold text-lg">•••• •••• •••• {paymentMethod.last4}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1"><FiCalendar size={12} /> Expira: {paymentMethod.expiry}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <Button variant="secondary" onClick={() => setPaymentModalOpen(true)} className="flex-1 sm:flex-none !py-2 !text-xs sm:!text-sm"><FiEdit3 className="sm:mr-1" /><span className="hidden sm:inline"> Editar</span></Button>
                                        <Button variant="secondary" onClick={() => setPaymentModalOpen(true)} className="flex-1 sm:flex-none !py-2 !text-xs sm:!text-sm"><FiPlus className="sm:mr-1" /><span className="hidden sm:inline"> Añadir</span></Button>
                                        <Button variant="secondary" className="!py-2 !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"><FiTrash2 /></Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Billing History - With Filter */}
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2"><FiFileText className="text-primary" /> {t('historialPagos')}</h3>
                                <div className="flex items-center gap-2">
                                    <FiFilter className="text-slate-400" />
                                    <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="all">Todos</option>
                                        <option value="2024-06">Junio 2024</option>
                                        <option value="2024-05">Mayo 2024</option>
                                        <option value="2024-04">Abril 2024</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="p-4 font-semibold">{t('idFactura')}</th>
                                            <th className="p-4 font-semibold">{t('fecha')}</th>
                                            <th className="p-4 font-semibold">{t('importe')}</th>
                                            <th className="p-4 font-semibold text-center">{t('estado')}</th>
                                            <th className="p-4 font-semibold text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBilling.map((item, idx) => (
                                            <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-mono text-xs">{item.id}</td>
                                                <td className="p-4">{item.date}</td>
                                                <td className="p-4 font-semibold">{item.amount}</td>
                                                <td className="p-4 text-center"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('pagado')}</span></td>
                                                <td className="p-4 text-right"><button className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 text-sm font-semibold flex items-center gap-1 ml-auto hover:underline"><FiFileText /> Descargar</button></td>
                                            </motion.tr>
                                        ))}
                                        {filteredBilling.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay facturas para este período</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                );
            }
            case 'notificaciones': return (
                <motion.div key="notificaciones" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300 rounded-full flex items-center justify-center text-xl shadow-sm">
                                <FiMoon />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">{t('noMolestar')}</h3>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 opacity-80">{t('noMolestarDesc')}</p>
                            </div>
                        </div>
                        <Toggle isEnabled={doNotDisturb} onToggle={() => setDoNotDisturb(!doNotDisturb)} />
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${doNotDisturb ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all duration-300`}>
                        {/* Email Notifications */}
                        <Card className="!p-6 space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2"><FiMail className="text-primary" /> {t('notificacionesEmail')}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{t('noticiasNovedades')}</span>
                                    <Toggle isEnabled={emailNotifications.news} onToggle={() => setEmailNotifications(p => ({ ...p, news: !p.news }))} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{t('alertasSeguridad')}</span>
                                    <Toggle isEnabled={emailNotifications.security} onToggle={() => setEmailNotifications(p => ({ ...p, security: !p.security }))} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{t('marketingOfertas')}</span>
                                    <Toggle isEnabled={emailNotifications.marketing} onToggle={() => setEmailNotifications(p => ({ ...p, marketing: !p.marketing }))} />
                                </div>
                            </div>
                        </Card>

                        {/* Push Notifications */}
                        <Card className="!p-6 space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2"><FiBell className="text-primary" /> {t('notificacionesPush')}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{t('consejosDiarios')}</span>
                                    <Toggle isEnabled={pushNotifications.tips} onToggle={() => setPushNotifications(p => ({ ...p, tips: !p.tips }))} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{t('metasLogros')}</span>
                                    <Toggle isEnabled={pushNotifications.goals} onToggle={() => setPushNotifications(p => ({ ...p, goals: !p.goals }))} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{t('recordatoriosComida')}</span>
                                    <Toggle isEnabled={pushNotifications.reminders} onToggle={() => setPushNotifications(p => ({ ...p, reminders: !p.reminders }))} />
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            );
            case 'pedidos': {
                const handleDownloadInvoice = (orderId: string) => {
                    const order = mockOrderHistory.find(o => o.id === orderId);
                    if (!order) return;
                    const invoiceContent = `FACTURA - NUTRISTREAM\n\nPedido: #${orderId.split('-').pop()}\nFecha: ${order.date}\n\nProductos:\n${order.items.map(({ product, quantity }) => `- ${product.name} x${quantity}: $${(product.price * quantity).toFixed(2)}`).join('\n')}\n\nTotal: $${order.total.toFixed(2)}\n\nGracias por tu compra!`;
                    const blob = new Blob([invoiceContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `factura_${orderId}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                };

                return (
                    <motion.div key="pedidos" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><FiPackage className="text-primary" /> {t('misPedidos')}</h3>
                            <span className="text-sm text-slate-500">{mockOrderHistory.length} pedido(s)</span>
                        </div>
                        {mockOrderHistory.length > 0 ? (
                            <div className="space-y-4">
                                {mockOrderHistory.map((order, idx) => (
                                    <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                        <Card className="!p-0 overflow-hidden hover:shadow-lg transition-shadow">
                                            {/* Order Header */}
                                            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/50 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                                <FiPackage size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">{t('pedido')} #{order.id.split('-').pop()}</p>
                                                                <p className="text-xs text-slate-500 flex items-center gap-1"><FiCalendar size={10} /> {order.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                                                            <motion.div animate={{ rotate: expandedOrderId === order.id ? 180 : 0 }} className="text-slate-400"><FiChevronDown /></motion.div>
                                                        </div>
                                                    </div>
                                                    {/* Status Timeline */}
                                                    <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 shrink-0"><FiCheckCircle size={14} /> Confirmado</div>
                                                        <div className="h-0.5 w-6 bg-green-500 shrink-0" />
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 shrink-0"><FiPackage size={14} /> Preparado</div>
                                                        <div className="h-0.5 w-6 bg-green-500 shrink-0" />
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 shrink-0"><FiTruck size={14} /> Enviado</div>
                                                        <div className="h-0.5 w-6 bg-green-500 shrink-0" />
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 shrink-0"><FiMapPin size={14} /> Entregado</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Expanded Content */}
                                            <AnimatePresence>
                                                {expandedOrderId === order.id && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                                            <h4 className="font-semibold text-sm text-slate-500">{t('productosEnPedido')}</h4>
                                                            <div className="space-y-3">
                                                                {order.items.map(({ product, quantity }) => (
                                                                    <div key={product.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                                        <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-semibold text-sm truncate">{product.name}</p>
                                                                            <p className="text-xs text-slate-500">{t('cantidad')}: {quantity}</p>
                                                                        </div>
                                                                        <p className="font-bold shrink-0">${(product.price * quantity).toFixed(2)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                                <Button variant="secondary" className="flex-1 sm:flex-none !text-xs !py-2"><FiTruck className="mr-1" /> {t('seguirEnvio')}</Button>
                                                                <Button variant="secondary" onClick={() => handleDownloadInvoice(order.id)} className="flex-1 sm:flex-none !text-xs !py-2"><FiDownload className="mr-1" /> {t('descargarFactura')}</Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <Card className="text-center !p-8">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-4"><FiPackage size={32} className="text-slate-400" /></div>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">{t('noHayPedidos')}</p>
                                <Button onClick={() => setActivePage('marketplace')}>{t('explorarMarketplace')}</Button>
                            </Card>
                        )}
                    </motion.div>
                );
            }
            default: return null;
        }
    };

    return (<> <SEO title="Mi Perfil" description="Gestiona tu cuenta y suscripción." /> <AnimatePresence> {isDeleteModalOpen && <DeleteAccountModal onClose={() => setDeleteModalOpen(false)} />} {isTwoFactorModalOpen && (<TwoFactorAuthModal onClose={() => setTwoFactorModalOpen(false)} onConfirm={() => { setTwoFactorEnabled(true); setTwoFactorModalOpen(false); }} />)} </AnimatePresence> <div className="space-y-8"> <h2 className="text-3xl font-bold">{t('configuracionPerfil')}</h2> <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"> <div className="lg:col-span-1"> <Card className="text-center !p-8"> <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center relative group"> <span className="text-4xl text-slate-500"><FiUser /></span> <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"> <span className="text-white text-2xl"><FiCamera /></span> </div> </div> <h3 className="text-xl font-bold">{formData.name}</h3> <p className="text-sm text-slate-500 dark:text-slate-400">{formData.email}</p> <span className="mt-2 inline-block text-xs font-semibold px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full capitalize">{userData.plan} Member</span> </Card> </div> <div className="lg:col-span-3"> <Card className="!p-6"> <div className="border-b border-slate-200 dark:border-slate-700 mb-6"> <nav className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"> <TabButton id="cuenta" label={t('cuenta')} /> <TabButton id="seguridad" label={t('seguridad')} /> <TabButton id="notificaciones" label={t('notificaciones')} /> <TabButton id="suscripcion" label={t('suscripcion')} /> <TabButton id="pedidos" label={t('misPedidos')} /> </nav> </div> <AnimatePresence mode="wait"> {renderContent()} </AnimatePresence> </Card> </div> </div> </div> </>)
};

export default Perfil;

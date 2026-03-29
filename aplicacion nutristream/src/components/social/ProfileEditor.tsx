import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser, FiCamera, FiMapPin, FiLink, FiInstagram, FiTwitter,
    FiEdit3, FiSave, FiX, FiEye, FiEyeOff, FiShield, FiCheck
} from 'react-icons/fi';

import { UserProfile, LeagueColors, LeagueTier } from '../../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ProfileFormData {
    displayName: string;
    username: string;
    bio: string;
    avatar: string | null;
    location: string;
    website: string;
    instagram: string;
    twitter: string;
    isPublic: boolean;
    showSensorData: boolean;
    showWorkouts: boolean;
    showLeague: boolean;
}

interface ProfileEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProfileFormData) => void;
    currentProfile?: Partial<ProfileFormData>;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE EDITOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, onSave, currentProfile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'social' | 'privacy'>('general');
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile?.avatar || null);

    const [formData, setFormData] = useState<ProfileFormData>({
        displayName: currentProfile?.displayName || '',
        username: currentProfile?.username || '',
        bio: currentProfile?.bio || '',
        avatar: currentProfile?.avatar || null,
        location: currentProfile?.location || '',
        website: currentProfile?.website || '',
        instagram: currentProfile?.instagram || '',
        twitter: currentProfile?.twitter || '',
        isPublic: currentProfile?.isPublic ?? true,
        showSensorData: currentProfile?.showSensorData ?? true,
        showWorkouts: currentProfile?.showWorkouts ?? true,
        showLeague: currentProfile?.showLeague ?? true
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
            setFormData(prev => ({ ...prev, avatar: url }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 500));
        onSave(formData);
        setSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-5 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-cyan-500/20">
                                <FiEdit3 className="text-cyan-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Editar Perfil Público</h2>
                                <p className="text-xs text-slate-400">Configura cómo te ven otros atletas en Nexus</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-700">
                        {[
                            { key: 'general' as const, label: 'General', icon: <FiUser /> },
                            { key: 'social' as const, label: 'Redes Sociales', icon: <FiLink /> },
                            { key: 'privacy' as const, label: 'Privacidad', icon: <FiShield /> }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
                                        ? 'text-cyan-400 border-b-2 border-cyan-400'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FiUser className="text-slate-600" size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
                                        >
                                            <FiCamera size={16} />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">Foto de Perfil</h4>
                                        <p className="text-sm text-slate-400">JPG, PNG o GIF. Máximo 5MB.</p>
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Nombre para Mostrar
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                        placeholder="Tu nombre visible"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Nombre de Usuario
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                                            placeholder="tu_username"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Solo letras, números y guiones bajos</p>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value.slice(0, 160) }))}
                                        placeholder="Cuéntale al mundo tu pasión por el fitness..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1 text-right">{formData.bio.length}/160</p>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Ubicación
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            placeholder="Barcelona, España"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SOCIAL TAB */}
                        {activeTab === 'social' && (
                            <div className="space-y-6">
                                {/* Website */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Sitio Web
                                    </label>
                                    <div className="relative">
                                        <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                            placeholder="https://tuwebsite.com"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                {/* Instagram */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Instagram
                                    </label>
                                    <div className="relative">
                                        <FiInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" />
                                        <input
                                            type="text"
                                            value={formData.instagram}
                                            onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value.replace('@', '') }))}
                                            placeholder="tu_instagram"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                {/* Twitter */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Twitter / X
                                    </label>
                                    <div className="relative">
                                        <FiTwitter className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                                        <input
                                            type="text"
                                            value={formData.twitter}
                                            onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value.replace('@', '') }))}
                                            placeholder="tu_twitter"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                                    <p className="text-sm text-cyan-400">
                                        💡 Conectar tus redes sociales aumenta tu visibilidad y permite que otros atletas te encuentren más fácilmente.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* PRIVACY TAB */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-4">
                                {/* Public Profile Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800">
                                    <div className="flex items-center gap-3">
                                        {formData.isPublic ? <FiEye className="text-emerald-400" /> : <FiEyeOff className="text-slate-400" />}
                                        <div>
                                            <h4 className="font-medium text-white">Perfil Público</h4>
                                            <p className="text-xs text-slate-400">Cualquiera puede ver tu perfil y posts</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${formData.isPublic ? 'bg-emerald-500' : 'bg-slate-600'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                {/* Show Sensor Data */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800">
                                    <div>
                                        <h4 className="font-medium text-white">Mostrar Datos de Sensores</h4>
                                        <p className="text-xs text-slate-400">VO2 Max, Neural Battery, etc. en tu perfil</p>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, showSensorData: !prev.showSensorData }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${formData.showSensorData ? 'bg-cyan-500' : 'bg-slate-600'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.showSensorData ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                {/* Show Workouts */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800">
                                    <div>
                                        <h4 className="font-medium text-white">Mostrar Entrenamientos</h4>
                                        <p className="text-xs text-slate-400">Tu historial de entrenamientos público</p>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, showWorkouts: !prev.showWorkouts }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${formData.showWorkouts ? 'bg-cyan-500' : 'bg-slate-600'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.showWorkouts ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                {/* Show League */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800">
                                    <div>
                                        <h4 className="font-medium text-white">Mostrar Liga</h4>
                                        <p className="text-xs text-slate-400">Tu rango y liga visible en perfil</p>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, showLeague: !prev.showLeague }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${formData.showLeague ? 'bg-cyan-500' : 'bg-slate-600'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.showLeague ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-sm text-amber-400">
                                        ⚠️ Si tu perfil es privado, solo tus seguidores podrán ver tus posts y estadísticas.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !formData.displayName || !formData.username}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiSave size={18} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProfileEditor;

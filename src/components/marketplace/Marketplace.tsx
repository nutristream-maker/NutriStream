// Marketplace Component
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiCpu, FiMinus, FiPlus, FiTrash2, FiX, FiCheckCircle, FiStar } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { Product, CartItem } from '../../types';
import { mockMarketplaceProducts, mockMedicalData, mockRecoveryData } from '../../data/mockData';
import { useSensorStore } from '../../store/useSensorStore';

import { Card as UICard, Button as UIButton } from '../ui/Shared';
import { useLanguage } from '../../context/LanguageContext';
import PlanMarketplace from './PlanMarketplace';

const ProductModal: React.FC<{ product: Product, onClose: () => void, onAddToCart: (product: Product, quantity: number) => void }> = ({ product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(product.gallery[0]);
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useLanguage();

    const handleAddToCart = () => { onAddToCart(product, quantity); onClose(); };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()} >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700"> <h2 className="text-2xl font-bold">{product.name}</h2> <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FiX /></button> </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 p-6 overflow-y-auto">
                    <div>
                        <div className="relative group cursor-zoom-in" onClick={() => setIsExpanded(true)}>
                            <AnimatePresence mode="wait">
                                <motion.img key={activeImage} src={activeImage} alt={product.name} className="w-full h-auto aspect-square object-contain bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm mb-4 border border-slate-100 dark:border-slate-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                <span className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm transition-opacity">{t('ampliar_imagen')}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2"> {product.gallery.map((img, i) => (<img key={i} src={img} alt={`${product.name} thumbnail ${i + 1}`} onClick={() => setActiveImage(img)} className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 transition-all ${activeImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`} />))} </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex-grow"> <div className="flex justify-between items-start"> <span className="bg-primary/20 text-primary text-sm font-semibold px-3 py-1 rounded-full">{product.category}</span> <div className="flex items-center gap-1"> <span className="text-yellow-400 flex items-center"><FiStar /></span> <span className="font-bold">{product.rating}</span> <span className="text-sm text-slate-500">({product.reviews.length} {t('resenas')})</span> </div> </div> <p className="text-4xl font-extrabold my-4">${product.price}</p> <p className="text-slate-600 dark:text-slate-300">{product.description}</p>
                            {product.reviews.length > 0 && (<div className="mt-6"> <h3 className="font-bold text-lg mb-2">{t('opiniones_clientes')}</h3> <div className="space-y-3 max-h-48 overflow-y-auto pr-2"> {product.reviews.map((review, i) => (<div key={i} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg"> <div className="flex items-center justify-between"> <span className="font-semibold">{review.user}</span> <div className="flex">{Array.from({ length: review.rating }).map((_, j) => <span key={j} className="text-yellow-400 text-xs flex items-center"><FiStar /></span>)}</div> </div> <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{review.comment}</p> </div>))} </div> </div>)}
                        </div>
                        <div className="flex items-center gap-4 mt-6"> <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-full"> <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3"><FiMinus /></button> <span className="px-4 font-bold text-lg">{quantity}</span> <button onClick={() => setQuantity(q => q + 1)} className="p-3"><FiPlus /></button> </div> <UIButton onClick={handleAddToCart} icon={FiShoppingCart} className="w-full"> {t('anadir_carrito')} </UIButton> </div>
                    </div>
                </div>
            </motion.div>

            {/* Lightbox / Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
                        onClick={() => setIsExpanded(false)}
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={activeImage}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                        />
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2">
                            <FiX size={32} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
};

const CartModal: React.FC<{ cart: CartItem[], onUpdateCart: (product: Product, quantity: number) => void, onClose: () => void, onCheckout: () => void }> = ({ cart, onUpdateCart, onClose, onCheckout }) => {
    const { t } = useLanguage();
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0); const shipping = 5.99; const total = subtotal + shipping;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()} >
                <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700"> <h2 className="text-2xl font-bold">{t('tu_carrito')}</h2> <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FiX /></button> </div>
                {cart.length > 0 ? (<> <div className="flex-grow p-6 overflow-y-auto space-y-4"> {cart.map(({ product, quantity }) => (<div key={product.id} className="flex items-center gap-4"> <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" /> <div className="flex-grow"> <h3 className="font-bold">{product.name}</h3> <p className="text-sm text-slate-500">${product.price}</p> </div> <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-full"> <button onClick={() => onUpdateCart(product, quantity - 1)} className="p-2"><FiMinus /></button> <span className="px-2 font-bold text-sm">{quantity}</span> <button onClick={() => onUpdateCart(product, quantity + 1)} className="p-2"><FiPlus /></button> </div> <p className="font-bold w-16 text-right">${(product.price * quantity).toFixed(2)}</p> <button onClick={() => onUpdateCart(product, 0)} className="text-slate-400 hover:text-red-500 p-2"><FiTrash2 /></button> </div>))} </div> <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-2"> <div className="flex justify-between"><span>{t('subtotal')}</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div> <div className="flex justify-between"><span>{t('envio')}</span><span className="font-semibold">${shipping.toFixed(2)}</span></div> <div className="flex justify-between text-lg font-bold"><span>{t('total')}</span><span>${total.toFixed(2)}</span></div> <UIButton onClick={onCheckout} className="w-full mt-4">{t('proceder_pago')}</UIButton> </div> </>) : (<div className="flex-grow flex flex-col items-center justify-center text-center p-6"> <div className="text-6xl text-slate-300 dark:text-slate-600 mb-4 flex justify-center"><FiShoppingCart /></div> <h3 className="text-xl font-bold">{t('carrito_vacio')}</h3> <p className="text-slate-500 mt-1">{t('explora_marketplace')}</p> </div>)}
            </motion.div>
        </motion.div>
    );
};

const PaymentConfirmationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-8 text-center" onClick={e => e.stopPropagation()} > <div className="text-6xl text-green-500 mx-auto mb-4 flex justify-center"><FiCheckCircle /></div> <h2 className="text-2xl font-bold mb-2">{t('pago_realizado')}</h2> <p className="text-slate-600 dark:text-slate-300 mb-4"> {t('pedido_procesado')} Recibirás una confirmación por correo electrónico en breve. </p> <UIButton onClick={onClose} className="w-full mt-6">{t('volver_marketplace')}</UIButton> </motion.div>
        </motion.div>
    );
};

const Marketplace: React.FC<{}> = React.memo(() => {
    const [activeTab, setActiveTab] = useState<'products' | 'plans'>('products');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setCartOpen] = useState(false);
    const [isPaymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
    const { t } = useLanguage();

    // Context Data
    const { fatigue, activeMuscles } = useSensorStore();

    // PERSISTENCE LOGIC
    useEffect(() => {
        const storedCart = localStorage.getItem('nutristream_cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) { console.error("Error loading cart", e); }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('nutristream_cart', JSON.stringify(cart));
    }, [cart]);

    const handleAddToCart = (product: Product, quantity: number) => { setCart(prevCart => { const existingItem = prevCart.find(item => item.product.id === product.id); if (existingItem) { return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item).filter(item => item.quantity > 0); } return [...prevCart, { product, quantity }]; }); };
    const handleUpdateCart = (product: Product, quantity: number) => { if (quantity <= 0) { setCart(prevCart => prevCart.filter(item => item.product.id !== product.id)); } else { setCart(prevCart => prevCart.map(item => item.product.id === product.id ? { ...item, quantity } : item)); } };
    const handleCheckout = () => { setCartOpen(false); setPaymentConfirmationOpen(true); };
    const handleClosePaymentConfirmation = () => { setPaymentConfirmationOpen(false); setCart([]); };
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const aiRecommendations = useMemo(() => {
        const recommendations: { reasons: string[], products: Product[] } = { reasons: [], products: [], };
        const productMap = new Map<number, Product>();

        // 1. Bio-Medical Analysis
        const vitaminD = mockMedicalData.analytics.find(a => a.name === 'Vitamina D');
        if (vitaminD && vitaminD.status === 'Bajo') {
            recommendations.reasons.push("Nivel bajo de Vitamina D detectado. Considera aumentar tu exposición solar o consultar a un especialista sobre suplementación.");
        }

        // 2. Mock Data Recovery Analysis
        const criticalMuscles = Object.entries(mockRecoveryData).filter(([_, data]) => data.recovery < 30).sort((a, b) => a[1].recovery - b[1].recovery);
        if (criticalMuscles.length > 0) {
            const muscleName = criticalMuscles[0][0];
            recommendations.reasons.push(`Recuperación crítica en ${muscleName}. Prioriza el descanso y la nutrición.`);
            const protein = mockMarketplaceProducts.find(p => p.id === 1);
            const creatine = mockMarketplaceProducts.find(p => p.id === 5);
            const massageGun = mockMarketplaceProducts.find(p => p.id === 7);
            if (protein && !productMap.has(protein.id)) { productMap.set(protein.id, protein); }
            if (creatine && !productMap.has(creatine.id)) { productMap.set(creatine.id, creatine); }
            if (massageGun && !productMap.has(massageGun.id)) { productMap.set(massageGun.id, massageGun); }
        }

        // 3. REAL-TIME SENSOR ANALYSIS (Context)
        if (fatigue > 60) {
            recommendations.reasons.push(`⚠️ Fatiga Local Alta detectada (${fatigue}%). Se recomienda iniciar protocolo de recuperación activa.`);
            // Recommend Supplements (Protein/Creatine) and Tools (Foam Roller)
            const protein = mockMarketplaceProducts.find(p => p.id === 1);
            const roller = mockMarketplaceProducts.find(p => p.id === 4); // Suponiendo id 4 es Foam Roller
            const massageGun = mockMarketplaceProducts.find(p => p.id === 7);

            if (protein && !productMap.has(protein.id)) productMap.set(protein.id, protein);
            if (roller && !productMap.has(roller.id)) productMap.set(roller.id, roller);
            if (massageGun && !productMap.has(massageGun.id)) productMap.set(massageGun.id, massageGun);
        }

        if (activeMuscles.length > 0) {
            recommendations.reasons.push(`Detectada actividad intensa en: ${activeMuscles.slice(0, 3).join(', ')}.`);
        }

        // 4. MEDICAL HISTORY & INJURY PREVENTION (Phase G Integration)
        const activeInjuries = mockMedicalData.history.filter(h => h.status !== 'Recuperado');
        if (activeInjuries.length > 0) {
            const injury = activeInjuries[0]; // Take primary injury
            recommendations.reasons.push(`Historial: ${injury.condition} (${injury.status}). Se sugiere equipamiento de soporte.`);

            // Semantic matching of products to injuries (Mock logic)
            if (injury.condition.includes('Rodilla') || injury.condition.includes('Patelar')) {
                const bands = mockMarketplaceProducts.find(p => p.name.includes('Banda'));
                const collagen = mockMarketplaceProducts.find(p => p.category === 'Suplemento' && p.name.includes('Proteína')); // Fallback to protein/collagen
                if (bands && !productMap.has(bands.id)) productMap.set(bands.id, bands);
                if (collagen && !productMap.has(collagen.id)) productMap.set(collagen.id, collagen);
            } else if (injury.condition.includes('Esguince') || injury.condition.includes('Tobillo')) {
                const bands = mockMarketplaceProducts.find(p => p.name.includes('Banda')); // Resistance bands for rehab
                if (bands && !productMap.has(bands.id)) productMap.set(bands.id, bands);
            }
        }

        recommendations.products = Array.from(productMap.values());
        return recommendations;
    }, [fatigue, activeMuscles]); // Dependent on real-time sensors

    return (
        <div className="space-y-8">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold">{t('marketplaceTitle')}</h2>
                    <p className="text-slate-500 dark:text-slate-400">Todo lo que necesitas para tu rendimiento</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'products' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Productos
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'plans' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Planes de Entrenamiento
                    </button>
                </div>

                {activeTab === 'products' && (
                    <UIButton onClick={() => setCartOpen(true)} icon={FiShoppingCart} className="relative">
                        Carrito
                        {cartItemCount > 0 && (
                            <motion.div key={cartItemCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-bg">
                                {cartItemCount}
                            </motion.div>
                        )}
                    </UIButton>
                )}
            </div>

            {activeTab === 'products' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                    <AnimatePresence> {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />} {isCartOpen && <CartModal cart={cart} onUpdateCart={handleUpdateCart} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />} {isPaymentConfirmationOpen && <PaymentConfirmationModal onClose={handleClosePaymentConfirmation} />} </AnimatePresence>

                    {(aiRecommendations.reasons.length > 0 || aiRecommendations.products.length > 0) && (<UICard className="!p-6 !bg-primary/5 dark:!bg-primary/10 border border-primary/20"> <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-primary flex items-center"><FiCpu /></span> {t('aiInsight')}</h3> <div className="space-y-4"> {aiRecommendations.reasons.length > 0 && (<ul className="space-y-1 list-disc list-inside text-sm text-slate-700 dark:text-slate-300"> {aiRecommendations.reasons.map((reason, i) => <li key={i}>{reason}</li>)} </ul>)} {aiRecommendations.products.length > 0 && (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"> {aiRecommendations.products.map(product => (<div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"> <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" /> <div> <p className="font-bold text-sm">{product.name}</p> <p className="text-xs text-slate-500">{product.category}</p> </div> </div>))} </div>)} </div> </UICard>)}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mockMarketplaceProducts.map(product => (<UICard key={product.id} className="!p-0 flex flex-col" onClick={() => setSelectedProduct(product)}> <div className="relative"> <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-2xl" /> {product.premium && <div className="absolute top-3 right-3 bg-yellow-400 p-2 rounded-full flex items-center justify-center"><span className="text-white flex items-center"><FaCrown /></span></div>} </div> <div className="p-4 flex flex-col flex-grow"> <h3 className="font-bold text-lg">{product.name}</h3> <p className="text-sm text-slate-500 dark:text-slate-400">{product.category}</p> <div className="flex-grow"></div> <div className="flex justify-between items-center mt-4"> <p className="text-xl font-bold">${product.price}</p> <div className="flex items-center gap-1"> <span className="text-yellow-400 flex items-center"><FiStar /></span> <span className="font-bold">{product.rating}</span> </div> </div> </div> </UICard>))}
                    </div>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PlanMarketplace />
                </motion.div>
            )}
        </div>
    );
});

export default Marketplace;

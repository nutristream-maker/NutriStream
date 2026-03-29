import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Dashboard = lazy(() => import('../components/dashboard/Dashboard'));
const Marketplace = lazy(() => import('../components/marketplace/Marketplace'));
const ChefAI = lazy(() => import('../components/ai/ChefAI'));
const HistorialMedico = lazy(() => import('../components/profile/HistorialMedico'));
const Perfil = lazy(() => import('../components/profile/Perfil'));

export const CoreRoutes = () => (
    <>
        <Route index element={<Dashboard setActivePage={() => { }} />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="chef-ai" element={<ChefAI />} />
        <Route path="historial-medico" element={<HistorialMedico />} />
        <Route path="perfil" element={<Perfil setActivePage={() => { }} />} />
    </>
);

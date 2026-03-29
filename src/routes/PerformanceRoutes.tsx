import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Cuerpo = lazy(() => import('../components/body/Cuerpo'));
const Rendimiento = lazy(() => import('../components/dashboard/Rendimiento'));
const TechniqueAnalysis = lazy(() => import('../components/ai/TechniqueAnalysis'));
const TrainingCenter = lazy(() => import('../components/training/TrainingCenter'));

export const PerformanceRoutes = () => (
    <>
        <Route path="cuerpo" element={<Cuerpo />} />
        <Route path="rendimiento" element={<Rendimiento />} />
        <Route path="technique-analysis" element={<TechniqueAnalysis />} />
        <Route path="training-center" element={<TrainingCenter />} />
    </>
);

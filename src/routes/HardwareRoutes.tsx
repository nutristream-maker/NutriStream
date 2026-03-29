import { lazy } from 'react';
import { Route } from 'react-router-dom';

const NeuralSkinPod = lazy(() => import('../components/hardware/NeuralSkinPod'));
const DeviceCenter = lazy(() => import('../components/hardware/DeviceCenter'));
const RacketSensor = lazy(() => import('../components/hardware/RacketSensor'));
const AeroVisionGlasses = lazy(() => import('../components/hardware/AeroVisionGlasses'));
const AeroLungMask = lazy(() => import('../components/hardware/AeroLungMask'));
const GroundTruthInsoles = lazy(() => import('../components/hardware/GroundTruthInsoles'));

export const HardwareRoutes = () => (
    <>
        <Route path="ns-pod" element={<NeuralSkinPod />} />
        <Route path="dispositivos" element={<DeviceCenter />} />
        <Route path="racket-sensor" element={<RacketSensor />} />
        <Route path="aerovision" element={<AeroVisionGlasses />} />
        <Route path="aerolung" element={<AeroLungMask />} />
        <Route path="groundtruth" element={<GroundTruthInsoles />} />
    </>
);

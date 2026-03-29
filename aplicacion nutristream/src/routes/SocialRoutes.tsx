import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Especialistas = lazy(() => import('../components/social/Especialistas'));
const ClubHub = lazy(() => import('../components/clubhub/ClubHub'));
const PublicProfile = lazy(() => import('../components/social/PublicProfile'));
const NexusFeed = lazy(() => import('../components/social/NexusFeed'));

export const SocialRoutes = () => (
    <>
        <Route path="especialistas" element={<Especialistas />} />
        <Route path="clubhub" element={<ClubHub />} />
        <Route path="profile/:username" element={<PublicProfile />} />
        <Route path="nexus" element={<NexusFeed />} />
    </>
);

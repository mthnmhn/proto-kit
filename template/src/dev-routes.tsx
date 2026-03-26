import { Navigate, Route, Routes } from 'react-router-dom';
import ProtoSettingsAbout from './pages/ProtoSettingsAbout';
import ProtoSettingsSettings from './pages/ProtoSettingsSettings';
import ProtoSettingsVersions from './pages/ProtoSettingsVersions';
import ProtoSettingsNavigation from './pages/ProtoSettingsNavigation';

export function Component() {
  return (
    <Routes>
      <Route index element={<Navigate to="about" replace />} />
      <Route path="about" element={<ProtoSettingsAbout />} />
      <Route path="settings" element={<ProtoSettingsSettings />} />
      <Route path="navigation" element={<ProtoSettingsNavigation />} />
      <Route path="versions" element={<ProtoSettingsVersions />} />
    </Routes>
  );
}

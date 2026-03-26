import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './state/app-store';
import { useNavStore } from './state/nav-store';
import { labelToSlug } from './lib/nav-routes';
import PlaceholderPage from './pages/PlaceholderPage';
import ProtoSettingsAbout from './pages/ProtoSettingsAbout';
import ProtoSettingsSettings from './pages/ProtoSettingsSettings';
import ProtoSettingsVersions from './pages/ProtoSettingsVersions';
import ProtoSettingsNavigation from './pages/ProtoSettingsNavigation';


export default function App() {
  const protoName = useAppStore((s) => s.protoSettings.name);
  const topItems = useNavStore((s) => s.topItems);
  const bottomItems = useNavStore((s) => s.bottomItems);

  useEffect(() => {
    document.title = protoName || 'Prototype';
  }, [protoName]);

  const allItems = [...topItems, ...bottomItems];
  const firstSlug = topItems.length > 0 ? labelToSlug(topItems[0].label) : 'overview';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={__DEV__ ? '/proto-settings/about' : `/${firstSlug}`} replace />} />

      {/* Nav item routes */}
      {allItems.map((item, i) => (
        <Route
          key={item.id}
          path={`/${labelToSlug(item.label)}`}
          element={<PlaceholderPage title={item.label} activeIndex={i < topItems.length ? i : -1} />}
        />
      ))}

      {/* Proto-settings — dev only */}
      {__DEV__ && (
        <>
          <Route path="/proto-settings" element={<Navigate to="/proto-settings/about" replace />} />
          <Route path="/proto-settings/about" element={<ProtoSettingsAbout />} />
          <Route path="/proto-settings/settings" element={<ProtoSettingsSettings />} />
          <Route path="/proto-settings/navigation" element={<ProtoSettingsNavigation />} />
          <Route path="/proto-settings/versions" element={<ProtoSettingsVersions />} />
        </>
      )}
    </Routes>
  );
}

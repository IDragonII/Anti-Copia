import { Users, Video, BarChart3, Warehouse } from 'lucide-react';

const TABS = [
  { id: 'registro', label: 'Trabajadores', icono: Users },
  { id: 'monitoreo', label: 'Monitoreo', icono: Video },
  { id: 'reporte', label: 'Trazabilidad', icono: BarChart3 },
];

function Navigation({ tabActiva, setTabActiva, sidebar }) {
  if (sidebar) {
    return (
      <nav style={{
        width: 64,
        height: '100vh',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid #E2E8F0',
        boxShadow: '1px 0 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
        flexShrink: 0,
        zIndex: 50,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          marginBottom: 24,
        }}>
          <Warehouse style={{ width: 18, height: 18, color: '#FFFFFF' }} />
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          flex: 1,
        }}>
          {TABS.map((tab) => {
            const Icon = tab.icono;
            const isActive = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2,
                  padding: '10px 4px', borderRadius: 12,
                  border: 'none', cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                  transition: 'all 0.2s',
                  width: 56,
                }}
              >
                <Icon style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '56px', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>
            <Warehouse style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
          </div>
          <span style={{
            fontSize: '16px', fontWeight: 700, color: '#0F172A',
          }}>
            InvenTrack
          </span>
        </div>

        <div style={{
          display: 'flex', gap: '4px', padding: '3px',
          background: '#F1F5F9', borderRadius: '12px',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          {TABS.map((tab) => {
            const Icon = tab.icono;
            const isActive = tabActiva === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center',
                  gap: '5px', padding: '7px 12px', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 500, border: 'none',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: isActive ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                <Icon style={{ width: '15px', height: '15px' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

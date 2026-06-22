import { useState } from 'react';
import { Toaster } from 'sonner';
import type { User, View, AuditLog } from './types';
import { mockUsers, mockMedicines, mockPatients, mockContraindications, mockInteractions, mockPrescriptions, mockAuditLogs } from './mockData';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MedicineCatalog } from './components/MedicineCatalog';
import { PatientManagement } from './components/PatientManagement';
import { PrescriptionManagement } from './components/PrescriptionManagement';
import { ContraindicationRules } from './components/ContraindicationRules';
import { DrugInteractions } from './components/DrugInteractions';
import { InventoryManagement } from './components/InventoryManagement';
import { UserManagement } from './components/UserManagement';
import { AuditLogs } from './components/AuditLogs';
import { Settings } from './components/Settings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const [medicines, setMedicines] = useState(mockMedicines);
  const [patients, setPatients] = useState(mockPatients);
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [users, setUsers] = useState(mockUsers);
  const [contraindications, setContraindications] = useState(mockContraindications);
  const [interactions, setInteractions] = useState(mockInteractions);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

  const addAuditLog = (
    table: string,
    action: 'Them' | 'Sua' | 'Xoa' | 'Override',
    oldVal: string,
    newVal: string,
    reason?: string
  ) => {
    if (!currentUser) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const newLog: AuditLog = {
      id: Math.max(...auditLogs.map(l => l.id), 0) + 1,
      userID: currentUser.id,
      tenNguoiDung: currentUser.hoTen,
      bangDuLieu: table,
      hanhDong: action,
      thoiGian: timeStr,
      giaTriCu: oldVal,
      giaTriMoi: newVal,
      lyDoOverride: reason,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const alertCount = medicines.filter(m => m.trangThai && (m.tonKho < m.tonKhoToiThieu || new Date(m.hanDung) < today || (new Date(m.hanDung) >= today && new Date(m.hanDung) <= in30Days))).length;

  if (!currentUser) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={(user) => { setCurrentUser(user); setCurrentView('dashboard'); }} />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} medicines={medicines} patients={patients} prescriptions={prescriptions} />;
      case 'medicines':
        return <MedicineCatalog medicines={medicines} setMedicines={setMedicines} currentUser={currentUser} addAuditLog={addAuditLog} />;
      case 'patients':
        return <PatientManagement patients={patients} setPatients={setPatients} currentUser={currentUser} addAuditLog={addAuditLog} />;
      case 'prescriptions':
        return (
          <PrescriptionManagement
            prescriptions={prescriptions} setPrescriptions={setPrescriptions}
            medicines={medicines} setMedicines={setMedicines} patients={patients}
            contraindications={contraindications} interactions={interactions}
            currentUser={currentUser} addAuditLog={addAuditLog}
          />
        );
      case 'contraindications':
        return <ContraindicationRules rules={contraindications} setRules={setContraindications} medicines={medicines} currentUser={currentUser} addAuditLog={addAuditLog} />;
      case 'interactions':
        return <DrugInteractions interactions={interactions} setInteractions={setInteractions} medicines={medicines} currentUser={currentUser} addAuditLog={addAuditLog} />;
      case 'inventory':
        return <InventoryManagement medicines={medicines} setMedicines={setMedicines} currentUser={currentUser} addAuditLog={addAuditLog} />;
      case 'users':
        return <UserManagement users={users} setUsers={setUsers} currentUser={currentUser} addAuditLog={addAuditLog} />;
      case 'audit-logs':
        return <AuditLogs logs={auditLogs} />;
      case 'settings':
        return <Settings currentUser={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <Layout
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={() => setCurrentUser(null)}
        alertCount={alertCount}
      >
        {renderView()}
      </Layout>
    </>
  );
}

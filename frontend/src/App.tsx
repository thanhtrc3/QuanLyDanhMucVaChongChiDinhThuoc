import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import type { User, View, AuditLog } from './types';
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
import { DrugGroupManagement } from './components/DrugGroupManagement';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const [medicines, setMedicines] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [contraindications, setContraindications] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Chỉ tải dữ liệu từ API khi đã đăng nhập
    if (currentUser) {
      fetch('/api/thuoc')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMedicines(data);
        })
        .catch(err => console.error('Lỗi tải danh sách thuốc:', err));

      fetch('/api/benh-nhan', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        .then(res => res.json())
        .then(resData => {
          if (Array.isArray(resData.data)) setPatients(resData.data);
        })
        .catch(err => console.error('Lỗi tải danh sách bệnh nhân:', err));

      fetch('/api/don-thuoc', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setPrescriptions(data);
        })
        .catch(err => console.error('Lỗi tải danh sách đơn thuốc:', err));

      fetch('/api/chong-chi-dinh', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setContraindications(data);
        })
        .catch(err => console.error('Lỗi tải danh sách chống chỉ định:', err));

      fetch('/api/tuong-tac-thuoc', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setInteractions(data);
        })
        .catch(err => console.error('Lỗi tải danh sách tương tác thuốc:', err));
    }
  }, [currentUser]);

  const addAuditLog = (
    table: string,
    action: 'Them' | 'Sua' | 'Xoa' | 'Override',
    oldVal: string,
    newVal: string,
    reason?: string
  ) => {
    if (!currentUser) return;
    const token = localStorage.getItem('token');
    fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ bangDuLieu: table, hanhDong: action, giaTriCu: oldVal, giaTriMoi: newVal, lyDoOverride: reason || '' })
    }).catch(err => console.error('Lỗi ghi audit log:', err));
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
      case 'drug-groups':
        return <DrugGroupManagement currentUser={currentUser} addAuditLog={addAuditLog} />;
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

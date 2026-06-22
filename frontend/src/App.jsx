import { useEffect, useMemo, useState } from 'react';
import PrescriptionWorkspace from './components/PrescriptionWorkspace.jsx';
import ContraindicationRules from './components/ContraindicationRules.jsx';
import Login from './components/Login.jsx';
import AuditLogUI from './components/AuditLogUI.jsx';
import { AlertTriangle, AlertCircle, LogOut } from 'lucide-react';

const categoryOptions = ['Kháng sinh', 'Giảm đau - hạ sốt', 'Tim mạch', 'Tiêu hóa', 'Hô hấp', 'Dị ứng', 'Vitamin - khoáng chất', 'Khác'];
const unitOptions = ['viên', 'vỉ', 'hộp', 'chai', 'ống', 'gói', 'tuýp', 'lọ'];
const solidUnitFactors = { viên: 1, vỉ: 10, hộp: 100 };
const atcPattern = /^[A-Z][0-9]{2}[A-Z]{2}[0-9]{2}$/;

const sampleGroups = [
  { nhomThuocID: 1, tenNhom: 'Kháng sinh beta-lactam', moTa: 'Penicillin, cephalosporin' },
  { nhomThuocID: 2, tenNhom: 'Giảm đau thông dụng', moTa: 'Thuốc giảm đau - hạ sốt' },
  { nhomThuocID: 3, tenNhom: 'Điều trị tim mạch', moTa: 'Huyết áp, suy tim' }
];

const emptyForm = {
  thuocID: null,
  maATC: '',
  tenThuongMai: '',
  hoatChat: '',
  hamLuong: '',
  phanLoai: 'Kháng sinh',
  nhomThuocID: '',
  donViTinh: 'viên',
  tonKhoHienTai: 0,
  tonToiThieu: 10,
  ngaySanXuat: '',
  ngayHetHan: ''
};

const sampleMedicines = [
  {
    thuocID: 1,
    maATC: 'J01CA04',
    tenThuongMai: 'Amoxicillin 500mg',
    hoatChat: 'Amoxicillin',
    hamLuong: '500mg',
    phanLoai: 'Kháng sinh',
    nhomThuocID: 1,
    donViTinh: 'viên',
    tonKhoHienTai: 348,
    tonToiThieu: 80,
    ngayHetHan: '2027-04-30'
  },
  {
    thuocID: 2,
    maATC: 'N02BE01',
    tenThuongMai: 'Paracetamol 500mg',
    hoatChat: 'Paracetamol',
    hamLuong: '500mg',
    phanLoai: 'Giảm đau - hạ sốt',
    nhomThuocID: 2,
    donViTinh: 'viên',
    tonKhoHienTai: 72,
    tonToiThieu: 120,
    ngayHetHan: '2026-12-15'
  },
  {
    thuocID: 3,
    maATC: 'C09AA03',
    tenThuongMai: 'Lisinopril 10mg',
    hoatChat: 'Lisinopril',
    hamLuong: '10mg',
    phanLoai: 'Tim mạch',
    nhomThuocID: 3,
    donViTinh: 'hộp',
    tonKhoHienTai: 24,
    tonToiThieu: 30,
    ngayHetHan: '2028-02-01'
  }
];

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

function stockStatus(medicine) {
  if (Number(medicine.tonKhoHienTai) <= Number(medicine.tonToiThieu)) {
    return { label: 'Cần nhập', tone: 'warning' };
  }

  return { label: 'Ổn định', tone: 'success' };
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeView, setActiveView] = useState('catalog');
  const [medicines, setMedicines] = useState(sampleMedicines);
  const [groups, setGroups] = useState(sampleGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [converter, setConverter] = useState({ quantity: 1, fromUnit: 'hộp', toUnit: 'viên' });
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('Đang dùng dữ liệu mẫu nếu backend chưa sẵn sàng.');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const groupNameById = useMemo(() => {
    return groups.reduce((map, group) => ({ ...map, [group.nhomThuocID]: group.tenNhom }), {});
  }, [groups]);

  const conversionResult = useMemo(() => {
    const quantity = Number(converter.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) return 'Số lượng không hợp lệ';
    if (converter.fromUnit === converter.toUnit) return `${quantity} ${converter.toUnit}`;
    if (!solidUnitFactors[converter.fromUnit] || !solidUnitFactors[converter.toUnit]) {
      return 'Chỉ hỗ trợ đổi giữa hộp, vỉ và viên';
    }

    const result = (quantity * solidUnitFactors[converter.fromUnit]) / solidUnitFactors[converter.toUnit];
    return `${Number(result.toFixed(2))} ${converter.toUnit}`;
  }, [converter]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [medicineResponse, groupResponse] = await Promise.all([
        fetch('/api/thuoc'),
        fetch('/api/nhom-thuoc')
      ]);
      if (!medicineResponse.ok || !groupResponse.ok) throw new Error('API unavailable');
      setMedicines(await medicineResponse.json());
      setGroups(await groupResponse.json());
      setNotice('Đã đồng bộ danh mục thuốc và nhóm thuốc từ backend.');
    } catch (_error) {
      setMedicines(sampleMedicines);
      setGroups(sampleGroups);
      setNotice('Backend chưa chạy, giao diện đang hiển thị dữ liệu mẫu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const filteredMedicines = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return medicines;

    return medicines.filter((medicine) => (
      medicine.maATC?.toLowerCase().includes(keyword)
      || medicine.tenThuongMai?.toLowerCase().includes(keyword)
      || medicine.hoatChat?.toLowerCase().includes(keyword)
      || medicine.phanLoai?.toLowerCase().includes(keyword)
      || groupNameById[medicine.nhomThuocID]?.toLowerCase().includes(keyword)
    ));
  }, [groupNameById, medicines, query]);

  function updateField(field, value) {
    if (formError) setFormError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateConverter(field, value) {
    setConverter((current) => ({ ...current, [field]: value }));
  }

  function editMedicine(medicine) {
    setForm({
      ...emptyForm,
      ...medicine,
      phanLoai: medicine.phanLoai || 'Khác',
      nhomThuocID: medicine.nhomThuocID || '',
      ngaySanXuat: medicine.ngaySanXuat?.slice(0, 10) || '',
      ngayHetHan: medicine.ngayHetHan?.slice(0, 10) || ''
    });
  }

  async function saveMedicine(event) {
    event.preventDefault();
    const payload = {
      ...form,
      maATC: form.maATC.trim().toUpperCase(),
      tenThuongMai: form.tenThuongMai.trim(),
      hoatChat: form.hoatChat.trim(),
      nhomThuocID: form.nhomThuocID ? Number(form.nhomThuocID) : null,
      tonKhoHienTai: Number(form.tonKhoHienTai),
      tonToiThieu: Number(form.tonToiThieu)
    };

    if (!atcPattern.test(payload.maATC)) {
      setFormError('Mã ATC phải đúng định dạng, ví dụ J01CA04.');
      return;
    }

    const method = form.thuocID ? 'PUT' : 'POST';
    const url = form.thuocID ? `/api/thuoc/${form.thuocID}` : '/api/thuoc';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Save failed');
      const saved = await response.json();
      setMedicines((current) => (
        form.thuocID
          ? current.map((item) => (item.thuocID === saved.thuocID ? saved : item))
          : [saved, ...current]
      ));
      setForm(emptyForm);
      setNotice(form.thuocID ? 'Đã cập nhật thuốc.' : 'Đã thêm thuốc mới.');
    } catch (_error) {
      setMedicines((current) => {
        if (form.thuocID) {
          return current.map((item) => (item.thuocID === form.thuocID ? payload : item));
        }

        return [{ ...payload, thuocID: Date.now() }, ...current];
      });
      setForm(emptyForm);
      setNotice('Đã lưu tạm trên giao diện vì backend chưa phản hồi.');
    }
  }

  async function deleteMedicine(thuocID) {
    if (!window.confirm('Bạn có chắc muốn xoá thuốc này?')) return;
    try {
      const response = await fetch(`/api/thuoc/${thuocID}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Lỗi khi xóa thuốc');
        return;
      }
      setNotice('Đã xóa thuốc.');
      setMedicines((current) => current.filter((item) => item.thuocID !== thuocID));
    } catch (_error) {
      alert('Lỗi kết nối hoặc server không phản hồi.');
    }
  }

  async function applyConversion() {
    if (!form.thuocID) {
      alert('Vui lòng click nút "Sửa" một thuốc bất kỳ bên phải để áp dụng quy đổi!');
      return;
    }
    const ratio = Math.round(conversionResult / (converter.quantity || 1)) || 1;

    if (!window.confirm(`Xác nhận quy đổi thuốc [${form.tenThuongMai}] sang đơn vị [${converter.toUnit}] với tỷ lệ 1 ${converter.fromUnit} = ${ratio} ${converter.toUnit}?`)) return;

    try {
      const res = await fetch(`/api/thuoc/${form.thuocID}/convert`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          fromUnit: converter.fromUnit,
          toUnit: converter.toUnit,
          ratio: ratio
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Quy đổi thất bại');
        return;
      }
      alert('Quy đổi đơn vị thành công!');
      setMedicines(current => current.map(item => item.thuocID === form.thuocID ? data.data : item));
      setForm(data.data);
    } catch (err) {
      alert('Lỗi khi quy đổi đơn vị');
    }
  }

  async function createGroup(event) {
    event.preventDefault();
    const tenNhom = newGroupName.trim();
    if (!tenNhom) return;

    try {
      const response = await fetch('/api/nhom-thuoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenNhom })
      });
      if (!response.ok) throw new Error('Create group failed');
      const group = await response.json();
      setGroups((current) => [...current, group]);
      setNotice('Đã thêm nhóm thuốc.');
    } catch (_error) {
      setGroups((current) => [...current, { nhomThuocID: Date.now(), tenNhom, moTa: 'Nhóm demo' }]);
      setNotice('Đã thêm nhóm thuốc tạm trên giao diện.');
    } finally {
      setNewGroupName('');
    }
  }

  async function deleteGroup(nhomThuocID) {
    try {
      await fetch(`/api/nhom-thuoc/${nhomThuocID}`, { method: 'DELETE' });
    } catch (_error) {
      setNotice('Đã xóa nhóm thuốc khỏi giao diện demo.');
    }

    setGroups((current) => current.filter((group) => group.nhomThuocID !== nhomThuocID));
    setMedicines((current) => current.map((medicine) => (
      medicine.nhomThuocID === nhomThuocID ? { ...medicine, nhomThuocID: null } : medicine
    )));
  }

  const totalStock = medicines.reduce((sum, item) => sum + Number(item.tonKhoHienTai || 0), 0);
  const lowStockCount = medicines.filter((item) => Number(item.tonKhoHienTai) <= Number(item.tonToiThieu)).length;
  const categoryCount = new Set(medicines.map((item) => item.phanLoai || 'Khác')).size;

  const expiredList = medicines.filter(m => m.ngayHetHan && new Date(m.ngayHetHan) < new Date());
  const lowStockList = medicines.filter(m => Number(m.tonKhoHienTai) <= Number(m.tonToiThieu));

  if (!user) {
    return (
      <Login 
        onLogin={(data) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }} 
      />
    );
  }

  if (activeView === 'prescription') {
    return <PrescriptionWorkspace medicines={medicines} onNavigate={setActiveView} />;
  }

  if (activeView === 'rules') {
    return <ContraindicationRules medicines={medicines} onNavigate={setActiveView} />;
  }

  if (activeView === 'audit' && user?.vaiTro === 'Quản trị viên') {
    return (
      <main className="app-shell">
        <aside className="sidebar">
          <div className="brand-mark">Rx</div>
          <h1>QLDM CCDT</h1>
          <nav aria-label="Điều hướng chính">
            <button className="nav-button" type="button" onClick={() => setActiveView('catalog')}>Danh mục thuốc</button>
            <button className="nav-button" type="button" onClick={() => setActiveView('prescription')}>Đơn thuốc</button>
            <button className="nav-button" type="button" onClick={() => setActiveView('rules')}>Chống chỉ định</button>
            <button className="nav-button" type="button">Nhóm thuốc</button>
            <button className="nav-button" type="button">Kho thuốc</button>
            <button className="nav-button active" type="button">Nhật ký hệ thống</button>
          </nav>
          <button 
            className="nav-button mt-auto" 
            type="button" 
            onClick={() => { localStorage.clear(); setUser(null); }}
            style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </aside>
        <section className="workspace p-0" style={{ padding: 0 }}>
          <AuditLogUI />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">Rx</div>
        <h1>QLDM CCDT</h1>
        <nav aria-label="Điều hướng chính">
          <button className="nav-button active" type="button">Danh mục thuốc</button>
          <button className="nav-button" type="button" onClick={() => setActiveView('prescription')}>Đơn thuốc</button>
          <button className="nav-button" type="button" onClick={() => setActiveView('rules')}>Chống chỉ định</button>
          <button className="nav-button" type="button">Nhóm thuốc</button>
          <button className="nav-button" type="button">Kho thuốc</button>
          {user?.vaiTro === 'Quản trị viên' && (
            <button className="nav-button" type="button" onClick={() => setActiveView('audit')}>Nhật ký hệ thống</button>
          )}
        </nav>
        <button 
          className="nav-button mt-auto" 
          type="button" 
          onClick={() => { localStorage.clear(); setUser(null); }}
          style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Quản lý danh mục</p>
            <h2>Danh mục thuốc</h2>
          </div>
          <div className="sync-state">{loading ? 'Đang tải...' : notice}</div>
        </header>

        <section className="metrics" aria-label="Tổng quan danh mục thuốc">
          <article><span>Tổng thuốc</span><strong>{medicines.length}</strong></article>
          <article><span>Tổng tồn kho</span><strong>{totalStock}</strong></article>
          <article><span>Cần nhập thêm</span><strong>{lowStockCount}</strong></article>
          <article><span>Phân loại</span><strong>{categoryCount}</strong></article>
        </section>

        {(expiredList.length > 0 || lowStockList.length > 0) && (
          <div className="alert-dashboard">
            <h3><AlertTriangle size={20} /> Cảnh báo Kho thuốc</h3>
            <ul>
              {expiredList.map(m => <li key={`exp-${m.thuocID}`}>Thuốc <strong>{m.tenThuongMai}</strong> ({m.maATC}) đã hết hạn từ ngày {formatDate(m.ngayHetHan)}!</li>)}
              {lowStockList.map(m => <li key={`low-${m.thuocID}`}>Thuốc <strong>{m.tenThuongMai}</strong> ({m.maATC}) sắp hết (Tồn kho: {m.tonKhoHienTai} {m.donViTinh}).</li>)}
            </ul>
          </div>
        )}

        <section className="content-grid">
          <div className="left-column">
            <form className="medicine-form" onSubmit={saveMedicine}>
              <div className="section-heading">
                <h3>{form.thuocID ? 'Sửa thuốc' : 'Thêm thuốc'}</h3>
                {form.thuocID && (
                  <button className="ghost-button" type="button" onClick={() => setForm(emptyForm)}>
                    Hủy sửa
                  </button>
                )}
              </div>

              <label>
                Mã ATC
                <input value={form.maATC} onChange={(event) => updateField('maATC', event.target.value.toUpperCase())} placeholder="J01CA04" required />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <label>
                Tên thương mại
                <input value={form.tenThuongMai} onChange={(event) => updateField('tenThuongMai', event.target.value)} required />
              </label>
              <label>
                Hoạt chất
                <input value={form.hoatChat} onChange={(event) => updateField('hoatChat', event.target.value)} required />
              </label>
              <div className="form-row">
                <label>
                  Phân loại
                  <select value={form.phanLoai} onChange={(event) => updateField('phanLoai', event.target.value)}>
                    {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label>
                  Đơn vị
                  <select value={form.donViTinh} onChange={(event) => updateField('donViTinh', event.target.value)} required>
                    {unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </label>
              </div>
              <label>
                Nhóm thuốc
                <select value={form.nhomThuocID || ''} onChange={(event) => updateField('nhomThuocID', event.target.value)}>
                  <option value="">Chưa gán nhóm</option>
                  {groups.map((group) => <option key={group.nhomThuocID} value={group.nhomThuocID}>{group.tenNhom}</option>)}
                </select>
              </label>
              <label>
                Hàm lượng
                <input value={form.hamLuong} onChange={(event) => updateField('hamLuong', event.target.value)} />
              </label>
              <div className="form-row">
                <label>
                  Tồn kho
                  <input type="number" min="0" value={form.tonKhoHienTai} onChange={(event) => updateField('tonKhoHienTai', event.target.value)} />
                </label>
                <label>
                  Tồn tối thiểu
                  <input type="number" min="0" value={form.tonToiThieu} onChange={(event) => updateField('tonToiThieu', event.target.value)} />
                </label>
              </div>
              <label>
                Ngày hết hạn
                <input type="date" value={form.ngayHetHan} onChange={(event) => updateField('ngayHetHan', event.target.value)} />
              </label>
              <button className="primary-button" type="submit">
                {form.thuocID ? 'Cập nhật thuốc' : 'Thêm thuốc'}
              </button>
            </form>

            <section className="group-panel">
              <div className="section-heading">
                <h3>Nhóm thuốc</h3>
                <span>{groups.length} nhóm</span>
              </div>
              <form className="inline-form" onSubmit={createGroup}>
                <input placeholder="Tên nhóm thuốc" value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} />
                <button className="ghost-button" type="submit">Thêm</button>
              </form>
              <div className="group-list">
                {groups.map((group) => (
                  <div className="group-item" key={group.nhomThuocID}>
                    <span>{group.tenNhom}</span>
                    <button type="button" onClick={() => deleteGroup(group.nhomThuocID)}>Xóa</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="group-panel">
              <div className="section-heading">
                <h3>Đổi đơn vị</h3>
              </div>
              <div className="converter-grid">
                <label>
                  Số lượng
                  <input type="number" min="0" value={converter.quantity} onChange={(event) => updateConverter('quantity', event.target.value)} />
                </label>
                <label>
                  Từ
                  <select value={converter.fromUnit} onChange={(event) => updateConverter('fromUnit', event.target.value)}>
                    {unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </label>
                <label>
                  Sang
                  <select value={converter.toUnit} onChange={(event) => updateConverter('toUnit', event.target.value)}>
                    {unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </label>
              </div>
              <div className="conversion-result">
                {converter.quantity || 0} {converter.fromUnit} = <strong>{conversionResult}</strong>
              </div>
              <button 
                className="secondary-button" 
                type="button" 
                style={{ width: '100%', marginTop: '10px' }}
                onClick={applyConversion}
              >
                Áp dụng quy đổi cho Thuốc đang sửa
              </button>
            </section>
          </div>

          <section className="table-panel">
            <div className="table-toolbar">
              <h3>Danh sách thuốc</h3>
              <input aria-label="Tìm kiếm thuốc" placeholder="Tìm mã ATC, tên thuốc, nhóm thuốc" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã ATC</th>
                    <th>Tên thuốc</th>
                    <th>Nhóm thuốc</th>
                    <th>Phân loại</th>
                    <th>Tồn kho</th>
                    <th>Hạn dùng</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((medicine) => {
                    const status = stockStatus(medicine);
                    const isExpired = medicine.ngayHetHan && new Date(medicine.ngayHetHan) < new Date();
                    return (
                      <tr key={medicine.thuocID} className={isExpired ? 'expired-row' : ''}>
                        <td>{medicine.maATC}</td>
                        <td><strong>{medicine.tenThuongMai}</strong><small>{medicine.hoatChat} · {medicine.hamLuong || 'Chưa nhập hàm lượng'}</small></td>
                        <td>{groupNameById[medicine.nhomThuocID] || 'Chưa gán'}</td>
                        <td>{medicine.phanLoai || 'Khác'}</td>
                        <td>{medicine.tonKhoHienTai} {medicine.donViTinh}</td>
                        <td>{formatDate(medicine.ngayHetHan)}</td>
                        <td><span className={`badge ${status.tone}`}>{isExpired ? 'Hết hạn' : status.label}</span></td>
                        <td>
                          <div className="row-actions">
                            <button type="button" disabled={isExpired} onClick={() => editMedicine(medicine)}>Sửa</button>
                            <button className="danger-link" type="button" onClick={() => deleteMedicine(medicine.thuocID)}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;

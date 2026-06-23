// File: frontend/src/components/ContraindicationRules.jsx
import { ClipboardList, Pill, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const fieldOptions = [
  { value: 'TUOI', label: 'Tuổi' },
  { value: 'CAN_NANG', label: 'Cân nặng (kg)' },
  { value: 'GIOI_TINH', label: 'Giới tính' },
  { value: 'THAI_KY', label: 'Thai kỳ' },
  { value: 'DI_UNG', label: 'Dị ứng hoạt chất' }
];

const operatorOptions = ['=', '!=', '<', '<=', '>', '>=', 'CONTAINS'];

function newCondition() {
  return { localID: `${Date.now()}-${Math.random()}`, connector: 'AND', field: 'TUOI', operator: '<', value: '' };
}

function buildExpression(conditions) {
  return conditions.map((condition, index) => {
    const expression = `${condition.field} ${condition.operator} ${JSON.stringify(condition.value)}`;
    return index === 0 ? expression : `${condition.connector} ${expression}`;
  }).join(' ');
}

export default function ContraindicationRules({ medicines, onNavigate }) {
  // Lấy quyền user từ localStorage (hoặc Context tùy nhóm bạn)
  const userRole = JSON.parse(localStorage.getItem('user'))?.role; 
  
  const [form, setForm] = useState({
    tenQuyTac: '',
    thuocID: medicines[0]?.thuocID || '',
    mucDo: 'CẢNH BÁO',
    thongDiep: '',
    kichHoat: true
  });
  const [conditions, setConditions] = useState([newCondition()]);
  const [rules, setRules] = useState([]);
  const [notice, setNotice] = useState('Tạo quy tắc theo đặc điểm của đối tượng sử dụng thuốc.');

  const expression = useMemo(() => buildExpression(conditions), [conditions]);
  const medicineById = useMemo(() => (
    medicines.reduce((map, medicine) => ({ ...map, [medicine.thuocID]: medicine }), {})
  ), [medicines]);

  function updateForm(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function updateCondition(localID, field, value) {
    setConditions((current) => current.map((condition) => (
      condition.localID === localID ? { ...condition, [field]: value } : condition
    )));
  }
  function removeCondition(localID) {
    setConditions((current) => current.length === 1 ? [newCondition()] : current.filter((condition) => condition.localID !== localID));
  }

  async function saveRule(event) {
    event.preventDefault();
    if (!form.tenQuyTac.trim() || !form.thongDiep.trim() || conditions.some((condition) => !condition.value.trim())) {
      setNotice('Vui lòng nhập đủ tên, giá trị điều kiện và thông điệp cảnh báo.');
      return;
    }

    const payload = { ...form, thuocID: Number(form.thuocID), bieuThuc: expression, dieuKien: conditions.map((c) => { const copy = { ...c }; delete copy.localID; return copy; }) };

    try {
      const response = await fetch('/api/chong-chi-dinh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API unavailable');
      const saved = await response.json();
      setRules((current) => [saved, ...current]);
      setNotice('Đã lưu quy tắc chống chỉ định.');
    } catch (error) {
      console.error(error);
      setRules((current) => [{ ...payload, quyTacID: Date.now() }, ...current]);
      setNotice('Đã lưu quy tắc trên giao diện; API QCD-58 chưa sẵn sàng.');
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">Rx</div>
        <h1>QLDM CCDT</h1>
        <nav aria-label="Điều hướng chính">
          <button className="nav-button" type="button" onClick={() => onNavigate('catalog')}><Pill size={18} /> Danh mục thuốc</button>
          <button className="nav-button" type="button" onClick={() => onNavigate('prescription')}><ClipboardList size={18} /> Đơn thuốc</button>
          <button className="nav-button active" type="button"><ShieldAlert size={18} /> Chống chỉ định</button>
        </nav>
      </aside>

      <section className="workspace rules-workspace">
        <header className="topbar">
          <div><p className="eyebrow">Quản lý chống chỉ định</p><h2>Thiết lập Rule CCĐ</h2></div>
          <span className="sync-state">{notice}</span>
        </header>

        <div className="rules-layout">
          <form className="rule-form-panel" onSubmit={saveRule}>
            <div className="section-heading">
              <h3>Thông tin quy tắc</h3>
              <label className="toggle-label">
                <input type="checkbox" checked={form.kichHoat} onChange={(event) => updateForm('kichHoat', event.target.checked)} /> Kích hoạt
              </label>
            </div>

            <label>Tên quy tắc<input value={form.tenQuyTac} onChange={(event) => updateForm('tenQuyTac', event.target.value)} placeholder="Ví dụ: Không dùng cho trẻ dưới 12 tuổi" /></label>
            <div className="form-row">
              <label>Thuốc áp dụng<select value={form.thuocID} onChange={(event) => updateForm('thuocID', event.target.value)}>{medicines.map((medicine) => <option key={medicine.thuocID} value={medicine.thuocID}>{medicine.maATC} - {medicine.tenThuongMai}</option>)}</select></label>
              <label>Mức độ<select value={form.mucDo} onChange={(event) => updateForm('mucDo', event.target.value)}><option value="THÔNG TIN">Thông tin</option><option value="CẢNH BÁO">Cảnh báo</option><option value="CHẶN">Chặn kê đơn</option></select></label>
            </div>

            <div className="condition-heading">
              <h3>Điều kiện đối tượng</h3>
              <button className="ghost-button icon-text-button" type="button" onClick={() => setConditions((current) => [...current, newCondition()])}><Plus size={16} /> Thêm điều kiện</button>
            </div>
            <div className="condition-list">
              {conditions.map((condition, index) => (
                <div className="condition-row" key={condition.localID}>
                  {index > 0 ? <select aria-label="Phép nối điều kiện" value={condition.connector} onChange={(event) => updateCondition(condition.localID, 'connector', event.target.value)}><option value="AND">Và</option><option value="OR">Hoặc</option></select> : <span className="condition-index">Nếu</span>}
                  <select aria-label="Trường điều kiện" value={condition.field} onChange={(event) => updateCondition(condition.localID, 'field', event.target.value)}>{fieldOptions.map((field) => <option key={field.value} value={field.value}>{field.label}</option>)}</select>
                  <select aria-label="Toán tử" value={condition.operator} onChange={(event) => updateCondition(condition.localID, 'operator', event.target.value)}>{operatorOptions.map((operator) => <option key={operator} value={operator}>{operator}</option>)}</select>
                  <input aria-label="Giá trị điều kiện" value={condition.value} onChange={(event) => updateCondition(condition.localID, 'value', event.target.value)} placeholder="Giá trị" />
                  <button className="icon-button danger-link" type="button" title="Xóa điều kiện" onClick={() => removeCondition(condition.localID)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <div className="expression-preview"><span>Biểu thức logic</span><code>{expression}</code></div>
            <label>Thông điệp cảnh báo<textarea value={form.thongDiep} onChange={(event) => updateForm('thongDiep', event.target.value)} placeholder="Thông điệp hiển thị cho người kê đơn" rows="3" /></label>
            
            {/* Logic phân quyền nút Lưu */}
            {userRole === 'ADMIN' ? (
              <button className="primary-button" type="submit">Lưu quy tắc</button>
            ) : (
              <button className="primary-button opacity-50 cursor-not-allowed" disabled type="button">Bạn không có quyền chỉnh sửa</button>
            )}
          </form>

          <section className="rules-panel">
            <div className="section-heading"><h3>Quy tắc vừa tạo</h3><span>{rules.length} quy tắc</span></div>
            <div className="rule-list">
              {rules.length ? rules.map((rule) => (
                <article className="rule-item" key={rule.quyTacID}>
                  <div><strong>{rule.tenQuyTac}</strong><span>{medicineById[rule.thuocID]?.tenThuongMai}</span></div>
                  <span className={`severity-badge severity-${rule.mucDo === 'CHẶN' ? 'block' : 'warn'}`}>{rule.mucDo}</span>
                  <code>{rule.bieuThuc}</code><p>{rule.thongDiep}</p>
                </article>
              )) : <div className="empty-rule-state"><ShieldAlert size={28} /><p>Chưa có quy tắc mới trong phiên làm việc này.</p></div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
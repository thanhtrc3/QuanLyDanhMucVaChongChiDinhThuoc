import { ClipboardList, PackageOpen, Pill, Plus, Save, ShieldAlert, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MedicineAutocomplete from './MedicineAutocomplete.jsx';
import { calculateLineDose } from '../utils/dose.js';
import DoseWarningDialog from './DoseWarningDialog.jsx';

function createLine(medicine) {
  return {
    localID: `${Date.now()}-${Math.random()}`,
    thuocID: medicine?.thuocID || '',
    lieuMoiLan: 1,
    soLanNgay: 1,
    soNgay: 1,
    soLuong: 1,
    maxLieuNgay: '',
    mucDoCanhBao: 'TUYET_DOI',
    huongDan: ''
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function PrescriptionWorkspace({ medicines, onNavigate }) {
  const [header, setHeader] = useState({ tenBenhNhan: '', ngayKeDon: today(), ghiChu: '' });
  const [lines, setLines] = useState(() => [createLine(medicines[0])]);
  const [notice, setNotice] = useState('Đơn thuốc mới chưa được lưu.');
  const [saving, setSaving] = useState(false);
  const [doseWarning, setDoseWarning] = useState(null);
  const [dismissedWarning, setDismissedWarning] = useState('');
  const [warningOverrides, setWarningOverrides] = useState({});

  const medicineById = useMemo(() => (
    medicines.reduce((map, medicine) => ({ ...map, [medicine.thuocID]: medicine }), {})
  ), [medicines]);

  const doseWarnings = useMemo(() => {
    return lines.reduce((warnings, line) => {
      const dose = calculateLineDose(line);
      if (!dose.vuotLieu) return warnings;

      return [
        ...warnings,
        {
          line,
          dose,
          medicine: medicineById[line.thuocID],
          signature: `${line.localID}:${dose.tongLieuNgay}:${dose.maxLieuNgay}:${dose.mucDoCanhBao}`
        }
      ];
    }, []);
  }, [lines, medicineById]);

  const absoluteDoseWarning = useMemo(
    () => doseWarnings.find((warning) => warning.dose.isTuyetDoi) || null,
    [doseWarnings]
  );

  const activeDoseWarning = useMemo(() => {
    return doseWarnings.find((warning) => (
      warning.dose.isTuyetDoi || !warningOverrides[warning.signature]
    )) || null;
  }, [doseWarnings, warningOverrides]);

  const activeDoseWarning = useMemo(() => {
    for (const line of lines) {
      const dose = calculateLineDose(line);
      if (dose.vuotLieu) {
        return {
          line,
          dose,
          medicine: medicineById[line.thuocID],
          signature: `${line.localID}:${dose.tongLieuNgay}:${dose.maxLieuNgay}`
        };
      }
    }
    return null;
  }, [lines, medicineById]);

  useEffect(() => {
    if (activeDoseWarning && activeDoseWarning.signature !== dismissedWarning) {
      setDoseWarning(activeDoseWarning);
    }
    if (!activeDoseWarning) setDoseWarning(null);
  }, [activeDoseWarning, dismissedWarning]);

  function updateHeader(field, value) {
    setHeader((current) => ({ ...current, [field]: value }));
  }

  function updateLine(localID, field, value) {
    setLines((current) => current.map((line) => (
      line.localID === localID ? { ...line, [field]: value } : line
    )));
  }

  function addLine() {
    setLines((current) => [...current, createLine(medicines[0])]);
  }

  function removeLine(localID) {
    setLines((current) => current.length === 1
      ? [createLine(medicines[0])]
      : current.filter((line) => line.localID !== localID));
  }

  function overrideDoseWarning(signature, reason) {
    const normalizedReason = reason.trim();
    setWarningOverrides((current) => ({
      ...current,
      [signature]: normalizedReason
    }));
    setDismissedWarning(signature);
    setDoseWarning(null);
    setNotice('Đã ghi nhận lý do bỏ qua cảnh báo thận trọng.');
  }

  async function saveDraft() {
    if (!header.tenBenhNhan.trim()) {
      setNotice('Vui lòng nhập tên bệnh nhân trước khi lưu.');
      return;
    }

    if (activeDoseWarning) {
      setDoseWarning(activeDoseWarning);
      setNotice(activeDoseWarning.dose.isTuyetDoi
        ? 'Không thể lưu khi đơn thuốc còn rủi ro Tuyệt đối.'
        : 'Vui lòng nhập lý do bỏ qua cảnh báo Thận trọng trước khi lưu.');
      setNotice('Không thể lưu khi đơn thuốc còn dòng vượt liều.');
      return;
    }

    setSaving(true);
    try {
      const chiTiet = lines.map(({ localID, ...line }) => {
        const dose = calculateLineDose(line);
        const signature = `${localID}:${dose.tongLieuNgay}:${dose.maxLieuNgay}:${dose.mucDoCanhBao}`;

        return {
          ...line,
          thuocID: Number(line.thuocID),
          lieuMoiLan: Number(line.lieuMoiLan),
          soLanNgay: Number(line.soLanNgay),
          soNgay: Number(line.soNgay),
          soLuong: Number(line.soLuong),
          lyDoOverrideCanhBao: warningOverrides[signature] || ''
        };
      });
      const chiTiet = lines.map(({ localID: _localID, ...line }) => ({
        ...line,
        thuocID: Number(line.thuocID),
        lieuMoiLan: Number(line.lieuMoiLan),
        soLanNgay: Number(line.soLanNgay),
        soNgay: Number(line.soNgay),
        soLuong: Number(line.soLuong)
      }));
      const response = await fetch('/api/don-thuoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...header, chiTiet })
      });
      if (!response.ok) throw new Error('Save failed');
      const saved = await response.json();
      setNotice(`Đã lưu đơn thuốc ${saved.maDonThuoc} với ${saved.chiTiet.length} dòng thuốc.`);
    } catch (_error) {
      setNotice('Backend chưa sẵn sàng; dữ liệu vẫn được giữ trên màn hình.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">Rx</div>
        <h1>QLDM CCDT</h1>
        <nav aria-label="Điều hướng chính">
          <button className="nav-button" type="button" onClick={() => onNavigate('catalog')}>
            <Pill size={18} /> Danh mục thuốc
          </button>
          <button className="nav-button active" type="button">
            <ClipboardList size={18} /> Đơn thuốc
          </button>
          <button className="nav-button" type="button" onClick={() => onNavigate('rules')}>
            <ShieldAlert size={18} /> Chống chỉ định
          </button>
          <button className="nav-button" type="button">
            <PackageOpen size={18} /> Kho thuốc
          </button>
        </nav>
      </aside>

      <section className="workspace prescription-workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Quản lý đơn thuốc</p>
            <h2>Lập toa thuốc mới</h2>
          </div>
          <div className="toolbar-actions">
            <span className="sync-state">{notice}</span>
            <button
              className="primary-button icon-text-button"
              type="button"
              onClick={saveDraft}
              disabled={saving || Boolean(absoluteDoseWarning)}
              title={absoluteDoseWarning ? 'Không thể lưu khi còn rủi ro Tuyệt đối' : 'Lưu đơn thuốc'}
            >
            <button className="primary-button icon-text-button" type="button" onClick={saveDraft} disabled={saving}>
              <Save size={17} /> {saving ? 'Đang lưu' : 'Lưu đơn thuốc'}
            </button>
          </div>
        </header>

        <section className="prescription-header" aria-label="Thông tin đơn thuốc">
          <label>
            Bệnh nhân
            <input
              value={header.tenBenhNhan}
              onChange={(event) => updateHeader('tenBenhNhan', event.target.value)}
              placeholder="Nhập họ tên bệnh nhân"
            />
          </label>
          <label>
            Ngày kê đơn
            <input type="date" value={header.ngayKeDon} onChange={(event) => updateHeader('ngayKeDon', event.target.value)} />
          </label>
          <label className="wide-field">
            Ghi chú
            <input value={header.ghiChu} onChange={(event) => updateHeader('ghiChu', event.target.value)} placeholder="Chẩn đoán hoặc lưu ý sử dụng" />
          </label>
        </section>

        <section className="prescription-panel">
          <div className="section-heading prescription-table-heading">
            <div>
              <h3>Chi tiết toa thuốc</h3>
              <p>{lines.length} dòng thuốc</p>
            </div>
            <button className="ghost-button icon-text-button" type="button" onClick={addLine}>
              <Plus size={17} /> Thêm thuốc
            </button>
          </div>

          <div className="table-wrap">
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Thuốc</th>
                  <th>Liều/lần</th>
                  <th>Lần/ngày</th>
                  <th>Số ngày</th>
                  <th>Giới hạn/ngày</th>
                  <th>Mức cảnh báo</th>
                  <th>Tổng liều</th>
                  <th>Số lượng</th>
                  <th>Hướng dẫn</th>
                  <th aria-label="Xóa dòng" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const medicine = medicineById[line.thuocID];
                  const dose = calculateLineDose(line);
                  return (
                    <tr key={line.localID}>
                      <td className="medicine-select-cell">
                        <MedicineAutocomplete
                          medicines={medicines}
                          value={line.thuocID}
                          onSelect={(selectedMedicine) => updateLine(line.localID, 'thuocID', selectedMedicine.thuocID)}
                        />
                        <small>{medicine?.hoatChat} · {medicine?.hamLuong}</small>
                      </td>
                      <td><input type="number" min="0.01" step="0.01" value={line.lieuMoiLan} onChange={(event) => updateLine(line.localID, 'lieuMoiLan', event.target.value)} /></td>
                      <td><input type="number" min="1" value={line.soLanNgay} onChange={(event) => updateLine(line.localID, 'soLanNgay', event.target.value)} /></td>
                      <td><input type="number" min="1" value={line.soNgay} onChange={(event) => updateLine(line.localID, 'soNgay', event.target.value)} /></td>
                      <td><input type="number" min="0.01" step="0.01" value={line.maxLieuNgay} onChange={(event) => updateLine(line.localID, 'maxLieuNgay', event.target.value)} placeholder="Chưa đặt" /></td>
                      <td>
                        <select value={line.mucDoCanhBao} onChange={(event) => updateLine(line.localID, 'mucDoCanhBao', event.target.value)}>
                          <option value="TUYET_DOI">Tuyệt đối</option>
                          <option value="THAN_TRONG">Thận trọng</option>
                        </select>
                      </td>
                      <td className="generated-dose-cell">
                        <strong>{dose.tongLieuNgay}</strong>
                        <small>{dose.tongLieuDot} toàn đợt</small>
                      </td>
                      <td><input type="number" min="1" value={line.soLuong} onChange={(event) => updateLine(line.localID, 'soLuong', event.target.value)} /></td>
                      <td><input value={line.huongDan} onChange={(event) => updateLine(line.localID, 'huongDan', event.target.value)} placeholder="Sau ăn" /></td>
                      <td>
                        <button className="icon-button danger-link" type="button" title="Xóa dòng thuốc" onClick={() => removeLine(line.localID)}>
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
      <DoseWarningDialog
        warning={doseWarning}
        onOverride={overrideDoseWarning}
        onClose={() => {
          setDismissedWarning(doseWarning?.signature || '');
          setDoseWarning(null);
        }}
      />
    </main>
  );
}

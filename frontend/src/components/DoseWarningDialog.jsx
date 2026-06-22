import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DoseWarningDialog({ warning, onClose, onOverride }) {
  const [overrideReason, setOverrideReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  useEffect(() => {
    setOverrideReason('');
    setReasonError('');
  }, [warning?.signature]);

  if (!warning) return null;
  const isAbsolute = warning.dose.isTuyetDoi;
  const toneClass = isAbsolute ? 'absolute-risk' : 'caution-risk';
  const trimmedReason = overrideReason.trim();

  function submitOverride() {
    if (trimmedReason.length <= 10) {
      setReasonError('Lý do bắt buộc dài hơn 10 ký tự.');
      return;
    }

    onOverride?.(warning.signature, trimmedReason);
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className={`dose-warning-dialog ${toneClass}`} role="alertdialog" aria-modal="true" aria-labelledby="dose-warning-title">
        <div className="warning-dialog-heading">
          <span className="warning-icon"><AlertTriangle size={22} /></span>
          <div>
            <p>{isAbsolute ? 'Rủi ro tuyệt đối' : 'Rủi ro thận trọng'}</p>
            <h3 id="dose-warning-title">{isAbsolute ? 'Không thể lưu đơn thuốc' : 'Tổng liều vượt định mức'}</h3>

export default function DoseWarningDialog({ warning, onClose }) {
  if (!warning) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dose-warning-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dose-warning-title">
        <div className="warning-dialog-heading">
          <span className="warning-icon"><AlertTriangle size={22} /></span>
          <div>
            <p>Cảnh báo an toàn liều</p>
            <h3 id="dose-warning-title">Tổng liều vượt định mức</h3>
          </div>
          <button className="icon-button" type="button" title="Đóng cảnh báo" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="warning-dialog-body">
          <strong>{warning.medicine?.tenThuongMai || 'Thuốc đã chọn'}</strong>
          <dl>
            <div><dt>Tổng liều/ngày</dt><dd>{warning.dose.tongLieuNgay}</dd></div>
            <div><dt>Giới hạn/ngày</dt><dd>{warning.dose.maxLieuNgay}</dd></div>
            <div><dt>Vượt mức</dt><dd>+{Number((warning.dose.tongLieuNgay - warning.dose.maxLieuNgay).toFixed(2))}</dd></div>
          </dl>
          <p>
            {isAbsolute
              ? 'Cảnh báo đỏ mức Tuyệt đối yêu cầu điều chỉnh thuốc hoặc liều trước khi lưu.'
              : 'Hãy kiểm tra lại phác đồ và chỉ tiếp tục khi đã có lý do chuyên môn.'}
          </p>
          {!isAbsolute && (
            <label className="override-reason-field">
              Lý do bỏ qua cảnh báo
              <textarea
                value={overrideReason}
                onChange={(event) => {
                  setOverrideReason(event.target.value);
                  if (reasonError) setReasonError('');
                }}
                rows="3"
                placeholder="Nhập lý do chuyên môn trước khi bỏ qua cảnh báo"
              />
              <span className="field-hint">{trimmedReason.length}/11 ký tự tối thiểu</span>
              {reasonError && <span className="form-error">{reasonError}</span>}
            </label>
          )}
        </div>
        <div className="warning-dialog-actions">
          {!isAbsolute && (
            <button className="ghost-button" type="button" onClick={submitOverride}>
              Bỏ qua cảnh báo
            </button>
          )}
          <p>Hãy giảm liều mỗi lần hoặc số lần dùng trong ngày trước khi lưu đơn thuốc.</p>
        </div>
        <div className="warning-dialog-actions">
          <button className="primary-button" type="button" onClick={onClose}>Điều chỉnh liều</button>
        </div>
      </section>
    </div>
  );
}

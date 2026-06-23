const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const donThuocService = require('../services/donThuocService');

const router = express.Router();

function handleRouteError(res, error) {
  console.error(error);
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : 'Loi xu ly don thuoc',
    details: error.details || undefined
  });
}

router.get('/', async (_req, res) => {
  try {
    const list = await donThuocService.listDonThuoc();
    const formatted = list.map(p => ({
      ...p,
      ngayKe: p.ngayKeDon ? new Date(p.ngayKeDon).toISOString().split('T')[0] : null,
      trangThai: p.trangThai === 'Đã cấp' || p.trangThai === 'Da cap' ? 'Da cap' : (p.trangThai === 'Chờ duyệt' || p.trangThai === 'Cho duyet' ? 'Cho duyet' : 'Huy')
    }));
    return res.json(formatted);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prescription = await donThuocService.getDonThuoc(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Khong tim thay don thuoc' });
    const formatted = {
      ...prescription,
      ngayKe: prescription.ngayKeDon ? new Date(prescription.ngayKeDon).toISOString().split('T')[0] : null,
      trangThai: prescription.trangThai === 'Đã cấp' || prescription.trangThai === 'Da cap' ? 'Da cap' : (prescription.trangThai === 'Chờ duyệt' || prescription.trangThai === 'Cho duyet' ? 'Cho duyet' : 'Huy')
    };
    return res.json(formatted);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post('/draft', verifyToken, checkRole(['Admin', 'BacSi']), async (req, res) => {
  try {
    const prescription = await donThuocService.createDraft(req.body, req.user);
    return res.status(201).json(prescription);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post('/dose-check', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), (req, res) => {
  try {
    return res.json(donThuocService.checkDose(req.body));
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post('/', verifyToken, checkRole(['Admin', 'BacSi']), async (req, res) => {
  try {
    const prescription = await donThuocService.createPrescription(req.body, req.user);
    // Lấy lại thông tin đầy đủ sau khi tạo (có join với bảng Bệnh nhân, Bác sĩ)
    const fullPrescription = await donThuocService.getDonThuoc(prescription.id);
    const formatted = {
      ...fullPrescription,
      ngayKe: fullPrescription.ngayKeDon ? new Date(fullPrescription.ngayKeDon).toISOString().split('T')[0] : null,
      trangThai: fullPrescription.trangThai === 'Đã cấp' || fullPrescription.trangThai === 'Da cap' ? 'Da cap' : (fullPrescription.trangThai === 'Chờ duyệt' || fullPrescription.trangThai === 'Cho duyet' ? 'Cho duyet' : 'Huy')
    };
    return res.status(201).json(formatted);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.patch('/:id/status', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), async (req, res) => {
  try {
    await donThuocService.updateStatus(req.params.id, req.body.trangThai);
    res.json({ message: 'Success' });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.delete('/:id', verifyToken, checkRole(['Admin', 'BacSi']), async (req, res) => {
  try {
    await donThuocService.deleteDonThuoc(req.params.id);
    return res.json({ message: 'Xóa đơn thuốc thành công' });
  } catch (error) {
    if (error.message === 'Không tìm thấy đơn thuốc để xóa') {
      return res.status(404).json({ message: error.message });
    }
    return handleRouteError(res, error);
  }
});

module.exports = router;

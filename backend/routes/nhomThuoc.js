const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const nhomThuocService = require('../services/nhomThuocService');

const router = express.Router();

function handleRouteError(res, error, fallbackMessage) {
  console.error(error);
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : fallbackMessage,
    details: error.details || undefined
  });
}

router.get('/', async (_req, res) => {
  try {
    const groups = await nhomThuocService.listGroups();
    return res.json(groups);
  } catch (error) {
    return handleRouteError(res, error, 'Loi lay danh sach nhom thuoc');
  }
});

router.post('/', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), async (req, res) => {
  try {
    const group = await nhomThuocService.createGroup(req.body);
    return res.status(201).json(group);
  } catch (error) {
    return handleRouteError(res, error, 'Loi them nhom thuoc');
  }
});

router.put('/:id', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), async (req, res) => {
  try {
    const group = await nhomThuocService.updateGroup(req.params.id, req.body);
    if (!group) return res.status(404).json({ message: 'Khong tim thay nhom thuoc' });
    return res.json(group);
  } catch (error) {
    return handleRouteError(res, error, 'Loi cap nhat nhom thuoc');
  }
});

router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const deleted = await nhomThuocService.deleteGroup(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Khong tim thay nhom thuoc de xoa' });
    return res.json({ message: 'Da xoa nhom thuoc' });
  } catch (error) {
    return handleRouteError(res, error, 'Loi xoa nhom thuoc');
  }
});

module.exports = router;

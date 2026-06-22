const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const auditLog = require('./middleware/auditLog');
const thuocRoutes = require('./routes/thuoc');
const nhomThuocRoutes = require('./routes/nhomThuoc');
const donViRoutes = require('./routes/donVi');
const donThuocRoutes = require('./routes/donThuoc');

// Import Middleware
const auditLog = require('./middleware/auditLog');

// Khởi chạy Cron Jobs
require('./jobs/checkExpired');

// Import Routes
const thuocRoutes = require('./routes/thuoc');
const nguoiDungRoutes = require('./routes/nguoiDung');
const chongChiDinhRoutes = require('./routes/chongChiDinh');

require('./jobs/checkExpired');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(auditLog);

app.use('/api/thuoc', thuocRoutes);
app.use('/api/nhom-thuoc', nhomThuocRoutes);
app.use('/api/don-vi', donViRoutes);
app.use('/api/don-thuoc', donThuocRoutes);
app.use('/api/nguoidung', nguoiDungRoutes);
app.use('/api/chongchidinh', chongChiDinhRoutes);
app.use('/api/chong-chi-dinh', chongChiDinhRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend Quan Ly Danh Muc Va Chong Chi Dinh Thuoc dang hoat dong'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

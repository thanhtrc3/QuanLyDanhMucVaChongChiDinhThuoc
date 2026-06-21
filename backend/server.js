const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Middleware
const auditLog = require('./middleware/auditLog');

// Import Routes
const thuocRoutes = require('./routes/thuoc');
const nguoiDungRoutes = require('./routes/nguoiDung');
const chongChiDinhRoutes = require('./routes/chongChiDinh');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Gắn Global Middleware: Bắt buộc mọi request thay đổi dữ liệu đều bị lưu lại Audit Log
app.use(auditLog);

// Gắn Routes
app.use('/api/thuoc', thuocRoutes);
app.use('/api/nguoidung', nguoiDungRoutes);
app.use('/api/chongchidinh', chongChiDinhRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hệ thống Backend (Nhóm 9) đang hoạt động mượt mà!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

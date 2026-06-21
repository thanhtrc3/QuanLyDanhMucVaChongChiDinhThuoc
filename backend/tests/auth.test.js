const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock db module before requiring the route
jest.mock('../db', () => ({
  poolPromise: Promise.resolve({
    request: () => ({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockImplementation((queryStr) => {
        if (queryStr.includes('WHERE tenDangNhap = @tenDangNhap')) {
          // Mock finding the user
          return Promise.resolve({
            recordset: [
              {
                userId: 1,
                tenDangNhap: 'admin',
                matKhauHash: 'hashedpassword',
                hoTen: 'Admin User',
                vaiTro: 'Admin',
                trangThai: 1
              }
            ]
          });
        }
        return Promise.resolve({ recordset: [] });
      })
    })
  }),
  sql: { VarChar: jest.fn() }
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockImplementation((password, hash) => {
    return Promise.resolve(password === 'correctpassword');
  })
}));

const nguoiDungRoutes = require('../routes/nguoiDung');

const app = express();
app.use(express.json());
app.use('/api/nguoidung', nguoiDungRoutes);

describe('Auth API - Login (QCD-25)', () => {
  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/nguoidung/login')
      .send({
        tenDangNhap: 'admin',
        matKhau: 'correctpassword'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('vaiTro', 'Admin');
  });

  it('should return 401 with incorrect password', async () => {
    const res = await request(app)
      .post('/api/nguoidung/login')
      .send({
        tenDangNhap: 'admin',
        matKhau: 'wrongpassword'
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Sai mật khẩu!');
  });
});

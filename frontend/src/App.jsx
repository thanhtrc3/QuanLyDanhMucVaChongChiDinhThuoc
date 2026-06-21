import React, { useState } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">M</div>
          <div className="logo-text">MedDirectory</div>
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span>📊 Bảng điều khiển</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'thuoc' ? 'active' : ''}`}
          onClick={() => setActiveTab('thuoc')}
        >
          <span>💊 Danh mục thuốc</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'chongchidinh' ? 'active' : ''}`}
          onClick={() => setActiveTab('chongchidinh')}
        >
          <span>🚫 Chống chỉ định</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1>{activeTab === 'dashboard' ? 'Bảng điều khiển' : 'Danh mục thuốc'}</h1>
          <div className="user-profile">
            <span>Bác sĩ Hiến</span>
            <div className="avatar">H</div>
          </div>
        </div>

        <div className="page-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-title">Tổng số thuốc</div>
                  <div className="stat-value">1,245</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-title">Sắp hết hạn</div>
                  <div className="stat-value">28</div>
                </div>
                <div className="stat-card danger">
                  <div className="stat-title">Chống chỉ định</div>
                  <div className="stat-value">368</div>
                </div>
              </div>

              <h2 className="section-title">Cảnh báo an toàn gần đây</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Thuốc kiểm tra</th>
                    <th>Mức độ</th>
                    <th>Nguồn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>20/05/2026 09:15</td>
                    <td>Amoxicillin + Warfarin</td>
                    <td><span className="badge danger">Tuyệt đối</span></td>
                    <td>Trần Minh Anh</td>
                  </tr>
                  <tr>
                    <td>19/05/2026 14:20</td>
                    <td>Paracetamol + Ibuprofen</td>
                    <td><span className="badge warning">Thận trọng</span></td>
                    <td>Nguyễn Thu Hương</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'thuoc' && (
            <>
              <h2 className="section-title">Quản lý danh mục thuốc</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã Thuốc</th>
                    <th>Tên Thuốc</th>
                    <th>Hoạt chất</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>AMX500</td>
                    <td>Amoxicillin 500mg</td>
                    <td>Amoxicillin</td>
                    <td>348</td>
                    <td><span className="badge success">Còn hạn</span></td>
                  </tr>
                  <tr>
                    <td>PAR500</td>
                    <td>Paracetamol 500mg</td>
                    <td>Paracetamol</td>
                    <td>273</td>
                    <td><span className="badge success">Còn hạn</span></td>
                  </tr>
                  <tr>
                    <td>LISI10</td>
                    <td>Lisinopril 10mg</td>
                    <td>Lisinopril</td>
                    <td>224</td>
                    <td><span className="badge success">Còn hạn</span></td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// File: frontend/src/components/RuleModal.jsx
import React, { useState } from 'react';

const RuleModal = ({ isOpen, onClose, onSave }) => {
    const [ruleData, setRuleData] = useState({
        thuocId: '',
        dieuKien: '', // Chuỗi logic, ví dụ: "tuoi < 18 || tienSuBenh.includes('Suy gan')"
        mucDo: 'Cảnh báo',
        hauQua: ''
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[500px] shadow-2xl">
                <h2 className="text-xl font-bold mb-4">Thêm quy tắc chống chỉ định</h2>
                
                {/* 1. Chọn thuốc */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Thuốc *</label>
                    <select className="w-full border p-2 rounded" 
                        onChange={(e) => setRuleData({...ruleData, thuocId: e.target.value})}>
                        <option>-- Chọn thuốc --</option>
                        <option value="1">Amoxicillin</option>
                        <option value="2">Warfarin</option>
                    </select>
                </div>

                {/* 2. Nhập biểu thức logic (Gợi ý giúp logic hơn) */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Điều kiện (Logic) *</label>
                    <input className="w-full border p-2 rounded font-mono" 
                        placeholder="VD: tuoi < 12 || canNang < 40"
                        value={ruleData.dieuKien}
                        onChange={(e) => setRuleData({...ruleData, dieuKien: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1 italic">
                        Gợi ý: dùng 'tuoi', 'canNang', hoặc "tienSuBenh.includes('Suy gan')"
                    </p>
                </div>

                {/* 3. Mức độ cảnh báo */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Mức độ *</label>
                    <select className="w-full border p-2 rounded"
                        onChange={(e) => setRuleData({...ruleData, mucDo: e.target.value})}>
                        <option>Cảnh báo</option>
                        <option>Tuyệt đối</option>
                    </select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Hủy</button>
                    <button onClick={() => onSave(ruleData)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Thêm mới</button>
                </div>
            </div>
        </div>
    );
};

export default RuleModal;
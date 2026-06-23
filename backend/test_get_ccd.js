const express = require('express');
const { poolPromise } = require('./db');

async function test() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT c.ruleID AS id, c.thuocID, t.tenThuong AS tenThuoc, t.maATC, c.dieuKien, c.mucDo AS mucDoNguyHiem, c.heuQua, c.moTa
            FROM ChongChiDinh c
            JOIN Thuoc t ON c.thuocID = t.thuocID
        `);
        console.log(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();

IF OBJECT_ID('DonThuoc', 'U') IS NULL
BEGIN
  CREATE TABLE DonThuoc (
    donThuocID INT IDENTITY(1,1) PRIMARY KEY,
    maDonThuoc VARCHAR(30) NOT NULL UNIQUE,
    tenBenhNhan NVARCHAR(150) NOT NULL,
    ngayKeDon DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    ghiChu NVARCHAR(500) NULL,
    trangThai NVARCHAR(30) NOT NULL DEFAULT N'Nháp',
    createdBy NVARCHAR(120) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;

IF OBJECT_ID('ChiTietDonThuoc', 'U') IS NULL
BEGIN
  CREATE TABLE ChiTietDonThuoc (
    chiTietID INT IDENTITY(1,1) PRIMARY KEY,
    donThuocID INT NOT NULL,
    thuocID INT NOT NULL,
    lieuMoiLan DECIMAL(10,2) NOT NULL,
    soLanNgay INT NOT NULL,
    soNgay INT NOT NULL,
    soLuong INT NOT NULL,
    huongDan NVARCHAR(255) NULL,
    maxLieuNgay DECIMAL(10,2) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ChiTietDonThuoc_DonThuoc FOREIGN KEY (donThuocID)
      REFERENCES DonThuoc(donThuocID) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietDonThuoc_Thuoc FOREIGN KEY (thuocID)
      REFERENCES Thuoc(thuocID),
    CONSTRAINT CK_ChiTietDonThuoc_SoLuong CHECK (
      lieuMoiLan > 0 AND soLanNgay > 0 AND soNgay > 0 AND soLuong > 0
    )
  );
END;

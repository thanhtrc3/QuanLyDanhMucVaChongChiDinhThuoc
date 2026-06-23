IF COL_LENGTH('Thuoc', 'phanLoai') IS NULL
BEGIN
  ALTER TABLE Thuoc ADD phanLoai NVARCHAR(80) NULL;
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = 'CK_Thuoc_TonKhoKhongAm'
)
BEGIN
  ALTER TABLE Thuoc
  ADD CONSTRAINT CK_Thuoc_TonKhoKhongAm CHECK (tonKhoHienTai >= 0 AND tonToiThieu >= 0);
END;

const { poolPromise } = require('./db');
poolPromise.then(p => p.request().query("ALTER TABLE NguoiDung ADD isDeleted BIT NOT NULL DEFAULT 0")).then(() => {
  console.log("isDeleted added");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

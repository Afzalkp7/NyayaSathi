const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = "admin123"; // Choose your admin password
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  console.log("Hashed password:", hashed);
}

hashPassword();

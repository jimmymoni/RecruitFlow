// Test script to create proper bcrypt hash
const bcrypt = require('bcryptjs');

async function testPasswords() {
    const password = '123456';
    
    // Generate hash
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('Password:', password);
    console.log('Generated hash:', hash);
    
    // Test verification
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);
    
    // Test against the hash we used in SQL
    const sqlHash = '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a';
    const isSqlValid = await bcrypt.compare(password, sqlHash);
    console.log('SQL hash verification:', isSqlValid);
    
    // Generate SQL update statement
    console.log('\nSQL Update:');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'test@test.com';`);
}

testPasswords().catch(console.error);
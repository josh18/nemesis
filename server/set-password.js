const authController = require('./controllers/auth');

const password = process.argv[2];

if (!password) {
    console.error('No password entered');
    process.exit();
}

authController.setPassword(password);

console.log('Password set');
process.exit();

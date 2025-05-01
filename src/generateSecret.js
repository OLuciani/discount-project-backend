//script para crear secretos 
import crypto from 'crypto';

const secretKey = crypto.randomBytes(32).toString('hex'); // Genera una clave de 32 bytes (256 bits)
console.log(secretKey);

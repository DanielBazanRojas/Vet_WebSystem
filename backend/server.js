import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Dynamic import: garantiza que dotenv cargue ANTES de que db.js cree el Pool
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL ? '✅ configurada' : '❌ NO configurada'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ configurado' : '❌ NO configurado'}`);
});

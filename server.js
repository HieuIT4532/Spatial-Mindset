import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Phục vụ các file tĩnh trong thư mục dist được build bởi Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Xử lý các request khác, trả về index.html để React Router đảm nhiệm (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

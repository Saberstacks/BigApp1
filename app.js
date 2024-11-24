require('dotenv').config();
const express = require('express');
const path = require('path');
const seoRoutes = require('./routes/seo');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/seo', seoRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected Error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

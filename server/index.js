require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { getPublicStats } = require('./controllers/statsController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok', project: 'Food For All' }));
app.get('/api/stats', getPublicStats);

app.use('/api', authRoutes);
app.use('/api', donationRoutes);
app.use('/api', deliveryRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });

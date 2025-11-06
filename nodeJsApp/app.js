const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Route
app.get('/', (req, res) => {
  res.send('Hello i am from Node.js in green deployment Application! Deployed successfully 🚀');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5007;

// Set up CORS middleware
app.use(cors({
  origin: 'http://localhost:3000/amlibrary-plays', // Ensure this matches your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization,Music-User-Token'
}));

app.use(express.json());

const developerToken = process.env.APPLE_DEVELOPER_TOKEN;

app.get('/api/songs', async (req, res) => {
  const { limit, offset } = req.query;
  const musicUserToken = req.headers['music-user-token'];
  if (!musicUserToken) {
    return res.status(400).send('Music User Token is required');
  }

  try {
    const response = await axios.get('https://api.music.apple.com/v1/me/library/songs', {
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${developerToken}`,
        'Music-User-Token': musicUserToken,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching songs:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// Endpoint to fetch recommendations
app.get('/api/recommendations', async (req, res) => {
  const { ids } = req.query;
  const musicUserToken = req.headers['music-user-token'];
  try {
    const response = await axios.get('https://api.music.apple.com/v1/me/recommendations', {
      params: { ids },
      headers: {
        Authorization: `Bearer ${developerToken}`,
        'Music-User-Token': musicUserToken,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recommendations:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


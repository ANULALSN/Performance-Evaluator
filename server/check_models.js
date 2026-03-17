const axios = require('axios');

const checkModels = async () => {
  try {
    const response = await axios.get("https://openrouter.ai/api/v1/models");
    const freeModels = response.data.data
      .filter(m => m.id.includes(':free'))
      .map(m => m.id);
    console.log('Available Free Models:', JSON.stringify(freeModels, null, 2));
  } catch (err) {
    console.error('Failed to fetch models:', err.message);
  }
};

checkModels();

const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { keywords, location_code, language_name } = req.body;
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    res.status(400).json({ error: 'keywords is required and must be an array' });
    return;
  }
  if (!location_code) {
    res.status(400).json({ error: 'location_code is required' });
    return;
  }
  if (!language_name) {
    res.status(400).json({ error: 'language_name is required' });
    return;
  }

  const tasks = keywords.map(keyword => ({
    keyword: keyword,
    location_code: location_code,
    language_name: language_name
  }));

  const payload = {
    data: tasks
  };

  try {
    const response = await axios.post(
      'https://sandbox.dataforseo.com/v3/keywords_data/google/search_volume/task_post',
      payload,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    const errorData = error.response ? error.response.data : { status_message: error.message };
    console.error('Error in Keyword Research:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

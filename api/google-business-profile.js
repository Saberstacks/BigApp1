const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { businessName, category, location } = req.body;
  if (!businessName) {
    res.status(400).json({ error: 'businessName is required' });
    return;
  }

  const task = {
    business_name: businessName
  };
  if (category) task.category = category;
  if (location) task.location = location;

  const payload = [task];

  try {
    const response = await axios.post(
      'https://sandbox.dataforseo.com/v3/business_data/google/my_business_info/task_post',
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
    console.error('Error in Google Business Profile Audit:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

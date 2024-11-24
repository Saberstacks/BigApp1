const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { site } = req.body;
  if (!site) {
    res.status(400).json({ error: 'site is required' });
    return;
  }

  const payload = [{
    target: site,
    limit: 100
  }];

  try {
    const response = await axios.post(
      'https://sandbox.api.dataforseo.com/v3/backlinks/links/page_one/task_post',
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
    console.error('Error in Backlink Tracking:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

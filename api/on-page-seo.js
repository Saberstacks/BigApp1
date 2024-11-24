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

  // Correct field names and values
  const task = {
    target: site,
    max_crawl_pages: 10 // You can adjust this value as needed
  };

  // Payload is an array of tasks
  const payload = [task];

  try {
    const response = await axios({
      method: 'post',
      url: 'https://sandbox.dataforseo.com/v3/on_page/task_post',
      auth: {
        username: process.env.DATAFORSEO_LOGIN,
        password: process.env.DATAFORSEO_PASSWORD
      },
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    const errorData = error.response ? error.response.data : { status_message: error.message };
    console.error('Error in On-Page SEO Analysis:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

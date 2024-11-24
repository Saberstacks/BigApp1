const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { keyword, location_name, language_name } = req.body;

  if (!keyword || !location_name || !language_name) {
    res.status(400).json({ error: 'Keyword, location_name, and language_name are required' });
    return;
  }

  // Prepare the task payload
  const taskPayload = [
    {
      keyword: keyword,
      location_name: location_name,
      language_name: language_name,
      se: 'google',
      se_type: 'organic',
      device: 'desktop',
    },
  ];

  try {
    // Create the task in the sandbox environment
    const createResponse = await axios({
      method: 'post',
      url: 'https://sandbox.dataforseo.com/v3/serp/google/organic/task_post',
      auth: {
        username: process.env.DATAFORSEO_LOGIN,
        password: process.env.DATAFORSEO_PASSWORD,
      },
      data: taskPayload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const taskId = createResponse.data.tasks[0].id;

    // Wait for a moment before fetching the results
    await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds

    // Retrieve the results
    const resultsResponse = await axios({
      method: 'get',
      url: `https://sandbox.dataforseo.com/v3/serp/google/organic/task_get/advanced/${taskId}`,
      auth: {
        username: process.env.DATAFORSEO_LOGIN,
        password: process.env.DATAFORSEO_PASSWORD,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resultData = resultsResponse.data.tasks[0].result[0];

    res.status(200).json(resultData);
  } catch (error) {
    const errorData = error.response ? error.response.data : { status_message: error.message };
    console.error('Error in Competitor Analysis:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

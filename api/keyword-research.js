const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { keywords, location_code, language_code } = req.body;

  if (!keywords || !location_code || !language_code) {
    res.status(400).json({ error: 'Keywords, location_code, and language_code are required' });
    return;
  }

  // Prepare the task payload
  const taskPayload = [
    {
      keywords: keywords,
      location_code: location_code,
      language_code: language_code,
    },
  ];

  try {
    // Create the task in the sandbox environment
    const createResponse = await axios({
      method: 'post',
      url: 'https://sandbox.dataforseo.com/v3/keywords_data/google/search_volume/task_post',
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
      url: `https://sandbox.dataforseo.com/v3/keywords_data/google/search_volume/task_get/${taskId}`,
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
    console.error('Error in Keyword Research:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

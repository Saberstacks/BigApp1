const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { keyword } = req.body;

  if (!keyword) {
    res.status(400).json({ error: 'keyword is required' });
    return;
  }

  // Prepare the task payload
  const taskPayload = [
    {
      language_code: 'en',
      location_name: 'New York,New York,United States',
      keyword: keyword,
    },
  ];

  try {
    // Create the task
    const createResponse = await axios({
      method: 'post',
      url: 'https://sandbox.dataforseo.com/v3/business_data/google/my_business_info/task_post',
      auth: {
        username: process.env.DATAFORSEO_LOGIN,
        password: process.env.DATAFORSEO_PASSWORD,
      },
      data: taskPayload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const taskID = createResponse.data.tasks[0].id;

    // Wait for a moment before fetching the results
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds

    // Retrieve the results
    const resultsResponse = await axios({
      method: 'get',
      url: `https://sandbox.dataforseo.com/v3/business_data/google/my_business_info/task_get/advanced/${taskID}`,
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
    console.error('Error in Google Business Profile Audit:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { business_name, location } = req.body;

  if (!business_name || !location) {
    res.status(400).json({ error: 'business_name and location are required' });
    return;
  }

  // Prepare the task payload
  const taskPayload = [
    {
      business_name: business_name,
      location: location,
    },
  ];

  try {
    // Create the task using the 'my_business_info' endpoint
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

    // Retrieve the results using the 'my_business_info' endpoint
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

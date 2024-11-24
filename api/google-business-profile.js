const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { hotel_name, location } = req.body;

  if (!hotel_name || !location) {
    res.status(400).json({ error: 'hotel_name and location are required' });
    return;
  }

  // Prepare the task payload
  const taskPayload = [
    {
      hotel_name: hotel_name,
      location: location,
    },
  ];

  try {
    // Send the POST request to the 'hotel_info' endpoint in the sandbox environment
    const response = await axios({
      method: 'post',
      url: 'https://sandbox.dataforseo.com/v3/business_data/google/hotel_info/task_post',
      auth: {
        username: process.env.DATAFORSEO_LOGIN,
        password: process.env.DATAFORSEO_PASSWORD,
      },
      data: taskPayload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const taskID = response.data.tasks[0].id;

    // Wait for a moment before fetching the results
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds

    // Retrieve the results using the 'hotel_info' endpoint
    const resultsResponse = await axios({
      method: 'get',
      url: `https://sandbox.dataforseo.com/v3/business_data/google/hotel_info/task_get/advanced/${taskID}`,
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

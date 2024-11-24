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

  // Remove protocol and www from site
  const formattedSite = site.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');

  // Set up the task parameters
  const task = {
    target: formattedSite,
    max_crawl_pages: 1, // Limit to 1 page to reduce data volume
    force_sitewide_checks: true // Enable sitewide checks for a single page
  };

  // Payload is an array of tasks
  const payload = [task];

  try {
    // Create the task
    const createResponse = await axios({
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

    const taskID = createResponse.data.tasks[0].id;

    // Now poll the task status until it's finished
    let taskCompleted = false;
    let attempt = 0;
    const maxAttempts = 5;
    const delay = 2000; // 2 seconds

    let taskResult;

    while (!taskCompleted && attempt < maxAttempts) {
      attempt++;
      // Wait for a short period before checking
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check the task status
      const statusResponse = await axios({
        method: 'post',
        url: 'https://sandbox.dataforseo.com/v3/on_page/summary',
        auth: {
          username: process.env.DATAFORSEO_LOGIN,
          password: process.env.DATAFORSEO_PASSWORD
        },
        data: [{ id: taskID }],
        headers: {
          'Content-Type': 'application/json'
        }
      });

      taskResult = statusResponse.data.tasks[0].result[0];
      const crawlProgress = taskResult.crawl_progress;

      if (crawlProgress === 'finished') {
        taskCompleted = true;
        // Extract the desired data
        const pagesCount = taskResult.pages_count;
        const items = taskResult.items;
        if (items && items.length > 0) {
          const pageData = items[0];
          const metaData = pageData.meta;
          const title = metaData.title;
          const htags = metaData.htags;
          const description = metaData.description;

          // Return only the desired data
          res.status(200).json({
            title,
            description,
            htags
          });
        } else {
          res.status(200).json({ message: 'No page data found.' });
        }
        return;
      }
      // else continue polling
    }

    if (!taskCompleted) {
      res.status(202).json({ message: 'Task is still in progress. Please try again later.', task_id: taskID });
    }

  } catch (error) {
    const errorData = error.response ? error.response.data : { status_message: error.message };
    console.error('Error in On-Page SEO Analysis:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

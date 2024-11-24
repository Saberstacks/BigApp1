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

  // Remove protocol and www from site to get the target domain
  const formattedSite = site.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '').split('/')[0];

  // Set up the task parameters
  const task = {
    target: formattedSite,
    max_crawl_pages: 10, // Set to 10 pages to get sufficient data
  };

  // Payload is an array of tasks
  const payload = [task];

  try {
    // Submit the task
    const createResponse = await axios({
      method: 'post',
      url: 'https://sandbox.dataforseo.com/v3/on_page/task_post',
      auth: {
        username: process.env.DATAFORSEO_LOGIN,
        password: process.env.DATAFORSEO_PASSWORD,
      },
      data: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const taskID = createResponse.data.tasks[0].id;

    // Poll the task status until it's finished
    let taskCompleted = false;
    let attempt = 0;
    const maxAttempts = 10; // Increase max attempts to allow more time
    const delay = 5000; // 5 seconds delay between attempts

    while (!taskCompleted && attempt < maxAttempts) {
      attempt++;
      // Wait before checking the status
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Check the task status
      const statusResponse = await axios({
        method: 'post',
        url: 'https://sandbox.dataforseo.com/v3/on_page/summary',
        auth: {
          username: process.env.DATAFORSEO_LOGIN,
          password: process.env.DATAFORSEO_PASSWORD,
        },
        data: [{ id: taskID }],
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const taskResult = statusResponse.data.tasks[0].result[0];
      const crawlProgress = taskResult.crawl_progress;

      if (crawlProgress === 'finished') {
        taskCompleted = true;
        break;
      }
      // else, continue polling
    }

    if (taskCompleted) {
      // Retrieve the page data using the /v3/on_page/pages endpoint
      const pagesResponse = await axios({
        method: 'post',
        url: 'https://sandbox.dataforseo.com/v3/on_page/pages',
        auth: {
          username: process.env.DATAFORSEO_LOGIN,
          password: process.env.DATAFORSEO_PASSWORD,
        },
        data: [{ id: taskID, limit: 10 }], // Limit the number of pages
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const pagesData = pagesResponse.data.tasks[0].result[0];
      const pages = pagesData.items;

      if (pages && pages.length > 0) {
        // Extract title tags and headers from the pages
        const pageResults = pages.map((page) => {
          const url = page.url;
          const meta = page.meta || {};
          const title = meta.title || '';
          const description = meta.description || '';
          const htags = meta.htags || {};

          return {
            url,
            title,
            description,
            htags,
          };
        });

        // Return the extracted data
        res.status(200).json({ pages: pageResults });
      } else {
        res.status(200).json({ message: 'No page data found.' });
      }
    } else {
      res.status(200).json({
        message: 'Task is still in progress. Please try again later.',
        task_id: taskID,
      });
    }
  } catch (error) {
    const errorData = error.response ? error.response.data : { status_message: error.message };
    console.error('Error in On-Page SEO Analysis:', errorData);
    res.status(500).json({ error: errorData.status_message || 'An error occurred' });
  }
};

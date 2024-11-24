const express = require('express');
const router = express.Router();
const axios = require('axios');

function getHeaders() {
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };
}

function wrapPayloadInArray(payload) {
  return [payload];
}

// Helper function to handle API errors
function handleApiError(error, res, feature) {
  const errorData = error.response ? error.response.data : { status_message: error.message };
  console.error(`Error in ${feature}:`, errorData);
  res.status(500).json({ error: errorData.status_message || 'An error occurred' });
}

// Google Business Profile Audit
router.post('/google-business-profile', async (req, res) => {
  const { businessName, category, location } = req.body;
  if (!businessName) {
    return res.status(400).json({ error: 'businessName is required' });
  }

  const task = {
    business_name: businessName
  };
  if (category) task.category = category;
  if (location) task.location = location;

  const payload = wrapPayloadInArray(task);

  try {
    const response = await axios.post(
      'https://sandbox.api.dataforseo.com/v3/business_data/google/my_business_info/task_post',
      payload,
      { headers: getHeaders() }
    );

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, 'Google Business Profile Audit');
  }
});

// On-Page SEO Analysis
router.post('/on-page-seo', async (req, res) => {
  const { site } = req.body;
  if (!site) {
    return res.status(400).json({ error: 'site is required' });
  }

  const payload = wrapPayloadInArray({
    site: site,
    limit: 100
  });

  try {
    const response = await axios.post(
      'https://sandbox.api.dataforseo.com/v3/on_page/task_post',
      payload,
      { headers: getHeaders() }
    );

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, 'On-Page SEO Analysis');
  }
});

// Backlink Tracking
router.post('/backlink-tracking', async (req, res) => {
  const { site } = req.body;
  if (!site) {
    return res.status(400).json({ error: 'site is required' });
  }

  const payload = wrapPayloadInArray({
    target: site,
    limit: 100
  });

  try {
    const response = await axios.post(
      'https://sandbox.api.dataforseo.com/v3/backlinks/links/page_one/task_post',
      payload,
      { headers: getHeaders() }
    );

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, 'Backlink Tracking');
  }
});

// Keyword Research
router.post('/keyword-research', async (req, res) => {
  const { keywords, location_code, language_name } = req.body;
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ error: 'keywords is required and must be an array' });
  }
  if (!location_code) {
    return res.status(400).json({ error: 'location_code is required' });
  }
  if (!language_name) {
    return res.status(400).json({ error: 'language_name is required' });
  }

  const tasks = keywords.map(keyword => ({
    keyword: keyword,
    location_code: location_code,
    language_name: language_name
  }));

  try {
    const response = await axios.post(
      'https://sandbox.api.dataforseo.com/v3/keywords_data/google/search_volume/task_post',
      tasks,
      { headers: getHeaders() }
    );

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, 'Keyword Research');
  }
});

module.exports = router;

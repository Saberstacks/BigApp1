document.addEventListener('DOMContentLoaded', () => {
  const featureList = document.getElementById('feature-list');
  const inputField = document.getElementById('input-field');
  const submitButton = document.getElementById('submit-button');
  const featureDescription = document.getElementById('feature-description');
  const resultDiv = document.getElementById('result');
  const additionalFieldsDiv = document.getElementById('additional-fields');

  let selectedFeature = null;

  const features = {
    'google-business-profile': {
      placeholder: 'Enter Business Name',
      example: 'e.g., Starbucks',
      description: 'Google Business Profile Audit requires the business name.',
      validate: (input) => input.trim().length > 0,
      preparePayload: (input) => {
        const categoryInput = document.getElementById('category');
        const locationInput = document.getElementById('location');
        const payload = { businessName: input.trim() };
        if (categoryInput.value.trim()) payload.category = categoryInput.value.trim();
        if (locationInput.value.trim()) payload.location = locationInput.value.trim();
        return payload;
      }
    },
    'on-page-seo': {
      placeholder: 'Enter Website URL',
      example: 'e.g., https://www.example.com',
      description: 'On-Page SEO Analysis requires the website URL.',
      validate: (input) => isValidURL(input),
      preparePayload: (input) => ({ site: input.trim() })
    },
    'backlink-tracking': {
      placeholder: 'Enter Website URL',
      example: 'e.g., https://www.example.com',
      description: 'Backlink Tracking requires the website URL.',
      validate: (input) => isValidURL(input),
      preparePayload: (input) => ({ site: input.trim() })
    },
    'keyword-research': {
      placeholder: 'Enter Keywords (comma-separated)',
      example: 'e.g., keyword1, keyword2',
      description: 'Keyword Research requires keywords, location code, and language name.',
      validate: (input) => {
        const locationCodeInput = document.getElementById('location-code');
        const languageNameInput = document.getElementById('language-name');
        const keywords = input.split(',').map(k => k.trim()).filter(k => k);
        return keywords.length > 0 && locationCodeInput.value.trim() && languageNameInput.value.trim();
      },
      preparePayload: (input) => {
        const locationCodeInput = document.getElementById('location-code');
        const languageNameInput = document.getElementById('language-name');
        const keywords = input.split(',').map(k => k.trim()).filter(k => k);
        return {
          keywords: keywords,
          location_code: parseInt(locationCodeInput.value.trim()),
          language_name: languageNameInput.value.trim()
        };
      }
    }
  };

  featureList.addEventListener('click', (e) => {
    if (e.target && e.target.nodeName == 'LI') {
      selectedFeature = e.target.dataset.feature;
      updateUIForFeature(selectedFeature);
    }
  });

  function updateUIForFeature(feature) {
    if (features[feature]) {
      // Highlight selected feature
      const items = featureList.getElementsByTagName('li');
      for (let item of items) {
        item.classList.remove('active-feature');
      }
      const selectedItem = featureList.querySelector(`li[data-feature="${feature}"]`);
      selectedItem.classList.add('active-feature');

      inputField.placeholder = features[feature].placeholder;
      featureDescription.innerHTML = `${features[feature].description} <span class="example">${features[feature].example}</span>`;
      inputField.value = '';
      submitButton.disabled = true;
      resultDiv.textContent = '';
      additionalFieldsDiv.innerHTML = '';

      if (feature === 'keyword-research') {
        // Add location_code and language_name fields
        const locationCodeInput = document.createElement('input');
        locationCodeInput.type = 'text';
        locationCodeInput.id = 'location-code';
        locationCodeInput.placeholder = 'Enter Location Code (e.g., 2840 for USA)';

        const languageNameInput = document.createElement('input');
        languageNameInput.type = 'text';
        languageNameInput.id = 'language-name';
        languageNameInput.placeholder = 'Enter Language Name (e.g., English)';

        additionalFieldsDiv.appendChild(locationCodeInput);
        additionalFieldsDiv.appendChild(languageNameInput);

        locationCodeInput.addEventListener('input', validateInput);
        languageNameInput.addEventListener('input', validateInput);
      } else if (feature === 'google-business-profile') {
        // Add category and location fields
        const categoryInput = document.createElement('input');
        categoryInput.type = 'text';
        categoryInput.id = 'category';
        categoryInput.placeholder = 'Enter Business Category (optional)';

        const locationInput = document.createElement('input');
        locationInput.type = 'text';
        locationInput.id = 'location';
        locationInput.placeholder = 'Enter Business Location (optional)';

        additionalFieldsDiv.appendChild(categoryInput);
        additionalFieldsDiv.appendChild(locationInput);

        categoryInput.addEventListener('input', validateInput);
        locationInput.addEventListener('input', validateInput);
      }
    } else {
      inputField.placeholder = '';
      featureDescription.textContent = 'Select a feature to get started.';
      inputField.value = '';
      submitButton.disabled = true;
      additionalFieldsDiv.innerHTML = '';
    }
  }

  inputField.addEventListener('input', () => {
    validateInput();
  });

  function validateInput() {
    const userInput = inputField.value.trim();
    let isValid = false;

    if (selectedFeature && features[selectedFeature]) {
      isValid = features[selectedFeature].validate(userInput);
    }

    submitButton.disabled = !isValid;
  }

  submitButton.addEventListener('click', () => {
    const userInput = inputField.value.trim();
    if (!userInput) {
      alert('Please enter the required information.');
      return;
    }

    if (!selectedFeature || !features[selectedFeature]) {
      alert('Unknown feature selected.');
      return;
    }

    const payload = features[selectedFeature].preparePayload(userInput);

    fetch(`/seo/${selectedFeature}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          resultDiv.innerHTML = `<div class="error">Error: ${data.error}</div>`;
        } else {
          resultDiv.textContent = JSON.stringify(data, null, 2);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        resultDiv.innerHTML = '<div class="error">An error occurred. Please try again.</div>';
      });
  });

  function isValidURL(string) {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '([\\w\\d-]+\\.)+[\\w]{2,}' + // domain name and extension
      '(\\/.*)?$', // port and path
      'i'
    );
    return !!urlPattern.test(string);
  }
});

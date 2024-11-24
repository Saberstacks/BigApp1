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
      placeholder: 'Enter Hotel Name',
      example: 'Hilton Garden Inn',
      description: 'Google Business Profile Audit requires the hotel name and location.',
      validate: (input) => {
        const locationInput = document.getElementById('location');
        return input.trim().length > 0 && locationInput && locationInput.value.trim().length > 0;
      },
      preparePayload: (input) => {
        const locationInput = document.getElementById('location');
        return {
          hotel_name: input.trim(),
          location: locationInput.value.trim(),
        };
      },
      prefill: 'Hilton Garden Inn',
      additionalFields: [
        {
          id: 'location',
          placeholder: 'Enter Hotel Location',
          value: 'New York, NY',
        },
      ],
    },
    'on-page-seo': {
      placeholder: 'Enter Website URL',
      example: 'https://www.example.com',
      description: 'On-Page SEO Analysis requires the website URL.',
      validate: (input) => isValidURL(input),
      preparePayload: (input) => ({ site: input.trim() }),
      prefill: 'https://www.example.com',
    },
    'backlink-tracking': {
      placeholder: 'Enter Domain',
      example: 'example.com',
      description: 'Backlink Tracking requires the domain name.',
      validate: (input) => input.trim().length > 0,
      preparePayload: (input) => ({ domain: input.trim() }),
      prefill: 'example.com',
    },
    'keyword-research': {
      placeholder: 'Enter Keywords (comma-separated)',
      example: 'keyword research, SEO tools',
      description: 'Keyword Research requires keywords, location code, and language code.',
      validate: (input) => {
        const locationInput = document.getElementById('location_code');
        const languageInput = document.getElementById('language_code');
        return (
          input.trim().length > 0 &&
          locationInput &&
          locationInput.value.trim().length > 0 &&
          languageInput &&
          languageInput.value.trim().length > 0
        );
      },
      preparePayload: (input) => {
        const locationInput = document.getElementById('location_code');
        const languageInput = document.getElementById('language_code');
        const keywordsArray = input.split(',').map((kw) => kw.trim());
        return {
          keywords: keywordsArray,
          location_code: parseInt(locationInput.value.trim()),
          language_code: languageInput.value.trim(),
        };
      },
      prefill: 'keyword research, SEO tools',
      additionalFields: [
        {
          id: 'location_code',
          placeholder: 'Enter Location Code (e.g., 2840 for United States)',
          value: '2840',
        },
        {
          id: 'language_code',
          placeholder: 'Enter Language Code (e.g., en for English)',
          value: 'en',
        },
      ],
    },
  };

  featureList.addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'LI') {
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
      featureDescription.innerHTML = `${features[feature].description} <span class="example">e.g., ${features[feature].example}</span>`;
      inputField.value = features[feature].prefill || '';
      submitButton.disabled = !features[feature].validate(inputField.value);
      resultDiv.textContent = '';
      additionalFieldsDiv.innerHTML = '';

      // Add additional fields if any
      if (features[feature].additionalFields) {
        features[feature].additionalFields.forEach((field) => {
          const input = document.createElement('input');
          input.type = 'text';
          input.id = field.id;
          input.placeholder = field.placeholder;
          input.value = field.value || '';
          additionalFieldsDiv.appendChild(input);

          input.addEventListener('input', validateInput);
        });
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

    fetch(`/api/${selectedFeature}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          resultDiv.innerHTML = `<div class="error">Error: ${data.error}</div>`;
        } else {
          resultDiv.textContent = JSON.stringify(data, null, 2);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        resultDiv.innerHTML = '<div class="error">An error occurred. Please try again.</div>';
      });
  });

  function isValidURL(string) {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)' + // protocol
        '([\\w\\d-]+\\.)+[\\w]{2,}' + // domain name and extension
        '(\\/.*)?$', // port and path
      'i'
    );
    return !!urlPattern.test(string);
  }

  // Auto-select the first feature on page load
  const firstFeatureItem = featureList.querySelector('li[data-feature]');
  if (firstFeatureItem) {
    firstFeatureItem.click();
  }
});

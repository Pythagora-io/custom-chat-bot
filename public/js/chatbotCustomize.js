document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const submitButton = document.getElementById('submitButton');
  const formErrors = document.getElementById('formErrors');

  function validateForm() {
    console.log('Validating form');
    let errors = [];

    // Validate personality traits
    const personalityTraits = document.querySelectorAll('input[name="personalityTraits"]:checked');
    console.log('Selected personality traits:', personalityTraits.length);
    if (personalityTraits.length === 0) {
      errors.push('Please select at least one personality trait.');
    }

    // Validate response pattern
    const responsePattern = document.querySelector('input[name="responsePattern"]:checked');
    if (!responsePattern) {
      errors.push('Please select a response pattern.');
    }

    // Validate country
    const country = document.getElementById('country').value;
    if (!country) {
      errors.push('Please select a country.');
    }

    // Validate greeting
    const greeting = document.getElementById('greeting').value.trim();
    if (!greeting) {
      errors.push('Please enter a greeting.');
    }

    // Validate farewell
    const farewell = document.getElementById('farewell').value.trim();
    if (!farewell) {
      errors.push('Please enter a farewell.');
    }

    console.log('Validation errors:', errors);
    return errors;
  }

  form.addEventListener('submit', function(e) {
    console.log('Form submission attempted');
    const errors = validateForm();

    if (errors.length > 0) {
      e.preventDefault();
      formErrors.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
      formErrors.classList.remove('d-none');
      console.error('Form submission error:', errors.join('; '));
    } else {
      formErrors.classList.add('d-none');
    }
  });

  // Real-time validation
  form.addEventListener('change', function() {
    const errors = validateForm();
    submitButton.disabled = errors.length > 0;
    if (errors.length > 0) {
      formErrors.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
      formErrors.classList.remove('d-none');
    } else {
      formErrors.classList.add('d-none');
    }
  });
});
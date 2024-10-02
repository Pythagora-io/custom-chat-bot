document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const previewPersonality = document.getElementById('previewPersonality');
  const previewResponsePattern = document.getElementById('previewResponsePattern');
  const previewCulture = document.getElementById('previewCulture');
  const previewContext = document.getElementById('previewContext');
  const locationSelect = document.getElementById('chatbotLocation');
  const previewLocation = document.getElementById('previewLocation');

  function updatePreview() {
    // Update personality traits
    const selectedTraits = Array.from(document.querySelectorAll('input[name="personalityTraits"]:checked'))
      .map(input => input.value);
    previewPersonality.textContent = selectedTraits.length > 0
      ? selectedTraits.join(', ')
      : 'No traits selected';

    // Update response pattern
    const responsePattern = document.querySelector('input[name="responsePattern"]:checked');
    previewResponsePattern.textContent = responsePattern
      ? responsePattern.value
      : 'No pattern selected';

    // Update cultural behavior
    const country = document.getElementById('country').value;
    const greeting = document.getElementById('greeting').value;
    const farewell = document.getElementById('farewell').value;
    previewCulture.textContent = `Country: ${country || 'Not selected'}, ` +
      `Greeting: ${greeting || 'Not set'}, ` +
      `Farewell: ${farewell || 'Not set'}`;

    // Update context questions
    const contextQuestions = document.querySelectorAll('textarea[name^="contextQuestions"]');
    previewContext.innerHTML = Array.from(contextQuestions).map((textarea, index) => {
      const question = textarea.previousElementSibling.textContent;
      const answer = textarea.value;
      return `<p><strong>Q${index + 1}:</strong> ${question}<br><strong>A:</strong> ${answer || 'Not answered'}</p>`;
    }).join('');

    // Update location preview
    const selectedLocation = locationSelect.value;
    previewLocation.textContent = selectedLocation === 'right' ? 'Bottom Right' : 'Bottom Left';

    console.log('Chatbot preview updated');
  }

  // Update preview on form changes
  form.addEventListener('change', updatePreview);

  // Initial preview update
  updatePreview();

  locationSelect.addEventListener('change', updatePreview);
});
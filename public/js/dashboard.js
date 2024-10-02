document.addEventListener('DOMContentLoaded', function() {
  const chatbotList = document.querySelector('.list-group');

  chatbotList.addEventListener('click', async function(e) {
    console.log('Click event triggered on chatbot list');
    if (e.target.classList.contains('btn-danger')) {
      console.log('Delete button clicked');
      e.preventDefault();
      if (confirm('Are you sure you want to delete this chatbot?')) {
        const form = e.target.closest('form');
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const listItem = form.closest('.list-group-item');
          listItem.remove();

          console.log('Chatbot deleted successfully.');

          // Check if there are no more chatbots
          if (chatbotList.children.length === 0) {
            const noChatbotsMessage = document.createElement('p');
            noChatbotsMessage.textContent = "You don't have any chatbots yet. Create your first one!";
            chatbotList.parentNode.insertBefore(noChatbotsMessage, chatbotList);
          }
        } else {
          console.error('Failed to delete the chatbot.');
          alert('Failed to delete the chatbot. Please try again.');
        }
      }
    }
  });
});
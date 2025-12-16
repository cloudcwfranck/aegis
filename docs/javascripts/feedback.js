// Custom documentation feedback widget
document.addEventListener('DOMContentLoaded', function() {
  // Create feedback widget
  const feedbackWidget = document.createElement('div');
  feedbackWidget.className = 'feedback-widget';
  feedbackWidget.innerHTML = `
    <div class="feedback-container">
      <h4 class="feedback-title">Was this page helpful?</h4>
      <div class="feedback-buttons">
        <button class="feedback-btn feedback-btn-positive" data-feedback="positive">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
          </svg>
          <span>Yes, this page was helpful</span>
        </button>
        <button class="feedback-btn feedback-btn-negative" data-feedback="negative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
          </svg>
          <span>No, this page could be improved</span>
        </button>
      </div>
      <div class="feedback-response feedback-response-positive" style="display: none;">
        <p>✓ Thank you for your feedback! Your response helps us improve the documentation.</p>
      </div>
      <div class="feedback-response feedback-response-negative" style="display: none;">
        <p>Thanks for your feedback! Help us improve this page by <a href="#" class="feedback-issue-link" target="_blank" rel="noopener">opening an issue on GitHub</a>.</p>
      </div>
    </div>
  `;

  // Find the article content and insert feedback widget before footer
  const article = document.querySelector('article');
  if (article) {
    article.appendChild(feedbackWidget);
  }

  // Handle button clicks
  const positiveBtn = feedbackWidget.querySelector('.feedback-btn-positive');
  const negativeBtn = feedbackWidget.querySelector('.feedback-btn-negative');
  const buttons = feedbackWidget.querySelector('.feedback-buttons');
  const positiveResponse = feedbackWidget.querySelector('.feedback-response-positive');
  const negativeResponse = feedbackWidget.querySelector('.feedback-response-negative');
  const issueLink = feedbackWidget.querySelector('.feedback-issue-link');

  // Get current page info
  const pageTitle = document.title;
  const pageUrl = window.location.href;

  // Update GitHub issue link
  const issueTitle = encodeURIComponent(`[Docs Feedback] ${pageTitle}`);
  const issueBody = encodeURIComponent(`**Page**: ${pageUrl}\n**Feedback**: This page could be improved\n\n**Additional comments**:\n`);
  issueLink.href = `https://github.com/cloudcwfranck/aegis/issues/new?title=${issueTitle}&labels=documentation,feedback&body=${issueBody}`;

  positiveBtn.addEventListener('click', function() {
    buttons.style.display = 'none';
    positiveResponse.style.display = 'block';
  });

  negativeBtn.addEventListener('click', function() {
    buttons.style.display = 'none';
    negativeResponse.style.display = 'block';
  });
});

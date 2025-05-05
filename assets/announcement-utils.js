function updateAnnouncementBar() {
  const bar = document.querySelector('[data-announcement-bar]');
  if (!bar) return;

  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      const country = data.country_name;
      let message = 'Welcome to our store!';

      if (country === 'Ethiopia') {
        message = '🎉 Free shipping available in Ethiopia!';
      } else if (country === 'United States') {
        message = '🇺🇸 Fast 2-day shipping across the U.S.';
      }

      bar.textContent = message;
      bar.classList.add('show');
    })
    .catch(err => {
      console.error('Geo API failed:', err);
    });
}

// For live store
document.addEventListener('DOMContentLoaded', updateAnnouncementBar);

// For Shopify theme editor live reload
document.addEventListener('shopify:section:load', updateAnnouncementBar);

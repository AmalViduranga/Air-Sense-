// JavaScript to handle form submission and update the home page
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('user-form');
  
  if (form) {
      form.addEventListener('submit', (event) => {
          event.preventDefault();
          
          // Get user inputs
          const userName = document.getElementById('username').value;
          const location = document.getElementById('location').value;
          
          // Store in localStorage
          localStorage.setItem('userName', userName);
          localStorage.setItem('userLocation', location);
          
          // Redirect to home2.html
          window.location.href = 'home2.html';
      });
  }
    // Check if we're on home2.html
    const usernameDisplay = document.getElementById('username-display');
    const locationDisplay = document.getElementById('location-display');
    
    if (usernameDisplay && locationDisplay) {
        // Retrieve from localStorage and display
        const userName = localStorage.getItem('userName');
        const location = localStorage.getItem('userLocation');
        
        if (userName && location) {
            usernameDisplay.textContent = userName;
            locationDisplay.textContent = location;
        }
    }
});

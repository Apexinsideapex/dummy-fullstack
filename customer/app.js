const API = 'http://localhost:4000';
const EMAIL_KEY = 'customer_email';

$(function () {
  const email = localStorage.getItem(EMAIL_KEY);
  if (email) {
    showLoggedIn(email);
    fetchAndAlertMessages(email);
  } else {
    showLogin();
  }

  $('#login-form').on('submit', function (e) {
    e.preventDefault();
    const email = $('#email').val().trim();
    if (!email) return;

    $.ajax({
      url: API + '/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email: email }),
    })
      .done(function () {
        localStorage.setItem(EMAIL_KEY, email);
        showLoggedIn(email);
      })
      .fail(function () {
        alert('Login failed. Is the server running on port 4000?');
      });
  });

  $('#logout').on('click', function () {
    localStorage.removeItem(EMAIL_KEY);
    showLogin();
  });
});

function showLogin() {
  $('#login-view').show();
  $('#logged-in-view').hide();
}

function showLoggedIn(email) {
  $('#current-email').text(email);
  $('#login-view').hide();
  $('#logged-in-view').show();
}

function fetchAndAlertMessages(email) {
  $.getJSON(API + '/messages?email=' + encodeURIComponent(email))
    .done(function (data) {
      const messages = (data && data.messages) || [];
      messages.forEach(function (m) {
        alert(m.message);
      });
    })
    .fail(function () {
      // server unreachable — fail silently on load
    });
}

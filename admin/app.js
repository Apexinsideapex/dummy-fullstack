const API = 'http://localhost:4000';
let selectedEmail = null;

$(function () {
  loadUsers();

  $('#refresh').on('click', loadUsers);

  $('#users').on('click', 'li', function () {
    selectedEmail = $(this).data('email');
    $('#users li').removeClass('selected');
    $(this).addClass('selected');
    $('#selected-email').text(selectedEmail);
    $('#chat-panel').show();
    $('#message').val('').focus();
  });

  $('#chat-form').on('submit', function (e) {
    e.preventDefault();
    if (!selectedEmail) return;
    const message = $('#message').val().trim();
    if (!message) return;

    $.ajax({
      url: API + '/messages',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ to: selectedEmail, message: message }),
    })
      .done(function () {
        $('#message').val('');
        alert('Message sent to ' + selectedEmail);
      })
      .fail(function () {
        alert('Failed to send. Is the server running on port 4000?');
      });
  });
});

function loadUsers() {
  $.getJSON(API + '/users')
    .done(function (data) {
      const users = (data && data.users) || [];
      const $ul = $('#users').empty();

      if (users.length === 0) {
        $('#empty-state').show();
        return;
      }
      $('#empty-state').hide();

      users.forEach(function (email) {
        $ul.append($('<li>').text(email).attr('data-email', email));
      });
    })
    .fail(function () {
      $('#users').empty();
      $('#empty-state').text('Could not reach server on port 4000.').show();
    });
}

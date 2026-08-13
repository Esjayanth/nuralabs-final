$(function () {
  function showAlert($el, message, type) {
    $el.removeClass('d-none alert-success alert-danger')
       .addClass('alert-' + type)
       .text(message);
  }

  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const $alert = $('#loginAlert');
    const $btn = $('#loginBtn');

    const payload = {
      identifier: $('#identifier').val().trim(),
      password: $('#password').val(),
    };

    $btn.prop('disabled', true).text('Logging in...');

    $.ajax({
      url: 'php/login.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json',
    })
      .done(function (res) {
        showAlert($alert, res.message || 'Logged in!', 'success');
        setTimeout(function () {
          window.location.href = 'profile.html'; // redirect after successful login
        }, 500);
      })
      .fail(function (xhr) {
        const res = xhr.responseJSON;
        showAlert($alert, (res && res.message) || 'Login failed.', 'danger');
      })
      .always(function () {
        $btn.prop('disabled', false).text('Log In');
      });
  });
});

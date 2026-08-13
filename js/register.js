$(function () {
  function showAlert($el, message, type) {
    $el.removeClass('d-none alert-success alert-danger')
       .addClass('alert-' + type)
       .text(message);
  }

  $('#registerForm').on('submit', function (e) {
    e.preventDefault(); // no traditional form submission / page reload

    const $alert = $('#registerAlert');
    const $btn = $('#registerBtn');

    const payload = {
      username: $('#username').val().trim(),
      email: $('#email').val().trim(),
      password: $('#password').val(),
    };

    $btn.prop('disabled', true).text('Registering...');

    $.ajax({
      url: 'php/register.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json',
    })
      .done(function (res) {
        showAlert($alert, res.message || 'Registered!', 'success');
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 1000);
      })
      .fail(function (xhr) {
        const res = xhr.responseJSON;
        showAlert($alert, (res && res.message) || 'Registration failed.', 'danger');
      })
      .always(function () {
        $btn.prop('disabled', false).text('Register');
      });
  });
});

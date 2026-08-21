$(function () {
  // Password Visibility Toggle
  $('#togglePassword').on('click', function () {
    const $pwd = $('#password');
    const type = $pwd.attr('type') === 'password' ? 'text' : 'password';
    $pwd.attr('type', type);
    $('#eyeIconOpen').toggleClass('hidden');
    $('#eyeIconClosed').toggleClass('hidden');
  });

  // Login Form Submission via AJAX
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const $btn = $('#loginBtn');
    const $btnText = $('#btnText');
    const $btnSpinner = $('#btnSpinner');

    const identifier = $('#identifier').val().trim();
    const password = $('#password').val();

    if (!identifier || !password) {
      showToast('Please enter both your identifier and password.', 'warning');
      return;
    }

    // Set loading state
    $btn.prop('disabled', true).addClass('opacity-75 cursor-not-allowed');
    $btnText.text('Signing in...');
    $btnSpinner.removeClass('hidden');

    $.ajax({
      url: 'php/login.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        identifier: identifier,
        password: password,
      }),
      dataType: 'json',
    })
      .done(function (res) {
        showToast(res.message || 'Login successful! Redirecting...', 'success', 2000);
        $btnText.text('Redirecting...');
        setTimeout(function () {
          window.location.href = 'profile.html';
        }, 800);
      })
      .fail(function (xhr) {
        const res = xhr.responseJSON;
        const msg = (res && res.message) || 'Invalid credentials or login failed.';
        showToast(msg, 'error', 4000);
        $('#password').addClass('border-rose-500/80');
        setTimeout(() => $('#password').removeClass('border-rose-500/80'), 2500);
      })
      .always(function () {
        setTimeout(() => {
          $btn.prop('disabled', false).removeClass('opacity-75 cursor-not-allowed');
          $btnText.text('Sign In to Account');
          $btnSpinner.addClass('hidden');
        }, 500);
      });
  });
});

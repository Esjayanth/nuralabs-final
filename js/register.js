$(function () {
  // Password Visibility Toggle
  $('#togglePassword').on('click', function () {
    const $pwd = $('#password');
    const type = $pwd.attr('type') === 'password' ? 'text' : 'password';
    $pwd.attr('type', type);
    $('#eyeIconOpen').toggleClass('hidden');
    $('#eyeIconClosed').toggleClass('hidden');
  });

  // Real-time Password Strength Meter
  $('#password').on('input', function () {
    const pwd = $(this).val();
    let score = 0;

    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const $bar = $('#strengthBar');
    const $text = $('#strengthText');

    if (pwd.length === 0) {
      $bar.css('width', '0%').removeClass('bg-rose-500 bg-amber-500 bg-blue-500 bg-emerald-500');
      $text.text('').removeClass('text-rose-400 text-amber-400 text-blue-400 text-emerald-400');
      return;
    }

    $bar.removeClass('bg-rose-500 bg-amber-500 bg-blue-500 bg-emerald-500');
    $text.removeClass('text-rose-400 text-amber-400 text-blue-400 text-emerald-400');

    if (score === 1) {
      $bar.css('width', '25%').addClass('bg-rose-500');
      $text.text('Weak password').addClass('text-rose-400');
    } else if (score === 2) {
      $bar.css('width', '50%').addClass('bg-amber-500');
      $text.text('Fair password').addClass('text-amber-400');
    } else if (score === 3) {
      $bar.css('width', '75%').addClass('bg-blue-500');
      $text.text('Good password').addClass('text-blue-400');
    } else if (score >= 4) {
      $bar.css('width', '100%').addClass('bg-emerald-500');
      $text.text('Strong password').addClass('text-emerald-400');
    }
  });

  // Username validation helper
  $('#username').on('input', function () {
    const val = $(this).val();
    const valid = /^[a-zA-Z0-9_.]{3,30}$/.test(val);
    const $hint = $('#usernameHint');
    if (val.length > 0) {
      if (valid) {
        $hint.text('✓ Valid username').removeClass('text-rose-400 text-slate-400').addClass('text-emerald-400');
      } else {
        $hint.text('✕ 3-30 chars (letters, numbers, ., _)').removeClass('text-emerald-400 text-slate-400').addClass('text-rose-400');
      }
    } else {
      $hint.text('3-30 characters (letters, numbers, . or _)').removeClass('text-emerald-400 text-rose-400').addClass('text-slate-400');
    }
  });

  // AJAX Registration Form Submission
  $('#registerForm').on('submit', function (e) {
    e.preventDefault();

    const $btn = $('#registerBtn');
    const $btnText = $('#btnText');
    const $btnSpinner = $('#btnSpinner');

    const username = $('#username').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();

    // Client-side validations
    if (!username || !email || !password) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) {
      showToast('Username must be 3-30 characters and contain only letters, numbers, dot or underscore.', 'error');
      $('#username').focus();
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('Please provide a valid email address.', 'error');
      $('#email').focus();
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      $('#password').focus();
      return;
    }

    // Set loading state
    $btn.prop('disabled', true).addClass('opacity-75 cursor-not-allowed');
    $btnText.text('Creating account...');
    $btnSpinner.removeClass('hidden');

    $.ajax({
      url: 'php/register.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
      dataType: 'json',
    })
      .done(function (res) {
        showToast(res.message || 'Account created successfully! Redirecting...', 'success', 2500);
        $btnText.text('Account Created!');
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 1200);
      })
      .fail(function (xhr) {
        const res = xhr.responseJSON;
        const msg = (res && res.message) || 'Registration failed. Please check your details.';
        showToast(msg, 'error', 4500);
      })
      .always(function () {
        setTimeout(() => {
          $btn.prop('disabled', false).removeClass('opacity-75 cursor-not-allowed');
          $btnText.text('Create Account');
          $btnSpinner.addClass('hidden');
        }, 600);
      });
  });
});

$(function () {
  function showAlert(message, type) {
    $('#profileAlert')
      .removeClass('d-none alert-success alert-danger')
      .addClass('alert-' + type)
      .text(message);
  }

  function loadProfile() {
    $.ajax({
      url: 'php/profile.php',
      method: 'GET',
      dataType: 'json',
    })
      .done(function (res) {
        const acct = res.account;
        const profile = res.profile;

        $('#acctUsername').text(acct.username);
        $('#acctEmail').text(acct.email);
        $('#acctCreated').text(acct.created_at);

        $('#name').val(profile.name || '');
        $('#age').val(profile.age !== null ? profile.age : '');
        $('#bio').val(profile.bio || '');
        $('#interests').val((profile.interests || []).join(', '));
      })
      .fail(function (xhr) {
        if (xhr.status === 401) {
          window.location.href = 'login.html'; // not authenticated
        } else {
          showAlert('Could not load profile.', 'danger');
        }
      });
  }

  $('#profileForm').on('submit', function (e) {
    e.preventDefault();

    const $btn = $('#saveBtn');
    const interests = $('#interests').val()
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    const payload = {
      name: $('#name').val().trim(),
      age: $('#age').val(),
      bio: $('#bio').val().trim(),
      interests: interests,
    };

    $btn.prop('disabled', true).text('Saving...');

    $.ajax({
      url: 'php/profile.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json',
    })
      .done(function (res) {
        showAlert(res.message || 'Profile updated.', 'success');
      })
      .fail(function (xhr) {
        const res = xhr.responseJSON;
        showAlert((res && res.message) || 'Update failed.', 'danger');
      })
      .always(function () {
        $btn.prop('disabled', false).text('Save Profile');
      });
  });

  $('#logoutBtn').on('click', function () {
    $.ajax({
      url: 'php/profile.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ action: 'logout' }),
      dataType: 'json',
    }).always(function () {
      window.location.href = 'login.html';
    });
  });

  loadProfile();
});

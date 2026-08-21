$(function () {
  let interestsList = [];

  // Generate user avatar initials and gradient
  function updateAvatar(name, username) {
    const displayName = (name || username || 'User').trim();
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map(n => n[0].toUpperCase())
      .slice(0, 2)
      .join('') || 'U';

    $('#avatarInitials').text(initials);
    $('#navAvatarInitials').text(initials);

    // Color theme based on name hash
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
      hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const bgGradient = `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 45) % 360}, 80%, 45%))`;
    $('#avatarCircle').css('background', bgGradient);
    $('#navAvatarCircle').css('background', bgGradient);
  }

  // Render Interactive Tag Pills for Interests
  function renderInterestTags() {
    const $container = $('#tagsContainer');
    $container.empty();

    if (interestsList.length === 0) {
      $container.append('<span class="text-xs text-slate-400 italic">No interests added yet. Type below and press Enter!</span>');
      return;
    }

    interestsList.forEach((tag, idx) => {
      const $badge = $(`
        <span class="tag-badge">
          <span>#${escapeHtml(tag)}</span>
          <button type="button" class="tag-remove-btn" data-index="${idx}" title="Remove tag">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </span>
      `);
      $container.append($badge);
    });
  }

  function escapeHtml(str) {
    return $('<div>').text(str).html();
  }

  // Add Interest Tag Handler
  function addInterestTag() {
    const $input = $('#interestInput');
    const val = $input.val().trim();
    if (!val) return;

    // Support comma-separated items
    const parts = val.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
    parts.forEach(p => {
      if (p && !interestsList.includes(p)) {
        interestsList.push(p);
      }
    });

    $input.val('');
    renderInterestTags();
  }

  $('#addInterestBtn').on('click', addInterestTag);
  $('#interestInput').on('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addInterestTag();
    }
  });

  // Remove Tag Handler
  $('#tagsContainer').on('click', '.tag-remove-btn', function () {
    const idx = parseInt($(this).data('index'), 10);
    if (!isNaN(idx)) {
      interestsList.splice(idx, 1);
      renderInterestTags();
    }
  });

  // Bio Character Counter
  $('#bio').on('input', function () {
    const len = $(this).val().length;
    $('#bioCharCount').text(`${len} / 500`);
    if (len > 450) {
      $('#bioCharCount').addClass('text-amber-400');
    } else {
      $('#bioCharCount').removeClass('text-amber-400 text-rose-400');
    }
  });

  // Age input helper
  $('#age').on('input', function () {
    const age = parseInt($(this).val(), 10);
    const $hint = $('#ageHint');
    if (!isNaN(age) && age >= 0) {
      if (age < 18) $hint.text('Youth (<18)');
      else if (age < 30) $hint.text('Young Adult (18-29)');
      else if (age < 60) $hint.text('Adult (30-59)');
      else $hint.text('Senior (60+)');
    } else {
      $hint.text('');
    }
  });

  // Load User Profile Data
  function loadProfile() {
    $.ajax({
      url: 'php/profile.php',
      method: 'GET',
      dataType: 'json',
    })
      .done(function (res) {
        if (!res.ok) {
          showToast(res.message || 'Unable to retrieve profile.', 'error');
          return;
        }

        const acct = res.account || {};
        const profile = res.profile || {};

        // Display Account Data
        $('#acctUsername').text(acct.username || '—');
        $('#acctEmail').text(acct.email || '—');
        $('#acctId').text('#' + (acct.id || '—'));
        $('#displayUsername').text('@' + (acct.username || 'User'));

        if (acct.created_at) {
          const date = new Date(acct.created_at);
          $('#acctCreated').text(date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
        } else {
          $('#acctCreated').text('Active');
        }

        // Form Fields
        $('#name').val(profile.name || '');
        $('#age').val(profile.age !== null && profile.age !== undefined ? profile.age : '');
        $('#bio').val(profile.bio || '');
        $('#bioCharCount').text(`${(profile.bio || '').length} / 500`);

        // Trigger Age helper
        $('#age').trigger('input');

        // Interests Tags
        interestsList = Array.isArray(profile.interests) ? [...profile.interests] : [];
        renderInterestTags();

        // Update Avatar
        updateAvatar(profile.name, acct.username);
        $('#displayName').text(profile.name || acct.username || 'Member');
      })
      .fail(function (xhr) {
        if (xhr.status === 401) {
          showToast('Session expired. Redirecting to login...', 'warning', 2000);
          setTimeout(function () {
            window.location.href = 'login.html';
          }, 1000);
        } else {
          showToast('Failed to load profile data.', 'error');
        }
      });
  }

  // Profile Save Form
  $('#profileForm').on('submit', function (e) {
    e.preventDefault();

    const $btn = $('#saveBtn');
    const $btnText = $('#saveBtnText');
    const $btnSpinner = $('#saveBtnSpinner');

    const name = $('#name').val().trim();
    const ageVal = $('#age').val();
    const age = ageVal !== '' ? parseInt(ageVal, 10) : null;
    const bio = $('#bio').val().trim();

    if (age !== null && (isNaN(age) || age < 0 || age > 130)) {
      showToast('Please enter a valid age between 0 and 130.', 'error');
      $('#age').focus();
      return;
    }

    if (bio.length > 500) {
      showToast('Bio cannot exceed 500 characters.', 'error');
      $('#bio').focus();
      return;
    }

    $btn.prop('disabled', true).addClass('opacity-75 cursor-not-allowed');
    $btnText.text('Saving changes...');
    $btnSpinner.removeClass('hidden');

    $.ajax({
      url: 'php/profile.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: name,
        age: age,
        bio: bio,
        interests: interestsList,
      }),
      dataType: 'json',
    })
      .done(function (res) {
        showToast(res.message || 'Profile saved successfully!', 'success', 3000);
        $('#displayName').text(name || $('#acctUsername').text() || 'Member');
        updateAvatar(name, $('#acctUsername').text());
      })
      .fail(function (xhr) {
        const res = xhr.responseJSON;
        showToast((res && res.message) || 'Failed to update profile.', 'error');
      })
      .always(function () {
        setTimeout(() => {
          $btn.prop('disabled', false).removeClass('opacity-75 cursor-not-allowed');
          $btnText.text('Save Profile Changes');
          $btnSpinner.addClass('hidden');
        }, 400);
      });
  });

  // Tab Switching
  $('.profile-tab-btn').on('click', function () {
    const target = $(this).data('tab');
    $('.profile-tab-btn').removeClass('active border-indigo-500 text-indigo-400 bg-indigo-500/10').addClass('border-transparent text-slate-400 hover:text-slate-200');
    $(this).addClass('active border-indigo-500 text-indigo-400 bg-indigo-500/10').removeClass('border-transparent text-slate-400');

    $('.tab-content-panel').addClass('hidden');
    $('#tab-' + target).removeClass('hidden');
  });

  // Logout Handler
  function performLogout() {
    showToast('Logging out...', 'info', 1500);
    $.ajax({
      url: 'php/profile.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ action: 'logout' }),
      dataType: 'json',
    }).always(function () {
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 500);
    });
  }

  $('#logoutBtn, #logoutModalBtn').on('click', function () {
    $('#logoutConfirmModal').removeClass('hidden').addClass('flex');
  });

  $('#confirmLogoutBtn').on('click', function () {
    $('#logoutConfirmModal').addClass('hidden').removeClass('flex');
    performLogout();
  });

  $('#cancelLogoutBtn, #closeLogoutModal').on('click', function () {
    $('#logoutConfirmModal').addClass('hidden').removeClass('flex');
  });

  // Initialize
  loadProfile();
});

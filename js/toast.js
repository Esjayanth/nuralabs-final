/**
 * NuraHub Modern Toast Notification System
 */
window.showToast = function (message, type = 'info', duration = 3500) {
  let $container = $('#toastContainer');
  if ($container.length === 0) {
    $('body').append('<div id="toastContainer" aria-live="polite"></div>');
    $container = $('#toastContainer');
  }

  const icons = {
    success: `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    error: `<svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    warning: `<svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
    info: `<svg class="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
    error: 'border-rose-500/30 bg-rose-950/80 text-rose-100',
    warning: 'border-amber-500/30 bg-amber-950/80 text-amber-100',
    info: 'border-indigo-500/30 bg-slate-900/90 text-slate-100',
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500',
  };

  const iconHtml = icons[type] || icons.info;
  const cardClass = borders[type] || borders.info;
  const progressClass = progressColors[type] || progressColors.info;

  const toastId = 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

  const html = `
    <div id="${toastId}" class="toast-item flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${cardClass}">
      <div class="mt-0.5">${iconHtml}</div>
      <div class="flex-1 text-sm font-medium leading-relaxed pr-2">${message}</div>
      <button type="button" class="text-slate-400 hover:text-white transition-colors text-xs p-1 rounded-md" onclick="$('#${toastId}').removeClass('show').addClass('hide'); setTimeout(() => $('#${toastId}').remove(), 300);">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <div class="toast-progress ${progressClass}" style="animation-duration: ${duration}ms;"></div>
    </div>
  `;

  const $toast = $(html);
  $container.append($toast);

  // Trigger smooth slide in
  requestAnimationFrame(() => {
    $toast.addClass('show');
  });

  // Auto dismiss after duration
  setTimeout(() => {
    $toast.removeClass('show').addClass('hide');
    setTimeout(() => {
      $toast.remove();
    }, 300);
  }, duration);
};

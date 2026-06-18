// type ToastType = 'success' | 'error' | 'warning' | 'info'

// interface ToastOptions {
//   duration?: number   // milliseconds, default 4000
//   position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left'
// }

// // ─── Container ────────────────────────────────────────────────────────────────

// function getContainer(position: string): HTMLElement {
//   const id = `toast-container-${position}`
//   let container = document.getElementById(id)

//   if (!container) {
//     container = document.createElement('div')
//     container.id = id
//     container.setAttribute('aria-live', 'polite')
//     container.setAttribute('aria-atomic', 'false')
//     Object.assign(container.style, getContainerStyles(position))
//     document.body.appendChild(container)
//   }

//   return container
// }

// function getContainerStyles(position: string): Partial<CSSStyleDeclaration> {
//   const base: Partial<CSSStyleDeclaration> = {
//     position: 'fixed',
//     zIndex: '99999',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '10px',
//     padding: '16px',
//     pointerEvents: 'none',
//     maxWidth: '380px',
//     width: '100%',
//   }

//   const positions: Record<string, Partial<CSSStyleDeclaration>> = {
//     'top-right':    { top: '0', right: '0' },
//     'top-left':     { top: '0', left: '0' },
//     'top-center':   { top: '0', left: '50%', transform: 'translateX(-50%)' },
//     'bottom-right': { bottom: '0', right: '0', flexDirection: 'column-reverse' },
//     'bottom-left':  { bottom: '0', left: '0',  flexDirection: 'column-reverse' },
//   }

//   return { ...base, ...(positions[position] ?? positions['top-right']) }
// }

// // ─── Toast element ────────────────────────────────────────────────────────────

// const ICONS: Record<ToastType, string> = {
//   success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
//   error:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
//   warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
//   info:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
// }

// const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
//   success: { bg: '#0d1f17', border: '#22c55e', icon: '#22c55e' },
//   error:   { bg: '#1f0d0d', border: '#ef4444', icon: '#ef4444' },
//   warning: { bg: '#1f1a0d', border: '#f59e0b', icon: '#f59e0b' },
//   info:    { bg: '#0d1520', border: '#3b82f6', icon: '#3b82f6' },
// }

// // CSS injected once
// let cssInjected = false
// function injectCSS() {
//   if (cssInjected || typeof document === 'undefined') return
//   cssInjected = true

//   const style = document.createElement('style')
//   style.textContent = `
//     .iw-toast {
//       display: flex;
//       align-items: flex-start;
//       gap: 12px;
//       padding: 14px 16px;
//       border-radius: 12px;
//       border: 1px solid;
//       pointer-events: all;
//       cursor: pointer;
//       box-shadow: 0 8px 32px rgba(0,0,0,0.4);
//       font-family: inherit;
//       direction: rtl;
//       animation: iw-toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
//       max-width: 100%;
//     }
//     .iw-toast.removing {
//       animation: iw-toast-out 0.25s ease-in forwards;
//     }
//     .iw-toast-icon {
//       flex-shrink: 0;
//       margin-top: 1px;
//     }
//     .iw-toast-body {
//       flex: 1;
//     }
//     .iw-toast-message {
//       font-size: 14px;
//       font-weight: 500;
//       color: #f1f5f9;
//       line-height: 1.5;
//       margin: 0;
//     }
//     .iw-toast-progress {
//       height: 3px;
//       border-radius: 2px;
//       margin-top: 10px;
//       animation: iw-progress linear forwards;
//       transform-origin: left;
//     }
//     @keyframes iw-toast-in {
//       from { opacity: 0; transform: translateX(20px) scale(0.96); }
//       to   { opacity: 1; transform: translateX(0)   scale(1); }
//     }
//     @keyframes iw-toast-out {
//       from { opacity: 1; transform: translateX(0)   scale(1);    max-height: 100px; }
//       to   { opacity: 0; transform: translateX(20px) scale(0.96); max-height: 0; padding: 0; margin: 0; }
//     }
//     @keyframes iw-progress {
//       from { transform: scaleX(1); }
//       to   { transform: scaleX(0); }
//     }
//   `
//   document.head.appendChild(style)
// }

// // ─── Core show function ───────────────────────────────────────────────────────

// function show(type: ToastType, message: string, options: ToastOptions = {}) {
//   if (typeof document === 'undefined') return  // SSR guard

//   injectCSS()

//   const { duration = 4000, position = 'top-right' } = options
//   const container = getContainer(position)
//   const colors = COLORS[type]

//   const el = document.createElement('div')
//   el.className = 'iw-toast'
//   el.setAttribute('role', 'alert')
//   el.setAttribute('aria-label', message)

//   Object.assign(el.style, {
//     background: colors.bg,
//     borderColor: colors.border,
//   })

//   el.innerHTML = `
//     <div class="iw-toast-icon" style="color:${colors.icon}">${ICONS[type]}</div>
//     <div class="iw-toast-body">
//       <p class="iw-toast-message">${message}</p>
//       <div class="iw-toast-progress" style="background:${colors.border};animation-duration:${duration}ms"></div>
//     </div>
//   `

//   function remove() {
//     el.classList.add('removing')
//     el.addEventListener('animationend', () => el.remove(), { once: true })
//   }

//   el.addEventListener('click', remove)
//   container.appendChild(el)

//   setTimeout(remove, duration)
// }

// // ─── Public API ───────────────────────────────────────────────────────────────

// export const toast = {
//   success: (message: string, options?: ToastOptions) => show('success', message, options),
//   error:   (message: string, options?: ToastOptions) => show('error',   message, options),
//   warning: (message: string, options?: ToastOptions) => show('warning', message, options),
//   info:    (message: string, options?: ToastOptions) => show('info',    message, options),
// }






















/**
 * toast.ts
 * Lightweight toast system — no library needed.
 */

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left'
}

// ─── Container ────────────────────────────────────────────────────────────────

function getContainer(position: string): HTMLElement {
  const id = `toast-container-${position}`
  let container = document.getElementById(id)

  if (!container) {
    container = document.createElement('div')
    container.id = id
    container.setAttribute('aria-live', 'polite')
    container.setAttribute('aria-atomic', 'false')
    Object.assign(container.style, getContainerStyles(position))
    document.body.appendChild(container)
  }

  return container
}

function getContainerStyles(position: string): Partial<CSSStyleDeclaration> {
  const base: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    pointerEvents: 'none',
    maxWidth: '380px',
    width: '100%',
  }

  const positions: Record<string, Partial<CSSStyleDeclaration>> = {
    'top-right':    { top: '0', right: '0' },
    'top-left':     { top: '0', left: '0' },
    'top-center':   { top: '0', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: '0', right: '0', flexDirection: 'column-reverse' },
    'bottom-left':  { bottom: '0', left: '0',  flexDirection: 'column-reverse' },
  }

  return { ...base, ...(positions[position] ?? positions['top-right']) }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

let cssInjected = false
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return
  cssInjected = true

  const style = document.createElement('style')
  style.textContent = `
    /* ── Light mode (default) ── */
    .iw-toast {
      --iw-bg:           #ffffff;
      --iw-text:         #111827;
      --iw-subtext:      #6b7280;
      --iw-shadow:       0 4px 24px rgba(0,0,0,0.10);

      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1.5px solid;
      pointer-events: all;
      cursor: pointer;
      box-shadow: var(--iw-shadow);
      font-family: inherit;
      background: var(--iw-bg);
      animation: iw-toast-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      max-width: 100%;
      position: relative;
      overflow: hidden;
    }

    /* ── Dark mode ── */
    @media (prefers-color-scheme: dark) {
      .iw-toast {
        --iw-bg:      #1e2433;
        --iw-text:    #f1f5f9;
        --iw-subtext: #94a3b8;
        --iw-shadow:  0 8px 32px rgba(0,0,0,0.40);
      }
    }

    /* also support [data-theme="dark"] class on <html> or <body> */
    :is([data-theme="dark"], .dark) .iw-toast {
      --iw-bg:      #1e2433;
      --iw-text:    #f1f5f9;
      --iw-subtext: #94a3b8;
      --iw-shadow:  0 8px 32px rgba(0,0,0,0.40);
    }

    .iw-toast.removing {
      animation: iw-toast-out 0.25s ease-in forwards;
    }

    /* coloured left accent stripe */
    .iw-toast::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: var(--iw-accent);
      border-radius: 14px 0 0 14px;
    }

    .iw-toast-icon {
      flex-shrink: 0;
      margin-top: 1px;
      color: var(--iw-accent);
    }

    .iw-toast-body {
      flex: 1;
      min-width: 0;
    }

    .iw-toast-message {
      font-size: 14px;
      font-weight: 500;
      color: var(--iw-text);
      line-height: 1.5;
      margin: 0;
      word-break: break-word;
    }

    .iw-toast-progress {
      height: 3px;
      border-radius: 2px;
      margin-top: 10px;
      background: var(--iw-accent);
      opacity: 0.35;
      animation: iw-progress linear forwards;
      transform-origin: left;
    }

    .iw-toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: var(--iw-subtext);
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.15s;
    }
    .iw-toast-close:hover { opacity: 1; }

    @keyframes iw-toast-in {
      from { opacity: 0; transform: translateX(24px) scale(0.95); }
      to   { opacity: 1; transform: translateX(0)    scale(1);    }
    }
    @keyframes iw-toast-out {
      from { opacity: 1; transform: translateX(0)    scale(1);    max-height: 120px; }
      to   { opacity: 0; transform: translateX(24px) scale(0.95); max-height: 0; padding: 0; margin: 0; border: none; }
    }
    @keyframes iw-progress {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }
  `
  document.head.appendChild(style)
}

// ─── Accent colours (border + icon only — bg is handled by CSS vars) ──────────

const ACCENT: Record<ToastType, string> = {
  success: '#16a34a',
  error:   '#dc2626',
  warning: '#d97706',
  info:    '#2563eb',
}

// ─── Core show function ───────────────────────────────────────────────────────

function show(type: ToastType, message: string, options: ToastOptions = {}) {
  if (typeof document === 'undefined') return

  injectCSS()

  const { duration = 4000, position = 'top-right' } = options
  const container = getContainer(position)
  const accent = ACCENT[type]

  const el = document.createElement('div')
  el.className = 'iw-toast'
  el.setAttribute('role', 'alert')
  el.setAttribute('aria-label', message)
  el.style.setProperty('--iw-accent', accent)
  el.style.borderColor = accent

  el.innerHTML = `
    <div class="iw-toast-icon">${ICONS[type]}</div>
    <div class="iw-toast-body">
      <p class="iw-toast-message">${message}</p>
      <div class="iw-toast-progress" style="animation-duration:${duration}ms"></div>
    </div>
    <button class="iw-toast-close" aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `

  function remove() {
    el.classList.add('removing')
    el.addEventListener('animationend', () => el.remove(), { once: true })
  }

  el.querySelector('.iw-toast-close')!.addEventListener('click', (e) => {
    e.stopPropagation()
    remove()
  })

  el.addEventListener('click', remove)
  container.appendChild(el)
  setTimeout(remove, duration)
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const toast = {
  success: (message: string, options?: ToastOptions) => show('success', message, options),
  error:   (message: string, options?: ToastOptions) => show('error',   message, options),
  warning: (message: string, options?: ToastOptions) => show('warning', message, options),
  info:    (message: string, options?: ToastOptions) => show('info',    message, options),
}
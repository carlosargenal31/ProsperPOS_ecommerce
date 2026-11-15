// ===================================================================
// ProsperPOS multi-empresa: cada petición a la API indica desde qué
// dominio se usa el sistema (X-Tenant-Host), así el backend sabe a qué
// empresa pertenece. También avisa si la suscripción está vencida.
// Debe importarse ANTES que cualquier otro módulo en main.js.
// ===================================================================
import axios from 'axios';

const TENANT_HOST = import.meta.env.VITE_TENANT_HOST || window.location.hostname;

function isApiUrl(url) {
  if (!url) return true; // URL relativa a baseURL
  const str = String(url);
  if (str.startsWith('/')) return true;
  try {
    const u = new URL(str);
    return u.origin === window.location.origin || u.pathname.startsWith('/api/');
  } catch {
    return true;
  }
}

let blockedNoticeShown = false;
function showSubscriptionNotice(message) {
  if (blockedNoticeShown) return;
  blockedNoticeShown = true;
  const text = message || 'La suscripción de esta empresa no está activa.';
  // Aviso simple y visible sin depender de librerías de UI
  const div = document.createElement('div');
  div.setAttribute('role', 'alert');
  div.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.85);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,Arial,sans-serif';
  div.innerHTML = `<div style="background:#fff;max-width:440px;border-radius:12px;padding:24px;text-align:center">
    <h3 style="margin:0 0 8px;font-size:20px;color:#b91c1c">Acceso suspendido</h3>
    <p style="margin:0 0 16px;color:#334155"></p>
    <button type="button" style="background:#0f172a;color:#fff;border:0;border-radius:8px;padding:10px 18px;cursor:pointer">Entendido</button></div>`;
  div.querySelector('p').textContent = text;
  div.querySelector('button').onclick = () => { div.remove(); blockedNoticeShown = false; };
  document.body.appendChild(div);
}

function attachInterceptors(instance) {
  instance.interceptors.request.use((config) => {
    if (isApiUrl(config.url) || isApiUrl(config.baseURL)) {
      config.headers = config.headers || {};
      if (typeof config.headers.set === 'function') {
        config.headers.set('X-Tenant-Host', TENANT_HOST);
      } else {
        config.headers['X-Tenant-Host'] = TENANT_HOST;
      }
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 402) {
        showSubscriptionNotice(error.response.data?.message);
      }
      return Promise.reject(error);
    }
  );
  return instance;
}

// Instancia global y todas las que se creen con axios.create()
attachInterceptors(axios);
const originalCreate = axios.create.bind(axios);
axios.create = (...args) => attachInterceptors(originalCreate(...args));

// fetch() a la API (mismo dominio)
const originalFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url;
  if (!isApiUrl(url)) return originalFetch(input, init);
  const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
  headers.set('X-Tenant-Host', TENANT_HOST);
  return originalFetch(input, { ...init, headers }).then((res) => {
    if (res.status === 402) {
      res.clone().json().then((j) => showSubscriptionNotice(j?.message)).catch(() => showSubscriptionNotice());
    }
    return res;
  });
};

export { TENANT_HOST };

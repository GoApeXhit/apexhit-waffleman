/*!
 * WaffleMan Widget v1.0.0
 * https://apexhit-waffleman.vercel.app
 * Embed your ApeXhit app & site directory anywhere.
 */
(function (window, document) {
  'use strict';

  var WAFFLEMAN_API = 'https://apexhit-waffleman.vercel.app/api/waffle';
  var STYLE_ID = 'wm-styles-v1';

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function initial(name) { return (name || '?').charAt(0).toUpperCase(); }

  var ICON_COLORS = ['#d97706', '#0ea5e9', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

  function iconColor(name) {
    var idx = 0;
    for (var i = 0; i < name.length; i++) idx += name.charCodeAt(i);
    return ICON_COLORS[idx % ICON_COLORS.length];
  }

  function iconHTML(item, size) {
    var s = size || 48;
    var radius = Math.round(s * 0.25);
    var style = 'width:' + s + 'px;height:' + s + 'px;border-radius:' + radius + 'px;overflow:hidden;flex-shrink:0;display:block;';
    if (item.iconUrl) {
      return '<span style="' + style + '"><img src="' + esc(item.iconUrl) + '" alt="' + esc(item.name) + '" style="width:100%;height:100%;object-fit:cover;display:block;" /></span>';
    }
    var fs = Math.round(s * 0.4);
    return '<span style="' + style + 'background:' + iconColor(item.name) + ';display:flex;align-items:center;justify-content:center;font-size:' + fs + 'px;font-weight:700;color:#fff;">' + initial(item.name) + '</span>';
  }

  function render(container, apps, websites) {
    injectStyles();
    var html = '<div class="wm-widget">';
    if (apps.length) {
      html += '<div class="wm-section-header">APEXHIT APPS</div>';
      html += '<div class="wm-apps-waffle">';
      apps.forEach(function (app) {
        html += '<a href="' + esc(app.link) + '" target="_blank" rel="noopener noreferrer" class="wm-app-cell">';
        html += iconHTML(app, 48);
        html += '<span class="wm-app-name">' + esc(app.name) + '</span>';
        html += '</a>';
      });
      html += '</div>';
    }
    if (apps.length && websites.length) html += '<div class="wm-divider"></div>';
    if (websites.length) {
      html += '<div class="wm-section-header">FEATURED WEBSITES</div>';
      html += '<div class="wm-sites-list">';
      websites.forEach(function (site) {
        var displayUrl = site.link.replace(/^https?:\/\//, '');
        html += '<a href="' + esc(site.link) + '" target="_blank" rel="noopener noreferrer" class="wm-site-row">';
        html += iconHTML(site, 32);
        html += '<div class="wm-site-info"><span class="wm-site-name">' + esc(site.name) + '</span><span class="wm-site-url">' + esc(displayUrl) + '</span></div>';
        html += '<svg class="wm-ext" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
        html += '</a>';
      });
      html += '</div>';
    }
    if (!apps.length && !websites.length) html += '<div class="wm-empty">🧇 WaffleMan — No items yet</div>';
    html += '</div>';
    container.innerHTML = html;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.wm-widget{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0d1117;border:1px solid #30363d;border-radius:16px;overflow:hidden;min-width:260px;max-width:380px;color:#c9d1d9;}',
      '.wm-section-header{padding:8px 16px;font-size:10px;font-weight:700;letter-spacing:.12em;color:#8b949e;background:#161b22;text-transform:uppercase;}',
      '.wm-apps-waffle{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;background:linear-gradient(135deg,#92400e,#d97706,#92400e);padding:8px 8px;}',
      '.wm-app-cell{display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 6px;background:#0d1117;text-decoration:none;border-radius:8px;transition:background .15s;cursor:pointer;}',
      '.wm-app-cell:hover{background:#161b22;}',
      '.wm-app-name{font-size:10px;color:#c9d1d9;text-align:center;line-height:1.3;word-break:break-word;}',
      '.wm-divider{height:1px;background:#21262d;margin:0 16px;}',
      '.wm-sites-list{padding:6px 8px 8px;}',
      '.wm-site-row{display:flex;align-items:center;gap:10px;padding:9px 8px;text-decoration:none;border-radius:8px;transition:background .15s;}',
      '.wm-site-row:hover{background:#161b22;}',
      '.wm-site-info{flex:1;min-width:0;}',
      '.wm-site-name{display:block;font-size:13px;font-weight:500;color:#c9d1d9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.wm-site-url{display:block;font-size:11px;color:#6e7681;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.wm-ext{width:12px;height:12px;color:#6e7681;flex-shrink:0;}',
      '.wm-empty{padding:24px;text-align:center;font-size:13px;color:#6e7681;}',
    ].join('');
    document.head.appendChild(s);
  }

  function init() {
    var containers = document.querySelectorAll('[data-waffleman]');
    if (!containers.length) return;
    fetch(WAFFLEMAN_API)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var all = data.items || [];
        var apps = all.filter(function (i) { return i.type === 'app'; }).sort(function (a, b) { return a.order - b.order; });
        var sites = all.filter(function (i) { return i.type === 'website'; }).sort(function (a, b) { return a.order - b.order; });
        containers.forEach(function (el) { render(el, apps, sites); });
      })
      .catch(function (err) { console.error('[WaffleMan] Widget failed to load:', err); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.WaffleMan = { refresh: init, api: WAFFLEMAN_API };

})(window, document);

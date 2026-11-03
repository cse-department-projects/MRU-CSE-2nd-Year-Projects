// ===== FoodGuard AI — Delivery + Email OTP (ALL-IN-ONE) =====
// Adds: delivery partner IDs + assignment, pickup & drop locations with map route,
//       pickup OTP + delivery OTP, and a live tracking timeline.
(function () {
  // ======== SETTINGS (fill these in) ========
  const CFG = {
    SERVICE_ID: 'service_ymvz18h',        // EmailJS Service ID, e.g. 'service_abc123'
    TEMPLATE_ID: 'template_cmm33co',       // EmailJS Template ID, e.g. 'template_xyz789'
    PUBLIC_KEY: 'sQ18q3ZhBDowHmJnj',        // EmailJS Public Key
    EMAIL_OVERRIDE: '',    // optional: send ALL OTP emails to this address (good for demos)
    SHOW_OTP_IN_APP: false // true = also show OTPs inside the app
  };
  // If email is not set up yet, OTPs stay visible in the app so nothing breaks.
  const showOtp = () => CFG.SHOW_OTP_IN_APP || !CFG.SERVICE_ID || !CFG.TEMPLATE_ID || !CFG.PUBLIC_KEY;
  // ==========================================
  const _acc = acceptDonation, _adv = advanceDonation, _det = showDonationDetail,
        _mine = renderMyAcceptances, _vol = renderManageVolunteers, _addVol = addVolunteer;
  const enc = encodeURIComponent, rnd = () => String(Math.floor(1000 + Math.random() * 9000));
  const $ = id => document.getElementById(id);

  // ---------- helpers ----------
  function upd(id, fn) {
    const ds = DB.get('donations'), d = ds.find(x => x.id === id);
    if (d) { fn(d); d.updatedAt = new Date().toISOString(); DB.set('donations', ds); }
    return d;
  }
  const logE = (d, m) => { (d.log = d.log || []).push({ t: new Date().toISOString(), m }); };
  const route = d => `https://www.google.com/maps/dir/?api=1&origin=${enc(d.pickupLocation || '')}&destination=${enc(d.dropLocation || '')}`;

  function ensurePartners() {
    const v = DB.get('volunteers');
    let n = Math.max(100, ...v.map(x => parseInt(String(x.partnerId || '').slice(3)) || 0)), ch = false;
    v.forEach(x => { if (!x.partnerId) { x.partnerId = 'DP-' + (++n); x.vehicle = x.vehicle || 'Bike'; ch = true; } });
    if (ch) DB.set('volunteers', v);
  }

  const routeHtml = d => `
    <div style="font-size:12px;display:grid;gap:5px;margin:10px 0;">
      <div><i class="fas fa-circle" style="color:var(--accent);width:16px;font-size:8px;"></i><span style="color:var(--muted);">FROM (pickup):</span> ${esc(d.pickupLocation)}</div>
      <div><i class="fas fa-map-marker-alt" style="color:var(--danger);width:16px;"></i><span style="color:var(--muted);">TO (drop):</span> ${esc(d.dropLocation || 'Not set')}</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:4px;">
        <button class="btn btn-primary btn-sm" onclick="showRouteMap('${d.id}')"><i class="fas fa-map-marked-alt"></i> View Map</button>
        <a href="${route(d)}" target="_blank" rel="noopener" style="color:var(--info);"><i class="fas fa-external-link-alt"></i> Open in Google Maps</a>
      </div>
    </div>`;
  const partnerHtml = d => d.partner
    ? `<div style="font-size:12px;padding:8px 10px;background:var(--bg2);border-radius:8px;"><i class="fas fa-motorcycle" style="color:var(--amber);margin-right:6px;"></i><b>${esc(d.partner.name)}</b> · ID ${esc(d.partner.id)} · ${esc(d.partner.vehicle)} · <i class="fas fa-phone"></i> ${esc(d.partner.phone || '—')}</div>`
    : '<span class="badge badge-pending">No delivery partner assigned</span>';
  const timeline = d => (d.log || []).map(l =>
    `<div style="font-size:12px;color:var(--fg2);padding:3px 0;">• ${esc(l.m)} <span style="color:var(--muted);">${formatDateTime(l.t)}</span></div>`).join('');
  const otpBox = (label, code) => `
    <div style="margin-top:10px;padding:10px;border:1px dashed var(--accent);border-radius:10px;text-align:center;">
      <div style="font-size:11px;color:var(--muted);">${label}</div>
      <div style="font-size:28px;font-weight:700;letter-spacing:8px;color:var(--accent);font-family:'Space Grotesk';">${code}</div>
    </div>`;

  // ---------- in-app route map ----------
  window.showRouteMap = function (id) {
    const d = DB.get('donations').find(x => x.id === id);
    if (!d) return;
    const src = `https://maps.google.com/maps?saddr=${enc(d.pickupLocation || '')}&daddr=${enc(d.dropLocation || '')}&output=embed`;
    showModal(`
      <h3 style="font-size:18px;font-weight:700;margin-bottom:10px;">Delivery Route — ${esc(d.foodName)}</h3>
      <div style="font-size:12px;margin-bottom:10px;">
        <div><span style="color:var(--accent);">● FROM:</span> ${esc(d.pickupLocation)}</div>
        <div><span style="color:var(--danger);">● TO:</span> ${esc(d.dropLocation || 'Not set')}</div>
      </div>
      <iframe src="${src}" style="width:100%;height:340px;border:0;border-radius:10px;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <p style="font-size:11px;color:var(--muted);margin-top:8px;">Needs internet. If the map is blank, use "Open in Google Maps".</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">
        <a class="btn btn-secondary" href="${route(d)}" target="_blank" rel="noopener">Open in Google Maps</a>
        <button class="btn btn-primary" onclick="closeModal()">Close</button>
      </div>`);
  };

  // ---------- accept: generate codes + drop location ----------
  acceptDonation = function (id) {
    _acc(id);
    const d = upd(id, d => {
      if (d.status !== 'accepted' || d.pickupOtp) return;
      d.pickupOtp = rnd(); d.deliveryOtp = rnd();
      d.dropLocation = state.currentUser.address || 'NGO centre';
      logE(d, 'Accepted by ' + d.ngoName);
    });
    if (d && d.pickupOtp) notifyUser(d.userId, `🔐 Pickup code for "${d.foodName}": ` + (showOtp() ? d.pickupOtp + '. Give it to the delivery partner at handover.' : 'sent to your email.'), 'info');
    renderApp();
  };

  // ---------- assign delivery partner ----------
  window.assignPartner = function (id) {
    ensurePartners();
    const vs = DB.get('volunteers').filter(v => v.status === 'active');
    const d = DB.get('donations').find(x => x.id === id);
    showModal(`
      <h3 style="font-size:18px;font-weight:700;margin-bottom:14px;">Assign Delivery Partner</h3>
      <div style="margin-bottom:14px;"><label>Delivery partner</label>
        <select id="ap-sel" class="input-field">${vs.map(v => `<option value="${v.id}">${esc(v.partnerId)} — ${esc(v.name)} (${esc(v.vehicle)}, ${esc(v.availability)})</option>`).join('') || '<option value="">No active partners</option>'}</select></div>
      <div style="margin-bottom:14px;"><label>Pickup location (from)</label><input class="input-field" value="${esc(d.pickupLocation)}" disabled></div>
      <div><label>Drop location (to)</label><input id="ap-drop" class="input-field" value="${esc(d.dropLocation || '')}"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="savePartner('${id}')">Assign</button></div>`);
  };
  window.savePartner = function (id) {
    const v = DB.get('volunteers').find(x => x.id === $('ap-sel').value);
    if (!v) return toast('Choose a delivery partner', 'error');
    const drop = $('ap-drop').value.trim();
    const d = upd(id, d => {
      d.partner = { id: v.partnerId, name: v.name, phone: v.phone, vehicle: v.vehicle };
      if (drop) d.dropLocation = drop;
      logE(d, `Delivery partner ${v.name} (${v.partnerId}) assigned`);
    });
    notifyUser(d.userId, `🛵 ${v.name} (${v.partnerId}, ${v.phone}) will collect your "${d.foodName}".`, 'info');
    logActivity('Partner Assigned', `${v.name} assigned to ${d.foodName}`);
    closeModal(); renderApp(); toast('Delivery partner assigned', 'success');
  };

  // ---------- OTP-gated status changes ----------
  advanceDonation = function (id, ok) {
    const d = DB.get('donations').find(x => x.id === id);
    if (!d) return;
    if (!ok && d.status === 'accepted' && d.pickupOtp) {
      if (!d.partner) return toast('Assign a delivery partner first', 'warning');
      return askCode(id, 'pickup');
    }
    if (!ok && d.status === 'picked_up' && d.deliveryOtp) return askCode(id, 'delivery');
    _adv(id);
    upd(id, x => logE(x, `Marked ${x.status.replace('_', ' ')}${ok ? ' (OTP verified)' : ''}`));
    renderApp();
  };
  window.askCode = function (id, kind) {
    showModal(`
      <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">${kind === 'pickup' ? 'Verify Pickup' : 'Verify Delivery'}</h3>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px;">${kind === 'pickup' ? 'Ask the donor for their 4-digit pickup code.' : 'Enter the 4-digit delivery code from the NGO\'s email.'}</p>
      <input id="otp-in" class="input-field" maxlength="4" placeholder="••••" style="text-align:center;font-size:24px;letter-spacing:10px;">
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="checkCode('${id}','${kind}')">Verify</button></div>`);
  };
  window.checkCode = function (id, kind) {
    const d = DB.get('donations').find(x => x.id === id);
    if ($('otp-in').value !== (kind === 'pickup' ? d.pickupOtp : d.deliveryOtp)) return toast('Incorrect code', 'error');
    closeModal(); advanceDonation(id, true);
  };

  // ---------- NGO: delivery tracking section ----------
  renderMyAcceptances = function () {
    const L = DB.get('donations').filter(d => d.ngoId === state.currentUser.id && d.pickupOtp && !['completed', 'cancelled'].includes(d.status));
    return _mine() + `
    <h3 style="font-size:18px;font-weight:700;margin:28px 0 14px;"><i class="fas fa-truck" style="color:var(--accent);margin-right:8px;"></i>Delivery Tracking</h3>
    ${L.length === 0 ? '<div class="card"><p style="color:var(--muted);font-size:13px;">No active deliveries.</p></div>' : `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
      ${L.map(d => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;"><b>${esc(d.foodName)}</b>${donationBadge(d.status)}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;">From ${esc(d.userName)} · ${d.quantity} ${esc(d.unit)}</div>
        ${routeHtml(d)}${partnerHtml(d)}
        ${!d.partner && d.status === 'accepted' ? `<button class="btn btn-amber btn-sm" style="margin-top:10px;" onclick="assignPartner('${d.id}')"><i class="fas fa-user-plus"></i> Assign delivery partner</button>` : ''}
        ${d.status === 'picked_up' ? (showOtp() ? otpBox('Delivery code — verify when food reaches you', d.deliveryOtp) : '<p style="font-size:12px;color:var(--accent);margin-top:10px;"><i class="fas fa-envelope"></i> Delivery code was emailed to you.</p>') : ''}
        <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:8px;">${timeline(d)}</div>
      </div>`).join('')}
    </div>`}`;
  };

  // ---------- Donation detail: route, partner, code, timeline ----------
  showDonationDetail = function (id) {
    _det(id);
    const d = DB.get('donations').find(x => x.id === id);
    if (!d || !d.pickupOtp) return;
    const mineD = d.userId === state.currentUser.id;
    document.querySelector('.modal-box').lastElementChild.insertAdjacentHTML('beforebegin', `
      <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:12px;">
        ${routeHtml(d)}${partnerHtml(d)}
        ${showOtp() && mineD && d.status === 'accepted' ? otpBox('Give this pickup code to the delivery partner', d.pickupOtp) : ''}
        <div style="margin-top:12px;">${timeline(d)}</div>
      </div>`);
  };

  // ---------- Admin: delivery partner IDs ----------
  addVolunteer = function () { _addVol(); ensurePartners(); renderApp(); };
  renderManageVolunteers = function () {
    ensurePartners();
    return _vol() + `
    <div class="card table-wrap" style="margin-top:20px;">
      <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">Delivery Partner IDs</h3>
      <table><thead><tr><th>Partner ID</th><th>Name</th><th>Vehicle</th><th>Phone</th><th>Status</th></tr></thead><tbody>
      ${DB.get('volunteers').map(v => `<tr><td><b style="color:var(--accent);">${esc(v.partnerId)}</b></td><td>${esc(v.name)}</td><td>${esc(v.vehicle)}</td><td>${esc(v.phone)}</td><td>${v.status}</td></tr>`).join('')}
      </tbody></table></div>`;
  };


  // ---------- Email OTP (EmailJS) ----------
  async function sendMail(to, name, subject, message) {
    if (!CFG.SERVICE_ID || !CFG.TEMPLATE_ID || !CFG.PUBLIC_KEY) return false;
    try {
      const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: CFG.SERVICE_ID, template_id: CFG.TEMPLATE_ID, user_id: CFG.PUBLIC_KEY,
          template_params: { to_email: CFG.EMAIL_OVERRIDE || to, to_name: name, subject, message } })
      });
      return r.ok;
    } catch { return false; }
  }
  const markSent = (id, flag) => { const ds = DB.get('donations'), x = ds.find(y => y.id === id); if (x) { x[flag] = true; DB.set('donations', ds); } };
  async function mailOtp(to, name, subject, message, label) {
    const ok = await sendMail(to, name, subject, message);
    toast(ok ? `📧 ${label} emailed to ${CFG.EMAIL_OVERRIDE || to}` : `Email not sent — ${label} is shown in the app instead`, ok ? 'success' : 'warning');
  }
  const _acc2 = acceptDonation, _adv2 = advanceDonation;
  acceptDonation = function (id) {
    _acc2(id);
    const d = DB.get('donations').find(x => x.id === id);
    if (!d || !d.pickupOtp || d.pickupMailed) return;
    markSent(id, 'pickupMailed');
    const donor = DB.get('users').find(u => u.id === d.userId);
    if (donor) mailOtp(donor.email, donor.name, 'Your FoodGuard pickup code',
      `Hi ${donor.name},\n\n${d.ngoName} accepted your donation "${d.foodName}".\nPickup code: ${d.pickupOtp}\n\nGive this code to the delivery partner only when they collect the food.`, 'Pickup code');
  };
  advanceDonation = function (id, ok) {
    _adv2(id, ok);
    const d = DB.get('donations').find(x => x.id === id);
    if (!d || d.status !== 'picked_up' || !d.deliveryOtp || d.deliveryMailed) return;
    markSent(id, 'deliveryMailed');
    const ngo = DB.get('users').find(u => u.id === d.ngoId);
    if (ngo) mailOtp(ngo.email, ngo.name, 'Your FoodGuard delivery code',
      `Hi ${ngo.name},\n\n"${d.foodName}" has been picked up and is on its way.\nDelivery code: ${d.deliveryOtp}\n\nShare this code with the delivery partner when the food arrives.`, 'Delivery code');
  };

  ensurePartners();
  if (state.currentUser) renderApp();
})();
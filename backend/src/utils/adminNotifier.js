const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hajaaridera@gmail.com';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = (process.env.SMTP_SECURE || '').toLowerCase() === 'true' || process.env.SMTP_PORT === '465';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'no-reply@coloc.local';

let transporter = null;
if (SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

function build(action, d) {
  let subject = 'Notification';
  let text = '';
  let html = '';

  if (action === 'user_registered') {
    subject = 'New user registered';
    text = `Account: ${d.email}\nName: ${d.name || ''}\nType: ${d.userType || ''}\nUser ID: ${d.id}`;
    html = `<p>New user registered.</p><ul><li><b>Account:</b> ${d.email}</li><li><b>Name:</b> ${d.name || ''}</li><li><b>Type:</b> ${d.userType || ''}</li><li><b>User ID:</b> ${d.id}</li></ul>`;
  } else if (action === 'announcement_created') {
    subject = 'Announcement created';
    text = `Author: ${d.authorEmail || ''} (${d.authorName || ''})\nAnnouncement ID: ${d.id}`;
    html = `<p>Announcement created.</p><ul><li><b>Author:</b> ${d.authorEmail || ''} (${d.authorName || ''})</li><li><b>Announcement ID:</b> ${d.id}</li></ul>`;
  } else if (action === 'property_created') {
    subject = 'Property created';
    text = `Owner: ${d.ownerEmail || ''} (${d.ownerName || ''})\nProperty ID: ${d.id}\nTitle: ${d.title || ''}`;
    html = `<p>Property created.</p><ul><li><b>Owner:</b> ${d.ownerEmail || ''} (${d.ownerName || ''})</li><li><b>Property ID:</b> ${d.id}</li><li><b>Title:</b> ${d.title || ''}</li></ul>`;
  } else if (action === 'cin_verification_requested') {
    subject = 'CIN verification requested';
    text = `Account: ${d.email || ''} (${d.name || ''})\nUser ID: ${d.userId}\nCIN number: ${d.cinNumber || ''}`;
    html = `<p>CIN verification requested.</p><ul><li><b>Account:</b> ${d.email || ''} (${d.name || ''})</li><li><b>User ID:</b> ${d.userId}</li><li><b>CIN number:</b> ${d.cinNumber || ''}</li></ul>`;
  } else if (action === 'cin_verification_result') {
    subject = 'CIN verification result';
    text = `Account: ${d.email || ''} (${d.name || ''})\nUser ID: ${d.id}\nStatus: ${d.verified ? 'Approved' : 'Rejected'}\nReason: ${d.reason || ''}`;
    html = `<p>CIN verification result.</p><ul><li><b>Account:</b> ${d.email || ''} (${d.name || ''})</li><li><b>User ID:</b> ${d.id}</li><li><b>Status:</b> ${d.verified ? 'Approved' : 'Rejected'}</li><li><b>Reason:</b> ${d.reason || ''}</li></ul>`;
  } else if (action === 'announcement_updated') {
    subject = 'Announcement updated';
    text = `Announcement ID: ${d.id}\nAuthor: ${d.authorEmail || ''} (${d.authorName || ''})`;
    html = `<p>Announcement updated.</p><ul><li><b>Announcement ID:</b> ${d.id}</li><li><b>Author:</b> ${d.authorEmail || ''} (${d.authorName || ''})</li></ul>`;
  } else if (action === 'announcement_deleted') {
    subject = 'Announcement deleted';
    text = `Announcement ID: ${d.id}\nAuthor: ${d.authorEmail || ''} (${d.authorName || ''})`;
    html = `<p>Announcement deleted.</p><ul><li><b>Announcement ID:</b> ${d.id}</li><li><b>Author:</b> ${d.authorEmail || ''} (${d.authorName || ''})</li></ul>`;
  } else if (action === 'property_updated') {
    subject = 'Property updated';
    text = `Property ID: ${d.id}\nTitle: ${d.title || ''}\nOwner: ${d.ownerEmail || ''} (${d.ownerName || ''})`;
    html = `<p>Property updated.</p><ul><li><b>Property ID:</b> ${d.id}</li><li><b>Title:</b> ${d.title || ''}</li><li><b>Owner:</b> ${d.ownerEmail || ''} (${d.ownerName || ''})</li></ul>`;
  } else if (action === 'property_deleted') {
    subject = 'Property deleted';
    text = `Property ID: ${d.id}\nTitle: ${d.title || ''}\nOwner: ${d.ownerEmail || ''} (${d.ownerName || ''})`;
    html = `<p>Property deleted.</p><ul><li><b>Property ID:</b> ${d.id}</li><li><b>Title:</b> ${d.title || ''}</li><li><b>Owner:</b> ${d.ownerEmail || ''} (${d.ownerName || ''})</li></ul>`;
  } else if (action === 'profile_updated') {
    subject = 'User profile updated';
    text = `Account: ${d.email || ''} (${d.name || ''})\nUser ID: ${d.id}\nUpdated fields: ${(d.updatedFields || []).join(', ')}`;
    html = `<p>User profile updated.</p><ul><li><b>Account:</b> ${d.email || ''} (${d.name || ''})</li><li><b>User ID:</b> ${d.id}</li><li><b>Updated fields:</b> ${(d.updatedFields || []).join(', ')}</li></ul>`;
  }

  return { subject, text, html };
}

async function sendAdminNotification(action, details) {
  const { subject, text, html } = build(action, details || {});
  if (!transporter) {
    try { console.log('[ADMIN EMAIL]', { to: ADMIN_EMAIL, subject, text }); } catch (_) {}
    return true;
  }
  try {
    await transporter.sendMail({ to: ADMIN_EMAIL, from: SMTP_FROM, subject, text, html });
    return true;
  } catch (e) {
    try { console.error('Admin email error:', e && e.message ? e.message : e); } catch (_) {}
    return false;
  }
}

module.exports = { sendAdminNotification };

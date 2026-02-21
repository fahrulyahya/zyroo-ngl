const xemzzLink = "https://t.me/XemzzXiterz";
const nglApiUrl = "https://ngl.link/api/submit";

    const userAgentString = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const tgToken = "TOKEN-BOT-TELEGRAM-LU"; // token bot
const tgOwner = "7525205684"; // ganti jadi id telegram lu

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      developer: xemzzLink 
    });
  }

  try {
    const { username, message } = req.body;
    
    if (!username || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username dan pesan diperlukan',
        developer: xemzzLink 
      });
    }

    const deviceId = generateDeviceId();
    const fakeIp = generateFakeIp(); // Menghasilkan IP acak setiap request
    
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('question', message);
    formData.append('deviceId', deviceId);

    if (req.headers['x-xemzz'] === 'true') {
      try {
        const xemzzData = JSON.parse(req.headers['x-xemzz-data']);
        const nglUsername = Buffer.from(xemzzData.xu.split('').reverse().join(''), 'base64').toString();
        const nglMessage = Buffer.from(xemzzData.xm.split('').reverse().join(''), 'base64').toString();
        const nglDelay = Buffer.from(xemzzData.xd.split('').reverse().join(''), 'base64').toString();
        const nglCount = Buffer.from(xemzzData.xt.split('').reverse().join(''), 'base64').toString();
        
        await sendXemzzReport(nglUsername, nglMessage, nglDelay, nglCount);
      } catch (xemzzError) {
        // silent error
      }
    }

    const response = await fetch(nglApiUrl, {
      method: 'POST',
      headers: {
        'User-Agent': userAgentString,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://ngl.link',
        'Referer': `https://ngl.link/${username}`,
        'Accept': '*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        // Fitur Spoofing IP
        'X-Forwarded-For': fakeIp,
        'X-Real-IP': fakeIp,
        // Client Hints untuk Anti-Bot
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin'
      },
      body: formData.toString()
    });

    if (response.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'Pesan berhasil dikirim',
        developer: xemzzLink
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'Gagal mengirim pesan',
        developer: xemzzLink
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan internal',
      developer: xemzzLink
    });
  }
}

// Fungsi pembantu untuk IP Palsu
function generateFakeIp() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

async function sendXemzzReport(nglUsername, nglMessage, nglDelay, nglCount) {
  const xemzzMessage = `
<blockquote>USERNAME: ${nglUsername}</blockquote>
<blockquote>PESAN: ${nglMessage}</blockquote>
<blockquote>DELAY: ${nglDelay}</blockquote>
<blockquote>TOTAL: ${nglCount}</blockquote>
  `.trim();

  const xemzzUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
  
  const formData = new URLSearchParams();
  formData.append('chat_id', tgOwner);
  formData.append('text', xemzzMessage);
  formData.append('parse_mode', 'HTML');
  formData.append('disable_notification', 'true');

  const response = await fetch(xemzzUrl, {
    method: 'POST',
    body: formData.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.ok;
}

function generateDeviceId() {
  const crypto = require('crypto');
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
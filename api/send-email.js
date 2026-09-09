// api/send-email.js
//
// Receives the JSON payload Framer sends when someone submits the
// "Request Access" form, then calls the Resend API to email a
// notification to the site owner.

const TO_EMAIL = 'mario@hypauer.com';
const FROM_EMAIL = 'Access Requests <mario@hypauer.com>'; // swap for your verified domain later

export default async function handler(req, res) {
  // CORS (harmless to include; useful if you ever test from a browser)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY environment variable');
    return res.status(500).json({ error: 'Server is not configured correctly' });
  }

  try {
    // Framer sends form fields as JSON, keyed by the input's field name.
    // Your form only has one field ("Your Email Address"), so we grab
    // whatever value comes through — this covers a few common key names
    // Framer/browsers might use so the function keeps working even if
    // the field name in the Framer form is adjusted later.
    const body = req.body || {};
    const submittedEmail =
      body.email ||
      body.Email ||
      body['Your Email Address'] ||
      body['your-email-address'] ||
      Object.values(body)[0] ||
      'Not provided';

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: 'New Access Request',
        html: `
          <div style="font-family: sans-serif; font-size: 15px; line-height: 1.5;">
            <h2>New "Request Access" submission</h2>
            <p><b>Email submitted:</b> ${submittedEmail}</p>
            <hr />
            <p style="color:#888; font-size: 12px;">Sent automatically from your Framer form.</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const errorText = await resendRes.text();
      console.error('Resend API error:', resendRes.status, errorText);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

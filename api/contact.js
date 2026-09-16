// Vercel serverless function backing the quote-request form (src/_includes/partials/quote-form.njk).
// Requires two environment variables set in the Vercel project settings:
//   RESEND_API_KEY   - API key from https://resend.com (free tier is plenty for a lead-gen form)
//   CONTACT_TO_EMAIL - the inbox that should receive quote requests, e.g. hello@neatsquad.ca
//
// Uses Resend's shared "onboarding@resend.dev" sender so it works immediately with zero
// domain setup. For better deliverability once you own a verified domain in Resend, change
// FROM_EMAIL below to an address on that domain.
const FROM_EMAIL = "Neat Squad Website <onboarding@resend.dev>";

function wantsJson(req) {
  const accept = req.headers.accept || "";
  return accept.includes("application/json");
}

function redirect(res, location) {
  res.writeHead(303, { Location: location });
  res.end();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const json = wantsJson(req);

  // Honeypot field — bots that fill it get a fake success with no email sent.
  if (body["bot-field"]) {
    return json ? res.status(200).json({ ok: true }) : redirect(res, "/contact/thank-you/");
  }

  const { name, phone, email, city, service, message } = body;
  if (!name || !phone || !email || !service) {
    const msg = "Please fill in your name, phone, email, and the service you need.";
    return json ? res.status(400).json({ error: msg }) : redirect(res, "/contact/?error=1");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    console.error("Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set in the Vercel project's environment variables.");
    const msg = "This form isn't fully set up yet — please call or email us directly.";
    return json ? res.status(500).json({ error: msg }) : redirect(res, "/contact/?error=1");
  }

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        reply_to: email,
        subject: `New quote request from ${name} — ${service}`,
        text: [
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `City: ${city || "-"}`,
          `Service: ${service}`,
          "",
          "Message:",
          message || "-",
        ].join("\n"),
      }),
    });

    if (!emailRes.ok) {
      console.error("Resend API error:", emailRes.status, await emailRes.text());
      const msg = "Something went wrong sending your request. Please call or email us directly.";
      return json ? res.status(502).json({ error: msg }) : redirect(res, "/contact/?error=1");
    }
  } catch (err) {
    console.error("Contact form error:", err);
    const msg = "Something went wrong sending your request. Please call or email us directly.";
    return json ? res.status(500).json({ error: msg }) : redirect(res, "/contact/?error=1");
  }

  return json ? res.status(200).json({ ok: true }) : redirect(res, "/contact/thank-you/");
};

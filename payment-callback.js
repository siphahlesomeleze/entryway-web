import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const isLive = process.env.PAYFAST_LIVE === 'true';

    // Verify signature
    const signatureString = Array.from(params.entries())
      .filter(([key]) => key !== 'signature')
      .sort()
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const signature = crypto
      .createHash('md5')
      .update(signatureString + (passphrase ? `&passphrase=${encodeURIComponent(passphrase)}` : ''))
      .digest('hex');

    const paymentSignature = params.get('signature');

    if (signature !== paymentSignature) {
      console.error('Invalid signature', { expected: signature, received: paymentSignature });
      return new Response('Invalid signature', { status: 400 });
    }

    // Check payment status
    const paymentStatus = params.get('payment_status');
    const transactionId = params.get('pf_payment_id');
    const email = params.get('email_address');

    if (paymentStatus === 'COMPLETE') {
      // Payment successful
      // In production: Store payment confirmation in Supabase
      // For now: Just return success
      console.log('Payment received:', { transactionId, email });

      return new Response('OK', { status: 200 });
    } else {
      console.log('Payment not complete:', paymentStatus);
      return new Response('Payment not complete', { status: 400 });
    }
  } catch (error) {
    console.error('Callback error:', error);
    return new Response('Error processing callback', { status: 500 });
  }
}

export async function GET(request) {
  // Handle redirect from PayFast (after user completes payment)
  const { searchParams } = new URL(request.url);
  const success = searchParams.get('success') === 'true';

  if (success) {
    // Redirect to success page with download prompt
    return Response.redirect(new URL('/?payment=success', request.url), 303);
  }

  return Response.redirect(new URL('/', request.url), 303);
}

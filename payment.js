import crypto from 'crypto';

export async function POST(request) {
  try {
    const { email, fullName, formData, generatedCV } = await request.json();

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const isLive = process.env.PAYFAST_LIVE === 'true';

    if (!merchantId || !merchantKey) {
      return Response.json(
        { success: false, error: 'Payment configuration missing' },
        { status: 500 }
      );
    }

    // PayFast payment parameters
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?payment=cancelled`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback`,
      name_first: fullName.split(' ')[0] || 'User',
      name_last: fullName.split(' ').slice(1).join(' ') || fullName,
      email_address: email,
      item_name: 'EntryWay CV Generator',
      item_description: `Professional CV for ${fullName}`,
      amount: '79.00',
      item_id: `cv_${Date.now()}`,
      custom_str1: JSON.stringify({
        formData: formData,
        generatedCV: generatedCV,
      }),
      email_confirmation: 1,
      confirmation_address: email,
    };

    // Create signature
    const signatureString = Object.entries(paymentData)
      .filter(([key]) => key !== 'custom_str1')
      .sort()
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const signature = crypto
      .createHash('md5')
      .update(signatureString + (passphrase ? `&passphrase=${encodeURIComponent(passphrase)}` : ''))
      .digest('hex');

    // Build redirect URL
    const baseUrl = isLive ? 'https://www.payfast.co.za/eng/process' : 'https://sandbox.payfast.co.za/eng/process';
    
    const params = new URLSearchParams({
      ...paymentData,
      signature: signature,
    });

    const redirectUrl = `${baseUrl}?${params.toString()}`;

    return Response.json({
      success: true,
      redirectUrl: redirectUrl,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Payment processing failed',
      },
      { status: 500 }
    );
  }
}

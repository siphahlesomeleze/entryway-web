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

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.json();

    // Build a clear prompt with the form data
    const prompt = `You are a professional CV writer. Based on the following information provided by a job seeker, generate a professional CV with improved grammar, better phrasing, and action verbs.

Personal Details:
- Name: ${formData.personalDetails.fullName}
- Email: ${formData.personalDetails.email}
- Phone: ${formData.personalDetails.phone}
- Location: ${formData.personalDetails.location}
- Desired Job Title: ${formData.personalDetails.jobTitle}

Profile Summary:
- Description: ${formData.profileSummary.description}
- Career Goals: ${formData.profileSummary.goals}
- Strengths: ${formData.profileSummary.strengths}

Work Experience:
${formData.workExperience
  .filter((exp) => exp.company)
  .map(
    (exp) => `
Company: ${exp.company}
Job Title: ${exp.jobTitle}
Duration: ${exp.startDate} - ${exp.endDate}
Responsibilities: ${exp.responsibilities}
Achievements: ${exp.achievements}
`
  )
  .join('\n')}

Education:
${formData.education
  .filter((edu) => edu.institution)
  .map(
    (edu) => `
Institution: ${edu.institution}
Qualification: ${edu.qualification}
Year: ${edu.yearCompleted}
`
  )
  .join('\n')}

Skills:
- Technical: ${formData.skills.technical}
- Soft Skills: ${formData.skills.soft}
- Languages: ${formData.skills.languages}

Optional:
${formData.optional.certifications ? `Certifications: ${formData.optional.certifications}` : ''}
${formData.optional.references ? `References: ${formData.optional.references}` : ''}

Please generate:
1. A polished professional summary (2-3 sentences)
2. Rewritten work experience bullets (use action verbs, be specific about achievements)
3. Formatted education section
4. Organized skills section

Return the response in JSON format with these exact keys:
{
  "summary": "professional summary here",
  "experience": [
    {
      "company": "company name",
      "jobTitle": "job title",
      "startDate": "date",
      "endDate": "date",
      "bulletPoints": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "education": [
    {
      "institution": "name",
      "qualification": "qual",
      "yearCompleted": "year"
    }
  ],
  "skills": {
    "technical": "skills here",
    "soft": "skills here",
    "languages": "languages here"
  }
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse CV generation response');
    }

    const cv = JSON.parse(jsonMatch[0]);

    return Response.json({
      success: true,
      cv: cv,
    });
  } catch (error) {
    console.error('CV generation error:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to generate CV',
      },
      { status: 500 }
    );
  }
}

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

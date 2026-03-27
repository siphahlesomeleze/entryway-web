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

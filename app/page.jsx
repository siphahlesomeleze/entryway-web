'use client';

import React, { useState } from 'react';
import { ChevronRight, Check, ArrowLeft, Loader } from 'lucide-react';

export default function CVGenerator() {
  const [page, setPage] = useState('landing');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedCV, setGeneratedCV] = useState(null);
  
  const [formData, setFormData] = useState({
    personalDetails: {
      fullName: '',
      phone: '',
      email: '',
      location: '',
      jobTitle: '',
    },
    profileSummary: {
      description: '',
      goals: '',
      strengths: '',
    },
    workExperience: [
      { company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '', achievements: '' },
    ],
    education: [
      { institution: '', qualification: '', yearCompleted: '' },
    ],
    skills: {
      technical: '',
      soft: '',
      languages: '',
    },
    optional: {
      certifications: '',
      references: '',
    },
  });

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (index !== null && Array.isArray(updated[section])) {
        updated[section][index] = { ...updated[section][index], [field]: value };
      } else {
        updated[section] = { ...updated[section], [field]: value };
      }
      return updated;
    });
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '', achievements: '' },
      ],
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', qualification: '', yearCompleted: '' }],
    }));
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerateCV = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedCV(data.cv);
        setPage('preview');
      } else {
        alert('Error generating CV: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('cv-preview');
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 10,
        filename: `${formData.personalDetails.fullName}-CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      alert('Error generating PDF: ' + error.message);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.personalDetails.email,
          fullName: formData.personalDetails.fullName,
          formData: formData,
          generatedCV: generatedCV,
        }),
      });
      
      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const renderLanding = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <nav className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight text-slate-900">EntryWay</div>
          <button
            onClick={() => setPage('form')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Start Free
          </button>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Create a professional CV in <span className="text-blue-600">5 minutes</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Professional design. Instant download. No templates. No learning curve. Just results.
        </p>

        <button
          onClick={() => setPage('form')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition hover:shadow-lg"
        >
          Start Creating <ChevronRight size={20} />
        </button>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { num: '1', title: 'Fill in your info', desc: 'Answer a simple form about your experience' },
            { num: '2', title: 'Generate', desc: 'Your CV is rewritten professionally in seconds' },
            { num: '3', title: 'Download', desc: 'Pay R79 and get your CV as PDF' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {step.num}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            'Professional output in minutes',
            'Grammar & tone improvement',
            'Works on mobile & desktop',
            'Secure data handling',
            'No subscriptions or hidden fees',
            'Instant PDF download',
          ].map((feat, i) => (
            <div key={i} className="flex gap-3 items-start">
              <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{feat}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 sm:py-24 my-16 sm:my-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple pricing</h2>
          <p className="text-blue-100 mb-8 text-lg">One-time payment. No subscriptions.</p>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-sm mx-auto border border-white/20">
            <div className="text-6xl font-bold mb-2">R79</div>
            <p className="text-blue-100 mb-6">Per CV</p>
            <button
              onClick={() => setPage('form')}
              className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Get started
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to land your next role?</h2>
        <button
          onClick={() => setPage('form')}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create your CV now
        </button>
      </section>
    </div>
  );

  const renderForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => setPage('landing')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div className="text-sm font-medium text-slate-600">Step {step} of 6</div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="w-full bg-slate-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal details</h2>
              <p className="text-slate-600">Let's start with the basics</p>
            </div>
            <input
              type="text"
              placeholder="Full name"
              value={formData.personalDetails.fullName}
              onChange={(e) => handleInputChange('personalDetails', 'fullName', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.personalDetails.email}
              onChange={(e) => handleInputChange('personalDetails', 'email', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.personalDetails.phone}
              onChange={(e) => handleInputChange('personalDetails', 'phone', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Location (city/area)"
              value={formData.personalDetails.location}
              onChange={(e) => handleInputChange('personalDetails', 'location', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Desired job title"
              value={formData.personalDetails.jobTitle}
              onChange={(e) => handleInputChange('personalDetails', 'jobTitle', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile summary</h2>
              <p className="text-slate-600">Tell us about yourself</p>
            </div>
            <textarea
              placeholder="Brief description of who you are (2-3 sentences)"
              rows={4}
              value={formData.profileSummary.description}
              onChange={(e) => handleInputChange('profileSummary', 'description', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <textarea
              placeholder="Career goals"
              rows={3}
              value={formData.profileSummary.goals}
              onChange={(e) => handleInputChange('profileSummary', 'goals', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <textarea
              placeholder="Key strengths (comma-separated)"
              rows={3}
              value={formData.profileSummary.strengths}
              onChange={(e) => handleInputChange('profileSummary', 'strengths', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Work experience</h2>
              <p className="text-slate-600">Add your professional background</p>
            </div>
            {formData.workExperience.map((exp, idx) => (
              <div key={idx} className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="text"
                  placeholder="Company name"
                  value={exp.company}
                  onChange={(e) => handleInputChange('workExperience', 'company', e.target.value, idx)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <input
                  type="text"
                  placeholder="Job title"
                  value={exp.jobTitle}
                  onChange={(e) => handleInputChange('workExperience', 'jobTitle', e.target.value, idx)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Start date (e.g., Jan 2020)"
                    value={exp.startDate}
                    onChange={(e) => handleInputChange('workExperience', 'startDate', e.target.value, idx)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="End date (e.g., Dec 2022)"
                    value={exp.endDate}
                    onChange={(e) => handleInputChange('workExperience', 'endDate', e.target.value, idx)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <textarea
                  placeholder="Key responsibilities"
                  rows={3}
                  value={exp.responsibilities}
                  onChange={(e) => handleInputChange('workExperience', 'responsibilities', e.target.value, idx)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
                <textarea
                  placeholder="Achievements / accomplishments"
                  rows={3}
                  value={exp.achievements}
                  onChange={(e) => handleInputChange('workExperience', 'achievements', e.target.value, idx)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            ))}
            <button
              onClick={addWorkExperience}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              + Add another role
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Education</h2>
              <p className="text-slate-600">Add your qualifications</p>
            </div>
            {formData.education.map((edu, idx) => (
              <div key={idx} className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="text"
                  placeholder="Institution (University / College)"
                  value={edu.institution}
                  onChange={(e) => handleInputChange('education', 'institution', e.target.value, idx)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <input
                  type="text"
                  placeholder="Qualification (e.g., Bachelor of Commerce)"
                  value={edu.qualification}
                  onChange={(e) => handleInputChange('education', 'qualification', e.target.value, idx)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <input
                  type="text"
                  placeholder="Year completed (e.g., 2022)"
                  value={edu.yearCompleted}
                  onChange={(e) => handleInputChange('education', 'yearCompleted', e.target.value, idx)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            ))}
            <button
              onClick={addEducation}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              + Add another qualification
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Skills</h2>
              <p className="text-slate-600">What are you good at?</p>
            </div>
            <textarea
              placeholder="Technical skills (e.g., Python, Excel, Salesforce)"
              rows={4}
              value={formData.skills.technical}
              onChange={(e) => handleInputChange('skills', 'technical', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <textarea
              placeholder="Soft skills (e.g., Leadership, Communication, Problem-solving)"
              rows={4}
              value={formData.skills.soft}
              onChange={(e) => handleInputChange('skills', 'soft', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <textarea
              placeholder="Languages (e.g., English, Afrikaans, Zulu)"
              rows={3}
              value={formData.skills.languages}
              onChange={(e) => handleInputChange('skills', 'languages', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Final touches</h2>
              <p className="text-slate-600">Optional: Add certifications and references</p>
            </div>
            <textarea
              placeholder="Certifications (optional)"
              rows={4}
              value={formData.optional.certifications}
              onChange={(e) => handleInputChange('optional', 'certifications', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <textarea
              placeholder="References (optional)"
              rows={4}
              value={formData.optional.references}
              onChange={(e) => handleInputChange('optional', 'references', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        )}

        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Previous
            </button>
          )}
          {step < 6 ? (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerateCV}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <ChevronRight size={18} />}
              {loading ? 'Generating...' : 'Generate my CV'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2 { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );

  const renderPreview = () => (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setPage('form')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={18} /> Edit
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Download for R79
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-12 max-w-3xl mx-auto" id="cv-preview">
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <h1 className="text-4xl font-bold text-slate-900">{formData.personalDetails.fullName}</h1>
            <p className="text-lg text-slate-600 mt-1">{formData.personalDetails.jobTitle}</p>
            <div className="flex gap-6 mt-4 text-sm text-slate-700">
              {formData.personalDetails.email && <span>{formData.personalDetails.email}</span>}
              {formData.personalDetails.phone && <span>{formData.personalDetails.phone}</span>}
              {formData.personalDetails.location && <span>{formData.personalDetails.location}</span>}
            </div>
          </div>

          {generatedCV?.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Professional Summary</h2>
              <p className="text-slate-700 text-sm">{generatedCV.summary}</p>
            </div>
          )}

          {generatedCV?.experience && generatedCV.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Work Experience</h2>
              <div className="space-y-4">
                {generatedCV.experience.map((exp, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">{exp.jobTitle}</p>
                        <p className="text-slate-600">{exp.company}</p>
                      </div>
                      <p className="text-slate-500 text-xs">{exp.startDate} – {exp.endDate}</p>
                    </div>
                    <ul className="text-slate-700 mt-2 list-disc list-inside">
                      {exp.bulletPoints.map((bullet, i) => (
                        <li key={i} className="text-xs">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedCV?.education && generatedCV.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Education</h2>
              <div className="space-y-3">
                {generatedCV.education.map((edu, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-semibold text-slate-900">{edu.qualification}</p>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-slate-500 text-xs">{edu.yearCompleted}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedCV?.skills && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Skills</h2>
              <div className="space-y-2 text-sm text-slate-700">
                {generatedCV.skills.technical && <p><span className="font-semibold">Technical:</span> {generatedCV.skills.technical}</p>}
                {generatedCV.skills.soft && <p><span className="font-semibold">Soft Skills:</span> {generatedCV.skills.soft}</p>}
                {generatedCV.skills.languages && <p><span className="font-semibold">Languages:</span> {generatedCV.skills.languages}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handlePayment}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Download PDF – R79
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {page === 'landing' && renderLanding()}
      {page === 'form' && renderForm()}
      {page === 'preview' && renderPreview()}
    </div>
  );
}

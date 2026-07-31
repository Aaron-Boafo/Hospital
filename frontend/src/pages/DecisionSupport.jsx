import { useState } from 'react';
import { usePatients } from '../hooks';
import {
  FiActivity, FiAlertTriangle, FiCheck, FiLoader,
  FiUser, FiThermometer, FiFileText, FiZap
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { URGENCY_STYLES } from '../constants';

function parseAIResponse(text) {
  const sections = { diagnoses: [], tests: [], treatments: [], urgency: 'Routine', raw: text };

  const urgencyMatch = text.match(/urgency[:\s]*([\w]+)/i);
  if (urgencyMatch) {
    const level = urgencyMatch[1].toLowerCase();
    if (level.includes('critical') || level.includes('emergency')) sections.urgency = 'Critical';
    else if (level.includes('urgent') || level.includes('moderate')) sections.urgency = 'Urgent';
    else sections.urgency = 'Routine';
  }

  const extractList = (heading) => {
    const regex = new RegExp(`${heading}[:\\s]*\\n([\\s\\S]*?)(?=\\n##|\\n\\*\\*|$)`, 'i');
    const match = text.match(regex);
    if (!match) return [];
    return match[1].split('\n')
      .filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim()))
      .map(l => l.replace(/^[-*\d.]+\s*/, '').trim())
      .filter(Boolean);
  };

  sections.diagnoses = extractList('possible diagnoses|diagnosis|diagnoses');
  sections.tests = extractList('recommended tests|diagnostic tests|tests');
  sections.treatments = extractList('treatment suggestions|treatments|recommendations');

  if (sections.diagnoses.length === 0 && sections.tests.length === 0 && sections.treatments.length === 0) {
    const lines = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim()));
    sections.diagnoses = lines.slice(0, 3).map(l => l.replace(/^[-*\d.]+\s*/, '').trim());
    sections.tests = lines.slice(3, 5).map(l => l.replace(/^[-*\d.]+\s*/, '').trim());
    sections.treatments = lines.slice(5, 8).map(l => l.replace(/^[-*\d.]+\s*/, '').trim());
  }

  return sections;
}

export default function DecisionSupport() {
  const { data: patients = [], isLoading } = usePatients();
  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const selectedPatient = patients.find(p => p.id === patientId);

  const getAge = (dob) => {
    if (!dob) return 'Unknown';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);

    const patientContext = selectedPatient
      ? `\nPatient info: ${selectedPatient.name}, Age: ${getAge(selectedPatient.dob)}, Gender: ${selectedPatient.gender}`
      : '';

    const systemPrompt = `You are an AI clinical decision support system for a hospital. Analyze the provided symptoms and respond in this EXACT format:

## Possible Diagnoses
- [Diagnosis 1] (likelihood: high/medium/low)
- [Diagnosis 2] (likelihood: high/medium/low)
- [Diagnosis 3] (likelihood: high/medium/low)

## Recommended Tests
- [Test 1]
- [Test 2]
- [Test 3]

## Treatment Suggestions
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]

## Urgency Level
[Critical/Urgent/Routine]

Important: Be thorough but concise. Always consider the most serious possibilities first.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Symptoms: ${symptoms}${patientContext}` }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      const parsed = parseAIResponse(content);
      setResults(parsed);

      setHistory(prev => [{
        id: Date.now(),
        patientName: selectedPatient?.name || 'Unknown',
        symptoms: symptoms.slice(0, 80),
        urgency: parsed.urgency,
        time: 'Just now',
      }, ...prev].slice(0, 10));
    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="AI Diagnosis" subtitle="AI-assisted clinical decision support for symptom analysis" />

      <div className="page-body fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiUser style={{ color: 'var(--color-accent)' }} /> Patient
                </h3>
              </div>
              <select
                className="form-control"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                <option value="">No patient selected</option>
                {isLoading && <option disabled>Loading patients…</option>}
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
              {selectedPatient && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  <span>Age: {getAge(selectedPatient.dob)}</span>
                  <span>Gender: {selectedPatient.gender}</span>
                  <span>Phone: {selectedPatient.phone}</span>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiActivity style={{ color: 'var(--color-accent)' }} /> Recent Analyses
                </h3>
              </div>
              {history.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>No analyses yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {history.map((h, i) => (
                    <div key={h.id} style={{
                      padding: '10px 0',
                      borderBottom: i < history.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{h.patientName}</span>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', padding: '2px 8px',
                          borderRadius: 'var(--radius-full)', ...URGENCY_STYLES[h.urgency],
                        }}>{h.urgency}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{h.symptoms}...</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{h.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiThermometer style={{ color: 'var(--color-accent)' }} /> Symptom Input
                </h3>
              </div>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Describe patient symptoms here... e.g. 'Persistent dry cough, fatigue, low-grade fever for 5 days, mild chest discomfort'"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ resize: 'vertical', marginBottom: 16 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                  disabled={loading || !symptoms.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {loading ? <FiLoader className="spin" /> : <FiZap />}
                  {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                </button>
                {symptoms && (
                  <button className="btn btn-ghost" onClick={() => { setSymptoms(''); setResults(null); setError(''); }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem', fontWeight: 500,
              }}>
                <FiAlertTriangle /> {error}
              </div>
            )}

            {results && (
              <>
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiCheck style={{ color: 'var(--color-success)' }} /> AI Analysis Results
                    </h3>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                      padding: '4px 12px', borderRadius: 'var(--radius-full)',
                      ...URGENCY_STYLES[results.urgency],
                    }}>
                      {results.urgency}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {results.diagnoses.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--color-accent)' }}>Possible Diagnoses</h4>
                        <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {results.diagnoses.map((d, i) => (
                            <li key={i} style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{d}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {results.tests.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--color-accent)' }}>Recommended Tests</h4>
                        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {results.tests.map((t, i) => (
                            <li key={i} style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.treatments.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--color-accent)' }}>Treatment Suggestions</h4>
                        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {results.treatments.map((t, i) => (
                            <li key={i} style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--color-accent)' }}>Full Response</h4>
                      <pre style={{
                        background: 'var(--color-bg-input)', padding: 16,
                        borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                        whiteSpace: 'pre-wrap', fontFamily: 'var(--font-family)',
                        color: 'var(--color-text-secondary)', lineHeight: 1.6,
                        border: '1px solid var(--color-border)',
                      }}>
                        {results.raw}
                      </pre>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-warning-bg)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <FiAlertTriangle style={{ color: 'var(--color-warning)', marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <strong>Disclaimer:</strong> This AI analysis is for clinical decision support only.
                    Always verify results with professional clinical judgment and standard medical protocols.
                  </div>
                </div>
              </>
            )}

            {!results && !loading && !error && (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <FiFileText style={{ fontSize: '3rem', color: 'var(--color-border)', marginBottom: 16 }} />
                <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: 8 }}>No Analysis Yet</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                  Enter patient symptoms and click "Analyze Symptoms" to get AI-powered diagnostic suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

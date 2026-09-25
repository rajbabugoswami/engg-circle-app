import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const CertificateDashboard = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [results, setResults] = useState([]);
  const [templateFile, setTemplateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiTemplatePrompt, setAiTemplatePrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const resEvent = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(resEvent.data);
      
      const resResults = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(resResults.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTemplateUpload = async (e) => {
    e.preventDefault();
    if (!templateFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('template', templateFile);
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/template`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Template uploaded successfully!');
      fetchData(); // Refresh to get new template URL
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
      setTemplateFile(null);
    }
  };

  const handleAITemplate = async (e) => {
    e.preventDefault();
    if (!aiTemplatePrompt) return;
    setIsAiGenerating(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/template/ai-generate`, 
      { prompt: aiTemplatePrompt },
      { headers: { Authorization: `Bearer ${token}` } });
      
      alert('AI Template Generated and applied successfully!');
      setAiTemplatePrompt('');
      fetchData(); // Refresh to get new template URL
    } catch (err) {
      alert(`AI Generation failed: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleResend = async (participantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/resend/${participantId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Certificate successfully resent!');
      fetchData();
    } catch (err) {
      alert(`Failed to resend: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
    }
  };

  const handleResendAllFailed = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/resend-all-failed/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Resend all failed triggered');
      fetchData();
    } catch (err) {
      alert('Failed to resend');
    }
  };

  const handleGenerateAll = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/generate-all/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Generation and sending started in the background. Please refresh after a minute.');
    } catch (err) {
      alert(`Failed to start bulk generation: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleGenerateSingle = async (participantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/generate`, { eventId, participantId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.certificateId && event.auto_email_enabled) {
         await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/send`, { certificateId: res.data.certificateId }, {
           headers: { Authorization: `Bearer ${token}` }
         });
      }
      alert('Certificate generated (and sent if auto-email is ON)!');
      fetchData();
    } catch (err) {
      alert(`Failed to generate or send: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
    }
  };

  const exportToExcel = () => {
    import('xlsx').then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        results.map((r, index) => ({
          Rank: index + 1,
          Name: r.name,
          Email: r.email,
          Score: r.score,
          CertificateId: r.certificate_id || 'Not generated',
          EmailStatus: r.email_status || 'Not Generated'
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
      XLSX.writeFile(workbook, `${event?.name || 'Event'}_Certificates.xlsx`);
    });
  };

  const exportToPDF = () => {
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jspdf, autoTable]) => {
      const jsPDF = jspdf.default;
      const doc = new jsPDF();
      
      doc.text(`Certificates: ${event?.name}`, 14, 15);
      
      const tableData = results.map((r, index) => [
        index + 1,
        r.name,
        r.email,
        r.score,
        r.certificate_id || 'Not generated',
        r.email_status || 'Not Generated'
      ]);
      
      autoTable.default(doc, {
        head: [['Rank', 'Name', 'Email', 'Score', 'Cert ID', 'Email Status']],
        body: tableData,
        startY: 20
      });
      
      doc.save(`${event?.name || 'Event'}_Certificates.pdf`);
    });
  };

  const toggleSetting = async (field, value) => {
    try {
      const token = localStorage.getItem('adminToken');
      const updatedEvent = { ...event, [field]: value };
      
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}`, {
        cert_generation_enabled: updatedEvent.cert_generation_enabled,
        auto_email_enabled: updatedEvent.auto_email_enabled,
        certificate_rank_limit: updatedEvent.certificate_rank_limit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEvent(updatedEvent);
    } catch (err) {
      alert('Failed to update setting');
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left">Certificate Dashboard: {event.name}</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={`/admin/events/${eventId}/certificate-editor`} className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700">
              Customize Certificate Layout
            </Link>
            <Link to="/admin/dashboard" className="text-indigo-600 hover:underline flex items-center">Back to Dashboard</Link>
          </div>
        </div>

        {/* Template Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 border-t-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4">Event Certificate Template</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">Upload a high-resolution template (PNG/JPG). The system will automatically place text on this image.</p>
              <form onSubmit={handleTemplateUpload} className="space-y-4">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={(e) => setTemplateFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button 
                  type="submit" 
                  disabled={uploading || !templateFile}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save Template'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white">
                <h4 className="font-bold mb-2 flex items-center gap-2">✨ Or Generate with AI</h4>
                <form onSubmit={handleAITemplate} className="space-y-3">
                  <textarea required className="w-full border-none rounded p-2 text-gray-900 text-sm" rows="2"
                    placeholder="E.g., A premium cyber security event certificate background with dark blue and gold borders"
                    value={aiTemplatePrompt} onChange={e => setAiTemplatePrompt(e.target.value)}></textarea>
                  <button type="submit" disabled={isAiGenerating}
                    className="bg-white text-purple-700 px-4 py-2 rounded font-bold hover:bg-gray-100 disabled:opacity-50 text-sm">
                    {isAiGenerating ? '🤖 Generating...' : 'Generate Template'}
                  </button>
                </form>
              </div>
              
              <div className="mt-6 p-4 bg-gray-100 rounded">
                <h4 className="font-bold mb-4">Automatic Settings</h4>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-medium">Auto-Generate Certificates at end of quiz</span>
                  <button 
                    onClick={() => toggleSetting('cert_generation_enabled', !event.cert_generation_enabled)}
                    className={`px-3 py-1 rounded font-bold text-xs ${event.cert_generation_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {event.cert_generation_enabled ? 'ON (Click to Disable)' : 'OFF (Click to Enable)'}
                  </button>
                </div>
                

                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-700 font-medium">Rank Limit (0 for ALL participants)</span>
                  <input 
                    type="number" 
                    min="0"
                    value={event.certificate_rank_limit || 0}
                    onChange={(e) => toggleSetting('certificate_rank_limit', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded text-center"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Example: 3 means only Top 3 get certificates. 0 means everyone gets a certificate.</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
              {event.cert_template_url ? (
                <>
                  <div className="text-green-600 font-bold mb-2">✓ Template Uploaded</div>
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.cert_template_url}`} alt="Template Preview" className="max-h-64 shadow-lg border border-gray-300" />
                </>
              ) : (
                <div className="text-orange-600 font-bold flex flex-col items-center">
                  <span className="text-4xl mb-2">⚠</span>
                  No Template Uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results/Certificates Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-bold">Participants & Certificates</h2>
            <div className="flex gap-4 flex-wrap">
              <button onClick={handleGenerateAll} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
                GENERATE ALL
              </button>
              <button onClick={() => {
                const token = localStorage.getItem('adminToken');
                window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/zip/${eventId}?token=${token}`, '_blank');
              }} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700">
                Download ZIP
              </button>
              <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">
                Export Excel
              </button>
              <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">
                Export PDF
              </button>
              <button onClick={handleResendAllFailed} className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600">
                GENERATE MISSING
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank/Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cert ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{r.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{r.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold">#{r.rank_pos || idx + 1}</span> ({r.score} pts)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{r.certificate_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {r.email_status === 'AVAILABLE' && <span className="text-green-600 font-bold">✓ AVAILABLE IN APP</span>}
                      {r.email_status === 'SENT' && <span className="text-green-600 font-bold">✓ SENT</span>}
                      {r.email_status === 'FAILED' && <span className="text-red-600 font-bold">✗ FAILED</span>}
                      {r.email_status === 'PENDING' && <span className="text-yellow-600 font-bold">⏳ PENDING</span>}
                      {!r.email_status && <span className="text-gray-400">Not Generated</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {r.pdf_url ? (
                        <>
                          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${r.pdf_url}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">View</a>
                        </>
                      ) : (
                        <button onClick={() => handleGenerateSingle(r.id)} className="text-green-600 hover:text-green-900 font-bold">Generate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDashboard;

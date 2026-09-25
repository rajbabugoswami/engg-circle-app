import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const Results = () => {
  const { eventId } = useParams();
  const [results, setResults] = useState([]);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    fetchResults();
  }, [eventId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data.results);
      setEventName(res.data.eventName);
    } catch (error) {
      console.error('Error fetching results', error);
    }
  };

  const handleGenerateCertificate = async (participantId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/generate`, 
        { eventId, participantId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Certificate generated: ${res.data.certificateId}`);
      fetchResults(); // Refresh list to show generated status
    } catch (error) {
      console.error(error);
      alert('Failed to generate certificate');
    }
  };

  const handleSendEmail = async (certificateId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/send`, 
        { certificateId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Email sent successfully!');
      fetchResults();
    } catch (error) {
      console.error(error);
      alert('Failed to send email');
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
          CertificateId: r.certificate_id || 'Not generated'
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
      XLSX.writeFile(workbook, `${eventName || 'Event'}_Results.xlsx`);
    });
  };

  const exportToPDF = () => {
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jspdf, autoTable]) => {
      const jsPDF = jspdf.default;
      const doc = new jsPDF();
      
      doc.text(`Results: ${eventName}`, 14, 15);
      
      const tableData = results.map((r, index) => [
        index + 1,
        r.name,
        r.email,
        r.score,
        r.certificate_id || 'Not generated'
      ]);
      
      autoTable.default(doc, {
        head: [['Rank', 'Name', 'Email', 'Score', 'Certificate ID']],
        body: tableData,
        startY: 20
      });
      
      doc.save(`${eventName || 'Event'}_Results.pdf`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900">Results: {eventName}</h1>
          <div className="flex gap-4">
            <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">
              Export Excel
            </button>
            <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">
              Export PDF
            </button>
            <Link to="/admin/dashboard" className="text-indigo-600 hover:underline flex items-center ml-4">Back to Dashboard</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((r, index) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{r.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {r.certificate_id ? (
                      <span className="text-indigo-600 font-bold">{r.certificate_id}</span>
                    ) : (
                      <span className="text-gray-400 italic">Not generated</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!r.certificate_id && (
                      <button onClick={() => handleGenerateCertificate(r.id)} className="text-blue-600 hover:text-blue-900 border border-blue-600 px-2 py-1 rounded">Generate Cert</button>
                    )}
                    {r.certificate_id && (
                      <>
                        <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${r.pdf_url}`} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-900 border border-green-600 px-2 py-1 rounded">View</a>
                        <button onClick={() => handleSendEmail(r.certificate_id)} className="text-purple-600 hover:text-purple-900 border border-purple-600 px-2 py-1 rounded">
                          {r.email_status === 'SENT' ? 'Resend Email' : 'Send Email'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Results;

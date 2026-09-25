import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CertificateEditor = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [templateFile, setTemplateFile] = useState(null);
  
  // Fields that can be placed on the certificate
  const defaultFields = [
    { id: 'studentName', label: 'Student Name', active: true, x: 50, y: 50, fontSize: 32, color: '#000000', align: 'center' },
    { id: 'eventName', label: 'Event Name', active: true, x: 50, y: 60, fontSize: 24, color: '#000000', align: 'center' },
    { id: 'rank', label: 'Rank', active: true, x: 50, y: 70, fontSize: 24, color: '#000000', align: 'center' },
    { id: 'date', label: 'Event Date', active: true, x: 50, y: 80, fontSize: 20, color: '#000000', align: 'center' },
    { id: 'certId', label: 'Certificate ID', active: true, x: 10, y: 90, fontSize: 14, color: '#555555', align: 'left' }
  ];

  const [fields, setFields] = useState(defaultFields);
  const [selectedFieldId, setSelectedFieldId] = useState('studentName');
  
  const imageRef = useRef(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(res.data);
      if (res.data.cert_template_config) {
        // Merge saved config with defaults
        const savedFields = typeof res.data.cert_template_config === 'string' 
          ? JSON.parse(res.data.cert_template_config) 
          : res.data.cert_template_config;
        setFields(savedFields);
      }
    } catch (error) {
      console.error('Failed to fetch event', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateUpload = async (e) => {
    e.preventDefault();
    if (!templateFile) return;

    const formData = new FormData();
    formData.append('template', templateFile);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/template`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setEvent({ ...event, cert_template_url: res.data.fileUrl });
      alert('Template uploaded successfully!');
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload template');
    }
  };

  const saveConfiguration = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/template-config`, {
        config: fields
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save config', error);
      alert('Failed to save configuration');
    }
  };

  const handleImageClick = (e) => {
    if (!imageRef.current || !selectedFieldId) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    updateField(selectedFieldId, { x, y });
  };

  const updateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Certificate Designer - {event?.name}</h2>
          <Link to="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">&larr; Back to Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Template Upload */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-4">1. Upload Template</h3>
              <form onSubmit={handleTemplateUpload}>
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => setTemplateFile(e.target.files[0])} className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                <button type="submit" disabled={!templateFile} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                  Upload Template
                </button>
              </form>
            </div>

            {/* Field Configuration */}
            {event?.cert_template_url && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-4">2. Edit Fields</h3>
                <p className="text-sm text-gray-500 mb-4">Select a field, then click on the certificate to set its position.</p>
                
                <div className="space-y-2 mb-6">
                  {fields.map(field => (
                    <button
                      key={field.id}
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`w-full text-left px-4 py-2 rounded-md border ${selectedFieldId === field.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{field.label}</span>
                        <input type="checkbox" checked={field.active} onChange={(e) => {
                          e.stopPropagation();
                          updateField(field.id, { active: e.target.checked });
                        }} className="rounded text-indigo-600 focus:ring-indigo-500" />
                      </div>
                    </button>
                  ))}
                </div>

                {selectedField && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-700">Settings for {selectedField.label}</h4>
                    
                    <div>
                      <label className="block text-sm text-gray-600">Font Size (px)</label>
                      <input type="number" value={selectedField.fontSize} onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })} className="mt-1 w-full px-3 py-1 border rounded" />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600">Color</label>
                      <input type="color" value={selectedField.color} onChange={(e) => updateField(selectedField.id, { color: e.target.value })} className="mt-1 w-full h-8 border rounded p-0" />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600">Alignment</label>
                      <select value={selectedField.align} onChange={(e) => updateField(selectedField.id, { align: e.target.value })} className="mt-1 w-full px-3 py-1 border rounded">
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <button onClick={saveConfiguration} className="w-full mt-6 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-bold shadow">
                  Save Configuration
                </button>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow min-h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300">
              {event?.cert_template_url ? (
                <div 
                  className="relative w-full max-w-4xl mx-auto shadow-xl cursor-crosshair overflow-hidden" 
                  style={{ aspectRatio: '1.414 / 1' }} // Standard A4 landscape ratio
                >
                  <img 
                    ref={imageRef}
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.cert_template_url}`} 
                    alt="Certificate Template" 
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  
                  {/* Invisible overlay to catch clicks safely over the image */}
                  <div className="absolute inset-0 z-10" onClick={handleImageClick}></div>

                  {/* Render fields */}
                  {fields.filter(f => f.active).map(field => {
                    const isSelected = field.id === selectedFieldId;
                    
                    let transformX = '0%';
                    if (field.align === 'center') transformX = '-50%';
                    if (field.align === 'right') transformX = '-100%';

                    return (
                      <div
                        key={field.id}
                        className={`absolute whitespace-nowrap z-20 pointer-events-none ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-500/10' : ''}`}
                        style={{
                          left: `${field.x}%`,
                          top: `${field.y}%`,
                          transform: `translate(${transformX}, -50%)`,
                          fontSize: `${field.fontSize}px`,
                          color: field.color,
                          fontWeight: 'bold',
                          fontFamily: 'Arial, sans-serif'
                        }}
                      >
                        [{field.label}]
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl">Upload a template image to start designing</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CertificateEditor;

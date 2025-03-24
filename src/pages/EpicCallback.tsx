
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleEpicCallback } from "@/services/epicFhirService";

const EpicCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const success = await handleEpicCallback(urlParams);
        
        if (success) {
          setStatus('success');
          setMessage("Authentication successful! Redirecting...");
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage("Authentication failed. Please try again.");
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (error) {
        console.error("Error in Epic callback:", error);
        setStatus('error');
        setMessage("An error occurred during authentication. Please try again.");
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Epic EHR Authentication
        </h1>
        
        <div className="text-center mb-6">
          {status === 'processing' && (
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          )}
          {status === 'success' && (
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          <p className={`text-lg ${
            status === 'processing' ? 'text-blue-600' : 
            status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          You'll be redirected back to the dashboard automatically.
        </div>
      </div>
    </div>
  );
};

export default EpicCallback;

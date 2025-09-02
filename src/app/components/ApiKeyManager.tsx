'use client';

import { useState, useEffect } from 'react';
import { apiKeyStorage, validateApiKey, maskApiKey } from '../lib/apiKeyStorage';

export default function ApiKeyManager() {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const storedKey = apiKeyStorage.getApiKey();
    if (storedKey) {
      setHasStoredKey(true);
      setApiKey(storedKey);
    } else {
      setIsEditing(true); // Show input if no key is stored
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!validateApiKey(apiKey)) {
      setError('Invalid API key format. Must start with "sk-" and be at least 40 characters long.');
      return;
    }

    apiKeyStorage.setApiKey(apiKey);
    setHasStoredKey(true);
    setIsEditing(false);
    setError('');
    setShowKey(false);
    
    // Reload the page to reinitialize with new API key
    window.location.reload();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowKey(true);
    setError('');
  };

  const handleCancel = () => {
    const storedKey = apiKeyStorage.getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setIsEditing(false);
      setShowKey(false);
      setError('');
    }
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove your API key? You will need to add it again to use the application.')) {
      apiKeyStorage.removeApiKey();
      setApiKey('');
      setHasStoredKey(false);
      setIsEditing(true);
      setShowKey(false);
      setError('');
    }
  };

  const displayValue = showKey ? apiKey : maskApiKey(apiKey);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">OpenAI API Key</h3>
        {hasStoredKey && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={handleEdit}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your OpenAI API Key
            </label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
            {hasStoredKey && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>Your API key will be stored locally in your browser and used for all requests.</p>
            <p>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Current API Key:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
              {displayValue}
            </code>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Stored</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

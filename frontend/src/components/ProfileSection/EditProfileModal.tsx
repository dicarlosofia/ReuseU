import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileData;
  onSave: (profileData: ProfileData) => Promise<void>;
}

interface ProfileData {
  username: string;
  name: string;
  email: string;
  pronouns: string;
  aboutMe: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(formData);  // ✅ Pass edited form back to parent
      onClose();               // ✅ Then close modal
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cyan-800 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl border-t-4 border-lime-600">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h2 className="text-2xl font-bold text-lime-800">Edit Profile</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-cyan-950 bg-lime-200 rounded-full p-2">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-cyan-950">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="text-gray-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-cyan-950">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-gray-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cyan-950">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="text-gray-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="pronouns" className="block text-sm font-medium text-cyan-950">Pronouns</label>
            <input
              type="text"
              id="pronouns"
              name="pronouns"
              value={formData.pronouns}
              onChange={handleChange}
              className="text-gray-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="aboutMe" className="block text-sm font-medium text-cyan-950">About Me</label>
            <textarea
              id="aboutMe"
              name="aboutMe"
              value={formData.aboutMe}
              onChange={handleChange}
              rows={4}
              className="text-gray-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"
              placeholder="Tell us about your recycling interests and commitment to sustainability..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-cyan-950 bg-lime-200 rounded-md hover:bg-lime-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 text-sm font-medium text-white ${saving ? "bg-lime-400" : "bg-lime-800 hover:bg-lime-500"} rounded-md transition-colors duration-200 flex items-center gap-2`}
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

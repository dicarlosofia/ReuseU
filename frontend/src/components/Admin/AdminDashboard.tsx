import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { reportApi } from '@/pages/api/report';
import { API_BASE_URL } from '@/pages/api/config';

interface Report {
  report_id: string;
  listing_id: string;
  user_id: string;
  reason: string;
  description: string;
  created_at: string;
  marketplace_id: string;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // When this component mounts, set up a listener for Firebase auth state changes
  // If the user logs in, grab their JWT token for backend API calls
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUserToken(token);
      } else {
        setUserToken(null);
      }
    });
    return () => unsub();
  }, []);

  // Whenever we get a user token, try to load all reports from the backend
  // If the backend says we're not admin, show an error
  useEffect(() => {
    if (!userToken) return;
    setLoading(true);
    reportApi.getAllReports(userToken)
      .then(setReports)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userToken]);

  // Called when an admin clicks the delete button for a report/listing
  // This will remove both the report and the associated listing from the backend
  const handleDelete = async (report_id: string, listing_id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing and report?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/report/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ report_id, listing_id })
      });
      if (!res.ok) throw new Error('Failed to delete');
      setReports(reports => reports.filter(r => r.report_id !== report_id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard: Listing Reports</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Report ID</th>
            <th className="p-2 border">Listing ID</th>
            <th className="p-2 border">User ID</th>
            <th className="p-2 border">Reason</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Marketplace</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.report_id}>
              <td className="p-2 border">{r.report_id}</td>
              <td className="p-2 border">{r.listing_id}</td>
              <td className="p-2 border">{r.user_id}</td>
              <td className="p-2 border">{r.reason}</td>
              <td className="p-2 border">{r.description}</td>
              <td className="p-2 border">{r.created_at}</td>
              <td className="p-2 border">{r.marketplace_id}</td>
              <td className="p-2 border">
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800"
                  onClick={() => handleDelete(r.report_id, r.listing_id)}
                >
                  Delete Listing & Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && reports.length === 0 && <div className="mt-4">No reports found.</div>}
    </div>
  );
}

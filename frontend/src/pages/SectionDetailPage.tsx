import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface Law {
  _id: string;
  category: string;
  act_name: string;
  law_code: string;
  section_number: string;
  title: string;
  description: string;
  simplified_description: string;
  punishment?: string;
  keywords?: string[];
  examples?: string[];
  createdAt?: string;
  updatedAt?: string;
  // embeddings is intentionally omitted
}

const SectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [law, setLaw] = useState<Law | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchLaw = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/laws/${id}`);
        if (!res.ok) throw new Error('Failed to load law details');
        const data: Law = await res.json();
        setLaw(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLaw();
  }, [id]);

  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/law-library'))}
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Law Library
        </button>
      </div>

      {isLoading && <p className="py-8 text-center">Loading...</p>}
      {error && <p className="py-8 text-center text-red-600">{error}</p>}

      {law && (
        <div className="bg-white rounded-md shadow-sm p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="text-xs text-gray-600">
              {law.category} • {law.act_name}
            </div>
            <h1 className="text-lg font-semibold text-gray-900 mt-1">
              {law.title}
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <section>
              <h2 className="text-sm font-semibold text-gray-800 mb-1">Simple Explanation</h2>
              <p className="text-gray-800">{law.simplified_description}</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-800 mb-1">Legal Text</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{law.description}</p>
            </section>

            {law.punishment && (
              <section>
                <h2 className="text-sm font-semibold text-gray-800 mb-1">Punishment</h2>
                <p className="text-gray-800">{law.punishment}</p>
              </section>
            )}

            {law.keywords && law.keywords.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-800 mb-1">Keywords</h2>
                <div className="flex flex-wrap gap-1.5">
                  {law.keywords.map((k, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {law.examples && law.examples.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-800 mb-1">Examples</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-800">
                  {law.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Meta (no law_code or section shown) */}
            <section className="text-xs text-gray-500">
              <div>Created: {law.createdAt ? new Date(law.createdAt).toLocaleString() : '—'}</div>
              <div>Last Updated: {law.updatedAt ? new Date(law.updatedAt).toLocaleString() : '—'}</div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionDetailPage;
import React, { useEffect, useState } from 'react';
import { getAppData } from '../../services/DataStore.js';
import ApiManager from '../../services/ApiManager.js';

export default function Learn() {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Try from DataStore first (loaded in Loading)
      const boot = getAppData();
      if (boot?.disciplines?.data) {
        setDisciplines(boot.disciplines.data || []);
        setLoading(false);
        return;
      }
      try {
        const resp = await ApiManager.get('app/learn_content_list');
        setDisciplines(resp?.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: 16 }}>A carregar...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Aprender</h2>
      {disciplines.length === 0 ? (
        <p>Sem conteúdos disponíveis</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {disciplines.map((item) => (
            <li key={item.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 8 }}>
              <strong>{item.name || item.title}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

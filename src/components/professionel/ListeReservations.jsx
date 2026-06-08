import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import {
  CheckCircle, XCircle, Clock, Info, Video,
  CalendarCheck, Filter, RefreshCw, User, ChevronDown, ChevronUp, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTS = ['TOUS', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', bg: '#FDF3E3', text: '#B07830', border: '#EFD0A0', dot: '#E0A050', icon: Clock },
  VALIDE: { label: 'Validée', bg: '#E8F4EE', text: '#3A8A5A', border: '#9ACFB5', dot: '#4CAF78', icon: CheckCircle },
  REFUSE: { label: 'Refusée', bg: '#FAE9E4', text: '#B05030', border: '#EDAB96', dot: '#D06848', icon: XCircle },
};

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut];
  if (!cfg) return <span>{statut}</span>;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 50,
      fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.text,
      border: `1.5px solid ${cfg.border}`,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

const fmtDate = (dateStr, timeStr) => {
  if (!dateStr) return 'N/A';

  try {
    // 🔥 FIX IMPORTANT: éviter 00:00
    const time = timeStr && timeStr !== '00:00:00' ? timeStr.slice(0, 5) : '08:00';
    const dt = new Date(`${dateStr}T${time}`);

    return dt.toLocaleString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return `${dateStr} ${timeStr || ''}`;
  }
};

function DetailsModal({ res, onClose }) {
  if (!res) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 18,
          padding: 20,
        }}
      >
        <h3>Détails réservation</h3>

        <p><b>Nom :</b> {res.utilisateur?.prenom || 'N/A'} {res.utilisateur?.nom || ''}</p>
        <p><b>Email :</b> {res.utilisateur?.email || 'Non disponible'}</p>

        <p><b>Date réservation :</b> {fmtDate(res.dateReservation, res.heureDebut)}</p>

        {res.statut === 'VALIDE' && res.consultation && (
          <>
            <hr />
            <p><b>Consultation :</b></p>
            <p>
              {fmtDate(
                res.consultation.dateConsultation,
                res.consultation.heure || res.consultation.heureDebut
              )}
            </p>

            {res.consultation.lienVisio && (
              <a href={res.consultation.lienVisio} target="_blank">
                Rejoindre la visio
              </a>
            )}
          </>
        )}

        <button onClick={onClose} style={{ marginTop: 10 }}>
          Fermer
        </button>
      </div>
    </div>
  );
}

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selectedRes, setSelectedRes] = useState(null);

  useEffect(() => {
    if (proId) load();
  }, [proId]);

  const load = async () => {
    const data = await getReservations(proId);
    setReservations(data);
  };

  const update = async (id, status) => {
    await updateReservationStatus(id, status);
    load();
  };

  const filtered =
    filtreStatut === 'TOUS'
      ? reservations
      : reservations.filter(r => r.statut === filtreStatut);

  return (
    <div style={{ padding: 20 }}>

      {/* FILTRES FIX */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              border: '1px solid #ccc',
              background: filtreStatut === s ? '#C07048' : '#fff',
              color: filtreStatut === s ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {filtered.map(res => (
        <div key={res.id} style={{
          border: '1px solid #eee',
          padding: 15,
          borderRadius: 12,
          marginBottom: 10
        }}>
          <p>
            {res.utilisateur?.prenom || 'N/A'} {res.utilisateur?.nom || ''}
          </p>

          <p>{fmtDate(res.dateReservation, res.heureDebut)}</p>

          <button onClick={() => setSelectedRes(res)}>Infos</button>
          <button onClick={() => update(res.id, 'VALIDE')}>Accepter</button>
          <button onClick={() => update(res.id, 'REFUSE')}>Refuser</button>
        </div>
      ))}

      <DetailsModal res={selectedRes} onClose={() => setSelectedRes(null)} />
    </div>
  );
};

export default ListeReservations;
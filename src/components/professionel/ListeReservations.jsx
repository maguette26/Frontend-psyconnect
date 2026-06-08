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
  VALIDE:     { label: 'Validée',   bg: '#E8F4EE', text: '#3A8A5A', border: '#9ACFB5', dot: '#4CAF78', icon: CheckCircle },
  REFUSE:     { label: 'Refusée',   bg: '#FAE9E4', text: '#B05030', border: '#EDAB96', dot: '#D06848', icon: XCircle },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=Nunito:wght@400;500;600;700;800&display=swap');

  .lr-root {
    --cream: #FAF7F2;
    --cream2: #F3EDE3;
    --warm-border: #E8DDD0;
    --text-dark: #2C2417;
    --text-mid: #6B5E4E;
    --text-soft: #A89880;
    --terracotta: #C07048;
    --terracotta-light: #F5EBE4;
    --terracotta-hover: #A85E3A;
    --sage: #4A8A6A;
    --sage-light: #E5F4EE;
    font-family: 'Nunito', sans-serif;
    background: var(--cream);
  }

  .lr-card {
    background: #FFFFFF;
    border: 1px solid var(--warm-border);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(160,120,80,0.07), 0 1px 3px rgba(160,120,80,0.04);
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .lr-card:hover {
    box-shadow: 0 8px 28px rgba(160,120,80,0.13), 0 2px 6px rgba(160,120,80,0.06);
    transform: translateY(-2px);
  }

  .lr-avatar {
    width: 46px; height: 46px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 15px; flex-shrink: 0;
    font-family: 'Nunito', sans-serif;
    border: 2px solid transparent;
  }

  .lr-filter-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px;
    border-radius: 50px;
    font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: 'Nunito', sans-serif;
    transition: all 0.18s;
    border: 1.5px solid var(--warm-border);
    background: var(--cream);
    color: var(--text-mid);
  }
  .lr-filter-btn:hover { background: var(--cream2); border-color: #D4C4B0; }
  .lr-filter-btn.active {
    background: var(--terracotta);
    border-color: var(--terracotta);
    color: #fff;
    box-shadow: 0 4px 14px rgba(192,112,72,0.3);
  }

  .lr-action-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 50px;
    font-size: 12.5px; font-weight: 700;
    cursor: pointer; font-family: 'Nunito', sans-serif;
    border: 1.5px solid; transition: all 0.18s;
  }

  .lr-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(44,36,23,0.4);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 0 16px;
  }

  .lr-refresh-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    background: var(--cream); border: 1.5px solid var(--warm-border);
    border-radius: 50px; font-size: 13px; font-weight: 700;
    color: var(--text-mid); cursor: pointer;
    font-family: 'Nunito', sans-serif; transition: all 0.18s;
  }
  .lr-refresh-btn:hover { background: var(--cream2); }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spinning { animation: spin 0.8s linear infinite; }
`;

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut];
  if (!cfg) return <span style={{ fontSize: 11, color: '#A89880' }}>{statut}</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 50,
      fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.text,
      border: `1.5px solid ${cfg.border}`,
      fontFamily: 'Nunito, sans-serif',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

const AVATAR_PALETTES = [
  { bg: '#FDF3E3', color: '#C07048', border: '#EFD0A0' },
  { bg: '#E8F4EE', color: '#3A8A5A', border: '#9ACFB5' },
  { bg: '#F0EAF8', color: '#7A5AA8', border: '#CDB8E3' },
  { bg: '#E8F1F8', color: '#3A6A98', border: '#AACBE0' },
  { bg: '#F8EEE8', color: '#A86848', border: '#E3C0A8' },
];

function Avatar({ prenom, nom }) {
  const initials = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  const p = AVATAR_PALETTES[(prenom?.charCodeAt(0) || 0) % AVATAR_PALETTES.length];
  return (
    <div className="lr-avatar" style={{ background: p.bg, color: p.color, borderColor: p.border }}>
      {initials || <User size={16} />}
    </div>
  );
}

const fmtDate = (d, t) => {
  if (!d) return 'N/A';
  try {
    const dt = new Date(`${d}T${t || '00:00'}:00`);
    return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return `${d} ${t || ''}`; }
};

function ReservationCard({ res, onAccept, onRefuse, onDetails }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} className="lr-card">

      {/* Bande colorée gauche selon statut */}
      <div style={{ display: 'flex' }}>
        <div style={{
          width: 4, flexShrink: 0,
          background: res.statut === 'VALIDE' ? '#4CAF78' : res.statut === 'REFUSE' ? '#D06848' : '#E0A050',
          borderRadius: '0 0 0 0',
        }} />

        <div style={{ flex: 1 }}>
          {/* MAIN */}
          <div style={{ padding: '18px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <Avatar prenom={res.utilisateur?.prenom} nom={res.utilisateur?.nom} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-dark)', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.01em' }}>
                    {res.utilisateur?.prenom} {res.utilisateur?.nom}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={10} />
                    {res.utilisateur?.email}
                  </p>
                </div>
                <StatutBadge statut={res.statut} />
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', background: 'var(--cream)', borderRadius: 50,
                border: '1px solid var(--warm-border)', fontSize: 12.5, color: 'var(--text-mid)',
                fontWeight: 600,
              }}>
                <CalendarCheck size={12} color="var(--terracotta)" />
                {fmtDate(res.dateReservation, res.heureDebut)}
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderTop: '1px dashed var(--warm-border)', background: 'var(--cream)' }}>
                  {res.statut === 'VALIDE' && res.consultation ? (
                    <div style={{
                      background: '#fff', border: '1.5px solid #9ACFB5',
                      borderRadius: 16, padding: '16px 18px',
                    }}>
                      <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sage)' }}>
                        ✦ Consultation confirmée
                      </p>
                      <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <CalendarCheck size={14} color="var(--sage)" />
                        {fmtDate(res.consultation.dateConsultation, res.consultation.heure)}
                      </p>
                      {res.consultation.lienVisio && (
                        <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '9px 18px', background: 'var(--sage)', color: '#fff',
                            borderRadius: 50, fontSize: 13, fontWeight: 700,
                            textDecoration: 'none', boxShadow: '0 4px 12px rgba(74,138,106,0.3)',
                            transition: 'all 0.15s',
                          }}>
                          <Video size={14} /> Rejoindre la visio
                        </a>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
                      Aucune consultation associée.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FOOTER */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--cream2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <button onClick={() => setExpanded(!expanded)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12.5, fontWeight: 700, color: 'var(--terracotta)',
              fontFamily: 'Nunito, sans-serif', padding: '4px 0', transition: 'opacity 0.15s',
            }}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? 'Masquer' : 'Voir détails'}
            </button>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {res.statut === 'EN_ATTENTE' && (<>
                <button onClick={() => onAccept(res.id)} className="lr-action-btn"
                  style={{ background: 'var(--sage-light)', borderColor: '#9ACFB5', color: 'var(--sage)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--sage-light)'; e.currentTarget.style.color = 'var(--sage)'; }}>
                  <CheckCircle size={13} /> Accepter
                </button>
                <button onClick={() => onRefuse(res.id)} className="lr-action-btn"
                  style={{ background: '#FAE9E4', borderColor: '#EDAB96', color: '#B05030' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#D06848'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FAE9E4'; e.currentTarget.style.color = '#B05030'; }}>
                  <XCircle size={13} /> Refuser
                </button>
              </>)}
              <button onClick={() => onDetails(res)} className="lr-action-btn"
                style={{ background: 'var(--cream)', borderColor: 'var(--warm-border)', color: 'var(--text-mid)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cream2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--cream)'}>
                <Info size={13} /> Détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailsModal({ res, onClose }) {
  if (!res) return null;
  return (
    <div className="lr-modal-overlay" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFCF8', borderRadius: 26,
          boxShadow: '0 32px 80px rgba(44,36,23,0.18)',
          width: '100%', maxWidth: 440,
          border: '1px solid var(--warm-border)',
          overflow: 'hidden',
        }}>
        {/* Header modal */}
        <div style={{
          padding: '22px 26px 18px',
          background: 'var(--cream2)',
          borderBottom: '1px solid var(--warm-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 600, color: 'var(--text-dark)' }}>
              Détails
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-soft)', fontFamily: 'monospace' }}>Réservation #{res.id}</p>
          </div>
          <button onClick={onClose} style={{
            padding: '7px', borderRadius: 10, border: '1px solid var(--warm-border)',
            background: '#fff', cursor: 'pointer', color: 'var(--text-soft)',
            display: 'flex', alignItems: 'center', transition: 'all 0.15s',
          }}>
            <XCircle size={17} />
          </button>
        </div>

        <div style={{ padding: '20px 26px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Patient', value: `${res.utilisateur?.prenom} ${res.utilisateur?.nom}` },
            { label: 'Email', value: res.utilisateur?.email },
            { label: 'Date', value: fmtDate(res.dateReservation, res.heureDebut) },
            { label: 'Statut', value: <StatutBadge statut={res.statut} /> },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--cream)', borderRadius: 14, padding: '12px 16px',
              border: '1px solid var(--warm-border)',
            }}>
              <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)' }}>
                {label}
              </p>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)' }}>{value}</div>
            </div>
          ))}

          {res.statut === 'VALIDE' && res.consultation && (
            <div style={{ background: 'var(--sage-light)', border: '1.5px solid #9ACFB5', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sage)' }}>
                ✦ Consultation
              </p>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-mid)' }}>
                {fmtDate(res.consultation.dateConsultation, res.consultation.heure)}
              </p>
              {res.consultation.lienVisio && (
                <a href={res.consultation.lienVisio} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 13, color: 'var(--sage)', fontWeight: 700, textDecoration: 'none' }}>
                  <Video size={13} /> Lien visio
                </a>
              )}
            </div>
          )}

          <button onClick={onClose} style={{
            marginTop: 4, width: '100%', padding: '13px',
            background: 'var(--terracotta)', color: '#fff', border: 'none',
            borderRadius: 14, fontSize: 14, fontWeight: 700,
            fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(192,112,72,0.28)',
            transition: 'all 0.18s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--terracotta-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--terracotta)'}
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const ListeReservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selectedRes, setSelectedRes] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (proId) chargerReservations(); }, [proId]);

  const chargerReservations = async () => {
    try {
      setRefreshing(true);
      const data = await getReservations(proId);
      setReservations(data); setError('');
    } catch { setError('Erreur lors du chargement des réservations.'); }
    finally { setRefreshing(false); }
  };

  const handleUpdate = async (id, status) => {
    const label = status === 'VALIDE' ? "l'acceptation" : 'le refus';
    if (!window.confirm(`Confirmer ${label} de cette réservation ?`)) return;
    try {
      await updateReservationStatus(id, status);
      await chargerReservations();
    } catch { setError('Erreur lors de la mise à jour.'); }
  };

  const filtrees = filtreStatut === 'TOUS' ? reservations : reservations.filter(r => r.statut === filtreStatut);
  const counts = STATUTS.reduce((acc, s) => {
    acc[s] = s === 'TOUS' ? reservations.length : reservations.filter(r => r.statut === s).length;
    return acc;
  }, {});

  return (
    <div className="lr-root" style={{ padding: '0' }}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 24,
      }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-soft)' }}>
            Gestion des patients
          </p>
          <h2 style={{
            margin: 0, fontSize: 24,
            fontFamily: "'Playfair Display', serif", fontWeight: 600,
            color: 'var(--text-dark)', letterSpacing: '-0.02em',
          }}>
            Réservations
          </h2>
        </div>
        <button onClick={chargerReservations} className="lr-refresh-btn">
          <RefreshCw size={13} className={refreshing ? 'spinning' : ''} style={{ transition: 'none' }} />
          Actualiser
        </button>
      </div>

      {error && (
        <div style={{
          marginBottom: 16, padding: '13px 18px',
          background: '#FAE9E4', border: '1.5px solid #EDAB96',
          borderRadius: 14, fontSize: 13.5, color: '#B05030', fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {/* FILTRES en pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {STATUTS.map(s => {
          const cfg = STATUT_CONFIG[s];
          const active = filtreStatut === s;
          return (
            <button key={s} onClick={() => setFiltreStatut(s)}
              className={`lr-filter-btn${active ? ' active' : ''}`}>
              {s === 'TOUS' ? <Filter size={12} /> : cfg && <cfg.icon size={12} />}
              {s === 'TOUS' ? 'Toutes' : cfg?.label || s}
              <span style={{
                fontSize: 11, fontWeight: 800,
                background: active ? 'rgba(255,255,255,0.22)' : 'var(--cream2)',
                color: active ? '#fff' : 'var(--text-soft)',
                padding: '1px 8px', borderRadius: 50,
              }}>
                {counts[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTE */}
      {reservations.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: '#fff', borderRadius: 22,
          border: '1.5px dashed var(--warm-border)',
        }}>
          <Inbox size={40} color="#E8DDD0" style={{ marginBottom: 14 }} />
          <p style={{ margin: '0 0 6px', fontSize: 16, fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--text-mid)' }}>
            Aucune réservation pour le moment
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
            Les nouvelles demandes apparaîtront ici.
          </p>
        </div>
      ) : filtrees.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '44px 24px',
          background: 'var(--cream)', borderRadius: 18,
          border: '1.5px dashed var(--warm-border)',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
            Aucune réservation avec ce statut.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {filtrees.map(res => (
              <ReservationCard key={res.id} res={res}
                onAccept={id => handleUpdate(id, 'VALIDE')}
                onRefuse={id => handleUpdate(id, 'REFUSE')}
                onDetails={setSelectedRes}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedRes && <DetailsModal res={selectedRes} onClose={() => setSelectedRes(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default ListeReservations;
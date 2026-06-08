import React, { useEffect, useState } from 'react';
import {
  Smile, Meh, Frown, Zap, AlertCircle, Activity,
  Star, Coffee, TrendingUp, Trash2, Edit2, ChevronDown, ChevronUp, Plus, Check, X
} from 'lucide-react';
import {
  getSuiviHumeur, ajouterHumeur, modifierHumeur, supprimerHumeur
} from '../../services/serviceUtilisateur';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = [
  { label: 'Heureux',      Icon: Smile,        color: '#F59E0B', bg: '#FFFBEB',  ring: '#FDE68A' },
  { label: 'Neutre',       Icon: Meh,          color: '#94A3B8', bg: '#F8FAFC',  ring: '#CBD5E1' },
  { label: 'Triste',       Icon: Frown,        color: '#60A5FA', bg: '#EFF6FF',  ring: '#BFDBFE' },
  { label: 'En colère',    Icon: Zap,          color: '#F87171', bg: '#FEF2F2',  ring: '#FECACA' },
  { label: 'Anxieux',      Icon: AlertCircle,  color: '#A78BFA', bg: '#F5F3FF',  ring: '#DDD6FE' },
  { label: 'Stressé',      Icon: Activity,     color: '#F472B6', bg: '#FDF2F8',  ring: '#FBCFE8' },
  { label: 'Enthousiaste', Icon: Star,         color: '#FB923C', bg: '#FFF7ED',  ring: '#FED7AA' },
  { label: 'Fatigué',      Icon: Coffee,       color: '#818CF8', bg: '#EEF2FF',  ring: '#C7D2FE' },
  { label: 'Motivé',       Icon: TrendingUp,   color: '#34D399', bg: '#ECFDF5',  ring: '#A7F3D0' },
];

const getMood = (label) => MOODS.find(m => m.label === label) || MOODS[0];

const SuiviHumeur = ({ currentUser }) => {
  const [humeurs, setHumeurs] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [flash, setFlash] = useState(null);
  const [humeurDuJour, setHumeurDuJour] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [editionNotes, setEditionNotes] = useState('');
  const [showHistorique, setShowHistorique] = useState(false);
  const isAuth = !!currentUser?.id;

  useEffect(() => {
    if (flash) { const t = setTimeout(() => setFlash(null), 3500); return () => clearTimeout(t); }
  }, [flash]);

  useEffect(() => {
    if (!isAuth) return;
    getSuiviHumeur()
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHumeurs(sorted);
        const today = new Date().toISOString().split('T')[0];
        const h = sorted.find(x => x.date === today);
        if (h) { setHumeurDuJour(h); setEditionNotes(h.noteJournal || ''); }
      })
      .catch(() => setFlash({ type: 'error', text: "Impossible de charger l'historique." }));
  }, [isAuth]);

  const handleEnregistrer = async (e) => {
    e.preventDefault();
    if (!selectedMood) return setFlash({ type: 'error', text: 'Veuillez sélectionner une humeur.' });
    try {
      const added = await ajouterHumeur({
        date: new Date().toISOString().split('T')[0],
        etat: selectedMood,
        noteJournal: notes.trim(),
      });
      const newList = [added, ...humeurs].sort((a, b) => new Date(b.date) - new Date(a.date));
      setHumeurs(newList);
      setHumeurDuJour(added);
      setSelectedMood('');
      setNotes('');
      setFlash({ type: 'success', text: 'Humeur enregistrée !' });
    } catch { setFlash({ type: 'error', text: "Erreur lors de l'enregistrement." }); }
  };

  const handleModifier = async () => {
    try {
      const updated = await modifierHumeur(humeurDuJour.id, {
        etat: humeurDuJour.etat, noteJournal: editionNotes.trim(), date: humeurDuJour.date,
      });
      setHumeurs(prev => prev.map(h => h.id === updated.id ? updated : h).sort((a, b) => new Date(b.date) - new Date(a.date)));
      setHumeurDuJour(updated);
      setModeEdition(false);
      setFlash({ type: 'success', text: 'Journal mis à jour.' });
    } catch { setFlash({ type: 'error', text: 'Erreur lors de la modification.' }); }
  };

  const handleSupprimer = async () => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await supprimerHumeur(humeurDuJour.id);
      setHumeurs(prev => prev.filter(h => h.id !== humeurDuJour.id));
      setHumeurDuJour(null);
      setEditionNotes('');
      setFlash({ type: 'success', text: 'Humeur supprimée.' });
    } catch { setFlash({ type: 'error', text: 'Erreur lors de la suppression.' }); }
  };

  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif", maxWidth: 680, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

        .sh-card {
          background: #ffffff;
          border: 1px solid #E8EDF2;
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
        }
        .sh-mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          border-radius: 16px;
          border: 1.5px solid transparent;
          background: #F8FAFC;
          cursor: pointer;
          font-size: 11.5px;
          font-weight: 500;
          color: #64748B;
          transition: all 0.18s ease;
          font-family: inherit;
        }
        .sh-mood-btn:hover:not(:disabled) {
          background: #F1F5F9;
          transform: translateY(-1px);
        }
        .sh-mood-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .sh-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 16px;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          font-size: 13.5px;
          color: #334155;
          font-family: inherit;
          resize: none;
          outline: none;
          line-height: 1.6;
          background: #FAFBFC;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .sh-textarea:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
          background: #fff;
        }
        .sh-textarea::placeholder { color: #CBD5E1; }
        .sh-btn-primary {
          width: 100%;
          padding: 13px;
          background: #18181B;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .sh-btn-primary:hover:not(:disabled) { background: #27272A; transform: translateY(-1px); }
        .sh-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
        .sh-icon-btn {
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          transition: background 0.15s, color 0.15s;
          font-family: inherit;
        }
        .sh-icon-btn:hover { background: #F1F5F9; color: #475569; }
        .sh-icon-btn.danger:hover { background: #FEF2F2; color: #EF4444; }
        .sh-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94A3B8;
          display: block;
          margin-bottom: 10px;
        }
        .sh-hist-item {
          display: flex;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #F1F5F9;
          align-items: flex-start;
        }
        .sh-hist-item:last-child { border-bottom: none; }
        .sh-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          width: 100%;
          justify-content: center;
        }
        .sh-toggle-btn:hover { background: #F1F5F9; border-color: #CBD5E1; }
        .sh-save-btn {
          flex: 1;
          padding: 10px;
          background: #18181B;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .sh-save-btn:hover { background: #27272A; }
        .sh-cancel-btn {
          flex: 1;
          padding: 10px;
          background: #F1F5F9;
          color: #64748B;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .sh-cancel-btn:hover { background: #E2E8F0; }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Journal d'humeur
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', textTransform: 'capitalize', fontStyle: 'italic', fontFamily: "'Instrument Serif', serif" }}>
          {todayLabel}
        </p>
      </div>

      {/* FLASH */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            style={{ marginBottom: 16, overflow: 'hidden' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 13, fontWeight: 500,
              background: flash.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: flash.type === 'success' ? '#16A34A' : '#DC2626',
              border: `1px solid ${flash.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            }}>
              {flash.type === 'success'
                ? <Check size={15} />
                : <X size={15} />}
              {flash.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD PRINCIPALE */}
      <AnimatePresence mode="wait">
        {!humeurDuJour ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="sh-card"
            style={{ padding: '28px 28px 24px' }}
          >
            <p style={{ margin: '0 0 22px', fontSize: 15.5, fontWeight: 600, color: '#1E293B' }}>
              Comment vous sentez-vous aujourd'hui ?
            </p>

            {/* GRILLE HUMEURS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 22 }}>
              {MOODS.map(({ label, Icon, color, bg, ring }) => {
                const active = selectedMood === label;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={!isAuth}
                    onClick={() => setSelectedMood(label)}
                    className="sh-mood-btn"
                    style={active ? {
                      background: bg,
                      borderColor: ring,
                      color: color,
                      boxShadow: `0 0 0 3px ${ring}40`,
                      transform: 'translateY(-1px)',
                    } : {}}
                  >
                    <Icon size={20} color={active ? color : '#94A3B8'} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* NOTE */}
            <div style={{ marginBottom: 20 }}>
              <span className="sh-label">Note du jour</span>
              <textarea
                className="sh-textarea"
                placeholder="Décrivez votre journée, vos ressentis..."
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={!isAuth}
              />
            </div>

            <button onClick={handleEnregistrer} disabled={!isAuth || !selectedMood} className="sh-btn-primary">
              <Plus size={15} strokeWidth={2.5} />
              Enregistrer mon humeur
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="sh-card"
            style={{ padding: '24px 28px' }}
          >
            {/* TOP ROW */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#CBD5E1' }}>
                Humeur du jour
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="sh-icon-btn" onClick={() => setModeEdition(!modeEdition)}
                  title="Modifier la note">
                  <Edit2 size={14} />
                </button>
                <button className="sh-icon-btn danger" onClick={handleSupprimer} title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* MOOD DISPLAY */}
            {(() => {
              const m = getMood(humeurDuJour.etat);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: m.bg,
                    border: `1.5px solid ${m.ring}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <m.Icon size={24} color={m.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {humeurDuJour.etat}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>
                      {new Date(humeurDuJour.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* NOTE */}
            <AnimatePresence mode="wait">
              {!modeEdition ? (
                <motion.div
                  key="note-read"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 14,
                    padding: '14px 16px',
                    minHeight: 60,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13.5, color: humeurDuJour.noteJournal ? '#475569' : '#CBD5E1', lineHeight: 1.7, whiteSpace: 'pre-line', fontStyle: humeurDuJour.noteJournal ? 'normal' : 'italic' }}>
                    {humeurDuJour.noteJournal || 'Aucune note pour ce jour.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="note-edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  <textarea
                    className="sh-textarea"
                    rows={4}
                    value={editionNotes}
                    onChange={e => setEditionNotes(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleModifier} className="sh-save-btn">Enregistrer</button>
                    <button onClick={() => setModeEdition(false)} className="sh-cancel-btn">Annuler</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HISTORIQUE */}
      <div style={{ marginTop: 16 }}>
        <button className="sh-toggle-btn" onClick={() => setShowHistorique(!showHistorique)}>
          {showHistorique ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {showHistorique ? 'Masquer l\'historique' : `Voir l'historique`}
          {humeurs.length > 0 && (
            <span style={{
              marginLeft: 4,
              fontSize: 11, fontWeight: 700,
              background: '#E2E8F0', color: '#64748B',
              borderRadius: 20, padding: '2px 8px',
            }}>
              {humeurs.length}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showHistorique && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="sh-card" style={{ marginTop: 10, padding: '8px 24px 8px', maxHeight: 420, overflowY: 'auto' }}>
                {humeurs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#CBD5E1', fontSize: 13, padding: '24px 0', fontStyle: 'italic' }}>
                    Aucune entrée enregistrée.
                  </p>
                ) : humeurs.map((h, i) => {
                  const m = getMood(h.etat);
                  const isToday = h.date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={h.id} className="sh-hist-item">
                      <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        background: m.bg, border: `1.5px solid ${m.ring}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <m.Icon size={18} color={m.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>{h.etat}</span>
                          <span style={{
                            fontSize: 11, color: isToday ? '#6366F1' : '#94A3B8',
                            fontWeight: isToday ? 600 : 400,
                            background: isToday ? '#EEF2FF' : 'transparent',
                            padding: isToday ? '2px 8px' : '0',
                            borderRadius: 20,
                          }}>
                            {isToday ? "Aujourd'hui" : new Date(h.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        {h.noteJournal && (
                          <p style={{
                            margin: 0, fontSize: 12.5, color: '#64748B',
                            lineHeight: 1.5, overflow: 'hidden',
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {h.noteJournal}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuiviHumeur;
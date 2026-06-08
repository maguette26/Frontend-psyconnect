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
  { label: 'Heureux',      Icon: Smile,        color: '#C97B2E', bg: '#FDF3E3', ring: '#F0C885', emoji: '😊' },
  { label: 'Neutre',       Icon: Meh,          color: '#7A8A7F', bg: '#EFF2EF', ring: '#C2CECC', emoji: '😐' },
  { label: 'Triste',       Icon: Frown,        color: '#4D7FA8', bg: '#E8F1F8', ring: '#AACBE0', emoji: '😢' },
  { label: 'En colère',    Icon: Zap,          color: '#B85C3A', bg: '#FAE9E4', ring: '#EDAB96', emoji: '😤' },
  { label: 'Anxieux',      Icon: AlertCircle,  color: '#8A66A8', bg: '#F0EAF8', ring: '#CDB8E3', emoji: '😰' },
  { label: 'Stressé',      Icon: Activity,     color: '#A85A7A', bg: '#F8E8F0', ring: '#E3B0C8', emoji: '😣' },
  { label: 'Enthousiaste', Icon: Star,         color: '#C07830', bg: '#FDF0E0', ring: '#EFC895', emoji: '🤩' },
  { label: 'Fatigué',      Icon: Coffee,       color: '#7A6A8A', bg: '#F0ECF8', ring: '#C5B8D8', emoji: '😴' },
  { label: 'Motivé',       Icon: TrendingUp,   color: '#4A8A6A', bg: '#E5F4EE', ring: '#9ACFB5', emoji: '💪' },
];

const getMood = (label) => MOODS.find(m => m.label === label) || MOODS[0];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400;1,500&family=Nunito:wght@400;500;600;700&display=swap');

  .sh-root {
    --cream: #FAF7F2;
    --cream2: #F3EDE3;
    --warm-border: #E8DDD0;
    --text-dark: #2C2417;
    --text-mid: #6B5E4E;
    --text-soft: #A89880;
    --terracotta: #C07048;
    --terracotta-light: #F5EBE4;
    --sage: #5A8A6A;
    --sage-light: #E8F2EB;
    font-family: 'Nunito', sans-serif;
  }

  .sh-card {
    background: #FFFFFF;
    border: 1px solid var(--warm-border);
    border-radius: 24px;
    box-shadow: 0 2px 12px rgba(160,120,80,0.07), 0 1px 3px rgba(160,120,80,0.05);
  }

  .sh-mood-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    padding: 16px 6px 12px;
    border-radius: 18px;
    border: 1.5px solid transparent;
    background: var(--cream);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-mid);
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    font-family: 'Nunito', sans-serif;
    line-height: 1.2;
  }
  .sh-mood-btn:hover:not(:disabled) {
    background: var(--cream2);
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 6px 16px rgba(160,120,80,0.12);
  }
  .sh-mood-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .sh-mood-btn .emoji { font-size: 22px; line-height: 1; }

  .sh-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 14px 18px;
    border: 1.5px solid var(--warm-border);
    border-radius: 16px;
    font-size: 14px;
    color: var(--text-dark);
    font-family: 'Nunito', sans-serif;
    resize: none;
    outline: none;
    line-height: 1.65;
    background: var(--cream);
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  }
  .sh-textarea:focus {
    border-color: var(--terracotta);
    box-shadow: 0 0 0 3px rgba(192,112,72,0.1);
    background: #fff;
  }
  .sh-textarea::placeholder { color: var(--text-soft); }

  .sh-btn-primary {
    width: 100%;
    padding: 14px;
    background: var(--terracotta);
    color: #fff;
    border: none;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    letter-spacing: 0.01em;
    box-shadow: 0 4px 14px rgba(192,112,72,0.3);
  }
  .sh-btn-primary:hover:not(:disabled) {
    background: #A85E3A;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(192,112,72,0.38);
  }
  .sh-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

  .sh-icon-btn {
    padding: 8px;
    border-radius: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--text-soft);
    display: flex;
    align-items: center;
    transition: all 0.15s;
    font-family: inherit;
  }
  .sh-icon-btn:hover { background: var(--cream2); color: var(--text-mid); }
  .sh-icon-btn.danger:hover { background: #FAE9E4; color: #B85C3A; }

  .sh-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
    display: block;
    margin-bottom: 10px;
    font-family: 'Nunito', sans-serif;
  }

  .sh-save-btn {
    flex: 1; padding: 11px;
    background: var(--terracotta); color: #fff;
    border: none; border-radius: 12px;
    font-size: 13.5px; font-weight: 700;
    font-family: 'Nunito', sans-serif;
    cursor: pointer; transition: background 0.15s;
  }
  .sh-save-btn:hover { background: #A85E3A; }
  .sh-cancel-btn {
    flex: 1; padding: 11px;
    background: var(--cream2); color: var(--text-mid);
    border: 1.5px solid var(--warm-border); border-radius: 12px;
    font-size: 13.5px; font-weight: 600;
    font-family: 'Nunito', sans-serif;
    cursor: pointer; transition: background 0.15s;
  }
  .sh-cancel-btn:hover { background: var(--warm-border); }

  .sh-toggle-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 20px;
    background: var(--cream); border: 1.5px solid var(--warm-border);
    border-radius: 16px; font-size: 13.5px; font-weight: 600;
    color: var(--text-mid); cursor: pointer;
    font-family: 'Nunito', sans-serif;
    transition: all 0.15s; width: 100%; justify-content: center;
  }
  .sh-toggle-btn:hover { background: var(--cream2); border-color: #D4C4B0; }

  .sh-hist-item {
    display: flex; gap: 14px; padding: 14px 0;
    border-bottom: 1px solid var(--cream2);
    align-items: flex-start;
  }
  .sh-hist-item:last-child { border-bottom: none; }
`;

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
        etat: selectedMood, noteJournal: notes.trim(),
      });
      setHumeurs(prev => [added, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setHumeurDuJour(added); setSelectedMood(''); setNotes('');
      setFlash({ type: 'success', text: 'Humeur enregistrée avec succès !' });
    } catch { setFlash({ type: 'error', text: "Erreur lors de l'enregistrement." }); }
  };

  const handleModifier = async () => {
    try {
      const updated = await modifierHumeur(humeurDuJour.id, {
        etat: humeurDuJour.etat, noteJournal: editionNotes.trim(), date: humeurDuJour.date,
      });
      setHumeurs(prev => prev.map(h => h.id === updated.id ? updated : h).sort((a, b) => new Date(b.date) - new Date(a.date)));
      setHumeurDuJour(updated); setModeEdition(false);
      setFlash({ type: 'success', text: 'Journal mis à jour.' });
    } catch { setFlash({ type: 'error', text: 'Erreur lors de la modification.' }); }
  };

  const handleSupprimer = async () => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await supprimerHumeur(humeurDuJour.id);
      setHumeurs(prev => prev.filter(h => h.id !== humeurDuJour.id));
      setHumeurDuJour(null); setEditionNotes('');
      setFlash({ type: 'success', text: 'Humeur supprimée.' });
    } catch { setFlash({ type: 'error', text: 'Erreur lors de la suppression.' }); }
  };

  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="sh-root" style={{ maxWidth: 660, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          margin: 0, fontSize: 26, fontFamily: "'Playfair Display', serif",
          fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-0.01em',
        }}>
          Journal d'humeur
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-soft)', textTransform: 'capitalize', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
          {todayLabel}
        </p>
      </div>

      {/* FLASH */}
      <AnimatePresence>
        {flash && (
          <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 14, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 14,
              fontSize: 13.5, fontWeight: 600,
              background: flash.type === 'success' ? 'var(--sage-light)' : '#FAE9E4',
              color: flash.type === 'success' ? 'var(--sage)' : '#B85C3A',
              border: `1.5px solid ${flash.type === 'success' ? '#9ACFB5' : '#EDAB96'}`,
            }}>
              {flash.type === 'success' ? <Check size={15} /> : <X size={15} />}
              {flash.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD PRINCIPALE */}
      <AnimatePresence mode="wait">
        {!humeurDuJour ? (
          <motion.div key="form" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
            className="sh-card" style={{ padding: '30px 28px 26px' }}>

            <p style={{ margin: '0 0 6px', fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--text-dark)', fontStyle: 'italic' }}>
              Comment vous sentez-vous aujourd'hui ?
            </p>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--text-soft)' }}>
              Prenez un moment pour vous. Choisissez ce qui vous correspond le mieux.
            </p>

            {/* GRILLE HUMEURS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
              {MOODS.map(({ label, Icon, color, bg, ring, emoji }) => {
                const active = selectedMood === label;
                return (
                  <motion.button
                    key={label} type="button" disabled={!isAuth}
                    onClick={() => setSelectedMood(label)}
                    className="sh-mood-btn"
                    whileTap={{ scale: 0.96 }}
                    style={active ? {
                      background: bg, borderColor: ring, color: color,
                      transform: 'translateY(-3px) scale(1.03)',
                      boxShadow: `0 6px 18px ${ring}80`,
                    } : {}}
                  >
                    <span className="emoji" style={{ filter: active ? 'none' : 'grayscale(30%)' }}>{emoji}</span>
                    {label}
                  </motion.button>
                );
              })}
            </div>

            {/* NOTE */}
            <div style={{ marginBottom: 22 }}>
              <span className="sh-label">Note du jour</span>
              <textarea className="sh-textarea"
                placeholder="Décrivez votre journée, vos ressentis, ce qui vous traverse..."
                rows={4} value={notes} onChange={e => setNotes(e.target.value)} disabled={!isAuth}
              />
            </div>

            <button onClick={handleEnregistrer} disabled={!isAuth || !selectedMood} className="sh-btn-primary">
              <Plus size={16} strokeWidth={2.5} />
              Enregistrer mon humeur
            </button>
          </motion.div>

        ) : (
          <motion.div key="display" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
            className="sh-card" style={{ padding: '26px 28px', overflow: 'hidden', position: 'relative' }}>

            {/* Décor fond */}
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 120, height: 120,
              borderRadius: '50%', background: `${getMood(humeurDuJour.etat).bg}`,
              opacity: 0.6, pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)' }}>
                Humeur du jour
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="sh-icon-btn" onClick={() => setModeEdition(!modeEdition)}><Edit2 size={14} /></button>
                <button className="sh-icon-btn danger" onClick={handleSupprimer}><Trash2 size={14} /></button>
              </div>
            </div>

            {(() => {
              const m = getMood(humeurDuJour.etat);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, position: 'relative' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20, flexShrink: 0,
                    background: m.bg, border: `2px solid ${m.ring}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                    boxShadow: `0 4px 16px ${m.ring}60`,
                  }}>
                    {m.emoji}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-0.01em' }}>
                      {humeurDuJour.etat}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--text-soft)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
                      {new Date(humeurDuJour.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })()}

            <AnimatePresence mode="wait">
              {!modeEdition ? (
                <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ background: 'var(--cream)', borderRadius: 16, padding: '16px 18px', minHeight: 64, border: '1px solid var(--warm-border)' }}>
                  <p style={{ margin: 0, fontSize: 14, color: humeurDuJour.noteJournal ? 'var(--text-mid)' : 'var(--text-soft)', lineHeight: 1.75, whiteSpace: 'pre-line', fontStyle: humeurDuJour.noteJournal ? 'normal' : 'italic' }}>
                    {humeurDuJour.noteJournal || 'Aucune note pour ce jour.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea className="sh-textarea" rows={4} value={editionNotes}
                    onChange={e => setEditionNotes(e.target.value)} autoFocus />
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
      <div style={{ marginTop: 14 }}>
        <button className="sh-toggle-btn" onClick={() => setShowHistorique(!showHistorique)}>
          {showHistorique ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {showHistorique ? "Masquer l'historique" : "Voir l'historique complet"}
          {humeurs.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--terracotta-light)', color: 'var(--terracotta)', borderRadius: 20, padding: '2px 9px', marginLeft: 2 }}>
              {humeurs.length}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showHistorique && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <div className="sh-card" style={{ marginTop: 10, padding: '6px 24px 12px', maxHeight: 400, overflowY: 'auto' }}>
                {humeurs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: 13, padding: '24px 0', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
                    Aucune entrée enregistrée.
                  </p>
                ) : humeurs.map((h) => {
                  const m = getMood(h.etat);
                  const isToday = h.date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={h.id} className="sh-hist-item">
                      <div style={{
                        width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                        background: m.bg, border: `1.5px solid ${m.ring}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20,
                      }}>{m.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark)', fontFamily: "'Playfair Display', serif" }}>{h.etat}</span>
                          <span style={{
                            fontSize: 11, color: isToday ? 'var(--terracotta)' : 'var(--text-soft)',
                            fontWeight: isToday ? 700 : 400,
                            background: isToday ? 'var(--terracotta-light)' : 'transparent',
                            padding: isToday ? '2px 9px' : '0', borderRadius: 20,
                          }}>
                            {isToday ? "Aujourd'hui" : new Date(h.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        {h.noteJournal && (
                          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
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
import React, { useEffect, useState } from 'react';
import { getMessages, envoyerMessage } from '../../services/servicePsy';

const Messagerie = () => {
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      console.error("Erreur chargement messages", error);
    }
  };

  const handleEnvoyer = async () => {
    if (!nouveauMessage.trim()) return;
    try {
      await envoyerMessage({ contenu: nouveauMessage });
      setNouveauMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Erreur envoi message", error);
    }
  };

  return (
    <div>
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        {messages.length === 0 ? (
          <p>Aucun message</p>
        ) : (
          messages.map(msg => (
            <p key={msg.id}><strong>{msg.auteur}</strong>: {msg.contenu}</p>
          ))
        )}
      </div>

      <textarea
        value={nouveauMessage}
        onChange={e => setNouveauMessage(e.target.value)}
        placeholder="Écrire un message..."
        rows={3}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleEnvoyer}>Envoyer</button>
    </div>
  );
};

export default Messagerie;

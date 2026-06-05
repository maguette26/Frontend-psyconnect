import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:9191/api';

const motsInterdits = ['haine', 'suicide', 'viol'];

function contientMotInterdit(texte) {
  if (!texte) return false;
  const texteMinuscule = texte.toLowerCase();
  return motsInterdits.some(mot => texteMinuscule.includes(mot.toLowerCase()));
}

async function getMessages() {
  const response = await fetch(`${API_BASE_URL}/messages/admin/tous`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error("Erreur récupération des messages");
  return await response.json();
}

async function supprimerMessage(id) {
  const response = await fetch(`${API_BASE_URL}/messages/admin/supprimer/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error("Erreur suppression message");
  return await response.text();
}

async function getSujetsForum() {
  const response = await fetch(`${API_BASE_URL}/forum/admin/tous`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error("Erreur récupération des sujets forum");
  return await response.json();
}

async function supprimerSujetForum(id) {
  const response = await fetch(`${API_BASE_URL}/forum/admin/supprimer-sujet/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error("Erreur suppression sujet");
  return await response.text();
}

const ModerationMessages = () => {
  const [messages, setMessages] = useState([]);
  const [sujets, setSujets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
    fetchSujetsForum();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      setError("Erreur lors de la récupération des messages.");
      console.error(error);
    }
  };

  const fetchSujetsForum = async () => {
    try {
      const data = await getSujetsForum();
      setSujets(data);
    } catch (error) {
      setError("Erreur lors de la récupération des sujets du forum.");
      console.error(error);
    }
  };

  const handleSupprimerMessage = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await supprimerMessage(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      setError("Erreur lors de la suppression du message.");
      console.error(error);
    }
  };

  const handleSupprimerSujet = async (idSujet) => {
    if (!window.confirm('Supprimer ce sujet ?')) return;
    try {
      await supprimerSujetForum(idSujet);
      setSujets(prev => prev.filter(s => s.idSujet !== idSujet));
    } catch (error) {
      setError("Erreur lors de la suppression du sujet.");
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <h2 className="text-3xl font-bold text-indigo-700 text-center mb-8">
        Modération des Messages et Sujets du Forum
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center font-semibold mb-4 select-none">
          {error}
        </div>
      )}

      {/* Bloc Messages */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 border-b border-indigo-300 pb-2">
          Messages privés & Forum
        </h3>

        {messages.length === 0 ? (
          <p className="text-center text-gray-500 italic py-8 select-none">
            Aucun message à modérer.
          </p>
        ) : (
          <ul className="divide-y divide-gray-300 border border-gray-300 rounded-md shadow-sm">
            {messages.map(msg => {
              const inapproprie = msg.inapproprie || contientMotInterdit(msg.contenu);
              const expediteur = msg.anonymat ? 'Anonyme' : (msg.expediteur || 'Inconnu');
              const destinataire = msg.destinataire || 'Forum Public';

              let dateHeure = 'Date inconnue';
              try {
                const dateTime = new Date(`${msg.date}T${msg.heure}`);
                if (!isNaN(dateTime)) {
                  dateHeure = `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                }
              } catch {}

              return (
                <li key={msg.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-indigo-50 transition-colors">
                  <div className="flex-grow mb-2 sm:mb-0 pr-4">
                    <p>
                      <strong className="text-gray-900">{expediteur}</strong> à <em>{destinataire}</em> :{' '}
                      {inapproprie ? (
                        <span className="text-red-600 font-semibold">[Message inapproprié]</span>
                      ) : (
                        <span className="text-gray-700">{msg.contenu}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 select-none">({dateHeure})</p>
                  </div>
                  <button
                    onClick={() => handleSupprimerMessage(msg.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm focus:outline-none transition"
                    aria-label="Supprimer message"
                  >
                    Supprimer
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Bloc Sujets Forum */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 border-b border-indigo-300 pb-2">
          Sujets du Forum
        </h3>

        {sujets.length === 0 ? (
          <p className="text-center text-gray-500 italic py-8 select-none">
            Aucun sujet trouvé.
          </p>
        ) : (
          <ul className="space-y-6">
            {sujets.map(sujet => (
              <li key={sujet.idSujet} className="border border-gray-300 rounded-md p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="max-w-[80%]">
                    <h4 className="text-lg font-semibold text-indigo-700 truncate">{sujet.titre}</h4>
                    <p className="text-gray-800 mt-1">{sujet.contenu}</p>
                    <p className="text-sm text-gray-500 mt-2 select-none">
                      Auteur : {sujet.auteur} | {new Date(sujet.dateCreation).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSupprimerSujet(sujet.idSujet)}
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none transition"
                    aria-label="Supprimer sujet"
                  >
                    Supprimer
                  </button>
                </div>

                {sujet.reponses && sujet.reponses.length > 0 && (
                  <div className="mt-5 border-t border-indigo-200 pt-4">
                    <h5 className="text-sm font-semibold text-indigo-600 mb-3">Réponses :</h5>
                    <ul className="space-y-3 max-h-64 overflow-y-auto">
                      {sujet.reponses.map(rep => (
                        <li key={rep.idReponse} className="bg-indigo-50 rounded p-3">
                          <p className="text-gray-900"><strong>{rep.auteur}</strong> : {rep.message}</p>
                          <p className="text-xs text-gray-500 select-none">{new Date(rep.dateReponse).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ModerationMessages;

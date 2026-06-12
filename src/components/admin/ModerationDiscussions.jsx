import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://backend-psyconnect.up.railway.app/api';

const motsInterdits = ['haine', 'suicide', 'viol'];

function contientMotInterdit(texte) {
  if (!texte) return false;
  const texteMinuscule = texte.toLowerCase();
  return motsInterdits.some(mot => texteMinuscule.includes(mot.toLowerCase()));
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
  const [sujets, setSujets] = useState([]);
  const [errorSujets, setErrorSujets] = useState(null);

  useEffect(() => {
    fetchSujetsForum();
  }, []);

  const fetchSujetsForum = async () => {
    setErrorSujets(null);
    try {
      const data = await getSujetsForum();
      setSujets(data);
    } catch (error) {
      setErrorSujets("Erreur lors de la récupération des sujets du forum.");
      console.error(error);
    }
  };

  const handleSupprimerSujet = async (idSujet) => {
    if (!window.confirm('Supprimer ce sujet ?')) return;
    try {
      await supprimerSujetForum(idSujet);
      setSujets(prev => prev.filter(s => s.idSujet !== idSujet));
    } catch (error) {
      setErrorSujets("Erreur lors de la suppression du sujet.");
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <h2 className="text-3xl font-bold text-indigo-700 text-center mb-8">
        Modération du Forum
      </h2>

      {errorSujets && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center font-semibold mb-4 select-none">
          {errorSujets}
        </div>
      )}

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
            {sujets.map(sujet => {
              const titreInapproprie = contientMotInterdit(sujet.titre);
              const contenuInapproprie = contientMotInterdit(sujet.contenu);

              return (
                <li key={sujet.idSujet} className="border border-gray-300 rounded-md p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="max-w-[80%]">
                      <h4 className="text-lg font-semibold text-indigo-700 truncate">
                        {titreInapproprie ? (
                          <span className="text-red-600">[Titre inapproprié]</span>
                        ) : sujet.titre}
                      </h4>
                      <p className="text-gray-800 mt-1">
                        {contenuInapproprie ? (
                          <span className="text-red-600 font-semibold">[Contenu inapproprié]</span>
                        ) : sujet.contenu}
                      </p>
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
                        {sujet.reponses.map(rep => {
                          const reponseInappropriee = contientMotInterdit(rep.message);
                          return (
                            <li key={rep.idReponse} className={`rounded p-3 ${reponseInappropriee ? 'bg-red-50 border border-red-200' : 'bg-indigo-50'}`}>
                              <p className="text-gray-900">
                                <strong>{rep.auteur}</strong> :{' '}
                                {reponseInappropriee ? (
                                  <span className="text-red-600 font-semibold">[Réponse inappropriée]</span>
                                ) : rep.message}
                              </p>
                              <p className="text-xs text-gray-500 select-none">{new Date(rep.dateReponse).toLocaleString()}</p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ModerationMessages;
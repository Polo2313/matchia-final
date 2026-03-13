import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

const consultantsData = [
  { id: 1, name: "Sophie Marceau", role: "NLP & Chatbots", rating: 4.9, bio: "Experte en IA conversationnelle", skills: ["ChatGPT", "LangChain"], price: "450€/j" },
  { id: 2, name: "Karim Benzour", role: "Computer Vision", rating: 4.8, bio: "Spécialiste détection d'anomalies", skills: ["OpenCV", "YOLO"], price: "520€/j" },
  { id: 3, name: "Clara Dubois", role: "Data Science", rating: 5.0, bio: "Data Scientist senior, ex-Google", skills: ["Python", "MLOps"], price: "480€/j" }
];

export default function App() {
  const { 
    user, profile, loading: authLoading, 
    signIn, signUpBusiness, signUpConsultant, signOut, 
    getConsultants 
  } = useAuth();

  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("pme");
  const [showAuth, setShowAuth] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [consultants, setConsultants] = useState(consultantsData);

  useEffect(() => {
    const loadConsultants = async () => {
      const data = await getConsultants();
      if (data && data.length > 0) setConsultants(data);
    };
    loadConsultants();
  }, [getConsultants]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === "login") {
      const { error } = await signIn(email, password);
      if (!error) setShowAuth(false);
      else alert(error);
    } else {
      let error;
      if (role === "pme") {
        error = await signUpBusiness(email, password, name, "Entreprise en attente");
      } else {
        error = await signUpConsultant(email, password, name, "Expert IA");
      }
      
      if (!error) {
        alert("Inscription réussie ! Vérifiez vos emails pour confirmer.");
        setShowAuth(false);
      } else {
        alert(error);
      }
    }
  };

  const findCompany = async () => {
    if (search.length < 3) return;
    setSearchLoading(true);
    try {
      const res = await fetch("https://recherche-entreprises.api.gouv.fr/search?q=" + encodeURIComponent(search));
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error("Search error:", e);
    }
    setSearchLoading(false);
  };

  if (authLoading) return <div className="min-h-screen bg-[#08080F] flex items-center justify-center text-white">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#08080F] text-white font-sans selection:bg-indigo-500/30">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-[#12121E] backdrop-blur-md sticky top-0 z-40 bg-[#08080F]/80">
        <h2 
          onClick={() => setView("home")} 
          className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
        >
          MatchIA
        </h2>
        <div className="flex items-center gap-6">
          <span onClick={() => setView("pme")} className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">Espace PME</span>
          <span onClick={() => setView("consultants")} className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">Consultants</span>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-indigo-300">{profile?.full_name || user.email}</span>
              <button onClick={signOut} className="px-4 py-2 text-xs font-semibold bg-[#12122A] hover:bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg transition-all">Déconnexion</button>
            </div>
          ) : (
            <button onClick={() => { setAuthMode("login"); setShowAuth(true); }} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">Se connecter</button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {view === "home" && (
          <div className="text-center py-20">
            <h1 className="text-6xl font-extrabold tracking-tight mb-8">L'IA pour votre <span className="text-indigo-500">croissance</span></h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Connectez votre PME aux meilleurs consultants en Intelligence Artificielle pour automatiser vos processus et décupler vos revenus.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setView("pme")} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-lg font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/30">Trouver un expert</button>
              <button onClick={() => { setAuthMode("signup"); setRole("consultant"); setShowAuth(true); }} className="px-8 py-4 bg-[#12122A] hover:bg-[#1A1A3A] text-lg font-bold rounded-2xl transition-all border border-indigo-500/20">Devenir consultant</button>
            </div>
          </div>
        )}

        {view === "pme" && (
          <div className="max-w-2xl mx-auto">
            {step === 1 && (
              <div className="bg-[#12122A] p-10 rounded-3xl border border-indigo-500/10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Identifiez votre entreprise</h3>
                <div className="relative mb-6">
                  <input value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && findCompany()} placeholder="Nom de votre entreprise..." className="w-full bg-[#08080F] border border-[#2E2E55] rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  {searchLoading && <div className="absolute right-4 top-4 animate-spin text-indigo-500">◌</div>}
                </div>
                <button onClick={findCompany} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 mb-8">Rechercher sur le registre officiel</button>
                <div className="space-y-3">
                  {results.map(r => (
                    <div key={r.siren} onClick={() => { setSelectedCompany(r); setStep(2); }} className="p-4 bg-[#08080F] hover:bg-indigo-900/10 border border-[#2E2E55] hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all group">
                      <div className="flex justify-between items-center">
                        <span className="font-medium group-hover:text-indigo-400 transition-colors">{r.nom_complet}</span>
                        <span className="text-xs text-gray-500">SIREN {r.siren}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="bg-[#12122A] p-10 rounded-3xl border border-indigo-500/10 text-center shadow-2xl">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-3xl">✨</span></div>
                <h3 className="text-2xl font-bold mb-4">Analyse pour {selectedCompany?.nom_complet}</h3>
                <p className="text-gray-400 mb-8">Notre IA analyse votre secteur pour identifier les meilleures opportunités d'automatisation.</p>
                <button onClick={() => setStep(3)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">Découvrir mon équipe idéale</button>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold">Consultants recommandés</h3>
                  <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-white transition-colors">Retour</button>
                </div>
                <div className="grid gap-6">
                  {consultants.map(c => (
                    <div key={c.id} className="bg-[#12122A] p-6 rounded-2xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all group">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">{c.name}</h4>
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">{c.rating} ⭐</span>
                          </div>
                          <p className="text-indigo-300 text-sm font-medium mb-3">{c.role}</p>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{c.bio || "Expert en IA."}</p>
                          <div className="flex flex-wrap gap-2">
                            {(c.skills || ["IA"]).map(s => <span key={s} className="px-3 py-1 bg-[#08080F] text-gray-400 text-xs rounded-full border border-[#2E2E55]">{s}</span>)}
                          </div>
                        </div>
                        <div className="md:w-32 flex flex-col justify-between items-end border-l border-[#2E2E55] pl-6">
                          <div><p className="text-xs text-gray-500 uppercase">Tarif</p><p className="text-lg font-bold">{c.price || "Sur devis"}</p></div>
                          <button className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all" onClick={() => alert("Contacté !")}>Contacter</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <div className="bg-[#12122A] p-10 rounded-3xl w-full max-w-md border border-indigo-500/20 shadow-2xl relative">
            <button onClick={() => setShowAuth(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">✕</button>
            <h2 className="text-3xl font-bold mb-2">{authMode === "login" ? "Connexion" : "Rejoindre MatchIA"}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "signup" && (
                <>
                  <input placeholder="Prénom Nom" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#08080F] border border-[#2E2E55] rounded-xl px-4 py-3 text-white" />
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-[#08080F] border border-[#2E2E55] rounded-xl px-4 py-3 text-white">
                    <option value="pme">PME</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </>
              )}
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#08080F] border border-[#2E2E55] rounded-xl px-4 py-3 text-white" />
              <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#08080F] border border-[#2E2E55] rounded-xl px-4 py-3 text-white" />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 mt-6">{authMode === "login" ? "Se connecter" : "Créer mon compte"}</button>
            </form>
            <p className="mt-8 text-sm text-gray-400 text-center">
              {authMode === "login" ? "Pas encore de compte ?" : "Déjà membre ?"}
              <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors">{authMode === "login" ? "S'inscrire" : "Se connecter"}</button>
            </p>
          </div>
        </div>
      )}
      <footer className="mt-20 py-12 border-t border-[#12121E] text-center text-gray-500 text-sm">
        <p>© 2024 MatchIA - La plateforme de matching IA pour les PME françaises.</p>
      </footer>
    </div>
  );
}

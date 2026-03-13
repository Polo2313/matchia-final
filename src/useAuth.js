import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bizProfile, setBizProfile] = useState(null);
  const [consultantProfile, setConsultantProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!prof) return;
      setProfile(prof);
      if (prof.role === 'business') {
        const { data: biz } = await supabase
          .from('businessprofiles')
          .select('*')
          .eq('id', userId)
          .single();
        setBizProfile(biz);
      } else if (prof.role === 'consultant') {
        const { data: cons } = await supabase
          .from('consultantprofiles')
          .select('*')
          .eq('id', userId)
          .single();
        setConsultantProfile(cons);
      }
    } catch (e) {
      console.error('Error fetching profile', e);
    }
  }, []);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setBizProfile(null);
        setConsultantProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);
  const signUpBusiness = async (email, password, fullName, contactRole, company) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'business', fullname: fullName } }
    });
    if (error) return { error: error.message };
    await new Promise(r => setTimeout(r, 500));
    if (data.user && company) {
      const siege = company.siege;
      await supabase.from('businessprofiles').upsert({
        id: data.user.id,
        companyname: company.nom_complet,
        siren: company.siren,
        sector: company.libelle_activite_principale,
        activitylabel: company.libelle_activite_principale,
        nafcode: company.activite_principale,
        address: siege?.adresse,
        city: siege?.libelle_commune,
        postalcode: siege?.code_postal,
        employeecount: company.tranche_effectif_salarie,
        contactrole: contactRole,
        creationdate: company.date_creation
      });
    }
    return { data };
  };
  const signUpConsultant = async (email, password, fullName, specialty, dailyRate, skills, bio, location, linkedin) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'consultant', fullname: fullName } }
    });
    if (error) return { error: error.message };
    await new Promise(r => setTimeout(r, 500));
    if (data.user) {
      await supabase.from('consultantprofiles').upsert({
        id: data.user.id,
        specialty,
        dailyrate: parseInt(dailyRate) || 0,
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        bio,
        location,
        linkedinurl: linkedin,
        available: true,
        verified: false,
        experienceyears: 0,
        missionscount: 0,
        rating: 0
      });
    }
    return { data };
  };
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { data };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setBizProfile(null);
    setConsultantProfile(null);
  };
  const createRequest = async (need, budget, companyName, companySiren, sector) => {
    if (!user) return { error: 'Non connecte' };
    const { data, error } = await supabase.from('requests').insert({
      businessid: user.id,
      companyname: companyName,
      companysiren: companySiren,
      sector,
      need,
      budget,
      status: 'new'
    }).select().single();
    if (error) return { error: error.message };
    return { data };
  };
  const getMyRequests = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from('requests')
      .select('*')
      .eq('businessid', user.id)
      .order('createdat', { ascending: false });
    return data || [];
  };
  const getAvailableMissions = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .in('status', ['new', 'matching'])
      .order('createdat', { ascending: false });
    return data || [];
  };
  const getMyMatches = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from('matches')
      .select('*, requests(*)')
      .eq('consultantid', user.id)
      .order('createdat', { ascending: false });
    return data || [];
  };
  const respondToMatch = async (matchId, status) => {
    const { error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId);
    return error?.message;
  };
  const getConsultants = useCallback(async () => {
    const { data } = await supabase
      .from('consultantprofiles')
      .select('*, profiles(fullname, email)')
      .order('rating', { ascending: false });
    return data || [];
  }, []);
  return {
    user,
    profile,
    bizProfile,
    consultantProfile,
    loading,
    signUpBusiness,
    signUpConsultant,
    signIn,
    signOut,
    createRequest,
    getMyRequests,
    getAvailableMissions,
    getMyMatches,
    respondToMatch,
    getConsultants,
    fetchProfile
  };
}

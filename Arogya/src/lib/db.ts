/**
 * db.ts — Centralized Supabase data access layer for Arogya Zenith
 * All database operations for every page are defined here.
 */
import { supabase } from "./supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HealthRecord {
  id?: string;
  user_email: string;
  name: string;
  date: string;
  file_type?: string;
  file_size?: string;
  file_url?: string;
  created_at?: string;
}

export interface Prescription {
  id?: string;
  user_email: string;
  medicine: string;
  dosage: string;
  duration: string;
  date: string;
  created_at?: string;
}

export interface Vital {
  id?: string;
  user_email: string;
  heart_rate?: string;
  blood_pressure?: string;
  sleep?: string;
  steps?: string;
  hba1c?: string;
  bmi?: string;
  recorded_at?: string;
}

export interface Appointment {
  id?: string;
  user_email: string;
  title: string;
  date: string;
  time: string;
  location: string;
  created_at?: string;
}

export interface Medication {
  id?: string;
  user_email: string;
  name: string;
  dose: string;
  schedule: string;
  adherence?: string;
  created_at?: string;
}

export interface BloodDonor {
  id?: string;
  user_email?: string;
  name: string;
  blood_group: string;
  location: string;
  last_donation?: string;
  status?: string;
  phone?: string;
  created_at?: string;
}

export interface SosRequest {
  id?: string;
  user_email: string;
  lat?: number;
  lng?: number;
  address?: string;
  status?: string;
  created_at?: string;
}

export interface UserProfile {
  user_email: string;
  name?: string;
  phone?: string;
  blood_group?: string;
  address?: string;
  emergency_contact?: string;
  updated_at?: string;
}

export interface CartItemDB {
  id?: string;
  user_email: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  created_at?: string;
}

// ─── Health Records ───────────────────────────────────────────────────────────

export const fetchHealthRecords = async (userEmail: string): Promise<HealthRecord[]> => {
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchHealthRecords:", error); return []; }
  return data || [];
};

export const insertHealthRecord = async (record: HealthRecord): Promise<HealthRecord | null> => {
  const { data, error } = await supabase
    .from("health_records")
    .insert([record])
    .select()
    .single();
  if (error) { console.error("insertHealthRecord:", error); return null; }
  return data;
};

export const deleteHealthRecord = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("health_records").delete().eq("id", id);
  if (error) { console.error("deleteHealthRecord:", error); return false; }
  return true;
};

// ─── Prescriptions ────────────────────────────────────────────────────────────

export const fetchPrescriptions = async (userEmail: string): Promise<Prescription[]> => {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchPrescriptions:", error); return []; }
  return data || [];
};

export const insertPrescription = async (prescription: Prescription): Promise<Prescription | null> => {
  const { data, error } = await supabase
    .from("prescriptions")
    .insert([prescription])
    .select()
    .single();
  if (error) { console.error("insertPrescription:", error); return null; }
  return data;
};

export const deletePrescription = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("prescriptions").delete().eq("id", id);
  if (error) { console.error("deletePrescription:", error); return false; }
  return true;
};

// ─── Vitals ───────────────────────────────────────────────────────────────────

export const fetchLatestVitals = async (userEmail: string): Promise<Vital | null> => {
  const { data, error } = await supabase
    .from("vitals")
    .select("*")
    .eq("user_email", userEmail)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();
  if (error) { return null; }
  return data;
};

// Alias used by PatientDashboard
export const fetchVitals = fetchLatestVitals;

export const upsertVitals = async (vitals: Vital): Promise<Vital | null> => {
  const { data, error } = await supabase
    .from("vitals")
    .insert([vitals])
    .select()
    .single();
  if (error) { console.error("upsertVitals:", error); return null; }
  return data;
};

// Alias used by PatientDashboard
export const insertVitals = upsertVitals;

// ─── Appointments ─────────────────────────────────────────────────────────────

export const fetchAppointments = async (userEmail: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchAppointments:", error); return []; }
  return data || [];
};

export const insertAppointment = async (appt: Appointment): Promise<Appointment | null> => {
  const { data, error } = await supabase
    .from("appointments")
    .insert([appt])
    .select()
    .single();
  if (error) { console.error("insertAppointment:", error); return null; }
  return data;
};

// ─── Medications ──────────────────────────────────────────────────────────────

export const fetchMedications = async (userEmail: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchMedications:", error); return []; }
  return data || [];
};

export const insertMedication = async (med: Medication): Promise<Medication | null> => {
  const { data, error } = await supabase
    .from("medications")
    .insert([med])
    .select()
    .single();
  if (error) { console.error("insertMedication:", error); return null; }
  return data;
};

export const deleteMedication = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("medications").delete().eq("id", id);
  if (error) { console.error("deleteMedication:", error); return false; }
  return true;
};

// ─── Blood Donors ─────────────────────────────────────────────────────────────

export const fetchBloodDonors = async (): Promise<BloodDonor[]> => {
  const { data, error } = await supabase
    .from("blood_donors")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchBloodDonors:", error); return []; }
  return data || [];
};

export const insertBloodDonor = async (donor: BloodDonor): Promise<BloodDonor | null> => {
  const { data, error } = await supabase
    .from("blood_donors")
    .insert([donor])
    .select()
    .single();
  if (error) { console.error("insertBloodDonor:", error); return null; }
  return data;
};

// ─── SOS Requests ─────────────────────────────────────────────────────────────

export const insertSosRequest = async (sos: SosRequest): Promise<SosRequest | null> => {
  const { data, error } = await supabase
    .from("sos_requests")
    .insert([sos])
    .select()
    .single();
  if (error) { console.error("insertSosRequest:", error); return null; }
  return data;
};

// ─── User Profile ─────────────────────────────────────────────────────────────

export const fetchUserProfile = async (userEmail: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_email", userEmail)
    .single();
  if (error) { return null; }
  return data;
};

export const upsertUserProfile = async (profile: UserProfile): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "user_email" })
    .select()
    .single();
  if (error) { console.error("upsertUserProfile:", error); return null; }
  return data;
};

// ─── Cart Items ─────────────────────────────────────────────────────────────

export const fetchCartItems = async (userEmail: string): Promise<CartItemDB[]> => {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: true });
  if (error) { console.error("fetchCartItems:", error); return []; }
  return data || [];
};

export const insertCartItem = async (item: CartItemDB): Promise<CartItemDB | null> => {
  const { data, error } = await supabase
    .from("cart_items")
    .insert([item])
    .select()
    .single();
  if (error) { console.error("insertCartItem:", error); return null; }
  return data;
};

export const deleteCartItem = async (productId: string, userEmail: string): Promise<boolean> => {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .match({ product_id: productId, user_email: userEmail });
  if (error) { console.error("deleteCartItem:", error); return false; }
  return true;
};

export const updateCartItemQty = async (productId: string, userEmail: string, qty: number): Promise<boolean> => {
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: qty })
    .match({ product_id: productId, user_email: userEmail });
  if (error) { console.error("updateCartItemQty:", error); return false; }
  return true;
};

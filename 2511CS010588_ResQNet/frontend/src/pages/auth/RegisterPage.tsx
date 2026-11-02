import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Heart,
  Award,
  Activity,
  AlertCircle,
  LocateFixed
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import type { BloodGroup, Role, TeamType } from '../../types';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<Role>('CITIZEN');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('UNKNOWN');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // Citizen fields
  const [medicalConditions, setMedicalConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [isElderlyOrChild, setIsElderlyOrChild] = useState(false);

  // Volunteer fields
  const [skills, setSkills] = useState('');
  const [preferredRadiusKm, setPreferredRadiusKm] = useState(10);

  // Rescue Team fields
  const [unitName, setUnitName] = useState('');
  const [callSign, setCallSign] = useState('');
  const [teamType, setTeamType] = useState<TeamType>('DISASTER_RESPONSE_FORCE');
  const [memberCount, setMemberCount] = useState(5);
  const [vehicleType, setVehicleType] = useState('All-Terrain Emergency Vehicle');
  const [equipmentList, setEquipmentList] = useState('');

  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithAuthResponse } = useAuth();
  const navigate = useNavigate();

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not fetch precise location. You can enter your address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
        fullName,
        phone,
        role,
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        address,
        currentLatitude: latitude,
        currentLongitude: longitude,
        medicalConditions,
        allergies,
        specialNeeds,
        isElderlyOrChild,
        skills,
        preferredRadiusKm,
        unitName,
        callSign,
        teamType,
        memberCount,
        vehicleType,
        equipmentList,
      };

      const authData = await authService.register(payload);
      loginWithAuthResponse(authData);

      switch (authData.role) {
        case 'CITIZEN':
          navigate('/citizen');
          break;
        case 'VOLUNTEER':
          navigate('/volunteer');
          break;
        case 'RESCUE_TEAM':
          navigate('/rescue');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please check inputs and ensure backend service is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '14px',
            borderRadius: '16px',
            width: 'fit-content',
            margin: '0 auto 1rem auto'
          }}>
            <ShieldAlert size={32} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Register for ResQNet
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Select your operational role to enter the emergency coordination network
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.5rem',
          marginBottom: '2rem',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '6px',
          borderRadius: '12px'
        }}>
          {[
            { id: 'CITIZEN' as Role, label: 'Citizen', icon: Heart, desc: 'Safety & SOS' },
            { id: 'VOLUNTEER' as Role, label: 'Volunteer', icon: Award, desc: 'Field Tasks' },
            { id: 'RESCUE_TEAM' as Role, label: 'Rescue Unit', icon: Activity, desc: 'Command Radar' },
            { id: 'ADMIN' as Role, label: 'Admin', icon: ShieldAlert, desc: 'Coordination' },
          ].map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                  background: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} color={isSelected ? '#60a5fa' : '#9ca3af'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{r.label}</span>
                <span style={{ fontSize: '0.65rem', color: isSelected ? '#93c5fd' : 'var(--text-muted)' }}>{r.desc}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* General User Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} color="#6b7280" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.925rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@emergency.org"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.925rem'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Password (min 6 chars) *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.925rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={18} color="#6b7280" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.925rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Blood Group & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Blood Group (for triage)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.925rem'
                }}
              >
                <option value="UNKNOWN">Unknown / Prefer not to say</option>
                <option value="A_POS">A+</option>
                <option value="A_NEG">A-</option>
                <option value="B_POS">B+</option>
                <option value="B_NEG">B-</option>
                <option value="O_POS">O+</option>
                <option value="O_NEG">O-</option>
                <option value="AB_POS">AB+</option>
                <option value="AB_NEG">AB-</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Address / City
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Sector 4, Coastal Zone"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.925rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="btn btn-outline"
                  title="Detect live GPS location"
                  style={{ padding: '0.75rem' }}
                >
                  <LocateFixed size={18} color={latitude ? '#34d399' : '#60a5fa'} />
                </button>
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          {role === 'CITIZEN' && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fca5a5' }}>
                Citizen Safety & Emergency Profile
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Known Medical Conditions
                  </label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="e.g. Asthma, Diabetes, Hypertension"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Allergies
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Special Assistance Needs
                </label>
                <input
                  type="text"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="e.g. Wheelchair accessible, Oxygen cylinder, Guide dog"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="elderlyCheck"
                  checked={isElderlyOrChild}
                  onChange={(e) => setIsElderlyOrChild(e.target.checked)}
                />
                <label htmlFor="elderlyCheck" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Household includes elderly individuals, infants, or differently-abled dependents
                </label>
              </div>
            </div>
          )}

          {role === 'VOLUNTEER' && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fcd34d' }}>
                Volunteer Capabilities & Operational Radius
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Skills & Certifications
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. First Aid, CPR, Swimming, Heavy Driving"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Max Dispatch Radius (km): {preferredRadiusKm} km
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={preferredRadiusKm}
                    onChange={(e) => setPreferredRadiusKm(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'RESCUE_TEAM' && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#93c5fd' }}>
                Rescue Unit Details & Fleet Info
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Unit / Squad Name *
                  </label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="e.g. NDRF Unit 7 / Alpha Squad"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Unit Call Sign
                  </label>
                  <input
                    type="text"
                    value={callSign}
                    onChange={(e) => setCallSign(e.target.value)}
                    placeholder="e.g. ALPHA-1, BRAVO-LEADER"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Team Category
                  </label>
                  <select
                    value={teamType}
                    onChange={(e) => setTeamType(e.target.value as TeamType)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  >
                    <option value="FIRE_RESCUE">Fire & Hazmat</option>
                    <option value="MEDICAL_EMERGENCY">Medical Paramedic</option>
                    <option value="FLOOD_RESCUE">Flood & Water Rescue</option>
                    <option value="DISASTER_RESPONSE_FORCE">National / State DRF</option>
                    <option value="POLICE_SECURITY">Police & Security</option>
                    <option value="GENERAL_RELIEF">General Relief Taskforce</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Active Squad Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Primary Vehicle Type
                  </label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. 4x4 Ambulance, Inflatable Boat"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Equipment Inventory
                </label>
                <input
                  type="text"
                  value={equipmentList}
                  onChange={(e) => setEquipmentList(e.target.value)}
                  placeholder="e.g. Hydraulic cutters, Defibrillators, Satellite phones"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Next of Kin / Base Station"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.925rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+91 91234 56789"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.925rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.75rem', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <span>Registering Profile...</span>
            ) : (
              <>
                <UserPlus size={18} /> Complete Registration
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
              Sign In to Your Sector
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

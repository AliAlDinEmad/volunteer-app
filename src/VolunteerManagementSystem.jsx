import React, { useState, useEffect } from 'react';
import { Calendar, Users, Award, TrendingUp, Plus, Edit2, Clock, UserCheck } from 'lucide-react';
import PageContainer from './components/PageContainer';

const initializeDatabase = () => {
    const stored = localStorage.getItem('volunteerDB');
    if (stored) return JSON.parse(stored);

    return {
        users: [
            { id: 1, email: 'manager@org.com', password: 'manager123', role: 'manager', name: 'Sarah Manager' },
            { id: 2, email: 'volunteer1@email.com', password: 'vol123', role: 'volunteer', volunteerId: 1 },
            { id: 3, email: 'volunteer2@email.com', password: 'vol123', role: 'volunteer', volunteerId: 2 }
        ],
        volunteers: [
            { id: 1, name: 'Ahmed Hassan', age: 24, committee: 'Events', firstParticipation: '2023-03-15', userId: 2 },
            { id: 2, name: 'Fatima Ali', age: 22, committee: 'Marketing', firstParticipation: '2023-05-20', userId: 3 }
        ],
        committees: ['Events', 'Marketing', 'Tech', 'Outreach', 'Finance'],
        events: [
            { id: 1, name: 'Community Cleanup', date: '2026-01-20', committee: 'Events', description: 'Help clean the local park', createdBy: 1 },
            { id: 2, name: 'Food Drive', date: '2026-01-25', committee: 'Outreach', description: 'Collect food donations', createdBy: 1 }
        ],
        signups: [
            { id: 1, eventId: 1, volunteerId: 1, signedUpAt: '2026-01-10', status: 'signed_up' },
            { id: 2, eventId: 1, volunteerId: 2, signedUpAt: '2026-01-11', status: 'confirmed' }
        ],
        participations: [
            { id: 1, eventId: 1, volunteerId: 2, date: '2026-01-20', confirmedBy: 1 }
        ]
    };
};

const VolunteerManagementSystem = () => {
    const [db, setDb] = useState(initializeDatabase);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('login');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({ name: '', date: '', committee: 'Events', description: '' });
    const [newVolunteer, setNewVolunteer] = useState({ name: '', age: '', email: '', password: '', committee: 'Events' });
    const [editingVolunteer, setEditingVolunteer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCommittee, setFilterCommittee] = useState('all');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmCancelEventId, setConfirmCancelEventId] = useState(null);

    useEffect(() => {
        localStorage.setItem('volunteerDB', JSON.stringify(db));
    }, [db]);

    const saveDb = (newDb) => {
        setDb(newDb);
    };

    const login = (email, password) => {
        const user = db.users.find(
            (u) => u.email === email && u.password === password
        );

        if (user) {
            setCurrentUser(user);
            setView(user.role === 'manager' ? 'managerDashboard' : 'volunteerDashboard');
            return true;
        }

        return false;
    };


    const logout = () => {
        setCurrentUser(null);
        setView('login');
    };

    const getCurrentVolunteer = () => {
        if (!currentUser || currentUser.role !== 'volunteer') return null;
        return db.volunteers.find(v => v.id === currentUser.volunteerId);
    };

    const getVolunteerStats = (volunteerId) => {
        const participations = db.participations.filter(p => p.volunteerId === volunteerId);
        const volunteer = db.volunteers.find(v => v.id === volunteerId);

        if (!volunteer) return { total: 0, frequency: 0, firstDate: null };

        const firstDate = new Date(volunteer.firstParticipation);
        const daysSinceFirst = Math.floor((new Date() - firstDate) / (1000 * 60 * 60 * 24));
        const frequency = daysSinceFirst > 0 ? (participations.length / daysSinceFirst * 30).toFixed(1) : 0;

        return {
            total: participations.length,
            frequency: frequency,
            firstDate: volunteer.firstParticipation
        };
    };

    const signUpForEvent = (eventId) => {
        const volunteer = getCurrentVolunteer();
        if (!volunteer) return;

        const existingSignup = db.signups.find(s => s.eventId === eventId && s.volunteerId === volunteer.id);
        if (existingSignup) {
            alert('Already signed up for this event');
            return;
        }

        const newDb = { ...db };
        newDb.signups.push({
            id: Date.now(),
            eventId,
            volunteerId: volunteer.id,
            signedUpAt: new Date().toISOString(),
            status: 'signed_up'
        });
        saveDb(newDb);
    };

    const cancelSignup = (eventId) => {
        const volunteer = getCurrentVolunteer();
        if (!volunteer) return;

        const newDb = { ...db };
        newDb.signups = newDb.signups.filter(s => !(s.eventId === eventId && s.volunteerId === volunteer.id));
        saveDb(newDb);
    };

    const confirmAttendance = (eventId, volunteerId) => {
        const newDb = { ...db };
        const signup = newDb.signups.find(s => s.eventId === eventId && s.volunteerId === volunteerId);
        if (signup) {
            signup.status = 'confirmed';
            newDb.participations.push({
                id: Date.now(),
                eventId,
                volunteerId,
                date: new Date().toISOString(),
                confirmedBy: currentUser.id
            });
            saveDb(newDb);
        }
    };

    const createEvent = () => {
        if (!newEvent.name || !newEvent.date) {
            alert('Please fill in all required fields');
            return;
        }

        const newDb = { ...db };
        newDb.events.push({
            id: Date.now(),
            ...newEvent,
            createdBy: currentUser.id
        });
        saveDb(newDb);
        setNewEvent({ name: '', date: '', committee: 'Events', description: '' });
        setView('managerDashboard');
    };

    const createVolunteer = () => {
        if (!newVolunteer.name || !newVolunteer.age || !newVolunteer.email || !newVolunteer.password) {
            alert('Please fill in all fields');
            return;
        }

        const newDb = { ...db };
        const volunteerId = Date.now();
        const userId = volunteerId + 1;

        newDb.volunteers.push({
            id: volunteerId,
            name: newVolunteer.name,
            age: parseInt(newVolunteer.age),
            committee: newVolunteer.committee,
            firstParticipation: new Date().toISOString().split('T')[0],
            userId
        });

        newDb.users.push({
            id: userId,
            email: newVolunteer.email,
            password: newVolunteer.password,
            role: 'volunteer',
            volunteerId
        });

        saveDb(newDb);
        setNewVolunteer({ name: '', age: '', email: '', password: '', committee: 'Events' });
        setView('managerDashboard');
    };

    const updateVolunteer = () => {
        if (!editingVolunteer) return;

        const newDb = { ...db };
        const idx = newDb.volunteers.findIndex(v => v.id === editingVolunteer.id);
        if (idx !== -1) {
            newDb.volunteers[idx] = { ...editingVolunteer };
            saveDb(newDb);
            setEditingVolunteer(null);
        }
    };

    const getFilteredVolunteers = () => {
        let filtered = db.volunteers;

        if (searchTerm) {
            filtered = filtered.filter(v =>
                v.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCommittee !== 'all') {
            filtered = filtered.filter(v => v.committee === filterCommittee);
        }

        return filtered;
    };

    if (view === 'login') {
  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900
      relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 space-y-6
        bg-white/10 backdrop-blur-xl border border-white/20
        rounded-3xl shadow-2xl
        animate-[fadeIn_0.6s_ease-out]">

        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <Users className="w-14 h-14 text-indigo-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white">
          Volunteer Portal
        </h1>
        <p className="text-center text-white/70">
          Login to access your dashboard
        </p>

        {/* Inputs */}
        <div className="space-y-4 mt-6">
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl
              bg-white/10 text-white placeholder-white/50
              border border-white/20
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login(loginEmail, loginPassword)}
            className="w-full px-4 py-3 rounded-xl
              bg-white/10 text-white placeholder-white/50
              border border-white/20
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {error && (
            <div className="text-red-300 text-sm text-center
              bg-red-500/10 border border-red-500/30
              p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            disabled={loading}
            onClick={() => {
              setError('');
              setLoading(true);

              const success = login(loginEmail, loginPassword);
              if (!success) setError('Invalid email or password');

              setLoading(false);
            }}
            className={`w-full py-3 rounded-xl font-semibold text-lg
              transition shadow-lg
              ${loading
                ? 'bg-indigo-400/50 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'
              }`}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </div>

        {/* Demo accounts */}
        <div className="mt-8 p-5 rounded-xl text-sm
          bg-white/5 border border-white/10 text-white/80">
          <p className="font-semibold mb-2 text-white">Demo Accounts:</p>
          <p>Manager: manager@org.com / manager123</p>
          <p>Volunteer: volunteer1@email.com / vol123</p>
        </div>

      </div>
    </div>
  );
}

    if (view === 'volunteerDashboard') {
        const volunteer = getCurrentVolunteer();
        const stats = getVolunteerStats(volunteer.id);
        const mySignups = db.signups.filter(s => s.volunteerId === volunteer.id);
        const upcomingEvents = db.events.filter(e => new Date(e.date) >= new Date());
        const myUpcomingEvents = upcomingEvents.filter(e =>
            mySignups.some(s => s.eventId === e.id)
        );

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
                <nav className="bg-white/90 backdrop-blur-sm/80 backdrop-blur border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Users className="w-6 h-6 text-indigo-600" />
                            <span className="font-bold text-xl text-gray-800">Volunteer Portal</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">Welcome, {volunteer.name}</span>
                            <button onClick={logout} className="text-indigo-600 hover:text-indigo-800">Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Events</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                                </div>
                                <Award className="w-10 h-10 text-indigo-600" />
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Committee</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{volunteer.committee}</p>
                                </div>
                                <Users className="w-10 h-10 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Frequency</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.frequency}/mo</p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Member Since</p>
                                    <p className="text-lg font-bold text-gray-800 mt-1">{new Date(stats.firstDate).toLocaleDateString()}</p>
                                </div>
                                <Clock className="w-10 h-10 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {myUpcomingEvents.length > 0 && (
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow mb-8 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">My Upcoming Events</h2>
                            <div className="space-y-3">
                                {myUpcomingEvents.map(event => {
                                    const signup = mySignups.find(s => s.eventId === event.id);
                                    return (
                                        <div key={event.id} className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{event.name}</h3>
                                                <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} • {event.committee}</p>
                                                <p className="text-sm text-green-700 mt-1">
                                                    {signup.status === 'confirmed' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                                            ✓ Confirmed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            Signed Up
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {signup.status !== 'confirmed' &&
                                                confirmCancelEventId !== event.id && (
                                                    <button
                                                        onClick={() => setConfirmCancelEventId(event.id)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            {confirmCancelEventId === event.id && (
                                                <div
                                                    className="
      mt-4 flex items-center justify-between
      rounded-lg border border-red-200 bg-red-50
      px-4 py-3
      transition-all duration-300 ease-out
      opacity-100 translate-y-0
      animate-confirm
    "
                                                >
                                                    <span className="text-sm text-red-700">
                                                        Cancel this event?
                                                    </span>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                cancelSignup(event.id);
                                                                setConfirmCancelEventId(null);
                                                            }}
                                                            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
                                                        >
                                                            Yes, cancel
                                                        </button>

                                                        <button
                                                            onClick={() => setConfirmCancelEventId(null)}
                                                            className="px-3 py-1.5 rounded-md bg-white/90 backdrop-blur-sm border text-gray-700 text-sm hover:bg-gray-100"
                                                        >
                                                            Keep
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-6 h-6" />
                            Available Events
                        </h2>
                        <div className="space-y-3">
                            {upcomingEvents.map(event => {
                                const isSignedUp = mySignups.some(s => s.eventId === event.id);
                                return (
                                    <div key={event.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{event.name}</h3>
                                            <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} • {event.committee}</p>
                                            <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                                        </div>
                                        {!isSignedUp ? (
                                            <button
                                                onClick={() => signUpForEvent(event.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Sign Up
                                            </button>
                                        ) : (
                                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                                Signed Up ✓
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'managerDashboard') {
        const filteredVolunteers = getFilteredVolunteers();

        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Users className="w-6 h-6 text-indigo-600" />
                            <span className="font-bold text-xl text-gray-800">Manager Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('createEvent')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <Plus className="w-4 h-4 inline mr-1" />
                                New Event
                            </button>
                            <button onClick={() => setView('createVolunteer')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <Plus className="w-4 h-4 inline mr-1" />
                                Add Volunteer
                            </button>
                            <button onClick={() => setView('manageEvents')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Manage Events
                            </button>
                            <button onClick={logout} className="text-indigo-600 hover:text-indigo-800">Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <select
                                value={filterCommittee}
                                onChange={(e) => setFilterCommittee(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Committees</option>
                                {db.committees.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Committee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Participation</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Events</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredVolunteers.map(volunteer => {
                                        const stats = getVolunteerStats(volunteer.id);
                                        return (
                                            <tr key={volunteer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{volunteer.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{volunteer.age}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                                        {volunteer.committee}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(volunteer.firstParticipation).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{stats.total}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{stats.frequency}/mo</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button
                                                        onClick={() => setEditingVolunteer({ ...volunteer })}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {editingVolunteer && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 w-full max-w-md">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Volunteer</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={editingVolunteer.name}
                                            onChange={(e) => setEditingVolunteer({ ...editingVolunteer, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                        <input
                                            type="number"
                                            value={editingVolunteer.age}
                                            onChange={(e) => setEditingVolunteer({ ...editingVolunteer, age: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Committee</label>
                                        <select
                                            value={editingVolunteer.committee}
                                            onChange={(e) => setEditingVolunteer({ ...editingVolunteer, committee: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {db.committees.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={updateVolunteer}
                                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditingVolunteer(null)}
                                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (view === 'createEvent') {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                            <span className="font-bold text-xl text-gray-800">Create New Event</span>
                        </div>
                        <button onClick={() => setView('managerDashboard')} className="text-indigo-600 hover:text-indigo-800">
                            Back to Dashboard
                        </button>
                    </div>
                </nav>

                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                                <input
                                    type="text"
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Community Cleanup"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Committee</label>
                                <select
                                    value={newEvent.committee}
                                    onChange={(e) => setNewEvent({ ...newEvent, committee: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {db.committees.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="4"
                                    placeholder="Help clean the local park..."
                                />
                            </div>

                            <button
                                onClick={createEvent}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
                            >
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (view === 'manageEvents') {
        const upcomingEvents = db.events
            .slice()
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const getEventSignups = (eventId) =>
            db.signups.filter(s => s.eventId === eventId);

        const getVolunteerName = (volunteerId) =>
            db.volunteers.find(v => v.id === volunteerId)?.name ?? "Unknown";

        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                            <span className="font-bold text-xl text-gray-800">Manage Events</span>
                        </div>
                        <button onClick={() => setView('managerDashboard')} className="text-indigo-600 hover:text-indigo-800">
                            Back to Dashboard
                        </button>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                    {upcomingEvents.map(event => {
                        const signups = getEventSignups(event.id);

                        return (
                            <div key={event.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{event.name}</h2>
                                        <p className="text-sm text-gray-600">
                                            {new Date(event.date).toLocaleDateString()} • {event.committee}
                                        </p>
                                        {event.description && (
                                            <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-700 font-medium">
                                        Signups: {signups.length}
                                    </div>
                                </div>

                                <div className="mt-4 border-t pt-4">
                                    {signups.length === 0 ? (
                                        <p className="text-sm text-gray-500">No signups yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {signups.map(s => {
                                                const confirmed = s.status === 'confirmed';
                                                return (
                                                    <div
                                                        key={s.id}
                                                        className="flex items-center justify-between p-3 border rounded-lg"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-800">{getVolunteerName(s.volunteerId)}</p>
                                                            <p className="text-xs text-gray-500">
                                                                Signed up at: {new Date(s.signedUpAt).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        {confirmed ? (
                                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                                Confirmed ✓
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => confirmAttendance(event.id, s.volunteerId)}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                                            >
                                                                Confirm Attendance
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
export default VolunteerManagementSystem;

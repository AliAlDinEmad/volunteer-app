import React, { useState, useEffect } from "react";
import {
    Calendar,
    Users,
    Award,
    TrendingUp,
    Plus,
    Edit2,
    Clock,
    UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

/* ================= DATABASE ================= */

const initializeDatabase = () => {
    const stored = localStorage.getItem("volunteerDB");
    if (stored) return JSON.parse(stored);

    return {
        users: [
            {
                id: 1,
                email: "manager@org.com",
                password: "manager123",
                role: "manager",
                name: "Sarah Manager",
            },
            {
                id: 2,
                email: "volunteer1@email.com",
                password: "vol123",
                role: "volunteer",
                volunteerId: 1,
            },
            {
                id: 3,
                email: "volunteer2@email.com",
                password: "vol123",
                role: "volunteer",
                volunteerId: 2,
            },
        ],
        volunteers: [
            {
                id: 1,
                name: "Ahmed Hassan",
                age: 24,
                committee: "Events",
                firstParticipation: "2023-03-15",
                userId: 2,
            },
            {
                id: 2,
                name: "Fatima Ali",
                age: 22,
                committee: "Marketing",
                firstParticipation: "2023-05-20",
                userId: 3,
            },
        ],
        committees: ["Events", "Marketing", "Tech", "Outreach", "Finance"],
        events: [
            {
                id: 1,
                name: "Community Cleanup",
                date: "2026-01-20",
                committee: "Events",
                description: "Help clean the local park",
                createdBy: 1,
            },
            {
                id: 2,
                name: "Food Drive",
                date: "2026-01-25",
                committee: "Outreach",
                description: "Collect food donations",
                createdBy: 1,
            },
        ],
        signups: [
            {
                id: 1,
                eventId: 1,
                volunteerId: 1,
                signedUpAt: "2026-01-10",
                status: "signed_up",
            },
            {
                id: 2,
                eventId: 1,
                volunteerId: 2,
                signedUpAt: "2026-01-11",
                status: "confirmed",
            },
        ],
        participations: [
            {
                id: 1,
                eventId: 1,
                volunteerId: 2,
                date: "2026-01-20",
                confirmedBy: 1,
            },
        ],
    };
};

/* ================= COMPONENT ================= */

const VolunteerManagementSystem = () => {
    const [db, setDb] = useState(initializeDatabase);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState("login");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCommittee, setFilterCommittee] = useState("all");
    const [editingVolunteer, setEditingVolunteer] = useState(null);
    const [newVolunteer, setNewVolunteer] = useState({
        name: "",
        age: "",
        email: "",
        password: "",
        committee: "Events",
    });
    const createVolunteer = () => {
        if (
            !newVolunteer.name ||
            !newVolunteer.age ||
            !newVolunteer.email ||
            !newVolunteer.password
        ) {
            toast.error("Please fill all fields");
            return;
        }

        const volunteerId = Date.now();
        const userId = volunteerId + 1;

        const newDb = { ...db };

        newDb.volunteers.push({
            id: volunteerId,
            name: newVolunteer.name,
            age: parseInt(newVolunteer.age),
            committee: newVolunteer.committee,
            firstParticipation: new Date().toISOString().split("T")[0],
            userId,
        });

        newDb.users.push({
            id: userId,
            email: newVolunteer.email,
            password: newVolunteer.password,
            role: "volunteer",
            volunteerId,
        });

        setDb(newDb);

        setNewVolunteer({
            name: "",
            age: "",
            email: "",
            password: "",
            committee: "Events",
        });

        toast.success("Volunteer added successfully");
        setView("managerDashboard");
    };

    const createEvent = () => {
        if (!newEvent.name || !newEvent.date) {
            alert("Please fill in event name and date");
            return;
        }

        const newDb = { ...db };

        newDb.events.push({
            id: Date.now(),
            ...newEvent,
            createdBy: currentUser.id,
        });

        setDb(newDb);

        // reset form
        setNewEvent({
            name: "",
            date: "",
            committee: "Events",
            description: "",
        });

        setView("managerDashboard");
    };

    const [newEvent, setNewEvent] = useState({
        name: "",
        date: "",
        committee: "Events",
        description: "",
    });
    const [confirmCancelEventId, setConfirmCancelEventId] = useState(null);
    const getFilteredVolunteers = () => {
        let filtered = db.volunteers;

        if (searchTerm) {
            filtered = filtered.filter(v =>
                v.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCommittee !== "all") {
            filtered = filtered.filter(v => v.committee === filterCommittee);
        }

        return filtered;
    };

    useEffect(() => {
        localStorage.setItem("volunteerDB", JSON.stringify(db));
    }, [db]);

    const saveDb = (newDb) => setDb(newDb);
    const updateVolunteer = () => {
        const newDb = { ...db };

        newDb.volunteers = newDb.volunteers.map((v) =>
            v.id === editingVolunteer.id ? editingVolunteer : v
        );

        setDb(newDb);
        setEditingVolunteer(null);
        toast.success("Volunteer updated successfully");
    };


    /* ================= AUTH ================= */

    const login = (email, password) => {
        const user = db.users.find(
            (u) => u.email === email && u.password === password
        );

        if (user) {
            setCurrentUser(user);
            setView(user.role === "manager" ? "managerDashboard" : "volunteerDashboard");
            return true;
        }
        return false;
    };

    const handleLogin = () => {
        if (!loginEmail || !loginPassword) {
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const success = login(loginEmail, loginPassword);

            if (!success) {
                toast.error("Invalid email or password");
            } else {
                toast.success("Welcome back 👋");
            }

            setLoading(false);
        }, 600);
    };

    const logout = () => {
        setCurrentUser(null);
        setView("login");
    };



    /* ================= HELPERS ================= */

    const getCurrentVolunteer = () =>
        currentUser?.role === "volunteer"
            ? db.volunteers.find((v) => v.id === currentUser.volunteerId)
            : null;

    const getVolunteerStats = (volunteerId) => {
        const participations = db.participations.filter(
            (p) => p.volunteerId === volunteerId
        );
        const volunteer = db.volunteers.find((v) => v.id === volunteerId);

        if (!volunteer) return { total: 0, frequency: 0, firstDate: null };

        const firstDate = new Date(volunteer.firstParticipation);
        const days = Math.max(
            1,
            Math.floor((new Date() - firstDate) / (1000 * 60 * 60 * 24))
        );

        return {
            total: participations.length,
            frequency: ((participations.length / days) * 30).toFixed(1),
            firstDate: volunteer.firstParticipation,
        };
    };

    /* ================= EVENTS ================= */

    const signUpForEvent = (eventId) => {
        const volunteer = getCurrentVolunteer();
        if (!volunteer) return;

        if (db.signups.some((s) => s.eventId === eventId && s.volunteerId === volunteer.id)) {
            toast.error("You are already signed up");
            return;
        }

        saveDb({
            ...db,
            signups: [
                ...db.signups,
                {
                    id: Date.now(),
                    eventId,
                    volunteerId: volunteer.id,
                    signedUpAt: new Date().toISOString(),
                    status: "signed_up",
                },
            ],
        });

        toast.success("Signed up successfully");
    };

    const cancelSignup = (eventId) => {
        const volunteer = getCurrentVolunteer();
        if (!volunteer) return;

        saveDb({
            ...db,
            signups: db.signups.filter(
                (s) => !(s.eventId === eventId && s.volunteerId === volunteer.id)
            ),
        });

        toast.success("Event canceled");
    };

    /* ================= LOGIN VIEW ================= */

    if (view === "login") {
        return (
            <div className="min-h-screen flex flex-col font-display bg-[#f6f5f4] relative overflow-hidden">                <nav className="absolute top-0 left-0 right-0 z-10 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">△</span>
                    </div>
                    <span className="font-bold text-lg">VolunteerHub</span>
                </div>
                <div className="flex items-center gap-8">
                    <a href="#" className="text-gray-700 hover:text-gray-900">Our Mission</a>
                    <a href="#" className="text-gray-700 hover:text-gray-900">Events</a>
                    <a href="#" className="text-gray-700 hover:text-gray-900">Impact</a>
                    <button className="px-6 py-2 bg-coral-400 text-white rounded-full hover:bg-coral-500">
                        Sign Up
                    </button>
                </div>
            </nav>
                <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] bg-primary/20 rounded-full blur-3xl" />

                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 z-20">
                        {/* Header Text Section */}
                        <div className="text-center mb-8">
                            <h1 className="text-[#191110] tracking-tight text-[32px] font-bold leading-tight mb-2">
                                Ready to make an impact today?
                            </h1>
                            <p className="text-[#191110]/60 text-base font-medium">Welcome back, change-maker!</p>
                        </div>

                        <form className="space-y-5">
                            {/* Email Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#191110] text-sm font-semibold">Email Address</label>
                                <input
                                    className="w-full rounded-xl text-[#191110] border border-[#e4d6d3] bg-[#f6f5f4] focus:ring-2 focus:ring-[#e0988a] focus:border-[#e0988a] h-14 placeholder:text-[#8d6158]/50 px-4 text-base transition-all outline-none"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[#191110] text-sm font-semibold">Password</label>
                                    <a className="text-[#e0988a] text-xs font-bold hover:underline" href="#">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-xl text-[#191110] border border-[#e4d6d3] bg-[#f6f5f4] focus:ring-2 focus:ring-[#e0988a] focus:border-[#e0988a] h-14 placeholder:text-[#8d6158]/50 px-4 pr-12 text-base transition-all outline-none"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8d6158] cursor-pointer"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    className="rounded text-[#e0988a] focus:ring-[#e0988a] border-[#e4d6d3]"
                                    type="checkbox"
                                />
                                <span className="text-sm text-[#191110]/70">Remember me for 30 days</span>
                            </label>

                            {/* Action Button */}
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center rounded-xl h-14 bg-[#e0988a] text-white text-base font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#e0988a]/20"
                                type="submit"
                            >
                                {loading ? "Logging in…" : "Login to My Dashboard"}
                            </button>
                        </form>

                        {/* Social Login Divider */}
                        <div className="relative my-8 flex items-center py-2">
                            <div className="flex-grow border-t border-[#e4d6d3]"></div>
                            <span className="flex-shrink mx-4 text-xs font-bold text-[#191110]/40 uppercase tracking-widest">
                                Or continue with
                            </span>
                            <div className="flex-grow border-t border-[#e4d6d3]"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 border border-[#e4d6d3] rounded-xl h-12 hover:bg-[#f6f5f4] transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm font-semibold">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 border border-[#e4d6d3] rounded-xl h-12 hover:bg-[#f6f5f4] transition-colors">
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="text-sm font-semibold">Facebook</span>
                            </button>
                        </div>

                        {/* Signup Footer */}
                        <div className="mt-10 text-center">
                            <p className="text-sm text-[#191110]/60">
                                New here?{" "}
                                <a className="text-[#e0988a] font-bold hover:underline" href="#">Join our community</a>
                            </p>
                        </div>

                    </div> {/* closes the white card */}
                </main> {/* closes main */}

                {/* Footer Stats */}
                <footer className="p-6 text-center z-10">
                    <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-[#191110]/40 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            12.4k Active Volunteers
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            450 Verified Causes
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            1M+ Hours Logged
                        </span>
                    </div>
                </footer>
            </div>
        );
    }

    /* ================= DASHBOARDS ================= */

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
    if (view === "createVolunteer") {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Users className="w-6 h-6 text-green-600" />
                            <span className="font-bold text-xl text-gray-800">
                                Add New Volunteer
                            </span>
                        </div>
                        <button
                            onClick={() => setView("managerDashboard")}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </nav>

                <div className="max-w-xl mx-auto px-4 py-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-6 space-y-4">

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={newVolunteer.name}
                            onChange={(e) =>
                                setNewVolunteer({ ...newVolunteer, name: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                        />

                        <input
                            type="number"
                            placeholder="Age"
                            value={newVolunteer.age}
                            onChange={(e) =>
                                setNewVolunteer({ ...newVolunteer, age: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={newVolunteer.email}
                            onChange={(e) =>
                                setNewVolunteer({ ...newVolunteer, email: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={newVolunteer.password}
                            onChange={(e) =>
                                setNewVolunteer({ ...newVolunteer, password: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                        />

                        <select
                            value={newVolunteer.committee}
                            onChange={(e) =>
                                setNewVolunteer({ ...newVolunteer, committee: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            {db.committees.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={createVolunteer}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                        >
                            Add Volunteer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

}
export default VolunteerManagementSystem;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createNewConvert } from "@/lib/api";
import { ArrowLeft, UserPlus, CheckCircle, ExternalLink, AlertTriangle, Send, ChevronDown } from "lucide-react";

interface Submission { name: string; phone: string; submittedAt: string; status: "ok" | "error"; message: string; }

export default function NewConvertTestPage() {
  const router = useRouter();

  const [firstName,   setFirstName]   = useState("");
  const [middleName,  setMiddleName]  = useState("");
  const [lastName,    setLastName]    = useState("");
  const [countryCode, setCountryCode] = useState("234");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [sex,         setSex]         = useState("");
  const [street,      setStreet]      = useState("");
  const [city,        setCity]        = useState("");
  const [state,       setState]       = useState("");
  const [country,     setCountry]     = useState("Nigeria");
  const [submitting,  setSubmitting]  = useState(false);
  const [history,     setHistory]     = useState<Submission[]>([]);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      await createNewConvert({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        countryCode: countryCode.trim(),
        phoneNumber: phone.trim(),
        email: email.trim() || undefined,
        sex: sex || undefined,
        street: street.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
      });
      setHistory((p) => [{ name: `${firstName} ${lastName}`, phone, submittedAt: new Date().toLocaleTimeString(), status: "ok", message: "New convert registered successfully." }, ...p]);
      setFirstName(""); setMiddleName(""); setLastName(""); setPhone(""); setEmail(""); setSex(""); setStreet(""); setCity(""); setState("");
    } catch (e) {
      setHistory((p) => [{ name: `${firstName} ${lastName}`, phone, submittedAt: new Date().toLocaleTimeString(), status: "error", message: e instanceof Error ? e.message : "Unknown error." }, ...p]);
    } finally { setSubmitting(false); }
  };

  const inputCls = "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400";

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/test")} className="text-[#000080] dark:text-indigo-400 hover:text-[#000066]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
          <UserPlus className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold">New Convert Registration <span className="text-sm font-semibold text-green-600">[TEST]</span></h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Simulates a new convert filling the welcome card / public registration form</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Simulating public new-convert welcome card.</span>{" "}
                Calls real API. Verify in{" "}
                <button onClick={() => router.push("/user-management/new-converts")} className="font-semibold underline">New Converts</button>.
              </p>
            </div>

            <h2 className="mb-1 text-base font-bold text-[#111827] dark:text-slate-100">Welcome to the Family!</h2>
            <p className="mb-5 text-xs text-[#6B7280] dark:text-slate-400">Please fill in your details so we can stay in touch.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">First Name *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Middle Name</label>
                <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Last Name *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Gender</label>
                <div className="relative">
                  <select value={sex} onChange={(e) => setSex(e.target.value)}
                    className={`${inputCls} appearance-none pr-8`}>
                    <option value="">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Country Code</label>
                <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="234" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Phone Number *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" maxLength={10} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Street Address</label>
                <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="House number and street name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">State</label>
                <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Country</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !firstName.trim() || !lastName.trim() || !phone.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              <Send className="h-4 w-4" />
              {submitting ? "Registering…" : "Register New Convert"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">What to Verify</h3>
            <ul className="space-y-1.5 text-xs text-[#6B7280] dark:text-slate-400">
              {["Record appears in New Converts list", "Name, phone, and email are correct", "Gender is saved correctly", "Address fields are stored", "Can view full profile", "Can add call / visit notes", "Can update believers class stage", "Follow-up officer can be assigned"].map((item) => (
                <li key={item} className="flex items-start gap-1.5"><span className="mt-0.5 text-[#D1D5DB]">☐</span>{item}</li>
              ))}
            </ul>
            <button onClick={() => router.push("/user-management/new-converts")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-xs font-medium hover:bg-[#F9FAFB]">
              <ExternalLink className="h-3 w-3" /> Open New Converts Admin
            </button>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">This Session</h3>
            {history.length === 0 ? <p className="text-xs text-[#9CA3AF] dark:text-slate-400">No registrations yet.</p> : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className={`rounded-lg border px-3 py-2 text-xs ${h.status === "ok" ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}`}>
                    <div className="flex items-center gap-1.5">
                      {h.status === "ok" ? <CheckCircle className="h-3 w-3 text-green-600" /> : <AlertTriangle className="h-3 w-3 text-red-500" />}
                      <span className="font-semibold">{h.name}</span>
                    </div>
                    <p className={h.status === "ok" ? "text-green-700" : "text-red-600"}>{h.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">{h.phone} · {h.submittedAt}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

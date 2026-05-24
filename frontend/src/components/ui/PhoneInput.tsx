"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

// ─── Full world country dial-code list (alphabetical by name) ────────────────
export const COUNTRY_CODES: { code: string; name: string; flag: string }[] = [
  { flag: "🇦🇫", name: "Afghanistan",                      code: "+93"   },
  { flag: "🇦🇱", name: "Albania",                          code: "+355"  },
  { flag: "🇩🇿", name: "Algeria",                          code: "+213"  },
  { flag: "🇦🇩", name: "Andorra",                          code: "+376"  },
  { flag: "🇦🇴", name: "Angola",                           code: "+244"  },
  { flag: "🇦🇬", name: "Antigua & Barbuda",                code: "+1268" },
  { flag: "🇦🇷", name: "Argentina",                        code: "+54"   },
  { flag: "🇦🇲", name: "Armenia",                          code: "+374"  },
  { flag: "🇦🇺", name: "Australia",                        code: "+61"   },
  { flag: "🇦🇹", name: "Austria",                          code: "+43"   },
  { flag: "🇦🇿", name: "Azerbaijan",                       code: "+994"  },
  { flag: "🇧🇸", name: "Bahamas",                          code: "+1242" },
  { flag: "🇧🇭", name: "Bahrain",                          code: "+973"  },
  { flag: "🇧🇩", name: "Bangladesh",                       code: "+880"  },
  { flag: "🇧🇧", name: "Barbados",                         code: "+1246" },
  { flag: "🇧🇾", name: "Belarus",                          code: "+375"  },
  { flag: "🇧🇪", name: "Belgium",                          code: "+32"   },
  { flag: "🇧🇿", name: "Belize",                           code: "+501"  },
  { flag: "🇧🇯", name: "Benin",                            code: "+229"  },
  { flag: "🇧🇹", name: "Bhutan",                           code: "+975"  },
  { flag: "🇧🇴", name: "Bolivia",                          code: "+591"  },
  { flag: "🇧🇦", name: "Bosnia & Herzegovina",             code: "+387"  },
  { flag: "🇧🇼", name: "Botswana",                         code: "+267"  },
  { flag: "🇧🇷", name: "Brazil",                           code: "+55"   },
  { flag: "🇧🇳", name: "Brunei",                           code: "+673"  },
  { flag: "🇧🇬", name: "Bulgaria",                         code: "+359"  },
  { flag: "🇧🇫", name: "Burkina Faso",                     code: "+226"  },
  { flag: "🇧🇮", name: "Burundi",                          code: "+257"  },
  { flag: "🇨🇻", name: "Cabo Verde",                       code: "+238"  },
  { flag: "🇰🇭", name: "Cambodia",                         code: "+855"  },
  { flag: "🇨🇲", name: "Cameroon",                         code: "+237"  },
  { flag: "🇨🇦", name: "Canada",                           code: "+1"    },
  { flag: "🇨🇫", name: "Central African Republic",         code: "+236"  },
  { flag: "🇹🇩", name: "Chad",                             code: "+235"  },
  { flag: "🇨🇱", name: "Chile",                            code: "+56"   },
  { flag: "🇨🇳", name: "China",                            code: "+86"   },
  { flag: "🇨🇴", name: "Colombia",                         code: "+57"   },
  { flag: "🇰🇲", name: "Comoros",                          code: "+269"  },
  { flag: "🇨🇬", name: "Congo (Republic)",                 code: "+242"  },
  { flag: "🇨🇩", name: "Congo (DR)",                       code: "+243"  },
  { flag: "🇨🇷", name: "Costa Rica",                       code: "+506"  },
  { flag: "🇭🇷", name: "Croatia",                          code: "+385"  },
  { flag: "🇨🇺", name: "Cuba",                             code: "+53"   },
  { flag: "🇨🇾", name: "Cyprus",                           code: "+357"  },
  { flag: "🇨🇿", name: "Czech Republic",                   code: "+420"  },
  { flag: "🇩🇰", name: "Denmark",                          code: "+45"   },
  { flag: "🇩🇯", name: "Djibouti",                         code: "+253"  },
  { flag: "🇩🇲", name: "Dominica",                         code: "+1767" },
  { flag: "🇩🇴", name: "Dominican Republic",               code: "+1849" },
  { flag: "🇪🇨", name: "Ecuador",                          code: "+593"  },
  { flag: "🇪🇬", name: "Egypt",                            code: "+20"   },
  { flag: "🇸🇻", name: "El Salvador",                      code: "+503"  },
  { flag: "🇬🇶", name: "Equatorial Guinea",                code: "+240"  },
  { flag: "🇪🇷", name: "Eritrea",                          code: "+291"  },
  { flag: "🇪🇪", name: "Estonia",                          code: "+372"  },
  { flag: "🇸🇿", name: "Eswatini",                         code: "+268"  },
  { flag: "🇪🇹", name: "Ethiopia",                         code: "+251"  },
  { flag: "🇫🇯", name: "Fiji",                             code: "+679"  },
  { flag: "🇫🇮", name: "Finland",                          code: "+358"  },
  { flag: "🇫🇷", name: "France",                           code: "+33"   },
  { flag: "🇬🇦", name: "Gabon",                            code: "+241"  },
  { flag: "🇬🇲", name: "Gambia",                           code: "+220"  },
  { flag: "🇬🇪", name: "Georgia",                          code: "+995"  },
  { flag: "🇩🇪", name: "Germany",                          code: "+49"   },
  { flag: "🇬🇭", name: "Ghana",                            code: "+233"  },
  { flag: "🇬🇷", name: "Greece",                           code: "+30"   },
  { flag: "🇬🇩", name: "Grenada",                          code: "+1473" },
  { flag: "🇬🇹", name: "Guatemala",                        code: "+502"  },
  { flag: "🇬🇳", name: "Guinea",                           code: "+224"  },
  { flag: "🇬🇼", name: "Guinea-Bissau",                    code: "+245"  },
  { flag: "🇬🇾", name: "Guyana",                           code: "+592"  },
  { flag: "🇭🇹", name: "Haiti",                            code: "+509"  },
  { flag: "🇭🇳", name: "Honduras",                         code: "+504"  },
  { flag: "🇭🇺", name: "Hungary",                          code: "+36"   },
  { flag: "🇮🇸", name: "Iceland",                          code: "+354"  },
  { flag: "🇮🇳", name: "India",                            code: "+91"   },
  { flag: "🇮🇩", name: "Indonesia",                        code: "+62"   },
  { flag: "🇮🇷", name: "Iran",                             code: "+98"   },
  { flag: "🇮🇶", name: "Iraq",                             code: "+964"  },
  { flag: "🇮🇪", name: "Ireland",                          code: "+353"  },
  { flag: "🇮🇱", name: "Israel",                           code: "+972"  },
  { flag: "🇮🇹", name: "Italy",                            code: "+39"   },
  { flag: "🇯🇲", name: "Jamaica",                          code: "+1876" },
  { flag: "🇯🇵", name: "Japan",                            code: "+81"   },
  { flag: "🇯🇴", name: "Jordan",                           code: "+962"  },
  { flag: "🇰🇿", name: "Kazakhstan",                       code: "+77"   },
  { flag: "🇰🇪", name: "Kenya",                            code: "+254"  },
  { flag: "🇰🇮", name: "Kiribati",                         code: "+686"  },
  { flag: "🇽🇰", name: "Kosovo",                           code: "+383"  },
  { flag: "🇰🇼", name: "Kuwait",                           code: "+965"  },
  { flag: "🇰🇬", name: "Kyrgyzstan",                       code: "+996"  },
  { flag: "🇱🇦", name: "Laos",                             code: "+856"  },
  { flag: "🇱🇻", name: "Latvia",                           code: "+371"  },
  { flag: "🇱🇧", name: "Lebanon",                          code: "+961"  },
  { flag: "🇱🇸", name: "Lesotho",                          code: "+266"  },
  { flag: "🇱🇷", name: "Liberia",                          code: "+231"  },
  { flag: "🇱🇾", name: "Libya",                            code: "+218"  },
  { flag: "🇱🇮", name: "Liechtenstein",                    code: "+423"  },
  { flag: "🇱🇹", name: "Lithuania",                        code: "+370"  },
  { flag: "🇱🇺", name: "Luxembourg",                       code: "+352"  },
  { flag: "🇲🇬", name: "Madagascar",                       code: "+261"  },
  { flag: "🇲🇼", name: "Malawi",                           code: "+265"  },
  { flag: "🇲🇾", name: "Malaysia",                         code: "+60"   },
  { flag: "🇲🇻", name: "Maldives",                         code: "+960"  },
  { flag: "🇲🇱", name: "Mali",                             code: "+223"  },
  { flag: "🇲🇹", name: "Malta",                            code: "+356"  },
  { flag: "🇲🇭", name: "Marshall Islands",                 code: "+692"  },
  { flag: "🇲🇷", name: "Mauritania",                       code: "+222"  },
  { flag: "🇲🇺", name: "Mauritius",                        code: "+230"  },
  { flag: "🇲🇽", name: "Mexico",                           code: "+52"   },
  { flag: "🇫🇲", name: "Micronesia",                       code: "+691"  },
  { flag: "🇲🇩", name: "Moldova",                          code: "+373"  },
  { flag: "🇲🇨", name: "Monaco",                           code: "+377"  },
  { flag: "🇲🇳", name: "Mongolia",                         code: "+976"  },
  { flag: "🇲🇪", name: "Montenegro",                       code: "+382"  },
  { flag: "🇲🇦", name: "Morocco",                          code: "+212"  },
  { flag: "🇲🇿", name: "Mozambique",                       code: "+258"  },
  { flag: "🇲🇲", name: "Myanmar",                          code: "+95"   },
  { flag: "🇳🇦", name: "Namibia",                          code: "+264"  },
  { flag: "🇳🇷", name: "Nauru",                            code: "+674"  },
  { flag: "🇳🇵", name: "Nepal",                            code: "+977"  },
  { flag: "🇳🇱", name: "Netherlands",                      code: "+31"   },
  { flag: "🇳🇿", name: "New Zealand",                      code: "+64"   },
  { flag: "🇳🇮", name: "Nicaragua",                        code: "+505"  },
  { flag: "🇳🇪", name: "Niger",                            code: "+227"  },
  { flag: "🇳🇬", name: "Nigeria",                          code: "+234"  },
  { flag: "🇲🇰", name: "North Macedonia",                  code: "+389"  },
  { flag: "🇳🇴", name: "Norway",                           code: "+47"   },
  { flag: "🇴🇲", name: "Oman",                             code: "+968"  },
  { flag: "🇵🇰", name: "Pakistan",                         code: "+92"   },
  { flag: "🇵🇼", name: "Palau",                            code: "+680"  },
  { flag: "🇵🇸", name: "Palestine",                        code: "+970"  },
  { flag: "🇵🇦", name: "Panama",                           code: "+507"  },
  { flag: "🇵🇬", name: "Papua New Guinea",                 code: "+675"  },
  { flag: "🇵🇾", name: "Paraguay",                         code: "+595"  },
  { flag: "🇵🇪", name: "Peru",                             code: "+51"   },
  { flag: "🇵🇭", name: "Philippines",                      code: "+63"   },
  { flag: "🇵🇱", name: "Poland",                           code: "+48"   },
  { flag: "🇵🇹", name: "Portugal",                         code: "+351"  },
  { flag: "🇶🇦", name: "Qatar",                            code: "+974"  },
  { flag: "🇷🇴", name: "Romania",                          code: "+40"   },
  { flag: "🇷🇺", name: "Russia",                           code: "+7"    },
  { flag: "🇷🇼", name: "Rwanda",                           code: "+250"  },
  { flag: "🇰🇳", name: "Saint Kitts & Nevis",              code: "+1869" },
  { flag: "🇱🇨", name: "Saint Lucia",                      code: "+1758" },
  { flag: "🇻🇨", name: "Saint Vincent & the Grenadines",   code: "+1784" },
  { flag: "🇼🇸", name: "Samoa",                            code: "+685"  },
  { flag: "🇸🇲", name: "San Marino",                       code: "+378"  },
  { flag: "🇸🇹", name: "São Tomé & Príncipe",              code: "+239"  },
  { flag: "🇸🇦", name: "Saudi Arabia",                     code: "+966"  },
  { flag: "🇸🇳", name: "Senegal",                          code: "+221"  },
  { flag: "🇷🇸", name: "Serbia",                           code: "+381"  },
  { flag: "🇸🇨", name: "Seychelles",                       code: "+248"  },
  { flag: "🇸🇱", name: "Sierra Leone",                     code: "+232"  },
  { flag: "🇸🇬", name: "Singapore",                        code: "+65"   },
  { flag: "🇸🇰", name: "Slovakia",                         code: "+421"  },
  { flag: "🇸🇮", name: "Slovenia",                         code: "+386"  },
  { flag: "🇸🇧", name: "Solomon Islands",                  code: "+677"  },
  { flag: "🇸🇴", name: "Somalia",                          code: "+252"  },
  { flag: "🇿🇦", name: "South Africa",                     code: "+27"   },
  { flag: "🇸🇸", name: "South Sudan",                      code: "+211"  },
  { flag: "🇪🇸", name: "Spain",                            code: "+34"   },
  { flag: "🇱🇰", name: "Sri Lanka",                        code: "+94"   },
  { flag: "🇸🇩", name: "Sudan",                            code: "+249"  },
  { flag: "🇸🇷", name: "Suriname",                         code: "+597"  },
  { flag: "🇸🇪", name: "Sweden",                           code: "+46"   },
  { flag: "🇨🇭", name: "Switzerland",                      code: "+41"   },
  { flag: "🇸🇾", name: "Syria",                            code: "+963"  },
  { flag: "🇹🇼", name: "Taiwan",                           code: "+886"  },
  { flag: "🇹🇯", name: "Tajikistan",                       code: "+992"  },
  { flag: "🇹🇿", name: "Tanzania",                         code: "+255"  },
  { flag: "🇹🇭", name: "Thailand",                         code: "+66"   },
  { flag: "🇹🇱", name: "Timor-Leste",                      code: "+670"  },
  { flag: "🇹🇬", name: "Togo",                             code: "+228"  },
  { flag: "🇹🇴", name: "Tonga",                            code: "+676"  },
  { flag: "🇹🇹", name: "Trinidad & Tobago",                code: "+1868" },
  { flag: "🇹🇳", name: "Tunisia",                          code: "+216"  },
  { flag: "🇹🇷", name: "Turkey",                           code: "+90"   },
  { flag: "🇹🇲", name: "Turkmenistan",                     code: "+993"  },
  { flag: "🇹🇻", name: "Tuvalu",                           code: "+688"  },
  { flag: "🇺🇬", name: "Uganda",                           code: "+256"  },
  { flag: "🇺🇦", name: "Ukraine",                          code: "+380"  },
  { flag: "🇦🇪", name: "United Arab Emirates",             code: "+971"  },
  { flag: "🇬🇧", name: "United Kingdom",                   code: "+44"   },
  { flag: "🇺🇸", name: "United States",                    code: "+1"    },
  { flag: "🇺🇾", name: "Uruguay",                          code: "+598"  },
  { flag: "🇺🇿", name: "Uzbekistan",                       code: "+998"  },
  { flag: "🇻🇺", name: "Vanuatu",                          code: "+678"  },
  { flag: "🇻🇦", name: "Vatican City",                     code: "+379"  },
  { flag: "🇻🇪", name: "Venezuela",                        code: "+58"   },
  { flag: "🇻🇳", name: "Vietnam",                          code: "+84"   },
  { flag: "🇾🇪", name: "Yemen",                            code: "+967"  },
  { flag: "🇿🇲", name: "Zambia",                           code: "+260"  },
  { flag: "🇿🇼", name: "Zimbabwe",                         code: "+263"  },
];

// ─── Searchable country-code picker ──────────────────────────────────────────

interface CodePickerProps {
  value: string;
  onChange: (code: string) => void;
  name?: string;
}

function CountryCodePicker({ value, onChange, name }: CodePickerProps) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.code === value) ?? COUNTRY_CODES[0];

  const filtered = query.trim()
    ? COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.includes(query),
      )
    : COUNTRY_CODES;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden input so form serialisation picks up the value */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`flex h-[46px] w-full items-center justify-between gap-1 rounded-lg border bg-white dark:bg-slate-800 px-2 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors ${
          open
            ? "border-[#000080] ring-1 ring-[#000080]"
            : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#9CA3AF]"
        }`}
        aria-label="Select country code"
        aria-expanded={open}
      >
        <span className="truncate text-sm font-medium">
          {selected.flag} {selected.code}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#9CA3AF] dark:text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown — fixed width, opens below/above trigger */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-[#F3F4F6] dark:border-slate-700 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#9CA3AF] dark:text-slate-500" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              className="flex-1 bg-transparent text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                <X className="h-3.5 w-3.5 text-[#9CA3AF] dark:text-slate-400 hover:text-[#374151]" />
              </button>
            )}
          </div>

          {/* Options */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-center text-xs text-[#9CA3AF] dark:text-slate-500">
                No results for &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((c) => (
                <li
                  key={`${c.name}-${c.code}`}
                  role="option"
                  aria-selected={c.code === value}
                  onClick={() => { onChange(c.code); setOpen(false); setQuery(""); }}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    c.code === value
                      ? "bg-[#EFF6FF] dark:bg-indigo-900/30 font-medium text-[#000080] dark:text-indigo-400"
                      : "text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB] dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 text-xs text-[#9CA3AF] dark:text-slate-500">{c.code}</span>
                </li>
              ))
            )}
          </ul>

          {/* Footer count */}
          <div className="border-t border-[#F3F4F6] dark:border-slate-700 px-3 py-1.5 text-center text-[10px] text-[#9CA3AF] dark:text-slate-500">
            {filtered.length} of {COUNTRY_CODES.length} countries
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PhoneInput ───────────────────────────────────────────────────────────────

interface PhoneInputProps {
  label: string;
  required?: boolean;
  code: string;
  number: string;
  onCodeChange: (code: string) => void;
  onNumberChange: (number: string) => void;
  codeName?: string;
  numberName?: string;
  placeholder?: string;
  className?: string;
}

const sharedStyles =
  "h-[46px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function PhoneInput({
  label,
  required,
  code,
  number,
  onCodeChange,
  onNumberChange,
  codeName = "countryCode",
  numberName = "phone",
  placeholder = "Enter phone number",
  className = "",
}: PhoneInputProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {/* Grid: 120px for searchable code picker; rest for number input */}
      <div
        className="grid items-stretch gap-2"
        style={{ gridTemplateColumns: "120px minmax(0, 1fr)" }}
      >
        <CountryCodePicker
          value={code}
          onChange={onCodeChange}
          name={codeName}
        />

        <input
          type="tel"
          name={numberName}
          value={number}
          onChange={(e) => {
            let digits = e.target.value.replace(/\D/g, "");
            if (digits.startsWith("0")) digits = digits.slice(1);
            const maxDigits = code === "+234" ? 10 : 15;
            digits = digits.slice(0, maxDigits);
            onNumberChange(digits);
          }}
          placeholder={placeholder}
          required={required}
          maxLength={code === "+234" ? 10 : 15}
          className={`${sharedStyles} w-full px-4 bg-white dark:bg-slate-800`}
        />

        <p className="col-span-full mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">
          Do not include the leading 0 (e.g. enter 8132577456 not 08132577456)
        </p>
      </div>
    </div>
  );
}

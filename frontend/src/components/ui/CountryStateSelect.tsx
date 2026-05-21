"use client";

import SearchableSelect from "./SearchableSelect";
import { COUNTRIES, getStatesForCountry } from "@/lib/nigeria-states";

interface CountryStateSelectProps {
  country: string;
  state: string;
  onCountryChange: (c: string) => void;
  onStateChange: (s: string) => void;
  labelStyles: string;
  inputStyles: string;
}

export default function CountryStateSelect({
  country,
  state,
  onCountryChange,
  onStateChange,
  labelStyles,
  inputStyles,
}: CountryStateSelectProps) {
  const stateOptions = getStatesForCountry(country);

  const handleCountryChange = (c: string) => {
    onCountryChange(c);
    onStateChange("");
  };

  return (
    <>
      <div>
        <label className={labelStyles}>Country</label>
        <SearchableSelect
          placeholder="Select Country"
          searchPlaceholder="Search countries..."
          options={COUNTRIES}
          value={country}
          onChange={handleCountryChange}
        />
      </div>
      <div>
        <label className={labelStyles}>State / Province</label>
        {stateOptions.length > 0 ? (
          <SearchableSelect
            placeholder={country ? "Select State" : "Select a country first"}
            searchPlaceholder="Search states..."
            options={stateOptions}
            value={state}
            onChange={onStateChange}
            disabled={!country}
          />
        ) : (
          <input
            type="text"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            placeholder={country ? "Enter state / province" : "Select a country first"}
            disabled={!country}
            className={`${inputStyles} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-slate-700/50`}
          />
        )}
      </div>
    </>
  );
}

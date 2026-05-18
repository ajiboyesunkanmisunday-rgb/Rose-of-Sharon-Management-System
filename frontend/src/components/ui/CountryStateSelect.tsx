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
            placeholder="Select State"
            searchPlaceholder="Search states..."
            options={stateOptions}
            value={state}
            onChange={onStateChange}
          />
        ) : (
          <input
            type="text"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            placeholder="Enter State / Province"
            className={inputStyles}
          />
        )}
      </div>
    </>
  );
}

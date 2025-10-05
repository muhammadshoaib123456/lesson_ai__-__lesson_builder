"use client";

import Select from "react-select";

export function FormSelect({
  label,
  name,
  options,
  value,
  onChange,
  register,
  loading = false,
  error,
  useLabelAsValue = false,
  ...props
}) {
  // Tailwind-inspired custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#7C3AED" : "#A78BFA",
      borderRadius: "1.5rem", // rounded-3xl
      boxShadow: state.isFocused ? "0 0 0 2px rgba(124,58,237,0.5)" : "none",
      "&:hover": { borderColor: "#6D28D9", cursor: "pointer" },
      minHeight: "40px",
      paddingLeft: "0.25rem",
      paddingRight: "0.25rem",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.875rem",
      color: state.isSelected ? "#6D28D9" : "#7C3AED",
      backgroundColor: state.isSelected ? "#F3F4F6" : "#FFFFFF",
      "&:hover": {
        backgroundColor: "#F3F4F6",
        color: "#6D28D9",
        cursor: "pointer",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#7C3AED",
      fontSize: "0.875rem",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#6D28D9",
      fontWeight: 500,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? "#6D28D9" : "#7C3AED",
      "&:hover": { color: "#6D28D9" },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.75rem",
      border: "1px solid #E5E7EB",
      marginTop: "0.5rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    }),
  };

  // Determine the currently selected option.  Allow the caller to pass
  // either the full option object or just a string/ID.  When a string
  // is provided, attempt to match on the option value or label.
  const selectedOption =
    value && typeof value === "object"
      ? value
      : options?.find((opt) => opt.value === value || opt.label === value) || null;

  return (
    <div className="mb-2 w-4/5">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block mb-2 text-sm text-purple-600 font-medium">
          {label}
        </label>
      )}

      {/* React Select Dropdown */}
      <Select
        id={name}
        options={options || []}
        value={selectedOption}
        onChange={(selected) => {
          // Invoke the external onChange handler with the full selected option
          if (onChange) onChange(selected);
          // Integrate with react-hook-form by manually triggering register onChange
          if (register && typeof register === "function") {
            const field = register(name);
            if (field?.onChange) {
              field.onChange({
                target: {
                  name,
                  value: useLabelAsValue
                    ? selected?.label ?? ""
                    : selected?.value ?? "",
                },
              });
            }
          }
        }}
        styles={customStyles}
        placeholder={props.placeholder}
        isLoading={loading}
        noOptionsMessage={() => (loading ? "Loading..." : "No options found")}
        {...props}
      />

      {/* Validation/Error Message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

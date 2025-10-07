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
  // Updated custom styles to match form component UI
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#9333ea",
      borderRadius: "1.5rem",
      boxShadow: "none",
      minHeight: "2.75rem",
      height: "2.75rem",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      "&:hover": { borderColor: "#6b21a8", cursor: "pointer" },
      display: "flex",
      alignItems: "center",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "#6b21a8" : "#9333ea",
      backgroundColor: state.isSelected ? "#f3e8ff" : "#ffffff",
      "&:hover": {
        backgroundColor: "#f3e8ff",
        color: "#6b21a8",
        cursor: "pointer",
      },
    }),
    placeholder: (p) => ({ ...p, color: "#9333ea" }),
    singleValue: (p) => ({ ...p, color: "#6b21a8" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (p) => ({
      ...p,
      color: "#9333ea",
      "&:hover": { color: "#6b21a8" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 999999 }),
    menu: (base) => ({ ...base, zIndex: 999999 }),
  };

  const selectedOption =
    value && typeof value === "object"
      ? value
      : options?.find((opt) => opt.value === value || opt.label === value) || null;

  return (
    <div className="mb-4 w-full">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block mb-2 text-sm text-purple-primary font-medium">
          {label}
        </label>
      )}

      {/* Updated select UI */}
      <Select
        id={name}
        options={options || []}
        value={selectedOption}
        onChange={(selected) => {
          if (onChange) onChange(selected);
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
        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
        {...props}
      />

      {/* Error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

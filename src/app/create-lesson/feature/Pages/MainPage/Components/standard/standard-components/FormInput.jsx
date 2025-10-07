"use client";

export function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  ...props
}) {
  const { onChange: customOnChange, value: controlledValue, ...validationRules } = props;
  const registration = register ? register(name, { ...validationRules }) : {};
  const { onChange: registrationOnChange, ...registrationRest } = registration;

  return (
    <div className="mb-4 w-full">
      {/* Label */}
      <label htmlFor={name} className="block mb-2">
        <span className="text-sm text-purple-primary font-medium">{label}</span>
      </label>

      {/* Updated input UI */}
      <input
        type={type}
        id={name}
        className={`block w-full rounded-3xl border bg-white px-4 py-2 text-sm shadow-sm
                    border-purple-600 text-purple-primary placeholder-purple-400
                    focus:outline-none
                    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
        placeholder={placeholder}
        {...(controlledValue !== undefined ? { value: controlledValue } : {})}
        {...registrationRest}
        onChange={(e) => {
          if (typeof customOnChange === "function") customOnChange(e);
          if (typeof registrationOnChange === "function") registrationOnChange(e);
        }}
      />

      {/* Error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

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
  /*
   * When a custom onChange or value is passed to this component we need
   * to ensure both the react-hook-form registration and the custom
   * handler are invoked.  Destructure the register properties once
   * here, and then manually wire up the onChange chain.  Any
   * additional props (such as required, maxLength, etc.) are passed
   * into the register options.
   */
  // Extract potential handlers and values from the remaining props
  const { onChange: customOnChange, value: controlledValue, ...validationRules } = props;
  // Register the field with any validation rules provided
  const registration = register ? register(name, { ...validationRules }) : {};
  // Destructure the onChange from react‑hook‑form so we can call it manually
  const { onChange: registrationOnChange, ...registrationRest } = registration;
  return (
    <div className="mb-2 w-4/5">
      {/* Label */}
      <label htmlFor={name} className="w-full flex mb-2">
        <span className="text-sm flex text-purple-600 items-center justify-start w-full font-medium">
          {label}
        </span>
      </label>
      {/* Input field */}
      <input
        type={type}
        id={name}
        className={`text-base min-h-[40px] font-semibold rounded-3xl border w-full px-3 py-2 focus:outline-none 
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          ${error
            ? "border-red-500 placeholder-red-400"
            : "border-purple-300 text-purple-700 placeholder-gray-400"}`}
        placeholder={placeholder}
        // Provide a controlled value if supplied; otherwise allow
        // react-hook-form to manage the input state
        {...(controlledValue !== undefined ? { value: controlledValue } : {})}
        // Spread the registration props (minus onChange) before our handlers
        {...registrationRest}
        // Combine our custom onChange with the react-hook-form handler
        onChange={(e) => {
          // Invoke any custom handler supplied via props
          if (typeof customOnChange === "function") {
            customOnChange(e);
          }
          // Then call into react-hook-form's onChange to update the field value
          if (typeof registrationOnChange === "function") {
            registrationOnChange(e);
          }
        }}
      />
      {/* Error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

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
        {...register(name, { ...props })}
      />

      {/* Error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

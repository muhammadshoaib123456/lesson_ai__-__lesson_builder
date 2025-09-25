"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

export function FormSlider({
  label,
  name,
  max,
  min,
  register,
  error,
  ...props
}) {
  max = parseInt(max);
  min = parseInt(min);
  const array = Array.from(Array(max - min - 1).keys());

  return (
    <div className="mb-2">
      <label htmlFor={name} className="w-full flex mb-2">
        <span className="text-sm flex items-center justify-start text-gray-900 w-full text-start">
          {label}
        </span>
      </label>

      {/* Tailwind-only slider (no DaisyUI) */}
      <input
        type="range"
        min={min}
        max={max}
        id={name}
        defaultValue={((max + min) / 2).toString()}
        step="1"
        className="w-full h-2 rounded-lg bg-gray-200 accent-purple-600 cursor-pointer"
        {...register(name, props)}
      />

      <div className="flex justify-center">
        <div className="w-full flex justify-between px-2">
          <span className="text-xs">{min}</span>
          {array.map((item, index) => {
            if (item === parseInt((max - min - 1) / 2)) {
              return (
                <span key={index} className="text-xs">
                  {(max + min) / 2}
                </span>
              );
            } else {
              return (
                <span className="text-[7px]" key={index}>
                  |
                </span>
              );
            }
          })}
          <span className="text-xs">{max}</span>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  className = "",
  ...inputProps
}) {
  return (
    <div className="mb-4 w-full">
      <label htmlFor={name} className="block mb-2">
        <span className="text-sm text-purple-primary font-medium">{label}</span>
      </label>

      {/* Tailwind-only input matching the react-select look */}
      <input
        type={type}
        id={name}
        className={`block w-full rounded-3xl border bg-white px-4 py-2 text-sm shadow-sm
                    border-purple-600 text-purple-primary placeholder-purple-400
                    focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-purple-700
                    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
                    ${className}`}
        placeholder={placeholder}
        {...(register ? register(name) : {})}
        {...inputProps}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function FormRadioGroup({
  label,
  name,
  options,
  register,
  error,
  ...props
}) {
  return (
    <div className="flex mt-5 flex-col">
      <h1 className="w-full flex mb-2 text-sm">{label}</h1>
      <ul className="grid w-full gap-6 md:grid-cols-3 mb-2">
        {options.map((option, index) => (
          <li key={index}>
            <input
              type="radio"
              id={option.value}
              name={name}
              value={option.value}
              className="hidden peer"
              {...register(name, { ...props })}
              defaultChecked={option.value === "medium"}
            />
            <label
              htmlFor={option.value}
              className={`inline-flex items-center justify-center w-full p-0.5 rounded-lg cursor-pointer
                          border-2 border-slate-300 text-slate-800 bg-white
                          hover:text-gray-600 hover:bg-gray-100
                          peer-checked:text-white
                          ${
                            option.value === "easy"
                              ? "peer-checked:border-green-600 peer-checked:bg-green-600"
                              : option.value === "medium"
                              ? "peer-checked:border-blue-600 peer-checked:bg-blue-600"
                              : "peer-checked:border-red-600 peer-checked:bg-red-600"
                          }`}
            >
              <div className="block">
                <span className="w-full text-lg">{option.label}</span>
              </div>
            </label>
          </li>
        ))}
      </ul>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function FormSelect({
  label,
  name,
  options: optionsPromise,
  value,
  onChange,
  register,
  error,
  ...props
}) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    Promise.resolve(optionsPromise)
      .then((resolvedOptions) => {
        setOptions(
          resolvedOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching options:", err);
        setOptions([]);
      });
  }, [optionsPromise]);

  // Tailwind-look via react-select customStyles (colors mirror inputs)
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#9333ea", // purple-600
      borderRadius: "1.5rem",
      boxShadow: "none",
      minHeight: "2.75rem",
      height: "2.75rem",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      "&:hover": {
        borderColor: "#6b21a8", // purple-800
        cursor: "pointer",
      },
      display: "flex",
      alignItems: "center",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "#6b21a8" : "#9333ea",
      backgroundColor: state.isSelected ? "#f3e8ff" : "#ffffff", // purple-100
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
  };

  return (
    <div className="mb-4 w-full">
      <label
        htmlFor={name}
        className="block mb-2 text-sm text-purple-primary font-medium"
      >
        {label}
      </label>
      <Select
        id={name}
        options={options}
        value={options.find((opt) => opt.value === value)}
        onChange={(selectedOption) => {
          onChange(selectedOption);
          if (register) {
            register(name).onChange({
              target: { name, value: selectedOption.value },
            });
          }
        }}
        styles={customStyles}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function FormSelectDisabled({ label, name }) {
  return (
    <div className="mb-2">
      <label htmlFor={name} className="block mb-2 text-sm text-gray-900">
        {label}
      </label>
      {/* Tailwind-only disabled select look-alike */}
      <div className="w-full rounded-3xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-400 capitalize cursor-not-allowed">
        {/* intentionally empty placeholder box to match layout */}
      </div>
    </div>
  );
}

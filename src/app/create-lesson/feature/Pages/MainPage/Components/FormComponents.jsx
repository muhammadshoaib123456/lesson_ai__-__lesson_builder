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
      <input
        type="range"
        min={min}
        max={max}
        className="range range-primary range-sm"
        id={name}
        defaultValue={((max + min) / 2).toString()}
        step="1"
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
  type,
  placeholder,
  register,
  error,
  ...props
}) {
  return (
    <div className="mb-4 w-full">
      <label htmlFor={name} className="block mb-2">
        <span className="text-sm text-purple-primary font-wide">
          {label}
        </span>
      </label>
      <input
        type={type}
        id={name}
        className={`input input-bordered input-md text-purple-primary rounded-3xl border-purple-secondary w-full ${
          error ? 'input-error' : ''
        }`}
        placeholder={placeholder}
        {...register(name, { ...props })}
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
            {option.value === "easy" ? (
              <>
                <input
                  type="radio"
                  id={option.value}
                  name={name}
                  value={option.value}
                  className="hidden peer"
                  {...register(name, { ...props })}
                />
                <label
                  htmlFor={option.value}
                  className="inline-flex items-center border-2 border-slate-300 justify-center w-full p-0.5 text-slate-800 bg-white rounded-lg cursor-pointer peer-checked:border-green-600 peer-checked:text-green-600 hover:text-gray-600 hover:bg-gray-100"
                >
                  <div className="block">
                    <span className="w-full text-lg">{option.label}</span>
                  </div>
                </label>
              </>
            ) : option.value === "medium" ? (
              <>
                <input
                  type="radio"
                  id={option.value}
                  name={name}
                  value={option.value}
                  className="hidden peer"
                  defaultChecked
                  {...register(name, { ...props })}
                />
                <label
                  htmlFor={option.value}
                  className="inline-flex items-center border-2 border-slate-300 justify-center w-full p-0.5 text-slate-800 bg-white rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100"
                >
                  <div className="block">
                    <span className="w-full text-lg">{option.label}</span>
                  </div>
                </label>
              </>
            ) : option.value === "hard" ? (
              <>
                <input
                  type="radio"
                  id={option.value}
                  name={name}
                  value={option.value}
                  className="hidden peer"
                  {...register(name, { ...props })}
                />
                <label
                  htmlFor={option.value}
                  className="inline-flex items-center border-2 border-slate-300 justify-center w-full p-0.5 text-slate-800 bg-white rounded-lg cursor-pointer peer-checked:border-red-600 peer-checked:text-red-600 hover:text-gray-600 hover:bg-gray-100"
                >
                  <div className="block">
                    <span className="w-full text-lg">{option.label}</span>
                  </div>
                </label>
              </>
            ) : null}
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

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#9500DE",
      borderRadius: "1.5rem",
      boxShadow: "none",
      minHeight: "2.75rem", // enlarge the select height to better match design
      height: "2.75rem",
      "&:hover": {
        borderColor: "#500078",
        cursor: "pointer",
      },
      display: "flex",
      alignItems: "center",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "#500078" : "#9500DE",
      backgroundColor: state.isSelected ? "#E5E7EB" : "#FFFFFF",
      "&:hover": {
        backgroundColor: "#E5E7EB",
        color: "#500078",
        cursor: "pointer",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#500078",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#500078",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#9500DE",
      "&:hover": {
        color: "#500078",
      },
    }),
  };

  return (
    <div className="mb-4 w-full">
      <label
        htmlFor={name}
        className="block mb-2 text-sm text-purple-primary font-wide"
      >
        {label}
      </label>
      <Select
        id={name}
        options={options}
        value={options.find((opt) => opt.value === value)}
        onChange={(selectedOption) => {
          onChange(selectedOption);
          register(name).onChange({
            target: { name, value: selectedOption.value },
          });
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
      <select
        className="bg-gray-50 border select select-bordered select-sm w-full capitalize"
        disabled={true}
      ></select>
    </div>
  );
}
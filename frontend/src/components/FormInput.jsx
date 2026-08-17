const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  icon: Icon,
}) => {
  return (
    <div>
      <label htmlFor={name} className="label-text">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon size={16} />
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`input-field ${Icon ? "pl-9" : ""}`}
        />
      </div>
    </div>
  );
};

export default FormInput;

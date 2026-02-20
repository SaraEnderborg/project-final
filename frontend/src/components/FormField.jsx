const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  required = false,
}) => {
  return (
    <label>
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
      />
      {error && <p>{error}</p>}
    </label>
  );
};

export default FormField;

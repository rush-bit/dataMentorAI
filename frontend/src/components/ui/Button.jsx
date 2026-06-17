function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  style = {},
}) {
  const className =
    variant === "secondary" ? "btn btn-secondary" : "btn btn-primary";

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

export default Button;
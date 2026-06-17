function Badge({ children, variant = "primary" }) {
  const className = `badge badge-${variant}`;

  return <span className={className}>{children}</span>;
}

export default Badge;
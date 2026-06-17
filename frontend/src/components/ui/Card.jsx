function Card({ children, style = {} }) {
  return (
    <div className="card" style={{ padding: "22px", ...style }}>
      {children}
    </div>
  );
}

export default Card;
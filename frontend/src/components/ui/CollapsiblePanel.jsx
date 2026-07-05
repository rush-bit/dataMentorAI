// import { useState } from "react";

// function CollapsiblePanel({
//   title,
//   subtitle,
//   children,
//   defaultOpen = true,
//   rightContent = null,
// }) {
//   const [open, setOpen] = useState(defaultOpen);

//   return (
//     <div
//       className="card"
//       style={{
//         padding: "0",
//         background: "var(--bg-card)",
//         overflow: "hidden",
//       }}
//     >
//       <div
//         style={{
//           padding: "18px 22px",
//           borderBottom: open ? "1px solid var(--border)" : "none",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: "16px",
//         }}
//       >
//         <div>
//           <h2
//             style={{
//               margin: 0,
//               letterSpacing: "-0.03em",
//               color: "var(--text-main)",
//             }}
//           >
//             {title}
//           </h2>

//           {subtitle && (
//             <p
//               style={{
//                 margin: "6px 0 0",
//                 color: "var(--text-muted)",
//               }}
//             >
//               {subtitle}
//             </p>
//           )}
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           {rightContent}

//           <button
//             type="button"
//             onClick={() => setOpen((current) => !current)}
//             className="btn btn-secondary"
//             style={{ padding: "8px 12px" }}
//           >
//             {open ? "Minimize" : "Open"}
//           </button>
//         </div>
//       </div>

//       {open && <div style={{ padding: "22px" }}>{children}</div>}
//     </div>
//   );
// }

// export default CollapsiblePanel;
function CollapsiblePanel({
  title,
  subtitle,
  children,
  rightContent = null,
}) {
  return (
    <div
      className="card"
      style={{
        padding: "0",
        background: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              letterSpacing: "-0.03em",
              color: "var(--text-main)",
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                margin: "6px 0 0",
                color: "var(--text-muted)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {rightContent && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {rightContent}
          </div>
        )}
      </div>

      <div style={{ padding: "22px" }}>{children}</div>
    </div>
  );
}

export default CollapsiblePanel;
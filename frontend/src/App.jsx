// import { useEffect, useState } from "react";
// import axiosClient from "./api/axiosClient"; 

// function App() {
//   const [backendStatus, setBackendStatus] = useState("Checking...");

//   useEffect(() => {
//     axiosClient
//       .get("/api/health")
//       .then((response) => {
//         setBackendStatus(response.data.status);
//       })
//       .catch((error) => {
//         console.error(error);
//         setBackendStatus("Backend not connected");
//       });
//   }, []);

//   return (
//     <div style={{ padding: "40px", fontFamily: "Arial" }}>
//       <h1>DataMentor AI</h1>
//       <p>AI-powered data science tutor</p>

//       <div
//         style={{
//           marginTop: "20px",
//           padding: "16px",
//           border: "1px solid #ddd",
//           borderRadius: "8px",
//           width: "300px",
//         }}
//       >
//         <h3>Backend Status</h3>
//         <p>{backendStatus}</p>
//       </div>
//     </div>
//   );
// }

// export default App;
import UploadDataset from "./pages/UploadDataset";

function App() {
  return <UploadDataset />;
}

export default App;
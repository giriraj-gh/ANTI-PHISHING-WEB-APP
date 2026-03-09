import { getRole } from "../utils/getRole";

export default function Navbar() {
  const role = getRole();

  return (
    <nav style={{ padding:20, background:"#111", color:"#fff" }}>
      <b>Anti-Phishing App</b>

      {role === "admin" ? (
        <>
          <a href="/admin" style={{marginLeft:20}}>Admin Dashboard</a>
          <a href="/users" style={{marginLeft:20}}>Users</a>
          <a href="/analytics" style={{marginLeft:20}}>Charts</a>
        </>
      ) : (
        <>
          <a href="/home" style={{marginLeft:20}}>Home</a>
          <a href="/scan" style={{marginLeft:20}}>Scan</a>
          <a href="/report" style={{marginLeft:20}}>Report</a>
        </>
      )}
    </nav>
  );
}

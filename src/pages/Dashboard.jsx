import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../lib/auth-context";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1>Job Tracker</h1>
      <p>Signed in as: {user?.email}</p>

      <button onClick={() => signOut(auth)}>Sign out</button>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        Dashboard placeholder. Next: Applications CRUD.
      </div>
    </div>
  );
}
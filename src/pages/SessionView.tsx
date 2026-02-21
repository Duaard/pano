// Placeholder — will be implemented in task 4
import { useParams, Link } from "react-router-dom";

export default function SessionView() {
  const { agent, id } = useParams();
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">&larr; Back</Link>
      <h1 className="text-xl font-bold mt-4">Session: {agent}/{id}</h1>
      <p className="text-gray-500 mt-2">Loading...</p>
    </div>
  );
}

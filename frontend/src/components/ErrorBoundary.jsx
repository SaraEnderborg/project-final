import { useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Oops!</h1>
      <p>Something went wrong.</p>
      {error?.message && <p>{error.message}</p>}
    </div>
  );
}

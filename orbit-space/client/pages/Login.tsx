import { Link } from "react-router-dom";

export default function Login() {
  return (
    <section className="container py-16 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold">Login</h1>
      <p className="mt-2 text-muted-foreground">Auth flow coming next. Continue prompting to implement.</p>
      <p className="mt-6"><Link className="underline" to="/register">Need an account? Register</Link></p>
    </section>
  );
}

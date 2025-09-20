import { Link } from "react-router-dom";

export default function Register() {
  return (
    <section className="container py-16 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-muted-foreground">Registration flow coming next. Continue prompting to implement.</p>
      <p className="mt-6"><Link className="underline" to="/login">Already have an account? Login</Link></p>
    </section>
  );
}

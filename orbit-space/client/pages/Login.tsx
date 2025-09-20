import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { login as apiLogin } from "../api/auth"; // Alias the API login function

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: authContextLogin } = useAuth(); // Alias the AuthContext login function
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiLogin({ email, password }); // Call the API login function
      await authContextLogin(response.access_token); // Pass the token to AuthContext login
      toast({ title: "Login Successful", description: "Welcome back!" });
      navigate("/shop"); // Redirect to shop page after successful login
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      toast({ title: "Login Failed", description: "Please check your credentials.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-16 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold">Login</h1>
      <form onSubmit={handleLogin} className="mt-8 max-w-md mx-auto space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <Button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="mt-6"><Link className="underline" to="/register">Need an account? Register</Link></p>
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiUserPlus, FiBriefcase } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    targetRole: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.targetRole);
      toast.success("Account created! Let's get you prepped.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-slate-100 px-4 py-10">
      <div className="auth-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl font-bold text-white">
            P
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Start acing interviews with{" "}
            <span className="font-semibold text-primary-600">PrepPilot AI</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
            autoComplete="name"
            icon={FiUser}
          />
          <FormInput
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            autoComplete="email"
            icon={FiMail}
          />
          <FormInput
            label="Target role (optional)"
            name="targetRole"
            value={formData.targetRole}
            onChange={handleChange}
            placeholder="e.g. SDE-1, Business Analyst"
            icon={FiBriefcase}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              icon={FiLock}
            />
            <FormInput
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              icon={FiLock}
            />
          </div>

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? (
              "Creating account..."
            ) : (
              <>
                <FiUserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import { useState } from "react";
import { API_BASE_URL } from "../constants";
import FormField from "./FormField";

const SignupForm = ({ handleLogin }) => {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok && response.status > 499) {
        throw new Error("Failed to create user");
      }

      const resJson = await response.json();

      if (!resJson.success) {
        throw new Error(resJson.message || "Failed to create user");
      }

      handleLogin(resJson.response);
      setFormData({ username: "", email: "", password: "" });
    } catch (error) {
      const message = error.message || "Signup failed";

      if (message.toLowerCase().includes("email")) {
        setFieldErrors({ email: message });
      } else if (message.toLowerCase().includes("username")) {
        setFieldErrors({ username: message });
      } else if (message.toLowerCase().includes("password")) {
        setFieldErrors({ password: message });
      } else {
        setError(message);
      }

      console.log("Signup error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>

      <FormField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        autoComplete="username"
        required
        error={fieldErrors.username}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        autoComplete="email"
        required
        error={fieldErrors.email}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
        required
        error={fieldErrors.password}
      />

      <button type="submit">Sign Up</button>

      {error && <p>{error}</p>}
    </form>
  );
};

export default SignupForm;

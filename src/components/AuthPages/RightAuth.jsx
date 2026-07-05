import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../../store/authSlice";
import { useLoginMutation, useRegisterMutation } from "../../store/apiSlice";
import Input from "../Input";
import Button from "../Button";
import Logo from "../Logo";

function RightAuth() {
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginMutation, { isLoading: loginLoading, error: loginError }] =
    useLoginMutation();
  const [
    registerMutation,
    { isLoading: registerLoading, error: registerError },
  ] = useRegisterMutation();

  const error = loginError || registerError;
  const loading = loginLoading || registerLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const switchMode = (newMode) => {
    setMode(newMode);
    reset();
  };

  const submitHandler = async (data) => {
    try {
      if (mode === "signup") {
        await registerMutation(data).unwrap();
      }

      const authResp = await loginMutation({
        email: data.email,
        password: data.password,
      }).unwrap();
      dispatch(setCredentials({ token: authResp.token, user: authResp.user }));
      navigate("/");
    } catch {
      // mutation state renders the error message
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <Logo variant="mobile" />
        </div>

        <div className="mb-8">
          <h2 className="text-foreground text-3xl font-bold">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {mode === "login"
              ? "Sign in to manage your expenses"
              : "Start tracking expenses with your flatmates"}
          </p>
        </div>

        {/* Mode toggle */}
        <div
          className="flex bg-muted rounded-xl p-1 mb-6"
          id="auth-mode-toggle"
        >
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                mode === m
                  ? "bg-white shadow-sm text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {mode === "signup" && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Aarav Kumar"
              {...register("name", { required: "Full name is required" })}
              error={errors.name?.message}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="aarav@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Please enter a valid email",
              },
            })}
            error={errors.email?.message}
          />

          <div>
            <label
              className="block text-foreground mb-1.5 text-sm font-medium"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength:
                    mode === "signup"
                      ? { value: 6, message: "Min. 6 characters" }
                      : undefined,
                })}
                type={showPw ? "text" : "password"}
                id="password"
                placeholder={
                  mode === "signup" ? "Min. 6 characters" : "••••••••"
                }
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error?.data?.message ||
                error?.data ||
                "Something went wrong. Please try again."}
            </div>
          )}

          <Button type="submit" size="full" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        {mode === "login" && (
          <div className="mt-5 p-3.5 bg-secondary rounded-xl border border-border">
            <p className="text-secondary-foreground text-center text-xs">
              New here? Create an account to get started with expense tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RightAuth;

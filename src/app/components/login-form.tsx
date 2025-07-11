import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { MoveLeftIcon } from "lucide-react";
import { Login } from "@/app/actions/auth/login";
import { getCookie } from "@/app/actions/getCookie";

type LoginFormProps = {
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
};

export const LoginForm = ({ type, setType }: LoginFormProps) => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const response = await Login(formData);

      if (response && response.status === 200) {
        toast.success(response.message + " Redirecting...");

        const userCookie = await getCookie();

        if (!userCookie) {
          toast.error("User not found. Please try again.");
          setLoading(false);
          return;
        }

        const userId = userCookie.userId;

        router.push(`/${type.toLowerCase()}/${userId}/dashboard`);
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
      setShowPassword(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8">
      <h1 className="md:text-left text-center">
        <span className="text-2xl font-bold text-slate-900">
          Login as {type}
        </span>
        <p className="mt-2 text-sm text-slate-600">
          Please enter your {type} credentials
        </p>
      </h1>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-slate-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`Enter your email`}
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-3 shadow-sm focus:border-slate-500 focus:ring focus:ring-slate-200"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-bold text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Enter your password`}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-3 shadow-sm focus:border-slate-500 focus:ring focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center p-3 text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-between">
        <button
          type="submit"
          disabled={loading}
          className={`w-3/4 py-2 text-base text-white rounded-md ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-700 cursor-pointer"
          }`}
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <Link
          href={"/"}
          className="w-1/4 border py-2 rounded-md text-slate-500 hover:text-slate-700 cursor-pointer inline-flex items-center justify-center gap-1"
        >
          <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => setType("")}
          >
            <MoveLeftIcon className="w-3 md:w-5" /> Back
          </button>
        </Link>
      </div>
    </form>
  );
};

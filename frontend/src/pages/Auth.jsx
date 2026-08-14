import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UtensilsCrossed, User, Store, Loader2 } from "lucide-react"
import GridBackground from "@/components/shared/GridBackground"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { loginSchema, signupSchema } from "@/lib/validation"

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [role, setRole] = useState("user") // 'user' | 'messowner'
  const [mode, setMode] = useState("login") // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const schema = mode === "login" ? loginSchema : signupSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  })

  const switchMode = (newMode) => {
    setMode(newMode)
    setApiError("")
    reset()
  }

  const onSubmit = async (data) => {
    setApiError("")
    setLoading(true)

    try {
      const endpoint =
        role === "user" ? `/auth/user/${mode}` : `/auth/messowner/${mode}`

      const payload =
        mode === "signup"
          ? { name: data.name, email: data.email, password: data.password, phone: data.phone }
          : { email: data.email, password: data.password }

      const res = await api.post(endpoint, payload)

      const userData = role === "user" ? res.data.user : res.data.owner
      login(userData, res.data.token, role)

      navigate(role === "user" ? "/dashboard" : "/owner/dashboard")
    } catch (err) {
      setApiError(err.response?.data?.error || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      <GridBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">BiteNearby</span>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-orange-100/50 p-8">
          
          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-gray-100">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                role === "user" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("messowner")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                role === "messowner" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Store className="h-4 w-4" />
              Mess Owner
            </button>
          </div>

          {/* Login/Signup Tabs */}
          <Tabs value={mode} onValueChange={switchMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </Tabs>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" {...register("name")} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="9876543210" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {apiError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {apiError}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white h-11"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Log In" : "Create Account"}
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>

        <p
          onClick={() => navigate("/")}
          className="text-center text-sm text-gray-500 mt-6 cursor-pointer hover:text-gray-700"
        >
          ← Back to home
        </p>
      </motion.div>
    </div>
  )
}
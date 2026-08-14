import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import GridBackground from "@/components/shared/GridBackground"
import { Badge } from "@/components/ui/badge"
import { MapPin, UtensilsCrossed, Clock, ArrowRight, Star, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GridBackground />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">BiteNearby</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
          <a href="#" className="hover:text-gray-900 transition-colors">For mess owners</a>
        </div>
        <Button 
          onClick={() => navigate('/auth')}
          className="rounded-full bg-gray-900 hover:bg-gray-800 text-white"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 mb-6">
              <MapPin className="h-3.5 w-3.5" />
              Now live for students nearby
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05]">
              Your next meal is
              <span className="block text-orange-500">closer than you think</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              Discover mess kitchens near you, check today's menu, and reserve
              your meal in seconds. No more wondering what's for dinner.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 h-12 text-base shadow-lg shadow-orange-200 group"
              >
                Find Meals Near You
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="rounded-full h-12 text-base border-gray-300"
              >
                I own a mess
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span><span className="font-semibold text-gray-900">500+</span> students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                <span><span className="font-semibold text-gray-900">4.8</span> avg rating</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Visual mockup card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mt-8"
          >
            <div className="relative rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-orange-100/50 p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Prathamesh Mess</h3>
                  <p className="text-xs text-gray-500">0.2 km away</p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Open</Badge>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Veg Thali", price: "₹80", tag: "Day Meal" },
                  { name: "Special Thali", price: "₹120", tag: "Popular" },
                ].map((dish, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dish.name}</p>
                      <p className="text-xs text-gray-500">{dish.tag}</p>
                    </div>
                    <span className="text-sm font-semibold text-orange-600">{dish.price}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 rounded-xl bg-orange-500 hover:bg-orange-600">
                Reserve Now
              </Button>
            </div>

            {/* Floating badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -top-6 -right-6 rounded-2xl bg-white border border-gray-200 shadow-lg px-4 py-3 flex items-center gap-2 z-20"
            >
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Booked in 12s</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature strip */}
        <motion.div
          id="features"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: MapPin,
              title: "Nearby Discovery",
              desc: "Find mess kitchens within walking distance using real-time location search."
            },
            {
              icon: UtensilsCrossed,
              title: "Live Menus",
              desc: "See exactly what's cooking today — day and night meals, updated daily."
            },
            {
              icon: Clock,
              title: "Instant Reservations",
              desc: "Reserve your meal slot in seconds. No calls, no waiting, no confusion."
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="group rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-7 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      {/* How It Works */}
        <div id="how" className="mt-40 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wide">How it works</span>
            <h2 className="mt-3 text-4xl font-bold text-gray-900">Three steps to your next meal</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Share your location",
                desc: "We find mess kitchens within walking distance, sorted by proximity."
              },
              {
                step: "02",
                title: "Browse today's menu",
                desc: "Check dishes, prices, and what's cooking for day or night meals."
              },
              {
                step: "03",
                title: "Reserve instantly",
                desc: "Lock in your meal slot in seconds — no calls, no back and forth."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <span className="text-6xl font-bold text-orange-100">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* For Mess Owners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-40 rounded-3xl bg-gray-900 p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500 opacity-20 blur-[100px]" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-sm font-semibold text-orange-400 uppercase tracking-wide">For mess owners</span>
            <h2 className="mt-3 text-4xl font-bold text-white">Fill more plates, every single day</h2>
            <p className="mt-4 text-gray-300 text-lg">
              List your mess, manage your menu, and track daily attendance — all from
              one simple dashboard. Reach students actively looking for their next meal.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="mt-8 rounded-full bg-white text-gray-900 hover:bg-gray-100 px-7 h-12 text-base"
            >
              Register Your Mess
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">BiteNearby</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 BiteNearby. Built for students, by a student.</p>
        </footer>
      </div>
    </div>
  )
}

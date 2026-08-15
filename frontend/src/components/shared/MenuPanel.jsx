import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

export default function MenuPanel({ mess, onBack, onReserved }) {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(null) // tracks which mealType is being booked
  const [message, setMessage] = useState(null)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/menu/menu/${mess.id}/${today}`)
        setMenu(res.data.menu)
      } catch (err) {
        console.error("Failed to fetch menu", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [mess.id])

  // Group flat rows into { day: [dishes], night: [dishes] }
  const grouped = menu.reduce((acc, row) => {
    if (!acc[row.meal_type]) acc[row.meal_type] = {}
    if (!acc[row.meal_type][row.dish_id]) {
      acc[row.meal_type][row.dish_id] = {
        name: row.dish_name,
        price: row.price,
        items: [],
      }
    }
    if (row.item_name) acc[row.meal_type][row.dish_id].items.push(row.item_name)
    return acc
  }, {})

  const handleReserve = async (mealType) => {
    setReserving(mealType)
    setMessage(null)
    try {
      await api.post("/reservation/book", {
        messId: mess.id,
        mealType,
        date: today,
      })
      setMessage({ type: "success", text: `Reserved ${mealType} meal successfully!` })
      onReserved?.()
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Reservation failed" })
    } finally {
      setReserving(null)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </button>
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{mess.name}</h2>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {mess.address}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          </div>
        )}

        {!loading && Object.keys(grouped).length === 0 && (
          <p className="text-sm text-gray-500 text-center py-16">
            No menu published for today yet.
          </p>
        )}

        {message && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {["day", "night"].map((mealType) => {
          const dishes = grouped[mealType]
          if (!dishes) return null

          return (
            <div key={mealType} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <h3 className="font-medium text-gray-900 capitalize">{mealType} Meal</h3>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleReserve(mealType)}
                  disabled={reserving === mealType}
                  className="rounded-full bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
                >
                  {reserving === mealType ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Reserve"
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {Object.values(dishes).map((dish, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dish.name}</p>
                      <p className="text-xs text-gray-500">{dish.items.join(", ")}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">₹{dish.price}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
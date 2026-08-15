import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, Clock, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

export default function MyReservations() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split("T")[0]

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reservation/my-reservations/${today}`)
      setReservations(res.data.reservations)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    setCancellingId(id)
    setMessage(null)
    try {
      await api.delete(`/reservation/${id}`)
      setMessage({ type: "success", text: "Reservation cancelled successfully" })
      loadReservations()
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to cancel" })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="font-bold text-gray-900">My Reservations</span>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
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

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          </div>
        )}

        {!loading && reservations.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-16">
            No reservations for today.
          </p>
        )}

        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{r.mess_name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="capitalize">{r.meal_type} meal</span>
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(r.id)}
                disabled={cancellingId === r.id}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                {cancellingId === r.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
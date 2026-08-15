import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, UtensilsCrossed, LogOut, Plus, Users, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import * as ownerApi from "@/lib/ownerApi"
import LocationPicker from "@/components/shared/LocationPicker"
import api from "@/lib/api"

export default function OwnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [mess, setMess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("menu")

  useEffect(() => {
    fetchMess()
  }, [])

  const fetchMess = async () => {
    setLoading(true)
    try {
      const res = await ownerApi.getMyMess()
      setMess(res.data.mess)
    } catch (err) {
      // No mess yet — that's fine, we'll show the create form
      setMess(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">BiteNearby <span className="text-gray-400 font-normal">for Owners</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {!mess ? (
          <CreateMessForm onCreated={fetchMess} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{mess.name}</h1>
              <p className="text-sm text-gray-500">{mess.address}</p>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
              </TabsList>
            </Tabs>

            {tab === "menu" && <MenuManager mess={mess} />}
            {tab === "reservations" && <ReservationsView mess={mess} />}
          </>
        )}
      </div>
    </div>
  )
}

// ---------- Create Mess Form ----------
function CreateMessForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", address: "" })
  const [coords, setCoords] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Set a default immediately so the map always renders without waiting
    setUserLocation({ lat: 18.5679, lng: 73.9799 })

    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn("Geolocation failed, using default center:", err.message)
    )
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!coords) {
      setError("Please drop a pin on the map for your mess location")
      return
    }

    setLoading(true)
    try {
      await ownerApi.createMess({
        name: form.name,
        address: form.address,
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create mess")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Register your mess</h2>
        <p className="text-sm text-gray-500 mb-6">Let's get your kitchen listed for nearby students.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mess Name</Label>
            <Input
              placeholder="Prathamesh Mess"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              placeholder="Near Bharti Vidyapeeth"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Pin Location</Label>
            {userLocation && (
              <LocationPicker
                initialCenter={[userLocation.lat, userLocation.lng]}
                onChange={setCoords}
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Mess"}
          </Button>
        </form>
      </div>
    </div>
  )
}
// ---------- Menu Manager ----------
function MenuManager({ mess }) {
  const today = new Date().toISOString().split("T")[0]

  const [dishName, setDishName] = useState("")
  const [dishPrice, setDishPrice] = useState("")
  const [dishItems, setDishItems] = useState("")
  const [mealType, setMealType] = useState("day")
  const [addingDish, setAddingDish] = useState(false)
  const [menu, setMenu] = useState([])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = async () => {
    try {
      const res = await ownerApi.getMenu(mess.id, today)
      setMenu(res.data.menu)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddDish = async (e) => {
    e.preventDefault()
    setAddingDish(true)
    setMessage(null)

    try {
      const items = dishItems.split(",").map((i) => i.trim()).filter(Boolean)
      const dishRes = await ownerApi.addDish({
        name: dishName,
        price: parseFloat(dishPrice),
        messId: mess.id,
        items,
      })

      const dishId = dishRes.data.dish.id

      // Create/attach to today's menu for the chosen meal type
      await ownerApi.createMenu({
        messId: mess.id,
        mealType,
        date: today,
        dishIds: [dishId],
      })

      setMessage({ type: "success", text: `Added "${dishName}" to today's ${mealType} menu` })
      setDishName("")
      setDishPrice("")
      setDishItems("")
      loadMenu()
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to add dish" })
    } finally {
      setAddingDish(false)
    }
  }

  const grouped = menu.reduce((acc, row) => {
    if (!acc[row.meal_type]) acc[row.meal_type] = {}
    if (!acc[row.meal_type][row.dish_id]) {
      acc[row.meal_type][row.dish_id] = { name: row.dish_name, price: row.price, items: [] }
    }
    if (row.item_name) acc[row.meal_type][row.dish_id].items.push(row.item_name)
    return acc
  }, {})

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Add dish form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-orange-500" />
          Add Dish to Today's Menu
        </h3>

        <form onSubmit={handleAddDish} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100">
            <button
              type="button"
              onClick={() => setMealType("day")}
              className={`rounded-lg py-2 text-sm font-medium transition-all ${mealType === "day" ? "bg-white shadow-sm" : "text-gray-500"}`}
            >
              Day Meal
            </button>
            <button
              type="button"
              onClick={() => setMealType("night")}
              className={`rounded-lg py-2 text-sm font-medium transition-all ${mealType === "night" ? "bg-white shadow-sm" : "text-gray-500"}`}
            >
              Night Meal
            </button>
          </div>

          <Input placeholder="Dish name" value={dishName} onChange={(e) => setDishName(e.target.value)} required />
          <Input placeholder="Price (₹)" type="number" value={dishPrice} onChange={(e) => setDishPrice(e.target.value)} required />
          <Input placeholder="Items (comma separated: Rice, Dal, Roti)" value={dishItems} onChange={(e) => setDishItems(e.target.value)} />

          {message && (
            <p className={`text-xs rounded-lg px-3 py-2 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={addingDish} className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl">
            {addingDish ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Menu"}
          </Button>
        </form>
      </div>

      {/* Today's menu preview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Today's Menu</h3>

        {Object.keys(grouped).length === 0 && (
          <p className="text-sm text-gray-500">No dishes added yet.</p>
        )}

        {["day", "night"].map((type) => {
          const dishes = grouped[type]
          if (!dishes) return null
          return (
            <div key={type} className="mb-4">
              <p className="text-xs font-medium text-orange-600 uppercase mb-2">{type} Meal</p>
              <div className="space-y-2">
                {Object.entries(dishes).map(([dishId, d]) => (
                  <DishRow
                    key={dishId}
                    dishId={dishId}
                    dish={d}
                    onUpdated={loadMenu}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function DishRow({ dishId, dish, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dish.name)
  const [price, setPrice] = useState(dish.price)
  const [items, setItems] = useState(dish.items.join(", "))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const itemsArray = items.split(",").map((i) => i.trim()).filter(Boolean)
      await api.patch(`/menu/dish/${dishId}`, {
        name,
        price: parseFloat(price),
        items: itemsArray,
      })
      setEditing(false)
      onUpdated()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Remove "${dish.name}" from your menu catalog?`)) return
    setDeleting(true)
    setError("")
    try {
      await api.delete(`/menu/dish/${dishId}`)
      onUpdated()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete")
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div className="space-y-2 bg-gray-50 rounded-lg p-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" placeholder="Dish name" />
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          className="h-8 text-sm"
          placeholder="Price"
        />
        <Input
          value={items}
          onChange={(e) => setItems(e.target.value)}
          className="h-8 text-sm"
          placeholder="Items (comma separated)"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 bg-orange-500 hover:bg-orange-600">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-2.5 text-sm group">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{dish.name}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">₹{dish.price}</Badge>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-orange-500"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
      {dish.items.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{dish.items.join(", ")}</p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ---------- Reservations View ----------
function ReservationsView({ mess }) {
  const today = new Date().toISOString().split("T")[0]
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ownerApi.getMessReservations(mess.id, today)
        setReservations(res.data.reservations)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-orange-500" />
        Today's Reservations ({reservations.length})
      </h3>

      {reservations.length === 0 ? (
        <p className="text-sm text-gray-500">No reservations for today yet.</p>
      ) : (
        <div className="space-y-2">
          {reservations.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.user_name}</p>
                  <p className="text-xs text-gray-500">{r.email}</p>
                </div>
              </div>
              <Badge className="capitalize">{r.meal_type}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
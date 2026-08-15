import { useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    },
  })
  return null
}
function RecenterMap({ center }) {
  const map = useMap()
  const prevCenter = useRef(null)

  useEffect(() => {
    if (center && center !== prevCenter.current) {
      map.setView(center, 18)
      prevCenter.current = center
    }
  }, [center, map])

  return null
}

export default function LocationPicker({ initialCenter, onChange }) {
  const [position, setPosition] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState(null)
  const [searchError, setSearchError] = useState("")

  const handleSelect = (latlng) => {
    setPosition(latlng)
    onChange({ latitude: latlng.lat, longitude: latlng.lng })
  }

  const runSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchError("")

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await res.json()

      if (data.length === 0) {
        setSearchError("Location not found. Try a more specific search.")
        return
      }

      const { lat, lon } = data[0]
      setMapCenter([parseFloat(lat), parseFloat(lon)])
    } catch (err) {
      setSearchError("Search failed. Please try again.")
    } finally {
      setSearching(false)
    }
  }

  const handleKeyDown = (e) => {
    // Prevent Enter key from bubbling up to the outer form
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      runSearch()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search for your area (e.g. Wagholi Chowk, Pune)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm"
        />
        <Button
          type="button"
          size="sm"
          disabled={searching}
          variant="outline"
          className="shrink-0"
          onClick={runSearch}
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {searchError && <p className="text-xs text-red-500">{searchError}</p>}

      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: "420px" }}>
        <MapContainer
          center={initialCenter}
          zoom={17}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ClickHandler onSelect={handleSelect} />
          {mapCenter && <RecenterMap center={mapCenter} />}
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        {position
          ? `Pin dropped: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
          : "Search your area above, then click the map to drop a precise pin"}
      </p>
    </div>
  )
}
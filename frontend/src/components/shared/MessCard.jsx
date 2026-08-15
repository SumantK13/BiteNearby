import { MapPin, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function MessCard({ mess, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
        isSelected
          ? "border-orange-400 bg-orange-50 shadow-md"
          : "border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{mess.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{mess.address}</p>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shrink-0">
          Open
        </Badge>
      </div>
      <div className="flex items-center gap-1 mt-3 text-sm text-orange-600 font-medium">
        <MapPin className="h-3.5 w-3.5" />
        {mess.distance ? `${mess.distance.toFixed(2)} km away` : "Distance unknown"}
      </div>
    </div>
  )
}
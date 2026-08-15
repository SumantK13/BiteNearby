import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useGeolocation } from "@/hooks/useGeolocation";
import MessCard from "@/components/shared/MessCard";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, UtensilsCrossed, LogOut } from "lucide-react";
import MenuPanel from "@/components/shared/MenuPanel"
import { Button } from "@/components/ui/button";

// Small helper to recenter map when location changes
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng]);
  return null;
}

export default function Dashboard() {
  const { location, error: locError, loading: locLoading } = useGeolocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState(null);
  const [loadingMesses, setLoadingMesses] = useState(false);

  useEffect(() => {
    if (!location) return;

    const fetchNearby = async () => {
      setLoadingMesses(true);
      try {
        const res = await api.get("/mess/nearby", {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            radius: 10,
          },
        });
        setMesses(res.data.messes);
      } catch (err) {
        console.error("Failed to fetch nearby messes", err);
      } finally {
        setLoadingMesses(false);
      }
    };

    fetchNearby();
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (locLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        <p className="text-gray-500 text-sm">Getting your location...</p>
      </div>
    );
  }

  if (locError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-500 font-medium">Location access needed</p>
        <p className="text-gray-500 text-sm max-w-sm">
          BiteNearby needs your location to find nearby messes. Please enable
          location access and refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">BiteNearby</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 h-[calc(100vh-65px)]">
        {/* Left: Mess list */}
        <div className="lg:col-span-2 overflow-y-auto p-4 space-y-3 border-r border-gray-200 bg-white">
          <h2 className="font-semibold text-gray-900 mb-2">
            {loadingMesses
              ? "Finding messes..."
              : `${messes.length} messes nearby`}
          </h2>

          {loadingMesses && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            </div>
          )}

          {!loadingMesses && messes.length === 0 && (
            <p className="text-sm text-gray-500 py-8 text-center">
              No messes found nearby. Try a larger radius.
            </p>
          )}

          {messes.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
              isSelected={selectedMess?.id === mess.id}
              onClick={() => setSelectedMess(mess)}
            />
          ))}
        </div>

        {/* Right: Map or Menu */}
        <div className="lg:col-span-3 relative">
          {selectedMess ? (
            <MenuPanel
              mess={selectedMess}
              onBack={() => setSelectedMess(null)}
            />
          ) : (
            location && (
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <RecenterMap lat={location.latitude} lng={location.longitude} />

                <Marker position={[location.latitude, location.longitude]}>
                  <Popup>You are here</Popup>
                </Marker>

                {messes.map((mess) => (
                  <Marker
                    key={mess.id}
                    position={[
                      parseFloat(mess.latitude),
                      parseFloat(mess.longitude),
                    ]}
                    eventHandlers={{
                      click: () => setSelectedMess(mess),
                    }}
                  >
                    <Popup>
                      <strong>{mess.name}</strong>
                      <br />
                      {mess.address}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )
          )}
        </div>
      </div>
    </div>
  );
}

import api from "./api"

export const getMyMess = () => api.get("/mess/my-mess")

export const createMess = (data) => api.post("/mess/create", data)

export const addDish = (data) => api.post("/menu/dish", data)

export const createMenu = (data) => api.post("/menu/menu", data)

export const getMenu = (messId, date) => api.get(`/menu/menu/${messId}/${date}`)

export const getMessReservations = (messId, date) =>
  api.get(`/reservation/mess/${messId}/${date}`)

export const getMessEnrollments = (messId) =>
  api.get(`/enrollment/mess/${messId}`)
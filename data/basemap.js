const baseMaps = {
    "open-street-map": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }),
    "google-maps": L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", { attribution: "Google Maps" }),
    "google-terrain": L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", { attribution: "Google Terrain" }),
    "google-hybrid": L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", { attribution: "Google Hybrid" }),
    "google-satellite": L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", { attribution: "Google Satellite" }),
};

export { baseMaps };
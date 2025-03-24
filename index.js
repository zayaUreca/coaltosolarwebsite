import { baseMaps } from "./data/basemap.js";

// Initialize the map
const map = L.map("map").setView([47.917587, 106.90205], 12);

// Add default base map
baseMaps["google-satellite"].addTo(map);

// Add base map controls
const app = document.querySelector(".baseMapsClass");

if (app) {
    Object.entries(baseMaps).forEach(([key, baseMap]) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <label class="flex items-center space-x-3">
                <input type="radio" name="basemap" value="${key}" checked class="w-4 h-4 bg-gray-100 border-none rounded-sm" />
                <span>${baseMap.options?.attribution || "No attribution available"}</span>
            </label>`;
        app.appendChild(li);
    });

    app.addEventListener("change", (event) => {
        if (event.target.name === "basemap") {
            const selectedLayer = baseMaps[event.target.value];
            if (selectedLayer) {
                map.eachLayer((layer) => {
                    if (layer instanceof L.TileLayer) {
                        map.removeLayer(layer);
                    }
                });
                selectedLayer.addTo(map);
            }
        }
    });
} else {
    console.error("Element with class .baseMapsClass not found!");
}

// Layer objects storage
const layerObjects = {};

// Function to add markers from GeoJSON
function addMarkers(geojsonFile, layerGroup) {
    fetch(geojsonFile)
        .then((res) => res.json())
        .then((geojsonData) => {
            const markers = L.geoJSON(geojsonData, {
                pointToLayer: (feature, latlng) => L.marker(latlng).bindPopup(`
                    <h3 style="text-align: center; margin-bottom: 10px;"><b>Household</b></h3>
                    <table class="popup-table">
                        <tr>
                            <td>Name</td>
                            <td>`+ feature.properties.Name + `</td>
                        </tr>
                    </table>` ).openPopup()
            });
            layerGroup.addLayer(markers);
        })
        .catch(console.error);
}

// Initialize markers layer
const undpmarkersLayer = L.layerGroup();
const rtmarkersLayer = L.layerGroup();
const duureg = document.querySelector(".songinoKhairkhanClass");

// Load GeoJSON configurations
fetch("./data/geojson_config.json")
    .then((res) => res.json())
    .then((data) => {
        if (Array.isArray(data.geojson_configs)) {
            data.geojson_configs.forEach((config) => {
                const li = document.createElement("li");
                li.className = "p-2 rounded-lg bg-gray-100";

                const btn = document.createElement("button");
                btn.className = "flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100";
                btn.setAttribute("type", "button");
                btn.setAttribute("aria-controls", `dropdown-${config.name}`);
                btn.setAttribute("data-collapse-toggle", `dropdown-${config.name}`);
                btn.innerHTML = `
                    <span class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">${config.name}</span>
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                    </svg>`;

                const divUL = document.createElement("div");
                divUL.setAttribute("id", `dropdown-${config.name}`);
                divUL.className = "hidden py-2 space-y-2";

                config.properties.forEach((property) => {
                    fetch(property.file)
                        .then((res) => res.json())
                        .then((data) => {

                            const geoJsonLayer = L.geoJSON(data, {
                                style: { color: property.color, weight: property.weight, fillOpacity: property.fillOpacity }
                            }).bindPopup(`
                                <h3 style="text-align: center; margin-bottom: 10px;"><b>`+ config.name + ` Хороо</b></h3>
                                <table class="popup-table">
                                    <tr>
                                        <td>Гэр</td>
                                        <td>`+ config.ger + `</td>
                                    </tr>
                                    <tr>
                                        <td>Хашаа</td>
                                        <td>`+ config.khashaa + `</td>
                                    </tr>
                                </table>` ).openPopup().addTo(map);
                            layerObjects[`${config.name}-${property.name}`] = geoJsonLayer;

                            const checkbox = document.createElement("input");
                            checkbox.type = "checkbox";
                            checkbox.id = `${config.name}-${property.name}`;
                            checkbox.className = "w-4 h-4 border-none rounded-sm";
                            checkbox.checked = true;

                            checkbox.addEventListener("change", () => {
                                if (checkbox.checked) {
                                    map.addLayer(geoJsonLayer);
                                } else {
                                    map.removeLayer(geoJsonLayer);
                                }
                            });

                            const label = document.createElement("label");
                            label.className = "flex items-center space-x-3";
                            label.innerHTML = `<span>${property.name}</span>`;
                            label.prepend(checkbox);
                            divUL.appendChild(label);
                        })
                        .catch(console.error);
                });

                btn.addEventListener("click", () => {
                    divUL.classList.toggle("hidden");
                });

                li.appendChild(btn);
                li.appendChild(divUL);
                duureg.appendChild(li);
            });
        } else {
            console.error("geojson_configs is missing or not an array");
        }

        if (Array.isArray(data.geojson_gers)) {
            addMarkers(data.geojson_gers[0].file, undpmarkersLayer);
            addMarkers(data.geojson_gers[1].file, rtmarkersLayer);
        } else {
            console.error("geojson_gers is missing or not an array");
        }

        const checkbox = document.querySelector("input[name=householdsClass-undp-checkbox]");
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                map.addLayer(undpmarkersLayer);
            } else {
                map.removeLayer(undpmarkersLayer);
            }
        });

        const checkbox1 = document.querySelector("input[name=householdsClass-rt-checkbox]");
        checkbox1.addEventListener("change", () => {
            if (checkbox1.checked) {
                map.addLayer(rtmarkersLayer);
            } else {
                map.removeLayer(rtmarkersLayer);
            }
        });

    })
    .catch((error) => console.error("Error loading geojson_config.json:", error));

const elecLayer = L.layerGroup();

function styleFunction(feature) {
    return {
        color: feature.properties.stroke,
        opacity: feature.properties["stroke-opacity"],
        fillColor: feature.properties.fill,
        fillOpacity: feature.properties["fill_opacity"]
    };
}

// Function to add markers from GeoJSON
fetch("data/Cabel.json")
    .then((res) => res.json())
    .then((geojsonData) => {
        console.log(geojsonData)
        const elecs = L.geoJSON(geojsonData, {
            style: styleFunction
        }).bindPopup(function (layer) { return layer.feature.properties.description.value }).openPopup()
        elecLayer.addLayer(elecs);
    })
    .catch(console.error);

const checkboxElec = document.querySelector("input[name=electricity-checkbox]");
checkboxElec.addEventListener("change", () => {
    if (checkboxElec.checked) {
        map.addLayer(elecLayer);
    } else {
        map.removeLayer(elecLayer);
    }
});

const airLayer = L.layerGroup();

// Function to add markers from GeoJSON
fetch("data/air.json")
    .then((res) => res.json())
    .then((geojsonData) => {
        console.log(geojsonData)
        const elecs = L.geoJSON(geojsonData, {
            style: styleFunction
        }).bindPopup(function (layer) { return layer.feature.properties.description.value }).openPopup()
        airLayer.addLayer(elecs);
    })
    .catch(console.error);

const checkboxAir = document.querySelector("input[name=air-checkbox]");
checkboxAir.addEventListener("change", () => {
    if (checkboxAir.checked) {
        map.addLayer(airLayer);
    } else {
        map.removeLayer(airLayer);
    }
});
const axios = require('axios');

// Calculate distance (Haversine Formula) to sort results on backend
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

exports.getNearbyHospitals = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        // 1. Query OpenStreetMap (Overpass API)
        // We search within a 10km radius (10000 meters)
        const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:10000,${lat},${lon});
        way["amenity"="hospital"](around:10000,${lat},${lon});
      );
      out body;
    `;

        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        const data = response.data;

        // 2. Process & Sort Data
        const hospitals = data.elements
            .map((h) => ({
                id: h.id,
                name: h.tags.name || "Unnamed Hospital",
                type: h.tags["healthcare:speciality"] || "General Hospital",
                address: h.tags["addr:city"] || h.tags["addr:street"] || "Address not available",
                phone: h.tags.phone || null,
                lat: h.lat || h.center?.lat, // specific handling for ways vs nodes
                lon: h.lon || h.center?.lon,
                source: "ONLINE"
            }))
            .filter(h => h.lat && h.lon) // Remove items with missing coords
            .map(h => ({
                ...h,
                distance: getDistance(lat, lon, h.lat, h.lon) // Add distance
            }))
            .sort((a, b) => a.distance - b.distance); // Sort by nearest

        res.json({ success: true, count: hospitals.length, data: hospitals });

    } catch (error) {
        console.error("Error fetching hospitals:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch external data" });
    }
};
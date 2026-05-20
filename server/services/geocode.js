async function geocodeAddress(address) {
  if (!address?.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FoodForAll/1.0 (food-donation-app)' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.[0]) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

module.exports = { geocodeAddress };

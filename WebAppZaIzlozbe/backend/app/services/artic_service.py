import httpx
from typing import List, Dict, Any, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

IIIF_BASE_URL = "https://www.artic.edu/iiif/2"


async def fetch_artworks(
    page: int = 1,
    limit: int = 12,
    search: Optional[str] = None
) -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "page": page,
                "limit": limit,
                "fields": "id,title,artist_display,date_display,image_id,thumbnail,description"
            }
            
            if search:
                url = f"{settings.ARTIC_API_BASE_URL}/artworks/search"
                params["q"] = search
            else:
                url = f"{settings.ARTIC_API_BASE_URL}/artworks"
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data
            
    except httpx.HTTPError as e:
        logger.error(f"Greška pri dohvatanju sa Artic API: {str(e)}")
        return {"data": [], "pagination": {}}


def get_image_url(image_id: str, size: str = "843,") -> str:
    if not image_id:
        return ""
    return f"{IIIF_BASE_URL}/{image_id}/full/{size}/0/default.jpg"


def get_thumbnail_url(image_id: str) -> str:
    if not image_id:
        return ""
    return f"{IIIF_BASE_URL}/{image_id}/full/200,/0/default.jpg"


async def get_artwork_by_id(artwork_id: int) -> Optional[Dict[str, Any]]:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{settings.ARTIC_API_BASE_URL}/artworks/{artwork_id}"
            params = {
                "fields": "id,title,artist_display,date_display,image_id,thumbnail,description,dimensions,medium_display"
            }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data.get("data")
            
    except httpx.HTTPError as e:
        logger.error(f"Greška pri dohvatanju umetničkog rada {artwork_id}: {str(e)}")
        return None


def format_artwork_to_slika(artwork: Dict[str, Any]) -> Dict[str, Any]:
    image_id = artwork.get("image_id", "")
    
    return {
        "slika": get_image_url(image_id),
        "thumbnail": get_thumbnail_url(image_id),
        "naslov": artwork.get("title", "Bez naslova"),
        "opis": artwork.get("description", ""),
        "fotograf": artwork.get("artist_display", "Nepoznat umetnik"),
    }

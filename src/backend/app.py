from fastapi import FastAPI, HTTPException

from backend.astronomical_objects.routes import router as astronomical_objects_router
from backend.object_types.routes import router as object_types_router
from backend.observations.routes import router as observations_router

app = FastAPI()

app.include_router(prefix="/api", router=astronomical_objects_router)
app.include_router(prefix="/api", router=object_types_router)
app.include_router(prefix="/api", router=observations_router)

@app.get("/api/health", status_code=200)
async def health_check():
    """Return a simple health check response."""
    return {"status": "ok"}
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.astronomical_objects.routes import router as astronomical_objects_router
from backend.object_types.routes import router as object_types_router
from backend.observations.routes import router as observations_router
from backend.users.routes import router as users_router

app = FastAPI()
    
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://eremia-sigma.vercel.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routers
app.include_router(prefix="/api", router=astronomical_objects_router)
app.include_router(prefix="/api", router=object_types_router)
app.include_router(prefix="/api", router=observations_router)
app.include_router(prefix="/api", router=users_router)

@app.get("/api/health", status_code=200)
async def health_check():
    """Return a simple health check response."""
    return {"status": "ok"}
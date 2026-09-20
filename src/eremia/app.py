from fastapi import FastAPI, HTTPException

from eremia.astronomical_objects.routes import router as astronomical_objects_router

app = FastAPI()

app.include_router(astronomical_objects_router)

@app.get("/hello-world")
def  printHello():
    return {"Hello World!"}
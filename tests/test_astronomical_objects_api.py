import unittest

import httpx
from fastapi import FastAPI
from sqlalchemy import create_engine, insert

from backend.api.dependencies import get_db_session
from backend.astronomical_objects.models import AstronomicalObject
from backend.astronomical_objects.routes import router as astronomical_objects_router
from backend.database import models
from backend.database.base import Base
from backend.object_types.models import ObjectType


class SQLiteAsyncSession:
    def __init__(self, engine, objects: dict[int, AstronomicalObject]) -> None:
        self.engine = engine
        self.objects = objects

    async def scalars(self, statement):
        with self.engine.connect() as connection:
            object_ids = connection.execute(statement).scalars().all()
        return iter(self.objects[object_id] for object_id in object_ids)


class AstronomicalObjectsApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(
            self.engine, tables=[ObjectType.__table__, AstronomicalObject.__table__]
        )
        self.object_types = {
            1: ObjectType(id=1, name="Exoplanet", description=None),
            2: ObjectType(id=2, name="Star", description=None),
        }
        self.objects = {
            1: AstronomicalObject(
                id=1,
                name="Kepler-22b",
                catalog_id="KIC 10593626",
                object_type_id=1,
                description="Potentially habitable world",
                object_type=self.object_types[1],
            ),
            2: AstronomicalObject(
                id=2,
                name="Kepler-62e",
                catalog_id=None,
                object_type_id=1,
                description=None,
                object_type=self.object_types[1],
            ),
            3: AstronomicalObject(
                id=3,
                name="Sun",
                catalog_id="Sol",
                object_type_id=2,
                description="The star at the center of the Solar System",
                object_type=self.object_types[2],
            ),
        }
        with self.engine.begin() as connection:
            connection.execute(
                insert(ObjectType),
                [
                    {"id": object_type.id, "name": object_type.name}
                    for object_type in self.object_types.values()
                ],
            )
            connection.execute(
                insert(AstronomicalObject),
                [
                    {
                        "id": astronomical_object.id,
                        "name": astronomical_object.name,
                        "catalog_id": astronomical_object.catalog_id,
                        "object_type_id": astronomical_object.object_type_id,
                        "description": astronomical_object.description,
                    }
                    for astronomical_object in self.objects.values()
                ],
            )

        self.session = SQLiteAsyncSession(self.engine, self.objects)
        self.app = FastAPI()
        self.app.include_router(astronomical_objects_router, prefix="/api")
        self.app.dependency_overrides[get_db_session] = self.get_session
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app),
            base_url="http://test",
        )

    async def asyncTearDown(self) -> None:
        await self.client.aclose()
        self.app.dependency_overrides.clear()
        self.engine.dispose()

    async def get_session(self):
        yield self.session

    async def test_list_without_search_preserves_order_and_nested_type(self) -> None:
        response = await self.client.get("/api/astronomical-objects")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(
            [astronomical_object["name"] for astronomical_object in payload],
            ["Kepler-22b", "Kepler-62e", "Sun"],
        )
        self.assertEqual(payload[0]["object_type"]["name"], "Exoplanet")

    async def test_partial_name_search_is_case_insensitive(self) -> None:
        response = await self.client.get(
            "/api/astronomical-objects", params={"search": " ePlEr-6 "}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [2])

    async def test_search_matches_catalog_identifier_and_description(self) -> None:
        catalog_response = await self.client.get(
            "/api/astronomical-objects", params={"search": "10593"}
        )
        description_response = await self.client.get(
            "/api/astronomical-objects", params={"search": "habitable"}
        )

        self.assertEqual(
            [item["id"] for item in catalog_response.json()], [1]
        )
        self.assertEqual(
            [item["id"] for item in description_response.json()], [1]
        )

    async def test_search_matches_related_object_type_name(self) -> None:
        response = await self.client.get(
            "/api/astronomical-objects", params={"search": "exoplan"}
        )

        self.assertEqual([item["id"] for item in response.json()], [1, 2])

    async def test_nullable_fields_empty_search_and_whitespace_search(self) -> None:
        null_safe_response = await self.client.get(
            "/api/astronomical-objects", params={"search": "not-a-match"}
        )
        empty_response = await self.client.get(
            "/api/astronomical-objects", params={"search": ""}
        )
        whitespace_response = await self.client.get(
            "/api/astronomical-objects", params={"search": "   "}
        )

        self.assertEqual(null_safe_response.json(), [])
        self.assertEqual(len(empty_response.json()), 3)
        self.assertEqual(len(whitespace_response.json()), 3)

    async def test_search_combines_with_type_filter_and_pagination(self) -> None:
        response = await self.client.get(
            "/api/astronomical-objects",
            params={
                "search": "kepler",
                "object_type_id": 1,
                "skip": 1,
                "limit": 1,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [2])

    async def test_search_with_no_matches_returns_empty_array(self) -> None:
        response = await self.client.get(
            "/api/astronomical-objects", params={"search": "no-such-object"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    async def test_search_treats_like_wildcards_as_literal_characters(self) -> None:
        response = await self.client.get(
            "/api/astronomical-objects", params={"search": "%"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

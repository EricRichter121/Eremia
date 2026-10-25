import unittest
from decimal import Decimal

import httpx
from fastapi import FastAPI

from backend.api.dependencies import get_db_session
from backend.astronomical_objects.models import AstronomicalObject
from backend.astronomical_objects.routes import router as astronomical_objects_router
from backend.database.base import Base
from backend.object_types.models import ObjectType
from backend.planetary_parameters.models import PlanetaryParameters
from backend.users.auth import current_superuser


class FakeAsyncSession:
    def __init__(self) -> None:
        self.object_types = {1: ObjectType(id=1, name="Galaxy", description=None)}
        self.objects: dict[int, AstronomicalObject] = {}
        self.pending_objects: list[AstronomicalObject] = []
        self.deleted_objects: list[AstronomicalObject] = []
        self.next_object_id = 1

    async def get(self, model: type, object_id: int, **kwargs):
        if model is ObjectType:
            return self.object_types.get(object_id)
        if model is AstronomicalObject:
            return self.objects.get(object_id)
        raise AssertionError(f"Unexpected model lookup: {model}")

    async def scalar(self, statement):
        parameters = statement.compile().params
        object_id = next(iter(parameters.values()))
        return self.objects.get(object_id)

    def add(self, astronomical_object: AstronomicalObject) -> None:
        self.pending_objects.append(astronomical_object)

    async def delete(self, astronomical_object: AstronomicalObject) -> None:
        self.deleted_objects.append(astronomical_object)

    async def commit(self) -> None:
        for astronomical_object in self.pending_objects:
            astronomical_object.id = self.next_object_id
            self.next_object_id += 1
            astronomical_object.object_type = self.object_types[
                astronomical_object.object_type_id
            ]
            self.objects[astronomical_object.id] = astronomical_object
        self.pending_objects.clear()
        for astronomical_object in self.deleted_objects:
            self.objects.pop(astronomical_object.id, None)
        self.deleted_objects.clear()

    async def rollback(self) -> None:
        self.pending_objects.clear()
        self.deleted_objects.clear()


class PlanetaryParametersApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.session = FakeAsyncSession()
        self.app = FastAPI()
        self.app.include_router(astronomical_objects_router, prefix="/api")
        self.app.dependency_overrides[get_db_session] = self.get_session
        self.app.dependency_overrides[current_superuser] = self.get_superuser
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app),
            base_url="http://test",
        )

    async def asyncTearDown(self) -> None:
        await self.client.aclose()
        self.app.dependency_overrides.clear()

    async def get_session(self):
        yield self.session

    async def get_superuser(self):
        return object()

    @staticmethod
    def object_payload(**values):
        return {
            "name": "Kepler-22b",
            "object_type_id": 1,
            **values,
        }

    async def test_create_and_read_planetary_parameters(self) -> None:
        parameters = {
            "mass_earth": "2.4",
            "radius_earth": "1.8",
            "orbital_period_days": "289.9",
            "semi_major_axis_au": "0.812",
            "eccentricity": "0.04",
            "inclination_deg": "89.7",
            "equilibrium_temperature_k": "262",
            "insolation_flux_earth": "1.1",
        }
        response = await self.client.post(
            "/api/astronomical-objects",
            json=self.object_payload(planetary_parameters=parameters),
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Decimal(response.json()["planetary_parameters"]["mass_earth"]),
            Decimal("2.4"),
        )
        self.assertEqual(
            Decimal(response.json()["planetary_parameters"]["inclination_deg"]),
            Decimal("89.7"),
        )

        response = await self.client.get("/api/astronomical-objects/1")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            Decimal(response.json()["planetary_parameters"]["orbital_period_days"]),
            Decimal("289.9"),
        )

    async def test_objects_without_parameters_serialize_as_null(self) -> None:
        response = await self.client.post(
            "/api/astronomical-objects", json=self.object_payload()
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.json()["planetary_parameters"])

    async def test_put_omission_clears_planetary_parameters(self) -> None:
        create_response = await self.client.post(
            "/api/astronomical-objects",
            json=self.object_payload(
                planetary_parameters={"mass_earth": "2.4"}
            ),
        )
        self.assertEqual(create_response.status_code, 201)

        response = await self.client.put(
            "/api/astronomical-objects/1", json=self.object_payload()
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["planetary_parameters"])
        self.assertIsNone(self.session.objects[1].planetary_parameters)

    async def test_put_null_clears_planetary_parameters(self) -> None:
        await self.client.post(
            "/api/astronomical-objects",
            json=self.object_payload(
                planetary_parameters={"mass_earth": "2.4"}
            ),
        )

        response = await self.client.put(
            "/api/astronomical-objects/1",
            json=self.object_payload(planetary_parameters=None),
        )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["planetary_parameters"])

    async def test_put_replaces_planetary_parameters(self) -> None:
        await self.client.post(
            "/api/astronomical-objects",
            json=self.object_payload(planetary_parameters={"mass_earth": "2.4"}),
        )

        response = await self.client.put(
            "/api/astronomical-objects/1",
            json=self.object_payload(
                planetary_parameters={"radius_earth": "1.2"}
            ),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            Decimal(response.json()["planetary_parameters"]["radius_earth"]),
            Decimal("1.2"),
        )
        self.assertIsNone(response.json()["planetary_parameters"]["mass_earth"])

    async def test_invalid_parameter_ranges_are_rejected(self) -> None:
        for field, value in (
            ("mass_earth", "0"),
            ("eccentricity", "1"),
            ("inclination_deg", "180.1"),
            ("equilibrium_temperature_k", "-1"),
            ("insolation_flux_earth", "-0.1"),
            ("mass_earth", "NaN"),
            ("mass_earth", "Infinity"),
        ):
            with self.subTest(field=field):
                response = await self.client.post(
                    "/api/astronomical-objects",
                    json=self.object_payload(
                        planetary_parameters={field: value}
                    ),
                )
                self.assertEqual(response.status_code, 422)

        response = await self.client.post(
            "/api/astronomical-objects",
            json=self.object_payload(
                planetary_parameters={"mass_earth": "1", "unknown_field": "2"}
            ),
        )
        self.assertEqual(response.status_code, 422)

    async def test_parameters_are_allowed_for_any_object_type(self) -> None:
        response = await self.client.post(
            "/api/astronomical-objects",
            json=self.object_payload(
                planetary_parameters={"mass_earth": "1"}
            ),
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["object_type"]["name"], "Galaxy")
        self.assertEqual(
            Decimal(response.json()["planetary_parameters"]["mass_earth"]),
            Decimal("1"),
        )

    async def test_delete_object_removes_parameters_record(self) -> None:
        await self.client.post(
            "/api/astronomical-objects",
            json=self.object_payload(
                planetary_parameters={"mass_earth": "2.4"}
            ),
        )

        response = await self.client.delete("/api/astronomical-objects/1")

        self.assertEqual(response.status_code, 204)
        self.assertNotIn(1, self.session.objects)

    def test_parameter_model_has_cascading_primary_key_and_checks(self) -> None:
        self.assertIn("planetary_parameters", Base.metadata.tables)
        self.assertIsNotNone(PlanetaryParameters)
        primary_key = next(iter(PlanetaryParameters.__table__.primary_key.columns))
        self.assertEqual(primary_key.name, "astronomical_object_id")
        foreign_key = next(iter(primary_key.foreign_keys))
        self.assertEqual(foreign_key.ondelete, "CASCADE")
        self.assertEqual(len(PlanetaryParameters.__table__.constraints) - 2, 8)


if __name__ == "__main__":
    unittest.main()

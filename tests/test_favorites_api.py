import unittest
from datetime import datetime, timezone
from types import SimpleNamespace

import httpx
from fastapi import FastAPI
from sqlalchemy.exc import IntegrityError

from backend.api.dependencies import get_db_session
from backend.astronomical_objects.models import AstronomicalObject
from backend.database import models
from backend.database.base import Base
from backend.favorites.models import Favorite
from backend.favorites.routes import router as favorites_router
from backend.object_types.models import ObjectType
from backend.users.auth import current_active_user


class FakeAsyncSession:
    def __init__(self) -> None:
        self.objects = {
            7: AstronomicalObject(
                id=7,
                name="Andromeda Galaxy",
                catalog_id="M31",
                object_type_id=1,
                description="A nearby galaxy",
                object_type=ObjectType(id=1, name="Galaxy", description=None),
            )
        }
        self.favorites: list[Favorite] = []
        self.pending_favorites: list[Favorite] = []
        self.pending_deletions: list[Favorite] = []
        self.next_favorite_id = 1
        self.fail_next_commit_with: str | None = None

    async def get(self, model: type, object_id: int):
        if model is AstronomicalObject:
            return self.objects.get(object_id)
        raise AssertionError(f"Unexpected model lookup: {model}")

    async def scalars(self, statement):
        parameters = statement.compile().params
        user_id = next(
            value for key, value in parameters.items() if key.startswith("user_id")
        )
        return iter(
            favorite
            for favorite in self.favorites
            if favorite.user_id == user_id
        )

    async def scalar(self, statement):
        parameters = statement.compile().params
        return next(
            (
                favorite
                for favorite in self.favorites
                if all(
                    favorite.user_id == value
                    if key.startswith("user_id")
                    else favorite.astronomical_object_id == value
                    for key, value in parameters.items()
                )
            ),
            None,
        )

    def add(self, favorite: Favorite) -> None:
        self.pending_favorites.append(favorite)

    async def delete(self, favorite: Favorite) -> None:
        self.pending_deletions.append(favorite)

    async def commit(self) -> None:
        if self.fail_next_commit_with is not None:
            constraint_name = self.fail_next_commit_with
            self.fail_next_commit_with = None
            raise IntegrityError(
                "INSERT INTO favorites",
                {},
                SimpleNamespace(
                    diag=SimpleNamespace(constraint_name=constraint_name)
                ),
            )

        existing_pairs = {
            (favorite.user_id, favorite.astronomical_object_id)
            for favorite in self.favorites
        }
        for favorite in self.pending_favorites:
            if favorite.astronomical_object_id is None:
                favorite.astronomical_object_id = favorite.astronomical_object.id
            pair = (favorite.user_id, favorite.astronomical_object_id)
            if pair in existing_pairs:
                raise IntegrityError(
                    "INSERT INTO favorites",
                    {},
                    SimpleNamespace(
                        diag=SimpleNamespace(
                            constraint_name=(
                                "uq_favorites_user_id_astronomical_object_id"
                            )
                        )
                    ),
                )
            existing_pairs.add(pair)

        for favorite in self.pending_favorites:
            favorite.id = self.next_favorite_id
            self.next_favorite_id += 1
            favorite.created_at = datetime.now(timezone.utc)
            self.favorites.append(favorite)
        self.pending_favorites.clear()

        for favorite in self.pending_deletions:
            self.favorites.remove(favorite)
        self.pending_deletions.clear()

    async def rollback(self) -> None:
        self.pending_favorites.clear()
        self.pending_deletions.clear()


class FavoritesApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.session = FakeAsyncSession()
        self.app = FastAPI()
        self.app.include_router(favorites_router, prefix="/api")
        self.app.dependency_overrides[get_db_session] = self.get_session
        self.app.dependency_overrides[current_active_user] = self.get_user
        self.user_id = 11
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app),
            base_url="http://test",
        )

    async def asyncTearDown(self) -> None:
        await self.client.aclose()
        self.app.dependency_overrides.clear()

    async def get_session(self):
        yield self.session

    async def get_user(self):
        return SimpleNamespace(id=self.user_id)

    async def test_unauthenticated_requests_are_rejected(self) -> None:
        self.app.dependency_overrides.pop(current_active_user)
        for method, url, kwargs in (
            ("GET", "/api/favorites", {}),
            ("POST", "/api/favorites", {"json": {"astronomical_object_id": 7}}),
            ("DELETE", "/api/favorites/7", {}),
        ):
            with self.subTest(method=method):
                response = await self.client.request(method, url, **kwargs)
                self.assertEqual(response.status_code, 401)

    async def test_list_favorites_returns_empty_array(self) -> None:
        response = await self.client.get("/api/favorites")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    async def test_create_favorite_returns_nested_object(self) -> None:
        response = await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["astronomical_object"]["id"], 7)
        self.assertEqual(response.json()["astronomical_object"]["object_type"]["name"], "Galaxy")
        self.assertEqual(self.session.favorites[0].user_id, self.user_id)

    async def test_create_favorite_for_missing_object_returns_404(self) -> None:
        response = await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 999}
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.session.pending_favorites, [])

    async def test_duplicate_favorite_returns_409(self) -> None:
        await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )

        response = await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(len(self.session.favorites), 1)
        self.assertEqual(self.session.pending_favorites, [])

    async def test_concurrent_duplicate_integrity_error_returns_409(self) -> None:
        self.session.fail_next_commit_with = (
            "uq_favorites_user_id_astronomical_object_id"
        )

        response = await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(self.session.pending_favorites, [])

    async def test_other_integrity_errors_do_not_leak_database_details(self) -> None:
        self.session.fail_next_commit_with = "unexpected_foreign_key"

        response = await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )

        self.assertEqual(response.status_code, 409)
        self.assertNotIn("unexpected_foreign_key", response.text)
        self.assertEqual(self.session.pending_favorites, [])

    async def test_request_cannot_spoof_user_id(self) -> None:
        response = await self.client.post(
            "/api/favorites",
            json={"astronomical_object_id": 7, "user_id": 999},
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.session.favorites, [])

    async def test_favorites_are_isolated_between_users(self) -> None:
        await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )
        self.user_id = 22
        await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )

        self.user_id = 11
        response = await self.client.get("/api/favorites")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(len(self.session.favorites), 2)

    async def test_delete_only_removes_the_current_users_favorite(self) -> None:
        await self.client.post(
            "/api/favorites", json={"astronomical_object_id": 7}
        )
        other_user_favorite = Favorite(
            id=2,
            user_id=22,
            astronomical_object_id=7,
            astronomical_object=self.session.objects[7],
            created_at=datetime.now(timezone.utc),
        )
        self.session.favorites.append(other_user_favorite)

        response = await self.client.delete("/api/favorites/7")

        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.session.favorites, [other_user_favorite])
        self.assertIn(7, self.session.objects)

    async def test_delete_missing_favorite_returns_404(self) -> None:
        response = await self.client.delete("/api/favorites/7")

        self.assertEqual(response.status_code, 404)
        self.assertIn(7, self.session.objects)

    def test_favorite_model_preserves_database_constraints(self) -> None:
        self.assertIn("observation_logs", Base.metadata.tables)
        self.assertIsNotNone(models.ObservationLog)
        unique_constraints = [
            constraint
            for constraint in Favorite.__table__.constraints
            if constraint.__class__.__name__ == "UniqueConstraint"
        ]
        self.assertEqual(len(unique_constraints), 1)
        self.assertEqual(
            tuple(column.name for column in unique_constraints[0].columns),
            ("user_id", "astronomical_object_id"),
        )
        for column_name in ("user_id", "astronomical_object_id"):
            foreign_key = next(
                iter(Favorite.__table__.c[column_name].foreign_keys)
            )
            self.assertEqual(foreign_key.ondelete, "CASCADE")

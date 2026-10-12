from sqlalchemy.exc import IntegrityError


class IntegrityConflictError(Exception):
    """Raised when a database integrity constraint rejects a write."""


def integrity_constraint_name(error: IntegrityError) -> str | None:
    """Return the violated PostgreSQL constraint name when the driver exposes it."""
    original = error.orig
    diagnostic = getattr(original, "diag", None)
    return getattr(original, "constraint_name", None) or getattr(
        diagnostic, "constraint_name", None
    )

class ServiceError(Exception):
    """Base exception for service errors."""
    pass

class NotFoundError(ServiceError):
    """Resource not found."""
    pass

class ValidationError(ServiceError):
    """Input validation failed."""
    pass

class DatabaseError(ServiceError):
    """Database operation failed."""
    pass

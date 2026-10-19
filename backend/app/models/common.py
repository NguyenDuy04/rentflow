from typing import Annotated

from pydantic import BeforeValidator

# Coerces a Mongo ObjectId (or anything) to str when a model is built from a
# raw Mongo document, so API responses always expose plain string ids.
PyObjectId = Annotated[str, BeforeValidator(str)]

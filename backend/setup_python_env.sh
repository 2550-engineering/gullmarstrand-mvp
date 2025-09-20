# 1. Create a virtual environment named .venv
python -m venv .venv

# 2. Activate the virtual environment
source .venv/bin/activate

# 3. Upgrade pip (optional but recommended)
pip install --upgrade pip

# 4. Install required packages
pip install fastapi uvicorn sqlalchemy pydantic

# 5. (Optional) If you use Alembic for migrations:
pip install alembic
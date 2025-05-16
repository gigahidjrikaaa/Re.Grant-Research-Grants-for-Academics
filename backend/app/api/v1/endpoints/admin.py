from fastapi import APIRouter, Depends, HTTPException, status, Body
import sqlalchemy
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect # For dynamic queries and inspection
from typing import List, Dict, Any, Optional

from app.db.session import get_db
from app.api import deps
from app.models import User # Import one of your models to get Base.metadata for table listing
from app.db.base_class import Base
from app import models # To access metadata for all tables

router = APIRouter()

# --- Helper Functions (can be moved to a utility module) ---

def get_table_metadata(table_name: str):
    # The calling function (get_table_schema) already ensures that 
    # table_name is a valid key in Base.metadata.tables.
    
    # inspect(TableObject) returns the TableObject itself.
    table_object = inspect(Base.metadata.tables.get(table_name))
    
    # The 'if not table_object:' check is removed as it caused the TypeError
    # and is redundant here because table_object is guaranteed to be a Table instance.

    # Directly use the table_object to get columns and primary keys.
    # SQLAlchemy Table objects have .columns and .primary_key attributes.
    return {
        "name": table_name,
        "columns": [{"name": col.name, "type": str(col.type)} for col in table_object.columns],
        "primary_keys": [pk.name for pk in table_object.primary_key]
    }

# --- Admin Endpoints ---

@router.get("/tables", response_model=List[str])
async def list_manageable_tables(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(deps.get_current_active_superuser)
):
    """
    List all table names manageable by the admin panel.
    For security, you might want to return a predefined list rather than all tables.
    """
    # Option 1: List all tables known to SQLAlchemy Base.metadata
    # Be cautious with this in production; expose only what's necessary.
    table_names = list(Base.metadata.tables.keys())
    
    # Option 2: Define a list of explicitly allowed tables for admin editing
    # allowed_tables = ["users", "profiles", "grants", "projects"]
    # table_names = [tbl for tbl in Base.metadata.tables.keys() if tbl in allowed_tables]
    
    return sorted(table_names)


@router.get("/tables/{table_name}/schema", response_model=Optional[Dict[str, Any]])
async def get_table_schema(
    table_name: str,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(deps.get_current_active_superuser)
):
    """
    Get the schema (columns, types, primary keys) of a specific table.
    """
    if table_name not in Base.metadata.tables:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")
    
    schema_info = get_table_metadata(table_name)
    if not schema_info: # Should not happen if previous check passed, but good for safety
        raise HTTPException(status_code=404, detail=f"Could not inspect schema for table '{table_name}'.")
    return schema_info


@router.get("/tables/{table_name}/data", response_model=Dict[str, Any])
async def get_table_data(
    table_name: str,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(deps.get_current_active_superuser),
    page: int = 1,
    page_size: int = 20,
    sort_by: Optional[str] = None,
    sort_desc: bool = False,
    # TODO: Add filtering capabilities based on query parameters
    # For example: filter_column: Optional[str] = None, filter_value: Optional[str] = None
):
    """
    Fetch paginated and sorted data from a specific table.
    """
    if table_name not in Base.metadata.tables:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")

    table = Base.metadata.tables[table_name]
    
    query = db.query(table) # Query the raw table object

    # Sorting (basic example, ensure sort_by is a valid column name to prevent SQL injection)
    if sort_by:
        if sort_by not in table.columns:
            raise HTTPException(status_code=400, detail=f"Invalid sort column: {sort_by}")
        column_to_sort = table.columns[sort_by]
        if sort_desc:
            query = query.order_by(column_to_sort.desc())
        else:
            query = query.order_by(column_to_sort.asc())
    else: # Default sort by primary key if available and single
        pk_columns = [pk for pk in table.primary_key.columns]
        if pk_columns and len(pk_columns) == 1:
             query = query.order_by(pk_columns[0].asc())


    total_count = query.count() # Get total count before pagination for accurate total
    
    # Pagination
    offset = (page - 1) * page_size
    rows_sqlalchemy_proxy = query.offset(offset).limit(page_size).all()
    
    # Convert SQLAlchemy RowProxy objects to dictionaries
    # This is important because RowProxy objects aren't directly JSON serializable by default in all contexts
    # although FastAPI can often handle them. Being explicit is safer.
    rows = [dict(row._mapping) for row in rows_sqlalchemy_proxy] # _mapping gives a dict-like view

    return {
        "table_name": table_name,
        "total_rows": total_count,
        "page": page,
        "page_size": page_size,
        "data": rows
    }

@router.post("/tables/{table_name}/data", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
async def create_table_row(
    table_name: str,
    # For dynamic data, receive a dictionary. Pydantic validation would be ideal here
    # but requires dynamic Pydantic model creation or a generic Dict with frontend validation.
    row_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(deps.get_current_active_superuser)
):
    """
    Create a new row in the specified table.
    Data validation should occur on the frontend or via dynamically generated Pydantic models.
    """
    if table_name not in Base.metadata.tables:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")
    
    table = Base.metadata.tables[table_name]
    
    # Basic validation: Ensure all provided keys are actual columns
    valid_columns = {col.name for col in table.columns}
    for key in row_data.keys():
        if key not in valid_columns:
            raise HTTPException(status_code=400, detail=f"Invalid column '{key}' for table '{table_name}'.")

    try:
        stmt = table.insert().values(**row_data)
        result = db.execute(stmt)
        db.commit()
        
        # Fetch the newly created row (especially to get auto-generated IDs)
        # This assumes a single primary key. If composite, this needs adjustment.
        pk_columns = [pk.name for pk in table.primary_key.columns]
        if result.inserted_primary_key and pk_columns:
            # Assuming single primary key for simplicity
            # For composite keys, result.inserted_primary_key will be a tuple
            pk_values = result.inserted_primary_key
            
            # Construct a query to fetch the inserted row
            # For single PK:
            if len(pk_columns) == 1 and len(pk_values) == 1:
                select_stmt = table.select().where(table.columns[pk_columns[0]] == pk_values[0])
                new_row_proxy = db.execute(select_stmt).first()
                if new_row_proxy:
                    return dict(new_row_proxy._mapping)
            # For composite PKs, you'd need to build the where clause with all parts of the composite key
            # For now, just return the input data or a success message if fetching is complex
            return {"detail": "Row created successfully", "inserted_primary_key": pk_values, "data_sent": row_data}

        return {"detail": "Row created successfully, but could not retrieve the full new row.", "data_sent": row_data}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating row: {str(e)}")


@router.put("/tables/{table_name}/data/{row_id_str}", response_model=Dict[str, Any])
async def update_table_row(
    table_name: str,
    row_id_str: str, # Assuming primary key is a single integer for simplicity in path
    row_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(deps.get_current_active_superuser)
):
    """
    Update an existing row in the table by its primary key.
    Assumes a single primary key for simplicity.
    If composite PK, row_id might need to be a JSON string or multiple path/query params.
    """
    if table_name not in Base.metadata.tables:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")

    table = Base.metadata.tables[table_name]
    pk_columns = [pk for pk in table.primary_key.columns]

    if not pk_columns:
        raise HTTPException(status_code=400, detail=f"Table '{table_name}' has no primary key defined for updates.")
    
    # For simplicity, assuming single integer PK. Convert row_id_str to the correct type.
    # This needs to be more robust for different PK types (string, UUID, composite).
    # Let's assume the first primary key column is the one we use for `row_id_str`.
    primary_key_column = pk_columns[0]
    
    # Attempt to convert row_id_str to the type of the primary key column
    # This is a very basic type conversion and might need to be more sophisticated
    try:
        if isinstance(primary_key_column.type, (sqlalchemy.sql.sqltypes.Integer, sqlalchemy.sql.sqltypes.BigInteger)):
            row_id_typed = int(row_id_str)
        elif isinstance(primary_key_column.type, sqlalchemy.sql.sqltypes.String):
            row_id_typed = str(row_id_str)
        # Add more type checks if needed (UUID, etc.)
        else:
            row_id_typed = row_id_str # Fallback, might not work for all types
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid ID format for primary key '{primary_key_column.name}'. Expected type compatible with {primary_key_column.type}.")


    # Basic validation: Ensure all provided keys are actual columns
    valid_columns = {col.name for col in table.columns}
    for key in row_data.keys():
        if key not in valid_columns:
            raise HTTPException(status_code=400, detail=f"Invalid column '{key}' for table '{table_name}'.")
        if key == primary_key_column.name and row_data[key] != row_id_typed: # Prevent changing PK via body if it's also in path
            raise HTTPException(status_code=400, detail=f"Primary key '{primary_key_column.name}' cannot be changed via request body if specified in path.")


    try:
        stmt = table.update().where(primary_key_column == row_id_typed).values(**row_data)
        result = db.execute(stmt)
        
        if result.rowcount == 0:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Row with ID '{row_id_str}' not found in table '{table_name}'.")
            
        db.commit()
        
        # Fetch the updated row
        select_stmt = table.select().where(primary_key_column == row_id_typed)
        updated_row_proxy = db.execute(select_stmt).first()
        if updated_row_proxy:
            return dict(updated_row_proxy._mapping)
        return {"detail": "Row updated successfully, but could not retrieve the full updated row."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating row: {str(e)}")


@router.delete("/tables/{table_name}/data/{row_id_str}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_table_row(
    table_name: str,
    row_id_str: str, # Assuming single integer PK
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(deps.get_current_active_superuser)
):
    """
    Delete a row from the table by its primary key.
    Assumes a single primary key for simplicity.
    """
    if table_name not in Base.metadata.tables:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")

    table = Base.metadata.tables[table_name]
    pk_columns = [pk for pk in table.primary_key.columns]

    if not pk_columns:
        raise HTTPException(status_code=400, detail=f"Table '{table_name}' has no primary key defined for deletion.")

    primary_key_column = pk_columns[0] # Assuming single PK

    try:
        if isinstance(primary_key_column.type, (sqlalchemy.sql.sqltypes.Integer, sqlalchemy.sql.sqltypes.BigInteger)):
            row_id_typed = int(row_id_str)
        elif isinstance(primary_key_column.type, sqlalchemy.sql.sqltypes.String):
            row_id_typed = str(row_id_str)
        else:
            row_id_typed = row_id_str
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid ID format for primary key '{primary_key_column.name}'.")

    try:
        stmt = table.delete().where(primary_key_column == row_id_typed)
        result = db.execute(stmt)
        
        if result.rowcount == 0:
            db.rollback() # Not strictly necessary for delete if it didn't find anything, but good practice
            raise HTTPException(status_code=404, detail=f"Row with ID '{row_id_str}' not found in table '{table_name}'.")
        
        db.commit()
        return # Returns 204 No Content automatically by FastAPI if no body is returned

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting row: {str(e)}")

# TODO: Add an endpoint for executing raw SQL (VERY DANGEROUS - use with extreme caution and validation)
# This should be heavily restricted and ideally not exposed unless absolutely necessary
# and with input sanitization or specific command whitelisting.
# For a hackathon, if you need it, be very careful.
# @router.post("/sql-editor/execute", response_model=Dict[str, Any])
# async def execute_sql_query(
#     query: str = Body(..., embed=True),
#     db: Session = Depends(get_db),
#     current_admin: models.User = Depends(deps.get_current_active_superuser)
# ):
#     if not query.strip().upper().startswith("SELECT"): # Basic safety: only allow SELECTs
#         raise HTTPException(status_code=400, detail="Only SELECT queries are allowed for now.")
#     try:
#         result_proxy = db.execute(text(query))
#         if result_proxy.returns_rows:
#             results = [dict(row._mapping) for row in result_proxy.fetchall()]
#             return {"data": results, "columns": list(result_proxy.keys())}
#         else:
#             db.commit() # For DML/DDL that don't return rows but change data (be careful!)
#             return {"message": "Query executed, no rows returned.", "rowcount": result_proxy.rowcount}
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=400, detail=f"SQL Error: {str(e)}")

import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
import json

# Import functions from the service
from services.analysis_service import _extract_address, _fetch_bigquery_context

# --- Tests for _extract_address ---

def test_extract_address_full():
    content = "Please analyze the property at 440 N Wabash Ave, Chicago, IL 60611."
    assert _extract_address(content) == "440 N Wabash Ave, Chicago, IL"

def test_extract_address_simple():
    content = "Info for 123 Main St"
    assert _extract_address(content) == "123 Main St"

def test_extract_address_none():
    content = "A building in Chicago."
    assert _extract_address(content) is None

# --- Tests for _fetch_bigquery_context ---

@patch('services.analysis_service.bigquery.Client')
def test_fetch_no_address_provided(mock_client):
    """Test that it returns an error JSON when no address is provided."""
    result = _fetch_bigquery_context(None)
    result_json = json.loads(result)
    assert "error" in result_json
    assert "No address could be extracted" in result_json["error"]
    mock_client.assert_not_called()

@patch('services.analysis_service.bigquery.Client')
def test_fetch_property_not_found(mock_client):
    """Test that it returns an error JSON when the property isn't in BigQuery."""
    mock_query_job = MagicMock()
    mock_query_job.to_dataframe.return_value = pd.DataFrame() # Empty dataframe
    
    mock_instance = mock_client.return_value
    mock_instance.query.return_value = mock_query_job

    result = _fetch_bigquery_context("999 Fake St")
    result_json = json.loads(result)
    assert "error" in result_json
    assert "No property found" in result_json["error"]

@patch('services.analysis_service.bigquery.Client')
def test_fetch_full_relational_data(mock_client):
    """Test a successful fetch that pulls related data using the property_id."""
    # --- Mock Data ---
    property_data = pd.DataFrame([
        {'property_id': 101, 'address': '440 N Wabash Ave', 'state': 'IL', 'property_type': 'Office'}
    ])
    loan_data = pd.DataFrame([
        {'loan_id': 201, 'property_id': 101, 'loan_amount': 18000000}
    ])
    tenant_data = pd.DataFrame([
        {'tenant_id': 301, 'property_id': 101, 'tenant_name': 'Smith & Jones Law'}
    ])
    comps_data = pd.DataFrame([
        {'comp_id': 401, 'sale_price': 30000000}
    ])

    # --- Mock Client Behavior ---
    # Configure the side_effect to return different dataframes for each call
    mock_instance = mock_client.return_value
    mock_instance.query.side_effect = [
        MagicMock(to_dataframe=MagicMock(return_value=property_data)), # First call finds the property
        MagicMock(to_dataframe=MagicMock(return_value=loan_data)),     # Second call finds the loan
        MagicMock(to_dataframe=MagicMock(return_value=tenant_data)),   # Third call finds tenants
        MagicMock(to_dataframe=MagicMock(return_value=comps_data)),    # Fourth call finds comps
    ]

    # --- Run Test ---
    result = _fetch_bigquery_context("440 N Wabash Ave")
    result_json = json.loads(result)

    # --- Assertions ---
    # Check that the query method was called 4 times
    assert mock_instance.query.call_count == 4
    
    # Check that the final JSON context is structured correctly
    assert result_json['property_details']['property_id'] == 101
    assert result_json['loan_details']['loan_id'] == 201
    assert len(result_json['tenant_roll']) == 1
    assert result_json['tenant_roll'][0]['tenant_id'] == 301
    assert len(result_json['market_comps']) == 1
    assert result_json['market_comps'][0]['comp_id'] == 401
    
    # Check that the second query used the property_id from the first query
    second_call_args = mock_instance.query.call_args_list[1]
    query_config = second_call_args.kwargs['job_config']
    # This is a bit deep, but it verifies the foreign key logic
    assert query_config.query_parameters[0].name == "property_id"
    assert query_config.query_parameters[0].value == 101

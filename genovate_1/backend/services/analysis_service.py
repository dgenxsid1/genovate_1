
import os
import re
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPICallError
import pandas as pd

from prompts import LOAN_ANALYSIS_PROMPT_TEMPLATE

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
DATASET_ID = "cre_data" # The dataset you created in BigQuery

def _extract_address(file_content: str) -> str | None:
    """Extracts a potential address from the user's text input."""
    # A simple regex to find something that looks like a street address
    match = re.search(r'(\d+\s+[A-Za-z0-9\s,]+(?:Ave|St|Blvd|Rd|Way|Ln|Dr|Ct)[A-Za-z0-9\s,]+)', file_content, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None

def _fetch_bigquery_context(address: str) -> str:
    """
    Fetches a structured, relational context from BigQuery based on a property address.
    """
    if not address:
        return json.dumps({"error": "No address could be extracted from the user input."})

    context = {
        "property_details": None,
        "loan_details": None,
        "tenant_roll": [],
        "market_comps": []
    }

    try:
        client = bigquery.Client(project=GCP_PROJECT_ID)
        
        # --- Query 1: Find the property by address to get its primary key ---
        property_query = f"""
            SELECT * FROM `{GCP_PROJECT_ID}.{DATASET_ID}.properties`
            WHERE address LIKE @address
            LIMIT 1
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("address", "STRING", f"%{address}%")]
        )
        property_df = client.query(property_query, job_config=job_config).to_dataframe()

        if property_df.empty:
            return json.dumps({"error": f"No property found in BigQuery for address like '{address}'."})

        property_details = property_df.to_dict(orient='records')[0]
        context["property_details"] = property_details
        property_id = property_details['property_id']
        
        # --- Query 2: Use the property_id (foreign key) to get related data ---
        
        # Get Loan Details
        loan_query = f"SELECT * FROM `{GCP_PROJECT_ID}.{DATASET_ID}.loans` WHERE property_id = @property_id LIMIT 1"
        job_config = bigquery.QueryJobConfig(query_parameters=[bigquery.ScalarQueryParameter("property_id", "INT64", property_id)])
        loan_df = client.query(loan_query, job_config=job_config).to_dataframe()
        if not loan_df.empty:
            context["loan_details"] = loan_df.to_dict(orient='records')[0]

        # Get Tenant Roll
        tenants_query = f"SELECT * FROM `{GCP_PROJECT_ID}.{DATASET_ID}.tenants` WHERE property_id = @property_id"
        job_config = bigquery.QueryJobConfig(query_parameters=[bigquery.ScalarQueryParameter("property_id", "INT64", property_id)])
        tenants_df = client.query(tenants_query, job_config=job_config).to_dataframe()
        if not tenants_df.empty:
            context["tenant_roll"] = tenants_df.to_dict(orient='records')

        # Get Market Comps
        comps_query = f"""
            SELECT * FROM `{GCP_PROJECT_ID}.{DATASET_ID}.market_comps`
            WHERE state = @state AND property_type = @property_type
            LIMIT 5
        """
        job_config = bigquery.QueryJobConfig(query_parameters=[
            bigquery.ScalarQueryParameter("state", "STRING", property_details['state']),
            bigquery.ScalarQueryParameter("property_type", "STRING", property_details['property_type'])
        ])
        comps_df = client.query(comps_query, job_config=job_config).to_dataframe()
        if not comps_df.empty:
            context["market_comps"] = comps_df.to_dict(orient='records')

        # Convert the entire context to a JSON string for the prompt
        return json.dumps(context, default=str) # Use default=str to handle dates/timestamps

    except GoogleAPICallError as e:
        print(f"BigQuery API Error: {e}")
        return json.dumps({"error": f"Error accessing BigQuery. Details: {e.message}"})
    except Exception as e:
        print(f"An unexpected error occurred during BigQuery fetch: {e}")
        return json.dumps({"error": "An unexpected error occurred while fetching data from BigQuery."})


async def get_analysis_memo(file_content: str) -> str:
    """
    Uses LangChain and Google Gemini to analyze the provided text content,
    enriched with structured, relational data from Google BigQuery.
    """
    address = _extract_address(file_content)
    if not address:
        return "Could not identify a property address from your input. Please provide a clear address to analyze."

    bigquery_context = _fetch_bigquery_context(address)

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("API_KEY"))

    prompt = PromptTemplate(
        template=LOAN_ANALYSIS_PROMPT_TEMPLATE,
        input_variables=["file_content", "bigquery_context"],
    )

    chain = prompt | llm | StrOutputParser()
    response = await chain.ainvoke({
        "file_content": file_content,
        "bigquery_context": bigquery_context
    })

    return response


# AI Commercial Real Estate Analyst - Deployment Guide

This guide provides clear, step-by-step instructions to deploy the application to a live server on Google Compute Engine (GCE).

## Deployment Strategy

We will use a modern, container-based approach for a reliable and repeatable deployment:
1.  **Package Locally**: We will package the entire application into a single `.zip` file on your local computer.
2.  **Upload to Server**: We will upload this single file to the Google Compute Engine VM.
3.  **Deploy on Server**: A script on the server will unpack and run the application using Docker.

## Prerequisites

-   A Google Cloud Platform (GCP) account with billing enabled.
-   The `gcloud` CLI installed and authenticated on your **local machine** (`gcloud auth login` and `gcloud auth application-default login`).
-   Python installed on your **local machine** to run the packaging script.

---

## Step 0: Get Your Google API Key

You must have a Google API Key to use the Gemini model.

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click on **"Get API key"** in the top-left menu.
3.  Click **"Create API key in new project"**.
4.  A new key will be generated. **Copy this key immediately.** Treat this key like a password and do not share it publicly.
5.  You will add this key to the `.env` file on the server in a later step.

---

## Step 1: Uploading the Sample Datasets to BigQuery (Crucial Step)

This application is designed to work with a relational data model. You must upload the provided sample CSV files to your BigQuery project for the backend to function correctly.

1.  **Navigate to BigQuery**: In the [Google Cloud Console](https://console.cloud.google.com/), go to the **BigQuery** section.
2.  **Create a Dataset**:
    -   In the Explorer panel, click on your project name.
    -   On the right, click **"CREATE DATASET"**.
    -   For **Dataset ID**, enter `cre_data`.
    -   Leave the other options as default and click **"CREATE DATASET"**.
3.  **Upload Each CSV as a Table**:
    -   You will find the sample CSV files in the `backend/sample_data` directory.
    -   For each of the four files (`properties.csv`, `loans.csv`, `tenants.csv`, `market_comps.csv`), follow these steps:
        -   In the Explorer panel, click the three dots next to your new `cre_data` dataset and select **"Create table"**.
        -   **Source**: Set "Create table from" to **Upload**.
        -   **Select file**: Browse and select the CSV file from your local machine.
        -   **Table name**: Name the table exactly as the file is named (e.g., `properties`, `loans`, etc.).
        -   **Schema**: Check the box for **"Auto-detect schema"**.
        -   Click **"CREATE TABLE"**.
    -   Repeat this process for all four CSV files. When you are done, you will have four tables inside your `cre_data` dataset.

---

## Step 2: Prepare and Deploy the Application

Follow the deployment steps from the previous `README.md` version. The process remains the same:
1.  **Prepare Project Locally**: Run `python download.py` to create `cre_analyst_app.zip`.
2.  **Prepare GCE Environment**: Create the VM, reserve a static IP, and create the firewall rule for port 8000.
3.  **Deploy to VM**:
    -   Upload the `cre_analyst_app.zip` file to the VM using `gcloud compute scp`.
    -   SSH into the VM.
    -   Install Docker Compose.
    -   Unzip the project.
    -   Configure the `backend/.env` file with your API key and Project ID.
    -   Run the `./deploy.sh` script with your static IP.

---

## Step 3: Access and Test Your Live Application

### Accessing the App
Open your web browser and navigate to your server's static IP address:

**http://YOUR_STATIC_IP_ADDRESS_HERE**

### Testing with Sample Data
The application is now configured to query the tables you just created.
1.  Use the sample text from `sample-data.txt` (now removed, but the content is in the Welcome Screen) or simply type an address from your new `properties.csv` table, for example: **"Analyze the property at 440 N Wabash Ave, Chicago, IL 60611"**.
2.  Click **"Generate Memo"**. The backend will now find this property in your `properties` table and use its `property_id` to fetch related loans and tenants, providing a deeply interconnected analysis.

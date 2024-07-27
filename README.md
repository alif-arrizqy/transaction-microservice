# Service Installation Guide

This guide provides the steps to install and run the `user-service`, `transaction-service`, and `material-service`.

## Steps to Install and Run the Services

### 1. Enter the Directory
Navigate to the directory of the service you want to install.

```bash
    cd path/to/service-directory
```

### 2. Install Packages
Install the necessary packages using npm.
```bash
    npm i
```

### 3. Adjust the Database Config
Edit the .env file to configure the database settings.

```
    # Example .env file
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=password
    DB_NAME=database_name
```
### 4. Create Database in MySQL
Ensure the database specified in the .env file is created.

### 5. Run the service
Start the service using the npm run dev command.
```bash
    npm run dev
```

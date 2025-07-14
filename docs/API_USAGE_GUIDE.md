# PlaceMyShop Backend API Usage Guide

This guide provides practical examples and workflows for using the PlaceMyShop Backend API. All examples use cURL commands and include complete authentication workflows.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Workflow](#authentication-workflow)
3. [User Management](#user-management)
4. [Role Management](#role-management)
5. [Business Management](#business-management)
6. [Common Workflows](#common-workflows)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Getting Started

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: Your deployed application URL

### Interactive Documentation

Visit the Swagger UI for interactive API documentation:
- **Local**: http://localhost:3000/api/docs
- **Features**: 
  - Interactive testing
  - Complete schema documentation
  - Authentication testing
  - Request/response examples

### Prerequisites

1. Application is running (see main README.md for setup)
2. MongoDB is connected
3. Default roles are seeded automatically
4. cURL is installed on your system

## Authentication Workflow

### Step 1: Login to Get Tokens

```bash
# Login with default admin credentials (if seeded)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "@id": "user-uuid-123",
    "email": "admin@example.com",
    "givenName": "Admin",
    "familyName": "User",
    "role": {
      "@id": "role-uuid-456",
      "roleName": "Admin"
    }
  }
}
```

### Step 2: Save and Use Access Token

Export the token for subsequent requests:
```bash
# Extract token from login response and export
export ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 3: Test Authentication

```bash
# Get your profile to verify authentication
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Step 4: Refresh Token (when access token expires)

```bash
# Refresh access token using refresh token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token_here"
  }'
```

### Step 5: Logout

```bash
# Logout (client should discard tokens)
curl -X POST http://localhost:3000/auth/logout
```

## User Management

### Create a New User

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "givenName": "John",
    "familyName": "Doe",
    "email": "john.doe@example.com",
    "telephone": "+1234567890",
    "password": "securePassword123",
    "roleId": "role-uuid-for-manager",
    "status": "Active"
  }'
```

### Get All Users (with pagination)

```bash
# Get first page (10 users)
curl -X GET "http://localhost:3000/users?page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Get second page (20 users per page)
curl -X GET "http://localhost:3000/users?page=2&limit=20" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Get User by ID

```bash
curl -X GET http://localhost:3000/users/user-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Update User

```bash
# Update user's name
curl -X PATCH http://localhost:3000/users/user-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "givenName": "Jane",
    "familyName": "Smith"
  }'

# Update user's password
curl -X PATCH http://localhost:3000/users/user-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newSecurePassword456"
  }'
```

### Delete User (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/users/user-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Restore Deleted User

```bash
curl -X POST http://localhost:3000/users/user-uuid-123/restore \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Role Management

### Create a New Role

```bash
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "Assistant",
    "permissions": ["customer_chat.access_read_write"]
  }'
```

### Get All Roles

```bash
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Get Role by ID

```bash
curl -X GET http://localhost:3000/roles/role-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Update Role Permissions

```bash
curl -X PATCH http://localhost:3000/roles/role-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      "customers.manage_manager",
      "customer_chat.access_full_manager"
    ]
  }'
```

### Delete Role

```bash
curl -X DELETE http://localhost:3000/roles/role-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Business Management

### Create a New Business

```bash
curl -X POST http://localhost:3000/businesses \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Awesome Dental Clinic",
    "description": "A modern dental practice",
    "founderId": "user-uuid-123",
    "email": "contact@awesomedentalclinic.com",
    "telephone": "+1555987654",
    "url": "https://awesomedentalclinic.com",
    "address": {
      "streetAddress": "123 Main Street",
      "addressLocality": "Anytown",
      "addressRegion": "CA",
      "postalCode": "90210",
      "addressCountry": "US"
    },
    "openingHours": [
      "Mo-Fr 09:00-17:00",
      "Sa 10:00-14:00"
    ],
    "sameAs": [
      "https://facebook.com/awesomedentalclinic",
      "https://twitter.com/awesomedentalclinic"
    ]
  }'
```

### Get All Businesses

```bash
curl -X GET "http://localhost:3000/businesses?page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Get Businesses by Founder

```bash
curl -X GET http://localhost:3000/businesses/by-founder/user-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Get Business by ID

```bash
curl -X GET http://localhost:3000/businesses/business-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Update Business

```bash
curl -X PATCH http://localhost:3000/businesses/business-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "An award-winning dental practice",
    "telephone": "+1555987655",
    "openingHours": [
      "Mo-Fr 08:00-18:00",
      "Sa 09:00-15:00"
    ]
  }'
```

### Delete Business

```bash
curl -X DELETE http://localhost:3000/businesses/business-uuid-123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Restore Business

```bash
curl -X POST http://localhost:3000/businesses/business-uuid-123/restore \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Common Workflows

### Complete Setup Workflow

```bash
#!/bin/bash
# Complete setup script for new environment

# 1. Login as admin
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}')

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Logged in successfully"

# 2. Create a manager role
MANAGER_ROLE=$(curl -s -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "Manager",
    "permissions": ["customers.manage_manager", "customer_chat.access_full_manager"]
  }')

MANAGER_ROLE_ID=$(echo $MANAGER_ROLE | jq -r '.@id')
echo "Created Manager role: $MANAGER_ROLE_ID"

# 3. Create a user
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"givenName\": \"John\",
    \"familyName\": \"Doe\",
    \"email\": \"john.doe@example.com\",
    \"password\": \"securePassword123\",
    \"roleId\": \"$MANAGER_ROLE_ID\"
  }")

USER_ID=$(echo $USER_RESPONSE | jq -r '.@id')
echo "Created user: $USER_ID"

# 4. Create a business
BUSINESS_RESPONSE=$(curl -s -X POST http://localhost:3000/businesses \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John's Clinic\",
    \"description\": \"A professional healthcare clinic\",
    \"founderId\": \"$USER_ID\",
    \"email\": \"contact@johnsclinic.com\"
  }")

BUSINESS_ID=$(echo $BUSINESS_RESPONSE | jq -r '.@id')
echo "Created business: $BUSINESS_ID"

echo "Setup complete!"
```

### User Assignment Workflow

```bash
# 1. Get available roles
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 2. Create user with specific role
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "givenName": "Alice",
    "familyName": "Manager",
    "email": "alice@example.com",
    "password": "password123",
    "roleId": "manager-role-id"
  }'

# 3. Verify user creation and role assignment
curl -X GET http://localhost:3000/users/new-user-id \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Successful GET, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., email exists)
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": ["email must be a valid email"],
  "error": "Bad Request"
}
```

### Handling Authentication Errors

```bash
# Check if token is expired
if curl -s -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" | grep -q "Unauthorized"; then
  echo "Token expired, refreshing..."
  # Refresh token logic here
fi
```

### Validation Error Example

```bash
# This will return validation errors
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "givenName": "",
    "email": "invalid-email",
    "password": "123"
  }'
```

**Response:**
```json
{
  "statusCode": 400,
  "message": [
    "givenName should not be empty",
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error
```bash
# Check if token is valid
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# If invalid, login again
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword"}'
```

#### 2. "Not Found" Error
```bash
# Verify the resource exists
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Check the ID format
echo "User ID: user-uuid-123"  # Should be a valid UUID or ObjectId
```

#### 3. "Conflict" Error (Email exists)
```bash
# Try a different email
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "unique.email@example.com",
    "givenName": "John",
    "familyName": "Doe",
    "password": "password123",
    "roleId": "role-id"
  }'
```

#### 4. Connection Refused
```bash
# Check if server is running
curl -f http://localhost:3000 || echo "Server not running"

# Check application logs
docker-compose logs app  # If using Docker
# or check console output if running directly
```

### Debugging Tips

1. **Use verbose cURL output**:
   ```bash
   curl -v -X GET http://localhost:3000/auth/profile \
     -H "Authorization: Bearer $ACCESS_TOKEN"
   ```

2. **Pretty print JSON responses**:
   ```bash
   curl -X GET http://localhost:3000/users \
     -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
   ```

3. **Save responses for debugging**:
   ```bash
   curl -X GET http://localhost:3000/users \
     -H "Authorization: Bearer $ACCESS_TOKEN" > response.json
   ```

4. **Test without authentication first**:
   ```bash
   # These endpoints don't require authentication
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   ```

## Best Practices

### Security

1. **Always use HTTPS in production**
2. **Store tokens securely** (not in scripts or logs)
3. **Use environment variables for sensitive data**:
   ```bash
   export API_BASE_URL="https://api.yourapp.com"
   export ADMIN_EMAIL="admin@yourapp.com"
   export ADMIN_PASSWORD="$SECURE_PASSWORD"
   ```

4. **Implement token refresh logic**:
   ```bash
   refresh_token_if_needed() {
     if ! curl -s -f -X GET $API_BASE_URL/auth/profile \
       -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null; then
       # Token expired, refresh it
       REFRESH_RESPONSE=$(curl -s -X POST $API_BASE_URL/auth/refresh \
         -H "Content-Type: application/json" \
         -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}")
       ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.access_token')
     fi
   }
   ```

### Performance

1. **Use pagination for large datasets**:
   ```bash
   curl -X GET "http://localhost:3000/users?page=1&limit=50" \
     -H "Authorization: Bearer $ACCESS_TOKEN"
   ```

2. **Cache frequently used data** (roles, etc.)
   - The API uses in-memory caching for `findAll` endpoints to improve performance.

3. **Use compression for large responses**:
   ```bash
   curl -H "Accept-Encoding: gzip" -X GET http://localhost:3000/users \
     -H "Authorization: Bearer $ACCESS_TOKEN"
   ```

### Development

1. **Use the Swagger UI for testing**: http://localhost:3000/api/docs
2. **Create reusable scripts** for common operations
3. **Use meaningful variable names** in scripts
4. **Add error checking** to scripts:
   ```bash
   response=$(curl -s -w "%{http_code}" -X GET http://localhost:3000/users \
     -H "Authorization: Bearer $ACCESS_TOKEN")
   
   http_code=${response: -3}
   if [ $http_code -ne 200 ]; then
     echo "Error: HTTP $http_code"
     exit 1
   fi
   ```

### Rate Limiting

- The API may implement rate limiting in production
- Implement exponential backoff for retries
- Monitor response headers for rate limit information

### Monitoring

1. **Log API responses** for debugging
2. **Monitor token expiration**
3. **Track API usage patterns**
4. **Set up alerts for errors**

---

## Additional Resources

- **Interactive API Documentation**: http://localhost:3000/api/docs
- **Main Project README**: [README.md](../README.md)
- **Schema Documentation**: [SCHEMA.md](./SCHEMA.md)
- **AI Agent Guidelines**: [AGENTS.md](../AGENTS.md)
- **GitHub Copilot Guidelines**: [COPILOT_AGENTS.md](../COPILOT_AGENTS.md)

## Support

For issues or questions:
1. Check the Swagger documentation at `/api/docs`
2. Review the troubleshooting section above
3. Check application logs for detailed error messages
4. Verify your environment configuration matches the requirements

---

*This guide covers the core API functionality. As new features are added, this documentation will be updated accordingly.*
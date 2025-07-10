# Schema Documentation

This document outlines the data schema design for the `placemyshop-backend` project. We use JSON-LD (JSON for Linking Data) to define our entities, promoting interoperability and semantic clarity.

## Rationale for JSON-LD

JSON-LD is chosen for its ability to:

-   **Provide Semantic Context:** It allows us to add context to our JSON data, making it self-descriptive and understandable by machines and humans.
-   **Enhance Interoperability:** By mapping to well-known vocabularies (like Schema.org), our data can be easily understood and consumed by other systems and search engines.
-   **Leverage Existing JSON Tooling:** JSON-LD is built on top of JSON, meaning we can use existing JSON parsers and libraries.
-   **Support Linked Data Principles:** It enables the creation of a web of data, where entities can be linked to other entities, both within and outside our domain.

## Core Entities

Below are the initial definitions for our core data entities. These will be expanded as the project evolves.

### Professional

Represents a liberal professional or a representative of an SMB office using the platform.

**JSON-LD Example:**

```json
{
  "@context": "http://schema.org/",
  "@type": "Person",
  "name": "Dr. Jane Doe",
  "jobTitle": "General Practitioner",
  "alumniOf": "University of Medical Sciences",
  "knowsLanguage": ["en", "es"],
  "memberOf": {
    "@type": "Organization",
    "name": "National Medical Association"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Health St",
    "addressLocality": "Wellville",
    "addressRegion": "CA",
    "postalCode": "90210",
    "addressCountry": "US"
  },
  "telephone": "+1-555-123-4567",
  "email": "jane.doe@example.com",
  "url": "http://www.janedoeclinic.com",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services Offered",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "General Consultation"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Annual Check-up"
        }
      }
    ]
  }
}
```

**Fields:**

*   **`@context`**: Specifies the vocabulary (Schema.org in this case).
*   **`@type`**: Defines the entity type (e.g., `Person`, `Physician`).
*   **`name`**: The professional's full name.
*   **`jobTitle`**: The professional's specific title (e.g., Dentist, Lawyer, Architect).
*   **`alumniOf`**: Educational institutions attended.
*   **`knowsLanguage`**: Languages spoken.
*   **`memberOf`**: Professional organizations.
*   **`address`**: Physical office address.
*   **`telephone`**: Contact phone number.
*   **`email`**: Contact email address.
*   **`url`**: Website URL.
*   **`openingHoursSpecification`**: Office opening hours.
*   **`hasOfferCatalog`**: List of services offered.

### Client

Represents a client or patient of the professional or SMB office.

**JSON-LD Example:**

```json
{
  "@context": "http://schema.org/",
  "@type": "Person",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "telephone": "+1-555-789-0123",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "456 Client Ave",
    "addressLocality": "Anytown",
    "addressRegion": "TX",
    "postalCode": "73301",
    "addressCountry": "US"
  }
}
```

**Fields:**

*   **`@context`**: Specifies the vocabulary (Schema.org).
*   **`@type`**: Defines the entity type as `Person`.
*   **`name`**: The client's full name.
*   **`email`**: Client's email address.
*   **`telephone`**: Client's phone number.
*   **`address`**: Client's address.

---

This documentation will be updated as new entities are introduced or existing ones are modified.
```

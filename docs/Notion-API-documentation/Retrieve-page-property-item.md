Retrieve a page property item

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/pages/{page_id}/properties/{property_id}": {
      "get": {
        "summary": "Retrieve a page property item",
        "description": "",
        "operationId": "retrieve-a-page-property",
        "parameters": [
          {
            "name": "page_id",
            "in": "path",
            "description": "Identifier for a Notion page",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "property_id",
            "in": "path",
            "description": "Identifier for a page [property](https://developers.notion.com/reference/page#all-property-values)",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "page_size",
            "in": "query",
            "description": "For paginated properties. The max number of property item objects on a page. The default size is 100",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "start_cursor",
            "in": "query",
            "description": "For paginated properties.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Number Property Item": {
                    "value": "{\n  \"object\": \"property_item\",\n  \"id\" \"kjPO\",\n  \"type\": \"number\",\n  \"number\": 2\n}"
                  },
                  "Result": {
                    "value": "{\n    \"object\": \"list\",\n    \"results\": [\n        {\n            \"object\": \"property_item\",\n            \"id\" \"kjPO\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {\n                \"type\": \"text\",\n                \"text\": {\n                    \"content\": \"Avocado \",\n                    \"link\": null\n                },\n                \"annotations\": {\n                    \"bold\": false,\n                    \"italic\": false,\n                    \"strikethrough\": false,\n                    \"underline\": false,\n                    \"code\": false,\n                    \"color\": \"default\"\n                },\n                \"plain_text\": \"Avocado \",\n                \"href\": null\n            }\n        },\n        {\n            \"object\": \"property_item\",\n            \"id\" \"ijPO\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {\n                \"type\": \"mention\",\n                \"mention\": {\n                    \"type\": \"page\",\n                    \"page\": {\n                        \"id\": \"41117fd7-69a5-4694-bc07-c1e3a682c857\"\n                    }\n                },\n                \"annotations\": {\n                    \"bold\": false,\n                    \"italic\": false,\n                    \"strikethrough\": false,\n                    \"underline\": false,\n                    \"code\": false,\n                    \"color\": \"default\"\n                },\n                \"plain_text\": \"Lemons\",\n                \"href\": \"http://notion.so/41117fd769a54694bc07c1e3a682c857\"\n            }\n        },\n        {\n            \"object\": \"property_item\",\n            \"id\" \"kjPO\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {\n                \"type\": \"text\",\n                \"text\": {\n                    \"content\": \" Tomato \",\n                    \"link\": null\n                },\n                \"annotations\": {\n                    \"bold\": false,\n                    \"italic\": false,\n                    \"strikethrough\": false,\n                    \"underline\": false,\n                    \"code\": false,\n                    \"color\": \"default\"\n                },\n                \"plain_text\": \" Tomato \",\n                \"href\": null\n            }\n        },\n...\n    ],\n    \"next_cursor\": \"some-next-cursor-value\",\n    \"has_more\": true,\n\t\t\"next_url\": \"http://api.notion.com/v1/pages/0e5235bf86aa4efb93aa772cce7eab71/properties/NVv^?start_cursor=some-next-cursor-value&page_size=25\",\n    \"property_item\": {\n      \"id\": \"NVv^\",\n      \"next_url\": null,\n      \"type\": \"rich_text\",\n      \"rich_text\": {}\n    }\n}"
                  },
                  "Rollup List Property Item": {
                    "value": "{\n    \"object\": \"list\",\n    \"results\": [\n        {\n            \"object\": \"property_item\",\n          \t\"id\": \"dj2l\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"id\": \"83f92c9d-523d-466e-8c1f-9bc2c25a99fe\"\n            }\n        },\n        {\n            \"object\": \"property_item\",\n          \t\"id\": \"dj2l\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"id\": \"45cfb825-3463-4891-8932-7e6d8c170630\"\n            }\n        },\n        {\n            \"object\": \"property_item\",\n          \t\"id\": \"dj2l\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"id\": \"1688be1a-a197-4f2a-9688-e528c4b56d94\"\n            }\n        }\n    ],\n    \"next_cursor\": \"some-next-cursor-value\",\n    \"has_more\": true,\n\t\t\"property_item\": {\n      \"id\": \"y}~p\",\n      \"next_url\": \"http://api.notion.com/v1/pages/0e5235bf86aa4efb93aa772cce7eab71/properties/y%7D~p?start_cursor=1QaTunT5&page_size=25\",\n      \"type\": \"rollup\",\n      \"rollup\": {\n        \"function\": \"sum\",\n        \"type\": \"incomplete\",\n        \"incomplete\": {}\n      }\n    }\n    \"type\": \"property_item\"\n}"
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const pageId = 'b55c9c91-384d-452b-81db-d1ef79372b75';\n  const propertyId = \"aBcD123\n  const response = await notion.pages.properties.retrieve({ page_id: pageId, property_id: propertyId });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl --request GET \\\n  --url https://api.notion.com/v1/pages/b55c9c91-384d-452b-81db-d1ef79372b75/properties/some-property-id \\\n  --header 'Authorization: Bearer $NOTION_API_KEY' \\\n  --header 'Notion-Version: 2022-06-28'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:614943b3de71ea001c546257"
}
```
openapi: 3.1.0
info:
  title: Notion Mat Database
  version: "1.0"
servers:
  - url: https://api.notion.com
paths:
  /v1/databases/250b0484bfa480b99341f936bcce2f6d/query:
    post:
      operationId: queryMatDatabase
      summary: Query the Mat database
      security:
        - notionAuth: []
      parameters:
        - name: Notion-Version
          in: header
          required: true
          description: Notion API version header, e.g. 2022-06-28.
          schema:
            type: string
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/QueryRequest'
      responses:
        '200':
          description: Notion response payload
components:
  securitySchemes:
    notionAuth:
      type: http
      scheme: bearer
      bearerFormat: notion_api_key
  schemas:
    QueryRequest:
      type: object
      properties:
        filter:
          type: object
          description: Optional Notion filter definition.
        sorts:
          type: array
          items:
            type: object
          description: Optional sort definitions.
        start_cursor:
          type: string
          description: Cursor from a previous response.
        page_size:
          type: integer
          minimum: 1
          maximum: 100
          description: Number of pages to return (max 100).
      additionalProperties: true
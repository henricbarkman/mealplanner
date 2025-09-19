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
              $ref: "#/components/schemas/QueryRequest"
      responses:
        "200":
          description: Notion response payload
  /v1/pages/{page_id}:
    get:
      operationId: getPage
      summary: Fetch a Notion page by id
      security:
        - notionAuth: []
      parameters:
        - name: page_id
          in: path
          required: true
          description: Notion page identifier (hyphenated eller kompakt).
          schema:
            type: string
        - name: Notion-Version
          in: header
          required: true
          description: Notion API version header, e.g. 2022-06-28.
          schema:
            type: string
      responses:
        "200":
          description: Notion page payload
    patch:
      operationId: updateMealPage
      summary: Update meal properties on an existing Notion page
      security:
        - notionAuth: []
      parameters:
        - name: page_id
          in: path
          required: true
          description: Notion page identifier to update.
          schema:
            type: string
        - name: Notion-Version
          in: header
          required: true
          description: Notion API version header, e.g. 2022-06-28.
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateMealPageRequest"
      responses:
        "200":
          description: Notion page update response
  /v1/blocks/{block_id}/children:
    get:
      operationId: listBlockChildren
      summary: List child blocks for a Notion block or page
      security:
        - notionAuth: []
      parameters:
        - name: block_id
          in: path
          required: true
          description: Notion block or page identifier whose children to fetch.
          schema:
            type: string
        - name: Notion-Version
          in: header
          required: true
          description: Notion API version header, e.g. 2022-06-28.
          schema:
            type: string
        - name: page_size
          in: query
          required: false
          description: Number of child blocks to return per page (max 100).
          schema:
            type: integer
            minimum: 1
            maximum: 100
        - name: start_cursor
          in: query
          required: false
          description: Cursor fr n f reg ende svar f r att paginera resultat.
          schema:
            type: string
      responses:
        "200":
          description: Notion block children payload
  /v1/pages:
    post:
      operationId: createPage
      summary: Create a Notion page in the Mat workspace
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
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - parent
                - properties
              properties:
                parent:
                  type: object
                  required:
                    - database_id
                  properties:
                    database_id:
                      type: string
                      description: Notion database id that will own the new page.
                  additionalProperties: false
                properties:
                  type: object
                  description: Page properties, matching the Notion database schema.
                  additionalProperties:
                    type: object
                    description: Property payload following Notion's property value schema.
                children:
                  type: array
                  description: Optional block content to append to the page when creating it.
                  items:
                    type: object
                    additionalProperties: true
                icon:
                  type: object
                  description: Optional page icon definition.
                  additionalProperties: true
                cover:
                  type: object
                  description: Optional page cover definition.
                  additionalProperties: true
              additionalProperties: false
      responses:
        "200":
          description: Notion page creation response
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
          description: Cursor fr n f reg ende svar f r paginering.
        page_size:
          type: integer
          minimum: 1
          maximum: 100
          description: Number of pages to return (max 100).
      additionalProperties: true
    UpdateMealPageRequest:
      type: object
      required:
        - properties
      properties:
        properties:
          type: object
          description: |
            Property map to update on the meal page. Supported keys:
            - Namn (title property, Notion id `title`)
            - URL (url property, Notion id `%3BH~Q`)
            - Betyg (multi_select, Notion id `E%3DH%7B`)
            - Kommentar (rich_text, Notion id `qGVL`)
            - Kategori (multi_select, Notion id `qN_L`)
            Pass the standard Notion property payload for each key.
          additionalProperties: true
          example:
            Namn:
              title:
                - type: text
                  text:
                    content: Pasta med tomats s och basilika
            Kategori:
              multi_select:
                - name: Vego
            Betyg:
              multi_select:
                - name: A1
            Kommentar:
              rich_text:
                - type: text
                  text:
                    content: Snabbt, enkelt och barnv nligt.
            URL:
              url: https://example.com/recept
      additionalProperties: false

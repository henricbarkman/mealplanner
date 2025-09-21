openapi: 3.1.0
info:
  title: Notion Title Editor + Finder (DB-aware, minimal)
  version: 1.1.1
servers:
  - url: https://api.notion.com
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
  schemas: {}  # must be an object

paths:
  /v1/databases/{database_id}:
    get:
      operationId: getDatabaseDataSources
      summary: Retrieve database container to discover its data_sources
      security:
        - bearerAuth: []
      parameters:
        - name: database_id
          in: path
          required: true
          schema:
            type: string
            # Lock to your DB by default; change if you ever need another
            enum: ["250b0484bfa480b99341f936bcce2f6d"]
        - name: Notion-Version
          in: header
          required: true
          schema:
            type: string
            enum: ["2025-09-03"]
      responses:
        '200':
          description: Returns a database object that includes a data_sources[] array
          content:
            application/json:
              schema:
                type: object
                properties: {}

  /v1/data_sources/{data_source_id}/query:
    post:
      operationId: findPagesByName
      summary: Find pages in a data source by title ("Name")
      security:
        - bearerAuth: []
      parameters:
        - name: data_source_id
          in: path
          required: true
          schema:
            type: string
        - name: Notion-Version
          in: header
          required: true
          schema:
            type: string
            enum: ["2025-09-03"]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                filter:
                  type: object
                  properties:
                    property:
                      type: string
                      enum: ["Name"]
                    title:
                      type: object
                      properties:
                        contains:
                          type: string
                        equals:
                          type: string
                page_size:
                  type: integer
            example:
              filter:
                property: "Name"
                title: { contains: "Tacos" }
              page_size: 3
      responses:
        '200':
          description: Query results
          content:
            application/json:
              schema:
                type: object
                properties: {}

  /v1/pages/{page_id}:
    patch:
      operationId: updatePageTitle
      summary: Update the "Name" title of a Notion page
      security:
        - bearerAuth: []
      parameters:
        - name: page_id
          in: path
          required: true
          schema:
            type: string
            example: "251b0484-bfa4-80ec-8a9c-d612597d2d70"
        - name: Notion-Version
          in: header
          required: true
          schema:
            type: string
            enum: ["2025-09-03"]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [properties]
              properties:
                properties:
                  type: object
                  required: [Name]
                  properties:
                    Name:
                      type: object
                      required: [title]
                      properties:
                        title:
                          type: array
                          items:
                            type: object
                            properties:
                              text:
                                type: object
                                properties:
                                  content:
                                    type: string
            example:
              properties:
                Name:
                  title:
                    - text: { content: "Tacos (edited)" }
      responses:
        '200':
          description: Page updated
          content:
            application/json:
              schema:
                type: object
                properties: {}
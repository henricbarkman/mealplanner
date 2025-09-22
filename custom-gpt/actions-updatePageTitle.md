openapi: 3.1.0
info:
  title: Notion Title Editor + Finder (DB-aware, extended)
  version: 1.2.0
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
                  additionalProperties: false
                page_size:
                  type: integer
              additionalProperties: false
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
      operationId: updateMealPage
      summary: Update the "Name" title and related metadata on a Notion page
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
                  description: Provide only the properties you need to update.
                  additionalProperties: true
                  properties:
                    Name:
                      type: object
                      required: [title]
                      properties:
                        title:
                          type: array
                          items:
                            type: object
                            required: [text]
                            properties:
                              text:
                                type: object
                                required: [content]
                                properties:
                                  content:
                                    type: string
                                  link:
                                    type: object
                                    nullable: true
                                    additionalProperties: true
                    URL:
                      type: object
                      properties:
                        url:
                          type: string
                          nullable: true
                      additionalProperties: false
                    Kommentar:
                      type: object
                      properties:
                        rich_text:
                          type: array
                          items:
                            type: object
                            required: [text]
                            properties:
                              text:
                                type: object
                                required: [content]
                                properties:
                                  content:
                                    type: string
                                  link:
                                    type: object
                                    nullable: true
                                    additionalProperties: true
                      additionalProperties: false
                    Kategori:
                      type: object
                      properties:
                        multi_select:
                          type: array
                          items:
                            type: object
                            required: [name]
                            properties:
                              name:
                                type: string
                          default: []
                      additionalProperties: false
                    Betyg:
                      type: object
                      properties:
                        multi_select:
                          type: array
                          items:
                            type: object
                            required: [name]
                            properties:
                              name:
                                type: string
                          default: []
                      additionalProperties: false
                    Status:
                      type: object
                      properties:
                        status:
                          type: object
                          required: [name]
                          properties:
                            name:
                              type: string
                          additionalProperties: false
                      additionalProperties: false
            examples:
              titleOnly:
                summary: Update just the Name property
                value:
                  properties:
                    Name:
                      title:
                        - text: { content: "Tacos (edit)" }
              titleAndMetadata:
                summary: Update Name plus metadata fields
                value:
                  properties:
                    Name:
                      title:
                        - text: { content: "Vardagsgryta" }
                    URL:
                      url: "https://example.com/vardagsgryta"
                    Kommentar:
                      rich_text:
                        - text: { content: "Stang spisen vid 92 C." }
                    Kategori:
                      multi_select:
                        - name: "Vego"
                        - name: "Snabbt"
                    Betyg:
                      multi_select:
                        - name: "A1"
                        - name: "L2"
                    Status:
                      status:
                        name: "Planerad"
      responses:
        '200':
          description: Page updated
          content:
            application/json:
              schema:
                type: object
                properties: {}

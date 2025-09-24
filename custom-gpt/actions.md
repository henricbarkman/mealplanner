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
  schemas:
    BlockRichText:
      type: object
      additionalProperties: false
      properties:
        rich_text:
          type: array
          description: New textual content to render inside the block.
          items:
            type: object
            required: [type]
            properties:
              type:
                type: string
                description: Rich text item type, for example "text" or "mention".
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
              mention:
                type: object
                additionalProperties: true
                description: Mention payload when type is "mention".
              equation:
                type: object
                additionalProperties: true
                description: Equation payload when type is "equation".
              annotations:
                type: object
                additionalProperties: true
                description: Styling flags such as bold or italic.
              plain_text:
                type: string
                description: Unformatted text that mirrors the content field.
              href:
                type: string
                nullable: true
                description: URL that the rich text item links to, if any.
        color:
          type: string
          description: Optional color name from the Notion color palette.
        is_toggleable:
          type: boolean
          description: Enable the block to toggle its nested children when true.
        children:
          type: array
          description: Nested blocks for toggle and callout updates.
          items:
            type: object
            additionalProperties: true
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

  /v1/databases/{database_id}/query:
    post:
      operationId: listDatabasePages
      summary: Query a database to enumerate pages and child databases
      description: |
        Lists the pages and/or sub-databases contained in a database. When no filter is supplied all entries
        are returned, paginated according to the request options. Requires using a Notion API version no
        later than 2022-06-28 because the endpoint is deprecated in newer releases.
      security:
        - bearerAuth: []
      parameters:
        - name: database_id
          in: path
          required: true
          schema:
            type: string
        - name: Notion-Version
          in: header
          required: true
          schema:
            type: string
            enum: ["2022-06-28"]
        - name: filter_properties
          in: query
          required: false
          schema:
            type: array
            items:
              type: string
          description: >-
            Repeatable query parameter that limits the response to specific property value IDs when paired
            with a filter.
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: false
              properties:
                filter:
                  type: object
                  description: Criteria that limit which pages are returned.
                  additionalProperties: true
                sorts:
                  type: array
                  description: Sorting instructions that control result ordering.
                  items:
                    type: object
                    additionalProperties: true
                start_cursor:
                  type: string
                  description: Cursor provided by the API to fetch the next page of results.
                page_size:
                  type: integer
                  maximum: 100
                  description: Desired number of items to include in the response (max 100).
            examples:
              listAllPages:
                summary: Return the first 50 entries without filters
                value:
                  page_size: 50
      responses:
        '200':
          description: Successful database query response
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

  /v1/pages:
    post:
      operationId: createMealPage
      summary: Create a new page in the meal planner database
      description: >-
        Creates a page as a database entry so the assistant can add brand-new meals. The request must supply the
        parent database along with property values for the required fields.
      security:
        - bearerAuth: []
      parameters:
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
              required: [parent, properties]
              additionalProperties: false
              properties:
                parent:
                  type: object
                  required: [database_id]
                  additionalProperties: false
                  properties:
                    database_id:
                      type: string
                      enum: ["250b0484bfa480b99341f936bcce2f6d"]
                properties:
                  type: object
                  description: Property values to initialize on the new page.
                  additionalProperties: true
                  properties:
                    Name:
                      type: object
                      required: [title]
                      properties:
                        title:
                          type: array
                          minItems: 1
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
                children:
                  type: array
                  description: Optional content blocks to insert in the page body.
                  items:
                    type: object
                    additionalProperties: true
            examples:
              minimalTitle:
                summary: Create a page with just the required Name property
                value:
                  parent:
                    database_id: "250b0484bfa480b99341f936bcce2f6d"
                  properties:
                    Name:
                      title:
                        - text:
                            content: "Nudelwok"
              fullProperties:
                summary: Create a page including metadata and starting content
                value:
                  parent:
                    database_id: "250b0484bfa480b99341f936bcce2f6d"
                  properties:
                    Name:
                      title:
                        - text:
                            content: "Rostad Pumpasallad"
                    URL:
                      url: "https://example.com/rostad-pumpasallad"
                    Kommentar:
                      rich_text:
                        - text:
                            content: "Servera med vitlöksbröd."
                    Kategori:
                      multi_select:
                        - name: "Vego"
                        - name: "Middag"
                    Betyg:
                      multi_select:
                        - name: "A1"
                  children:
                    - object: "block"
                      type: "heading_2"
                      heading_2:
                        rich_text:
                          - type: "text"
                            text:
                              content: "Ingredienser"
                    - object: "block"
                      type: "bulleted_list_item"
                      bulleted_list_item:
                        rich_text:
                          - type: "text"
                            text:
                              content: "Pumpa"
      responses:
        '200':
          description: Page created successfully
          content:
            application/json:
              schema:
                type: object
                properties: {}

  /v1/pages/{page_id}:
    get:
      operationId: retrieveMealPage
      summary: Retrieve a Notion page's properties and parent information
      description: Fetches the canonical representation of a page so the assistant can inspect current property values before editing.
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
      responses:
        '200':
          description: Page object including property values and parent reference
          content:
            application/json:
              schema:
                type: object
                properties: {}

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
      responses:
        '200':
          description: Page updated
          content:
            application/json:
              schema:
                type: object
                properties: {}

  /v1/blocks/{block_id}/children:
    get:
      operationId: listBlockChildren
      summary: List the child blocks that make up a page's content
      description: Returns the structured block tree underneath a block or page so the assistant can show the body content to the user.
      security:
        - bearerAuth: []
      parameters:
        - name: block_id
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
        - name: start_cursor
          in: query
          required: false
          schema:
            type: string
          description: Cursor provided by the API to fetch the next set of child blocks.
        - name: page_size
          in: query
          required: false
          schema:
            type: integer
            maximum: 100
          description: Number of child blocks to return in the response (max 100).
      responses:
        '200':
          description: Paginated list of child block objects
          content:
            application/json:
              schema:
                type: object
                properties: {}
  /v1/blocks/{block_id}:
    patch:
      operationId: updateBlockContent
      summary: Update an existing block's textual content or metadata
      description: >-
        Edits a block in place so the assistant can fix typos, rewrite instructions, or toggle checkboxes on an
        existing page. Supports textual block types, including headings, paragraphs, list items, quotes, callouts,
        and to-dos.
      security:
        - bearerAuth: []
      parameters:
        - name: block_id
          in: path
          required: true
          schema:
            type: string
            example: "9f1e8f4a-4662-4f94-8bd8-b83b7645a143"
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
              additionalProperties: false
              properties:
                archived:
                  type: boolean
                  description: Archive the block when set to true.
                paragraph:
                  $ref: '#/components/schemas/BlockRichText'
                heading_1:
                  $ref: '#/components/schemas/BlockRichText'
                heading_2:
                  $ref: '#/components/schemas/BlockRichText'
                heading_3:
                  $ref: '#/components/schemas/BlockRichText'
                bulleted_list_item:
                  $ref: '#/components/schemas/BlockRichText'
                numbered_list_item:
                  $ref: '#/components/schemas/BlockRichText'
                quote:
                  $ref: '#/components/schemas/BlockRichText'
                callout:
                  allOf:
                    - $ref: '#/components/schemas/BlockRichText'
                    - type: object
                      properties:
                        icon:
                          type: object
                          additionalProperties: true
                          description: Optional icon to display in the callout.
                toggle:
                  $ref: '#/components/schemas/BlockRichText'
                to_do:
                  allOf:
                    - $ref: '#/components/schemas/BlockRichText'
                    - type: object
                      properties:
                        checked:
                          type: boolean
                          description: Mark the to-do as completed when true.
            examples:
              rewriteParagraph:
                summary: Update the copy inside an existing paragraph block
                value:
                  paragraph:
                    rich_text:
                      - text:
                          content: "Koka pastan tills den är al dente och blanda med såsen."
              completeTodo:
                summary: Check off a to-do block and rewrite the instruction
                value:
                  to_do:
                    rich_text:
                      - text:
                          content: "Hacka koriandern fint och strö över vid servering."
                    checked: true
      responses:
        '200':
          description: Updated block object
          content:
            application/json:
              schema:
                type: object
                properties: {}
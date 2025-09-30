openapi: 3.1.0
info:
  title: Notion Meal Planner Actions
  description: Åtgärder för att söka, läsa och skriva recept i en Notion-databas för Matplaneraren.
  version: 2.1.6
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
          description: |
            Textinnehåll i blocket. Inkludera alltid `"type": "text"` för enkla textnoder:
            { "type": "text", "text": { "content": "Din text" } }.
          items:
            type: object
            required: [type]
            properties:
              type:
                type: string
                description: T.ex. "text" eller "mention".
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
              equation:
                type: object
                additionalProperties: true
              annotations:
                type: object
                additionalProperties: true
              plain_text:
                type: string
              href:
                type: string
                nullable: true
        color:
          type: string
          description: Valfri färg från Notions färgpalett.
        children:
          type: array
          description: Nästlade block (t.ex. för toggle/callout/heading med barn).
          items:
            type: object
            additionalProperties: true

    HeadingRichText:
      allOf:
        - $ref: '#/components/schemas/BlockRichText'
        - type: object
          additionalProperties: false
          properties:
            is_toggleable:
              type: boolean
              description: Endast giltig för heading_1/2/3.

    AppendChildrenPayload:
      type: object
      description: |
        Body för att lägga till barnblock under ett block eller en sida.
        **Viktigt:** Skicka `children` i JSON-body (inte som query eller separata kwargs).
        Använd denna endpoint för att *lägga till nytt innehåll*. Använd PATCH `/v1/blocks/{block_id}` för att *redigera* ett befintligt block.
      required: [children]
      additionalProperties: true
      properties:
        children:
          type: array
          minItems: 1
          maxItems: 100
          items:
            type: object
            additionalProperties: true
            properties:
              object:
                type: string
                enum: ["block"]
              type:
                type: string
                description: Blocktyp, t.ex. "paragraph", "heading_2", "bulleted_list_item".
              paragraph:
                $ref: '#/components/schemas/BlockRichText'
              heading_1:
                $ref: '#/components/schemas/HeadingRichText'
              heading_2:
                $ref: '#/components/schemas/HeadingRichText'
              heading_3:
                $ref: '#/components/schemas/HeadingRichText'
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
                    additionalProperties: false
                    properties:
                      icon:
                        type: object
                        additionalProperties: true
              toggle:
                $ref: '#/components/schemas/BlockRichText'
              to_do:
                allOf:
                  - $ref: '#/components/schemas/BlockRichText'
                  - type: object
                    additionalProperties: false
                    properties:
                      checked:
                        type: boolean

paths:

  /v1/search:
    post:
      operationId: searchPages
      summary: Sök efter sidor eller databaser (t.ex. hitta recept efter titel).
      security:
        - bearerAuth: []
      parameters:
        - name: Notion-Version
          in: header
          required: true
          description: Stabil Notion API-version.
          schema:
            type: string
            enum: ["2022-06-28"]
        - name: Content-Type
          in: header
          required: false
          schema:
            type: string
            enum: ["application/json"]
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
              properties:
                query:
                  type: string
                filter:
                  type: object
                  properties:
                    value:
                      type: string
                      enum: [page, database]
                    property:
                      type: string
                      enum: [object]
                sort:
                  type: object
                  properties:
                    direction:
                      type: string
                      enum: [ascending, descending]
                    timestamp:
                      type: string
                      enum: [last_edited_time]
            examples:
              findByTitle:
                summary: Hitta sidor som innehåller "Tacos" i titeln
                value:
                  query: "Tacos"
                  filter: { value: "page", property: "object" }
                  sort: { direction: "descending", timestamp: "last_edited_time" }
      responses:
        '200':
          description: Sökresultat
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

  /v1/databases/{database_id}:
    get:
      operationId: getDatabase
      summary: Hämta metadata för en databas (t.ex. property-nycklar).
      security:
        - bearerAuth: []
      parameters:
        - name: database_id
          in: path
          required: true
          schema:
            type: string
            example: "250b0484bfa480b99341f936bcce2f6d"
        - name: Notion-Version
          in: header
          required: true
          schema:
            type: string
            enum: ["2022-06-28"]
      responses:
        '200':
          description: Databasobjekt
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

  /v1/databases/{database_id}/query:
    post:
      operationId: queryDatabase
      summary: Lista/filtrera sidor i en databas (rekommenderad väg för att hitta recept).
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
        - name: Content-Type
          in: header
          required: false
          schema:
            type: string
            enum: ["application/json"]
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
                  additionalProperties: true
                sorts:
                  type: array
                  items:
                    type: object
                    additionalProperties: true
                start_cursor:
                  type: string
                page_size:
                  type: integer
                  maximum: 100
            examples:
              listFirst50:
                summary: Första 50 utan filter
                value:
                  page_size: 50
              filterByTitle:
                summary: Filtrera på Name innehåller "lax"
                value:
                  filter:
                    property: "Name"
                    title: { contains: "lax" }
                  page_size: 10
      responses:
        '200':
          description: Sidor från databasen
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

  /v1/pages:
    post:
      operationId: createPage
      summary: Skapa nytt receptkort (sida) i en databas.
      security:
        - bearerAuth: []
      parameters:
        - name: Notion-Version
          in: header
          required: true
          schema:
            type: string
            enum: ["2022-06-28"]
        - name: Content-Type
          in: header
          required: true
          schema:
            type: string
            enum: ["application/json"]
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
                      description: ID för måldatabasen.
                properties:
                  type: object
                  description: Notion-egenskaper för den nya sidan.
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
                            required: [type, text]
                            properties:
                              type:
                                type: string
                                enum: ["text"]
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
                            required: [type, text]
                            properties:
                              type:
                                type: string
                                enum: ["text"]
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
                  description: Valfria block som brödtext (ingredienser, steg m.m.).
                  items:
                    type: object
                    additionalProperties: true
            examples:
              minimal:
                summary: Skapa med bara titel
                value:
                  parent: { database_id: "250b0484bfa480b99341f936bcce2f6d" }
                  properties:
                    Name:
                      title:
                        - type: "text"
                          text: { content: "Rostad pumpasallad" }
              fullSv:
                summary: Skapa med svenska fält + startinnehåll
                value:
                  parent: { database_id: "250b0484bfa480b99341f936bcce2f6d" }
                  properties:
                    Name:
                      title:
                        - type: "text"
                          text: { content: "Fiskgratäng med potatis" }
                    URL: { url: "https://exempel.se/fiskgratang" }
                    Kommentar:
                      rich_text:
                        - type: "text"
                          text: { content: "Barnvänlig. Servera med ärtor." }
                    Kategori:
                      multi_select:
                        - name: "Fisk"
                        - name: "Middag"
                    Betyg:
                      multi_select:
                        - name: "A1"
                        - name: "I1"
                  children:
                    - object: "block"
                      type: "heading_2"
                      heading_2:
                        rich_text:
                          - type: "text"
                            text: { content: "Ingredienser" }
                    - object: "block"
                      type: "bulleted_list_item"
                      bulleted_list_item:
                        rich_text:
                          - type: "text"
                            text: { content: "600 g potatis" }
      responses:
        '200':
          description: Sida skapad
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

  /v1/pages/{page_id}:
    get:
      operationId: retrievePage
      summary: Hämta en sidas egenskaper.
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
            enum: ["2022-06-28"]
      responses:
        '200':
          description: Sida
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

    patch:
      operationId: updatePageProperties
      summary: Uppdatera titel och/eller metadata på en sida.
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
            enum: ["2022-06-28"]
        - name: Content-Type
          in: header
          required: true
          schema:
            type: string
            enum: ["application/json"]
      requestBody:
        required: true
        description: Uppdaterar endast properties/metadata. Påverkar inte sidkroppen.
        content:
          application/json:
            schema:
              type: object
              required: [properties]
              additionalProperties: false
              properties:
                properties:
                  type: object
                  description: Ange bara de egenskaper du vill uppdatera.
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
                            required: [type, text]
                            properties:
                              type:
                                type: string
                                enum: ["text"]
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
                            required: [type, text]
                            properties:
                              type:
                                type: string
                                enum: ["text"]
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
              updateTitleAndMeta:
                summary: Uppdatera titel + metadata
                value:
                  properties:
                    Name:
                      title:
                        - type: "text"
                          text: { content: "Vardagsgryta (mild)" }
                    URL: { url: "https://exempel.se/vardagsgryta" }
                    Kommentar:
                      rich_text:
                        - type: "text"
                          text: { content: "Håll 90–92 °C sjudning." }
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
          description: Sida uppdaterad
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

  /v1/blocks/{block_id}/children:
    get:
      operationId: listBlockChildren
      summary: Lista en sidas/blockets barnblock (brödtext).
      description: Returnerar träd av barnblock under en sida/ett block.
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
            enum: ["2022-06-28"]
        - name: start_cursor
          in: query
          required: false
          schema:
            type: string
        - name: page_size
          in: query
          required: false
          schema:
            type: integer
            maximum: 100
      responses:
        '200':
          description: Barnblock
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

    patch:
      operationId: appendBlockChildren
      summary: Lägg till nya barnblock (t.ex. receptsteg, inköpslista).
      description: |
        **Använd när du ska lägga till nytt innehåll (brödtext på sidan).**
        Skicka `children` i JSON-body enligt exemplen; skicka inte `children` som query-param eller separata kwargs.
        För att uppdatera existerande block, använd PATCH `/v1/blocks/{block_id}`.
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
            enum: ["2022-06-28"]
        - name: Content-Type
          in: header
          required: true
          schema:
            type: string
            enum: ["application/json"]
      requestBody:
        required: true
        description: JSON-body som innehåller `children` (se schema och exempel).
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppendChildrenPayload'
            examples:
              appendParagraph:
                summary: Lägg till ett stycke i sidans innehåll
                value:
                  children:
                    - object: "block"
                      type: "paragraph"
                      paragraph:
                        rich_text:
                          - type: "text"
                            text: { content: "Se även crispy rice" }
              appendList:
                summary: Lägg till lista med två punkter
                value:
                  children:
                    - object: "block"
                      type: "bulleted_list_item"
                      bulleted_list_item:
                        rich_text:
                          - type: "text"
                            text: { content: "500 g broccoli" }
                    - object: "block"
                      type: "bulleted_list_item"
                      bulleted_list_item:
                        rich_text:
                          - type: "text"
                            text: { content: "2 vitlöksklyftor" }
              appendTodo:
                summary: Lägg till en att-göra-rad (okryssad)
                value:
                  children:
                    - object: "block"
                      type: "to_do"
                      to_do:
                        checked: false
                        rich_text:
                          - type: "text"
                            text: { content: "Sätt på ugnen 225 °C" }
      responses:
        '200':
          description: Nya block tillagda
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

  /v1/blocks/{block_id}:
    patch:
      operationId: updateBlockContent
      summary: Uppdatera befintligt block (text, checka to-do, etc.).
      description: |
        **Använd när du vill redigera ett befintligt block.**
        För att lägga till nytt innehåll, använd PATCH `/v1/blocks/{block_id}/children`.
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
            enum: ["2022-06-28"]
        - name: Content-Type
          in: header
          required: true
          schema:
            type: string
            enum: ["application/json"]
      requestBody:
        required: true
        description: Ange fältet för den blocktyp du uppdaterar (t.ex. `paragraph`, `to_do`, `heading_2`).
        content:
          application/json:
            schema:
              type: object
              additionalProperties: false
              properties:
                archived:
                  type: boolean
                paragraph:
                  $ref: '#/components/schemas/BlockRichText'
                heading_1:
                  $ref: '#/components/schemas/HeadingRichText'
                heading_2:
                  $ref: '#/components/schemas/HeadingRichText'
                heading_3:
                  $ref: '#/components/schemas/HeadingRichText'
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
                      additionalProperties: false
                      properties:
                        icon:
                          type: object
                          additionalProperties: true
                toggle:
                  $ref: '#/components/schemas/BlockRichText'
                to_do:
                  allOf:
                    - $ref: '#/components/schemas/BlockRichText'
                    - type: object
                      additionalProperties: false
                      properties:
                        checked:
                          type: boolean
            examples:
              rewriteParagraph:
                summary: Förbättra instruktion i ett stycke
                value:
                  paragraph:
                    rich_text:
                      - type: "text"
                        text: { content: "Koka pastan 8–10 min (al dente). Blanda med såsen." }
                    color: "default"
              completeTodo:
                summary: Checka av en to-do och skriv om text
                value:
                  to_do:
                    rich_text:
                      - type: "text"
                        text: { content: "Häll av pastan och spara 1 dl kokvatten." }
                    checked: true
      responses:
        '200':
          description: Block uppdaterat
          content:
            application/json:
              schema:
                type: object
                properties: {}
                additionalProperties: true

security:
  - bearerAuth: []

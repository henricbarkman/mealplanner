openapi: 3.1.0
info:
  title: Meals API
  version: 1.0.0
servers:
  - url: https://rsanajkrlqxalfpdjqyj.functions.supabase.co
components:
  securitySchemes:
    supabaseAuth:
      type: http
      scheme: bearer
  schemas:
    MealSummary:
      type: object
      required: [id, title, categories, ratings, url]
      properties:
        id:
          type: string
          description: Notion page id
        title:
          type: string
        categories:
          type: array
          items:
            type: string
        ratings:
          type: array
          items:
            type: string
          description: "Family rating tags. Format <bokstav><siffra>: A/H = vuxna, I/L = barn; 1 = gott, 2 = okej, 3 = inte gott."
        comment:
          type: string
          nullable: true
        url:
          type: string
          format: uri
    MealDetail:
      allOf:
        - $ref: "#/components/schemas/MealSummary"
        - type: object
          required: [content_markdown]
          properties:
            content_markdown:
              type: string
              description: Notion page content rendered as Markdown
    MealsListResponse:
      type: object
      required: [meals, has_more, next_cursor]
      properties:
        meals:
          type: array
          items:
            $ref: "#/components/schemas/MealSummary"
        has_more:
          type: boolean
        next_cursor:
          type: string
          nullable: true
    CreateMealRequest:
      type: object
      required: [title]
      properties:
        title:
          type: string
        categories:
          type: array
          items:
            type: string
        ratings:
          type: array
          items:
            type: string
          description: "Family rating tags. Format <bokstav><siffra>: A/H = vuxna, I/L = barn; 1 = gott, 2 = okej, 3 = inte gott."
        comment:
          type: string
          nullable: true
        content_markdown:
          type: string
          nullable: true
    CreateMealResponse:
      type: object
      required: [id, url]
      properties:
        id:
          type: string
        url:
          type: string
          format: uri
    ErrorResponse:
      type: object
      required: [error]
      properties:
        error:
          type: string
        code:
          type: string
          nullable: true
paths:
  /meals:
    get:
      operationId: listMeals
      security:
        - supabaseAuth: []
      parameters:
        - name: query
          in: query
          schema:
            type: string
          description: Fritextsökning i titel.
        - name: categories
          in: query
          schema:
            oneOf:
              - type: string
              - type: array
                items:
                  type: string
          style: form
          explode: true
          description: En eller flera kategori-taggar.
        - name: ratings
          in: query
          schema:
            oneOf:
              - type: string
              - type: array
                items:
                  type: string
          style: form
          explode: true
          description: Betygstaggar i formatet <bokstav><siffra>.
        - name: cursor
          in: query
          schema:
            type: string
          description: Cursor från föregående svar (next_cursor).
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
          description: Antal poster per sida.
      responses:
        '200':
          description: Lista med måltider
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MealsListResponse"
        '400':
          description: Ogiltiga parametrar
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        '500':
          description: Serverfel
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
    post:
      operationId: createMeal
      security:
        - supabaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateMealRequest"
      responses:
        '201':
          description: Recept skapat
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CreateMealResponse"
        '400':
          description: Valideringsfel
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        '500':
          description: Serverfel
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
  /meals/{pageId}:
    get:
      operationId: getMeal
      security:
        - supabaseAuth: []
      parameters:
        - name: pageId
          in: path
          required: true
          schema:
            type: string
          description: Notion page id (kompakt eller med bindestreck)
      responses:
        '200':
          description: Hämtat recept
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MealDetail"
        '404':
          description: Hittades inte
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        '500':
          description: Serverfel
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
security:
  - supabaseAuth: []

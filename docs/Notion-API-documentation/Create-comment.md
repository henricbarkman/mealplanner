Create comment

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
    "/v1/comments": {
      "post": {
        "summary": "Create comment",
        "description": "Creates a comment in a page, block or existing discussion thread.",
        "operationId": "create-a-comment",
        "parameters": [
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
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "rich_text"
                ],
                "properties": {
                  "parent": {
                    "type": "string",
                    "description": "A [page parent](/reference/database#page-parent) or block parent. Either this or a discussion_id is required (not both)",
                    "format": "json"
                  },
                  "discussion_id": {
                    "type": "string",
                    "description": "A UUID identifier for a discussion thread. Either this or a parent object is required (not both)"
                  },
                  "rich_text": {
                    "type": "string",
                    "description": "A [rich text object](ref:rich-text)",
                    "format": "json"
                  },
                  "attachments": {
                    "type": "string",
                    "description": "An array of [comment attachment requests](ref:comment-attachment#request-format-input)",
                    "format": "json"
                  },
                  "display_name": {
                    "type": "string",
                    "description": "Custom display name of a comment",
                    "format": "json"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"comment\",\n    \"id\": \"b52b8ed6-e029-4707-a671-832549c09de3\",\n    \"parent\": {\n        \"type\": \"page_id\",\n        \"page_id\": \"5c6a2821-6bb1-4a7e-b6e1-c50111515c3d\"\n    },\n    \"discussion_id\": \"f1407351-36f5-4c49-a13c-49f8ba11776d\",\n    \"created_time\": \"2022-07-15T20:53:00.000Z\",\n    \"last_edited_time\": \"2022-07-15T20:53:00.000Z\",\n    \"created_by\": {\n        \"object\": \"user\",\n        \"id\": \"067dee40-6ebd-496f-b446-093c715fb5ec\"\n    },\n    \"rich_text\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Hello world\",\n                \"link\": null\n            },\n            \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n            },\n            \"plain_text\": \"Hello world\",\n            \"href\": null\n        }\n   ],\n   \"attachments\": [\n    {\n      \"category\": \"image\",\n      \"file\": {\n        \"url\": \"https://s3.us-west-2.amazonaws.com/...\",\n        \"expiry_time\": \"2025-06-10T21:58:51.599Z\"\n      }\n    }\n   ],\n\t\"display_name\": {\n\t\t\"type\": \"integration\",\n\t\t\"resolved_name\": \"Public Integration\"\n\t}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "comment"
                    },
                    "id": {
                      "type": "string",
                      "example": "b52b8ed6-e029-4707-a671-832549c09de3"
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "page_id"
                        },
                        "page_id": {
                          "type": "string",
                          "example": "5c6a2821-6bb1-4a7e-b6e1-c50111515c3d"
                        }
                      }
                    },
                    "discussion_id": {
                      "type": "string",
                      "example": "f1407351-36f5-4c49-a13c-49f8ba11776d"
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-07-15T20:53:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-07-15T20:53:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "067dee40-6ebd-496f-b446-093c715fb5ec"
                        }
                      }
                    },
                    "rich_text": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "example": "text"
                          },
                          "text": {
                            "type": "object",
                            "properties": {
                              "content": {
                                "type": "string",
                                "example": "Hello world"
                              },
                              "link": {}
                            }
                          },
                          "annotations": {
                            "type": "object",
                            "properties": {
                              "bold": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "italic": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "strikethrough": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "underline": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "code": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "color": {
                                "type": "string",
                                "example": "default"
                              }
                            }
                          },
                          "plain_text": {
                            "type": "string",
                            "example": "Hello world"
                          },
                          "href": {}
                        }
                      }
                    },
                    "attachments": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "category": {
                            "type": "string",
                            "example": "image"
                          },
                          "file": {
                            "type": "object",
                            "properties": {
                              "url": {
                                "type": "string",
                                "example": "https://s3.us-west-2.amazonaws.com/..."
                              },
                              "expiry_time": {
                                "type": "string",
                                "example": "2025-06-10T21:58:51.599Z"
                              }
                            }
                          }
                        }
                      }
                    },
                    "display_name": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "integration"
                        },
                        "resolved_name": {
                          "type": "string",
                          "example": "Public Integration"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "403": {
            "description": "403",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 403,\n    \"code\": \"restricted_resource\",\n    \"message\": \"Insufficient permissions for this endpoint.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 403,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "restricted_resource"
                    },
                    "message": {
                      "type": "string",
                      "example": "Insufficient permissions for this endpoint."
                    }
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
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const response = await notion.comments.create({\n    parent: {\n      page_id: \"5c6a28216bb14a7eb6e1c50111515c3d\"\n    },\n    rich_text: [\n      {\n        type: \"text\",\n        text: {\n          content: \"Hello world\"\n        }\n      }\n    ],\n    attachments: [\n      {\n        file_upload_id: \"48656c6c-6f20-576f-726c-64212048692e\"\n      }\n    ],\n    display_name: {\n      type: \"integration\"\n    }\n  });\n\n  console.log(response);\n})();\n",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/comments' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Notion-Version: 2022-06-28' \\\n  --data '{\n    \"parent\": {\n      \"page_id\": \"5c6a28216bb14a7eb6e1c50111515c3d\"\n    },\n    \"rich_text\": [\n      {\n        \"text\": {\n          \"content\": \"Hello world\"\n        }\n      }\n    ],\n    \"attachments\": [\n      {\n        \"file_upload_id\": \"48656c6c-6f20-576f-726c-64212048692e\"\n      }\n    ],\n\t\t\"display_name\": {\n      type: \"integration\"\n    }\n\t}'"
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
  "_id": "606ecc2cd9e93b0044cf6e47:62d1959cb1470f00438dcc1e"
}
```
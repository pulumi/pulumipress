export const schema = {
    "title": "Workshops",
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "default": "this is a test workshop",
            "maxLength": 60,
            "description": "This is the title that shows up on the list page."
        },
        "meta_desc": {
            "type": "string",
            "default": "this is a test description that is more than 50 chars............................................",
            "minLength": 50,
            "maxLength": 160,
            "description": "This is the description that shows up on the list page."
        },
        "url_slug": {
            "type": "string",
            "default": "test-workshop-url-slug",
            "description": "This is the url route where the page will live at, e.g. getting-started-with-iac "
        },
        "preview_image": {
          "type": "string",
          "default": ""
        },
      "hero": {
        "title": "Hero content",
        "type": "object",
        "description": "You can use the same title that shows up on the list page if you desire and you can just leave the default image.",
        "default": "this is a test workshop",
        "properties": {
          "title": {
            "type": "string",
            "default": "this is a test workshop"
          },
          "image": {
            "type": "string",
            "default": "/icons/containers.svg",
          }
        },
        "required": [
          "title",
          "image"
        ]
      },
      "main": {
        "title": "Landing page content",
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "default": "this is a test workshop",
          },
          "description": {
            "type": "string",
            "default": "this is a test description",
          },
          "sortable_date": {
            "type": "string",
            "default": "2022-12-25T09:00:00-08:00",
            "format": "date-time",
          },
          "duration": {
            "type": "string",
            "default": "30 minutes"
          },
          "datetime": {
            "type": "string",
            "format": "date-time"
          },
          "youtube_url": {
            "type": "string"
          },
          "presenters": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "role": {
                    "type": "string"
                  }
                },
                "required": [
                  "name",
                  "role"
                ]
              }
          },
          "learn": {
            "type": "array",
            "items": {
              "type": "string"
            },
          }
        },
        "required": [
          "sortable_date",
          "description",
          "duration",
          "title",
        ]
      },
      "event_data": {
        "title": "Google Event Data",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "start_date": {
            "type": "string",
            "format": "date-time"
          },
          "end_date": {
            "type": "string",
            "format": "date-time"
          },
          "url": {
            "type": "string"
          },
          "description": {
            "type": "string"
          }
        },
        "required": [
        ]
      },
      "form": {
        "type": "object",
        "title": "Hubspot Form",
        "properties": {
          "hubspot_form_id": {
            "type": "string",
            "default": "",
          },
          "salesforce_campaign_id": {
            "type": "string",
            "default": "",
          },
          "gotowebinar_key": {
            "type": "string",
            "default": "",
          }
        },
        "required": [
          
        ]
      },
      "featured": {
        "type": "boolean",
        "default": false,
      },
      "pre_recorded": {
        "type": "boolean",
        "default": false,
      },
      "pulumi_tv": {
        "title": "pulumi tv (will show in PulumiTV section)",
        "type": "boolean",
        "default": false,
      },
      "unlisted": {
        "title": "unlisted (will not be shown in webinars list if checked)",
        "type": "boolean",
        "default": false,
      },
      "gated": {
        "title": "gated (will users need to register to view?)",
        "type": "boolean",
        "default": true,
      },
      "type": {
        "type": "string",
        "default": "webinars"
      },
      "external": {
        "type": "boolean",
        "default": false,
      },
      "block_external_search_index": {
        "type": "boolean",
        "default": false,
      },
      "aws_only": {
        "type": "boolean",
        "default": false
      }
    },
    "required": [
      "title",
      "meta_desc",
      "url_slug"
    ]
  }
  
  export const uiSchema = {
    "ui:options": {
        "semantic": {
            "fluid": false,
            "inverted": false,
            "errorOptions": {
                "size": "small",
                "pointing": "above",
            }
        },
        addable: true
    },
    "meta_desc": {
        'ui:widget': 'textarea',
    },
    "main": {
        "description": {
            'ui:widget': 'textarea',
        }
    },
    "event_data": {
        "description": {
            'ui:widget': 'textarea',
        }
    } 
}
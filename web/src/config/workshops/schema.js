// JSON schema representation the form uses to render.
export const schema = {
    "title": "Workshops",
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "maxLength": 60,
            "description": "This is the title that shows up on the list page."
        },
        "meta_desc": {
            "type": "string",
            "minLength": 50,
            "maxLength": 160,
            "description": "This is the description that shows up on the list page."
        },
        "url_slug": {
            "type": "string",
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
        "properties": {
          "title": {
            "type": "string",
          },
          "image": {
            "type": "string",
            "default": "/icons/containers.svg",
            "description": "you can leave the default value here, '/icons/containers.svg'",
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
          },
          "description": {
            "type": "string",
          },
          "sortable_date": {
            "type": "string",
            "format": "date-time",
            "description": "the time the workshop will start"
          },
          "duration": {
            "type": "string",
            "default": "30 minutes",
            "description": "length of workshop in minutes. Value should include number followed by minutes, e.g. `60 minutes`"
          },
          "datetime": {
            "type": "string",
            "format": "date-time",
            "description": "this is an old field we do not really use anymore. you can leave blank, only sortable_date should be needed."
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
        "title": "featured (will show in the featured section)",
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
        "description": "you can leave the default value here as 'webinars'",
        "type": "string",
        "default": "webinars"
      },
      "external": {
        "title": "external (webinars will link to an external page instead of a webinar landing/registration page)",
        "type": "boolean",
        "default": false,
      },
      "block_external_search_index": {
        "title": "block_external_search_index (tell google not to index this page)",
        "type": "boolean",
        "default": false,
      },
      "aws_only": {
        "title": "aws_only (only show aws specific getting started links on the page)",
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
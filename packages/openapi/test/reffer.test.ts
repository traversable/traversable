import * as vi from "vitest"
import { dereference, openapi } from "@traversable/openapi"
import { fn } from "@traversable/data"

const FORMAT_datetime = { "format": "date-time", "type": "string" } as const
const FORMAT_iata = { "format": "iataCode", "type": "string" }
const FORMAT_time = { "format": "time", "type": "string" }
const FORMAT_uuid = { "format": "uuid", "type": "string" }
const FORMAT = {
  iata: FORMAT_iata,
  datetime: FORMAT_datetime,
  time: FORMAT_time,
  uuid: FORMAT_uuid,
}
const TYPE_string = { "type": "string" } as const
const TYPE_integer = { "type": "integer" } as const
const TYPE = {
  string: TYPE_string,
  integer: TYPE_integer,
}

const exp = {
  paths: {
    "/api/v1/searches": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
            }
          }
        }
      }
    }

  }
}

const input = {
  "components": {
    "schemas": {}
  },
  "paths": {

    "/api/v1/searches": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "slices": {
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "originIataCode": FORMAT.iata,
                        "destinationIataCode": FORMAT.iata,
                        "departureDate": FORMAT.datetime,
                        "departureTime": {
                          "type": "object",
                          "properties": {
                            "from": FORMAT.time,
                            "to": FORMAT.time
                          },
                          "required": ["from", "to"]
                        },
                        "arrivalTime": {
                          "type": "object",
                          "properties": {
                            "from": FORMAT.time,
                            "to": FORMAT.time
                          },
                          "required": ["from", "to"]
                        }
                      },
                      "required": ["originIataCode", "destinationIataCode", "departureDate"]
                    }
                  },
                  "travelers": {
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "anyOf": [
                            { "type": "string", "enum": ["adult"] },
                            { "type": "string", "enum": ["child"] },
                            { "type": "string", "enum": ["infant"] }
                          ]
                        },
                        "givenName": { "type": "string" },
                        "familyName": { "type": "string" },
                        "age": {
                          "description": "Only required for travelers of type \"child\"",
                          "type": "integer"
                        },
                        "loyaltyIds": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "iataAirlineCode": { "type": "string" },
                              "memberId": { "type": "string" }
                            },
                            "required": ["iataAirlineCode", "memberId"]
                          }
                        }
                      },
                      "required": ["type"]
                    }
                  },
                  "filterCriteria": {
                    "type": "object",
                    "properties": {
                      "maxSegments": TYPE.integer,
                      "limitToCabinClass": {
                        "anyOf": [
                          { "type": "number", "enum": [0] },
                          { "type": "number", "enum": [1] },
                          { "type": "number", "enum": [2] },
                          { "type": "number", "enum": [3] },
                          { "type": "number", "enum": [4] },
                          { "type": "number", "enum": [-1] }
                        ]
                      },
                      "includedIataAirlineCodes": { "type": "array", "items": TYPE.string }
                    }
                  }
                },
                "required": ["slices", "travelers"]
              }
            }
          },
          "required": true
        },
        "parameters": [
          {
            "schema": FORMAT.uuid,
            "in": "header",
            "name": "x-hotelengine-fss-search-id",
            "required": false,
            "description": "A V4 UUID spec (RFC4122)"
          },
          {
            "schema": FORMAT.uuid,
            "in": "header",
            "name": "x-hotelengine-fss-trace-id",
            "required": false,
            "description": "A V4 UUID spec (RFC4122)"
          },
          {
            "schema": FORMAT.uuid,
            "in": "header",
            "name": "x-hotelengine-fss-request-id",
            "required": false,
            "description": "A V4 UUID spec (RFC4122)"
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "results": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "continuationToken": {
                                "description": "A unique token used to fetch fares and slice offers for next slice of a trip",
                                "minLength": 1,
                                "type": "string"
                              },
                              "totalDuration": {
                                "description": "ISO-8601-compliant duration from the scheduled takeoff of the first  segment to the scheduled landing of the last segment. Format: PnYnMnDTnHnMnS",
                                "type": "string"
                              },
                              "daysOfTravelCount": {
                                "description": "The number of days that the slice offer extends specific to the local timezones.",
                                "type": "integer"
                              },
                              "badges": {
                                "type": "object",
                                "properties": {
                                  "fastest": {
                                    "description": "Boolean signifying if this slice offer offers the shortest travel time",
                                    "type": "boolean"
                                  }
                                }
                              },
                              "fareSummaries": {
                                "type": "object",
                                "properties": {
                                  "shelf1FareSummary": {
                                    "description": "Fare summary for an NGS shelf",
                                    "type": "object",
                                    "properties": {
                                      "badges": {
                                        "type": "object",
                                        "properties": {
                                          "cheapest": {
                                            "description": "Boolean signifying if this fare offer is the cheapest fare",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "cabinClasses": {
                                        "type": "array",
                                        "items": {
                                          "default": { "cabinClass": "economy" },
                                          "type": "object",
                                          "properties": {
                                            "cabinClass": {
                                              "anyOf": [
                                                { "type": "string", "enum": ["unrecognized"] },
                                                { "type": "string", "enum": ["unmapped"] },
                                                { "type": "string", "enum": ["economy"] },
                                                { "type": "string", "enum": ["premium_economy"] },
                                                { "type": "string", "enum": ["business"] },
                                                { "type": "string", "enum": ["first"] }
                                              ]
                                            },
                                            "segmentOrdinal": { "type": "number" }
                                          },
                                          "required": ["cabinClass", "segmentOrdinal"]
                                        }
                                      },
                                      "expiresAt": {
                                        "format": "date-time",
                                        "description": "Timestamp for when this fare offer expires",
                                        "type": "string"
                                      },
                                      "fareBrandName": {
                                        "description": "Brand name for a fare. Example: Economy+",
                                        "type": "string"
                                      },
                                      "ngsShelfOrdinal": {
                                        "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
                                        "type": "number"
                                      },
                                      "price": {
                                        "description": "Price information for a fare",
                                        "type": "object",
                                        "properties": {
                                          "currencyCode": {
                                            "anyOf": [
                                              {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "default": "USD",
                                                "type": "string"
                                              },
                                              { "type": "null" }
                                            ]
                                          },
                                          "totalValue": {
                                            "anyOf": [
                                              {
                                                "description": "The total price for this fare selection. Includes taxes and fees.",
                                                "type": "number"
                                              },
                                              { "type": "null" }
                                            ]
                                          }
                                        },
                                        "required": ["currencyCode", "totalValue"]
                                      },
                                      "travelPolicy": {
                                        "type": "object",
                                        "properties": {
                                          "exceedsMaxPrice": {
                                            "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
                                            "type": "boolean"
                                          },
                                          "exceedsCabinClassAllowance": {
                                            "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "sliceAmenities": {
                                        "description": "Amenities available for the slice",
                                        "default": { "some_amenity": "available" },
                                        "type": "object",
                                        "additionalProperties": {
                                          "description": "The availability of the amenity",
                                          "anyOf": [
                                            { "const": "unrecognized", "type": "string" },
                                            { "const": "unknown", "type": "string" },
                                            { "const": "available", "type": "string" },
                                            { "const": "unavailable", "type": "string" },
                                            { "const": "available_via_vendor", "type": "string" }
                                          ]
                                        }
                                      },
                                      "travelerSliceAmenities": {
                                        "description": "Amenities available for the traveler",
                                        "default": {
                                          "some_traveler_key": {
                                            "baggage": {
                                              "freeCarryOnBagsCount": 1,
                                              "freeCheckedBagsCount": 1
                                            }
                                          }
                                        },
                                        "not": {}
                                      },
                                      "travelerSegmentAmenities": {
                                        "default": {
                                          "some_traveler_key": [
                                            { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
                                          ]
                                        },
                                        "not": {}
                                      },
                                      "refund": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      },
                                      "ticketChange": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      }
                                    },
                                    "required": [
                                      "badges",
                                      "cabinClasses",
                                      "expiresAt",
                                      "fareBrandName",
                                      "ngsShelfOrdinal",
                                      "price",
                                      "travelPolicy",
                                      "sliceAmenities",
                                      "travelerSliceAmenities",
                                      "travelerSegmentAmenities",
                                      "refund",
                                      "ticketChange"
                                    ]
                                  },
                                  "shelf2FareSummary": {
                                    "description": "Fare summary for an NGS shelf",
                                    "type": "object",
                                    "properties": {
                                      "badges": {
                                        "type": "object",
                                        "properties": {
                                          "cheapest": {
                                            "description": "Boolean signifying if this fare offer is the cheapest fare",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "cabinClasses": {
                                        "type": "array",
                                        "items": {
                                          "default": { "cabinClass": "economy" },
                                          "type": "object",
                                          "properties": {
                                            "cabinClass": {
                                              "anyOf": [
                                                { "type": "string", "enum": ["unrecognized"] },
                                                { "type": "string", "enum": ["unmapped"] },
                                                { "type": "string", "enum": ["economy"] },
                                                { "type": "string", "enum": ["premium_economy"] },
                                                { "type": "string", "enum": ["business"] },
                                                { "type": "string", "enum": ["first"] }
                                              ]
                                            },
                                            "segmentOrdinal": { "type": "number" }
                                          },
                                          "required": ["cabinClass", "segmentOrdinal"]
                                        }
                                      },
                                      "expiresAt": {
                                        "format": "date-time",
                                        "description": "Timestamp for when this fare offer expires",
                                        "type": "string"
                                      },
                                      "fareBrandName": {
                                        "description": "Brand name for a fare. Example: Economy+",
                                        "type": "string"
                                      },
                                      "ngsShelfOrdinal": {
                                        "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
                                        "type": "number"
                                      },
                                      "price": {
                                        "description": "Price information for a fare",
                                        "type": "object",
                                        "properties": {
                                          "currencyCode": {
                                            "anyOf": [
                                              {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "default": "USD",
                                                "type": "string"
                                              },
                                              { "type": "null" }
                                            ]
                                          },
                                          "totalValue": {
                                            "anyOf": [
                                              {
                                                "description": "The total price for this fare selection. Includes taxes and fees.",
                                                "type": "number"
                                              },
                                              { "type": "null" }
                                            ]
                                          }
                                        },
                                        "required": ["currencyCode", "totalValue"]
                                      },
                                      "travelPolicy": {
                                        "type": "object",
                                        "properties": {
                                          "exceedsMaxPrice": {
                                            "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
                                            "type": "boolean"
                                          },
                                          "exceedsCabinClassAllowance": {
                                            "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "sliceAmenities": {
                                        "description": "Amenities available for the slice",
                                        "default": { "some_amenity": "available" },
                                        "type": "object",
                                        "additionalProperties": {
                                          "description": "The availability of the amenity",
                                          "anyOf": [
                                            { "const": "unrecognized", "type": "string" },
                                            { "const": "unknown", "type": "string" },
                                            { "const": "available", "type": "string" },
                                            { "const": "unavailable", "type": "string" },
                                            { "const": "available_via_vendor", "type": "string" }
                                          ]
                                        }
                                      },
                                      "travelerSliceAmenities": {
                                        "description": "Amenities available for the traveler",
                                        "default": {
                                          "some_traveler_key": {
                                            "baggage": {
                                              "freeCarryOnBagsCount": 1,
                                              "freeCheckedBagsCount": 1
                                            }
                                          }
                                        },
                                        "not": {}
                                      },
                                      "travelerSegmentAmenities": {
                                        "default": {
                                          "some_traveler_key": [
                                            { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
                                          ]
                                        },
                                        "not": {}
                                      },
                                      "refund": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      },
                                      "ticketChange": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      }
                                    },
                                    "required": [
                                      "badges",
                                      "cabinClasses",
                                      "expiresAt",
                                      "fareBrandName",
                                      "ngsShelfOrdinal",
                                      "price",
                                      "travelPolicy",
                                      "sliceAmenities",
                                      "travelerSliceAmenities",
                                      "travelerSegmentAmenities",
                                      "refund",
                                      "ticketChange"
                                    ]
                                  },
                                  "shelf3FareSummary": {
                                    "description": "Fare summary for an NGS shelf",
                                    "type": "object",
                                    "properties": {
                                      "badges": {
                                        "type": "object",
                                        "properties": {
                                          "cheapest": {
                                            "description": "Boolean signifying if this fare offer is the cheapest fare",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "cabinClasses": {
                                        "type": "array",
                                        "items": {
                                          "default": { "cabinClass": "economy" },
                                          "type": "object",
                                          "properties": {
                                            "cabinClass": {
                                              "anyOf": [
                                                { "type": "string", "enum": ["unrecognized"] },
                                                { "type": "string", "enum": ["unmapped"] },
                                                { "type": "string", "enum": ["economy"] },
                                                { "type": "string", "enum": ["premium_economy"] },
                                                { "type": "string", "enum": ["business"] },
                                                { "type": "string", "enum": ["first"] }
                                              ]
                                            },
                                            "segmentOrdinal": { "type": "number" }
                                          },
                                          "required": ["cabinClass", "segmentOrdinal"]
                                        }
                                      },
                                      "expiresAt": {
                                        "format": "date-time",
                                        "description": "Timestamp for when this fare offer expires",
                                        "type": "string"
                                      },
                                      "fareBrandName": {
                                        "description": "Brand name for a fare. Example: Economy+",
                                        "type": "string"
                                      },
                                      "ngsShelfOrdinal": {
                                        "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
                                        "type": "number"
                                      },
                                      "price": {
                                        "description": "Price information for a fare",
                                        "type": "object",
                                        "properties": {
                                          "currencyCode": {
                                            "anyOf": [
                                              {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "default": "USD",
                                                "type": "string"
                                              },
                                              { "type": "null" }
                                            ]
                                          },
                                          "totalValue": {
                                            "anyOf": [
                                              {
                                                "description": "The total price for this fare selection. Includes taxes and fees.",
                                                "type": "number"
                                              },
                                              { "type": "null" }
                                            ]
                                          }
                                        },
                                        "required": ["currencyCode", "totalValue"]
                                      },
                                      "travelPolicy": {
                                        "type": "object",
                                        "properties": {
                                          "exceedsMaxPrice": {
                                            "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
                                            "type": "boolean"
                                          },
                                          "exceedsCabinClassAllowance": {
                                            "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "sliceAmenities": {
                                        "description": "Amenities available for the slice",
                                        "default": { "some_amenity": "available" },
                                        "type": "object",
                                        "additionalProperties": {
                                          "description": "The availability of the amenity",
                                          "anyOf": [
                                            { "const": "unrecognized", "type": "string" },
                                            { "const": "unknown", "type": "string" },
                                            { "const": "available", "type": "string" },
                                            { "const": "unavailable", "type": "string" },
                                            { "const": "available_via_vendor", "type": "string" }
                                          ]
                                        }
                                      },
                                      "travelerSliceAmenities": {
                                        "description": "Amenities available for the traveler",
                                        "default": {
                                          "some_traveler_key": {
                                            "baggage": {
                                              "freeCarryOnBagsCount": 1,
                                              "freeCheckedBagsCount": 1
                                            }
                                          }
                                        },
                                        "not": {}
                                      },
                                      "travelerSegmentAmenities": {
                                        "default": {
                                          "some_traveler_key": [
                                            { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
                                          ]
                                        },
                                        "not": {}
                                      },
                                      "refund": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      },
                                      "ticketChange": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      }
                                    },
                                    "required": [
                                      "badges",
                                      "cabinClasses",
                                      "expiresAt",
                                      "fareBrandName",
                                      "ngsShelfOrdinal",
                                      "price",
                                      "travelPolicy",
                                      "sliceAmenities",
                                      "travelerSliceAmenities",
                                      "travelerSegmentAmenities",
                                      "refund",
                                      "ticketChange"
                                    ]
                                  },
                                  "shelf4FareSummary": {
                                    "description": "Fare summary for an NGS shelf",
                                    "type": "object",
                                    "properties": {
                                      "badges": {
                                        "type": "object",
                                        "properties": {
                                          "cheapest": {
                                            "description": "Boolean signifying if this fare offer is the cheapest fare",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "cabinClasses": {
                                        "type": "array",
                                        "items": {
                                          "default": { "cabinClass": "economy" },
                                          "type": "object",
                                          "properties": {
                                            "cabinClass": {
                                              "anyOf": [
                                                { "type": "string", "enum": ["unrecognized"] },
                                                { "type": "string", "enum": ["unmapped"] },
                                                { "type": "string", "enum": ["economy"] },
                                                { "type": "string", "enum": ["premium_economy"] },
                                                { "type": "string", "enum": ["business"] },
                                                { "type": "string", "enum": ["first"] }
                                              ]
                                            },
                                            "segmentOrdinal": { "type": "number" }
                                          },
                                          "required": ["cabinClass", "segmentOrdinal"]
                                        }
                                      },
                                      "expiresAt": {
                                        "format": "date-time",
                                        "description": "Timestamp for when this fare offer expires",
                                        "type": "string"
                                      },
                                      "fareBrandName": {
                                        "description": "Brand name for a fare. Example: Economy+",
                                        "type": "string"
                                      },
                                      "ngsShelfOrdinal": {
                                        "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
                                        "type": "number"
                                      },
                                      "price": {
                                        "description": "Price information for a fare",
                                        "type": "object",
                                        "properties": {
                                          "currencyCode": {
                                            "anyOf": [
                                              {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "default": "USD",
                                                "type": "string"
                                              },
                                              { "type": "null" }
                                            ]
                                          },
                                          "totalValue": {
                                            "anyOf": [
                                              {
                                                "description": "The total price for this fare selection. Includes taxes and fees.",
                                                "type": "number"
                                              },
                                              { "type": "null" }
                                            ]
                                          }
                                        },
                                        "required": ["currencyCode", "totalValue"]
                                      },
                                      "travelPolicy": {
                                        "type": "object",
                                        "properties": {
                                          "exceedsMaxPrice": {
                                            "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
                                            "type": "boolean"
                                          },
                                          "exceedsCabinClassAllowance": {
                                            "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "sliceAmenities": {
                                        "description": "Amenities available for the slice",
                                        "default": { "some_amenity": "available" },
                                        "type": "object",
                                        "additionalProperties": {
                                          "description": "The availability of the amenity",
                                          "anyOf": [
                                            { "const": "unrecognized", "type": "string" },
                                            { "const": "unknown", "type": "string" },
                                            { "const": "available", "type": "string" },
                                            { "const": "unavailable", "type": "string" },
                                            { "const": "available_via_vendor", "type": "string" }
                                          ]
                                        }
                                      },
                                      "travelerSliceAmenities": {
                                        "description": "Amenities available for the traveler",
                                        "default": {
                                          "some_traveler_key": {
                                            "baggage": {
                                              "freeCarryOnBagsCount": 1,
                                              "freeCheckedBagsCount": 1
                                            }
                                          }
                                        },
                                        "not": {}
                                      },
                                      "travelerSegmentAmenities": {
                                        "default": {
                                          "some_traveler_key": [
                                            { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
                                          ]
                                        },
                                        "not": {}
                                      },
                                      "refund": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      },
                                      "ticketChange": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      }
                                    },
                                    "required": [
                                      "badges",
                                      "cabinClasses",
                                      "expiresAt",
                                      "fareBrandName",
                                      "ngsShelfOrdinal",
                                      "price",
                                      "travelPolicy",
                                      "sliceAmenities",
                                      "travelerSliceAmenities",
                                      "travelerSegmentAmenities",
                                      "refund",
                                      "ticketChange"
                                    ]
                                  },
                                  "shelf5FareSummary": {
                                    "description": "Fare summary for an NGS shelf",
                                    "type": "object",
                                    "properties": {
                                      "badges": {
                                        "type": "object",
                                        "properties": {
                                          "cheapest": {
                                            "description": "Boolean signifying if this fare offer is the cheapest fare",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "cabinClasses": {
                                        "type": "array",
                                        "items": {
                                          "default": { "cabinClass": "economy" },
                                          "type": "object",
                                          "properties": {
                                            "cabinClass": {
                                              "anyOf": [
                                                { "type": "string", "enum": ["unrecognized"] },
                                                { "type": "string", "enum": ["unmapped"] },
                                                { "type": "string", "enum": ["economy"] },
                                                { "type": "string", "enum": ["premium_economy"] },
                                                { "type": "string", "enum": ["business"] },
                                                { "type": "string", "enum": ["first"] }
                                              ]
                                            },
                                            "segmentOrdinal": { "type": "number" }
                                          },
                                          "required": ["cabinClass", "segmentOrdinal"]
                                        }
                                      },
                                      "expiresAt": {
                                        "format": "date-time",
                                        "description": "Timestamp for when this fare offer expires",
                                        "type": "string"
                                      },
                                      "fareBrandName": {
                                        "description": "Brand name for a fare. Example: Economy+",
                                        "type": "string"
                                      },
                                      "ngsShelfOrdinal": {
                                        "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
                                        "type": "number"
                                      },
                                      "price": {
                                        "description": "Price information for a fare",
                                        "type": "object",
                                        "properties": {
                                          "currencyCode": {
                                            "anyOf": [
                                              {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "default": "USD",
                                                "type": "string"
                                              },
                                              { "type": "null" }
                                            ]
                                          },
                                          "totalValue": {
                                            "anyOf": [
                                              {
                                                "description": "The total price for this fare selection. Includes taxes and fees.",
                                                "type": "number"
                                              },
                                              { "type": "null" }
                                            ]
                                          }
                                        },
                                        "required": ["currencyCode", "totalValue"]
                                      },
                                      "travelPolicy": {
                                        "type": "object",
                                        "properties": {
                                          "exceedsMaxPrice": {
                                            "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
                                            "type": "boolean"
                                          },
                                          "exceedsCabinClassAllowance": {
                                            "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
                                            "type": "boolean"
                                          }
                                        }
                                      },
                                      "sliceAmenities": {
                                        "description": "Amenities available for the slice",
                                        "default": { "some_amenity": "available" },
                                        "type": "object",
                                        "additionalProperties": {
                                          "description": "The availability of the amenity",
                                          "anyOf": [
                                            { "const": "unrecognized", "type": "string" },
                                            { "const": "unknown", "type": "string" },
                                            { "const": "available", "type": "string" },
                                            { "const": "unavailable", "type": "string" },
                                            { "const": "available_via_vendor", "type": "string" }
                                          ]
                                        }
                                      },
                                      "travelerSliceAmenities": {
                                        "description": "Amenities available for the traveler",
                                        "default": {
                                          "some_traveler_key": {
                                            "baggage": {
                                              "freeCarryOnBagsCount": 1,
                                              "freeCheckedBagsCount": 1
                                            }
                                          }
                                        },
                                        "not": {}
                                      },
                                      "travelerSegmentAmenities": {
                                        "default": {
                                          "some_traveler_key": [
                                            { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
                                          ]
                                        },
                                        "not": {}
                                      },
                                      "refund": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      },
                                      "ticketChange": {
                                        "type": "object",
                                        "properties": {
                                          "type": {
                                            "description": "The type of condition for the fare: unknown, none, paid, or free",
                                            "anyOf": [
                                              { "type": "string", "enum": ["unknown"] },
                                              { "type": "string", "enum": ["none"] },
                                              { "type": "string", "enum": ["paid"] },
                                              { "type": "string", "enum": ["free"] }
                                            ]
                                          },
                                          "fee": {
                                            "type": "object",
                                            "properties": {
                                              "currencyCode": {
                                                "description": "The currency code for the type of currency this price is represented in.",
                                                "type": "string"
                                              },
                                              "value": {
                                                "description": "The value of the currency. This is a string to avoid floating point errors.",
                                                "type": "string"
                                              }
                                            },
                                            "required": ["currencyCode", "value"]
                                          }
                                        },
                                        "required": ["type"]
                                      }
                                    },
                                    "required": [
                                      "badges",
                                      "cabinClasses",
                                      "expiresAt",
                                      "fareBrandName",
                                      "ngsShelfOrdinal",
                                      "price",
                                      "travelPolicy",
                                      "sliceAmenities",
                                      "travelerSliceAmenities",
                                      "travelerSegmentAmenities",
                                      "refund",
                                      "ticketChange"
                                    ]
                                  }
                                }
                              },
                              "segments": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "aircraftIataCode": { "type": "string" },
                                    "duration": {
                                      "description": "ISO-8601-compliant duration of the segment. Format: PnYnMnDTnHnMnS",
                                      "type": "string"
                                    },
                                    "owner": {
                                      "description": "Airline owning or operating a segment.",
                                      "type": "object",
                                      "properties": {
                                        "name": { "type": "string" },
                                        "iataCode": { "type": "string" },
                                        "flightNumber": { "type": "string" },
                                        "callSign": { "type": "string" }
                                      },
                                      "required": ["iataCode", "flightNumber"]
                                    },
                                    "operator": {
                                      "description": "Airline owning or operating a segment.",
                                      "type": "object",
                                      "properties": {
                                        "name": { "type": "string" },
                                        "iataCode": { "type": "string" },
                                        "flightNumber": { "type": "string" },
                                        "callSign": { "type": "string" }
                                      },
                                      "required": ["iataCode", "flightNumber"]
                                    },
                                    "origin": {
                                      "description": "A stop/destination of a segment",
                                      "type": "object",
                                      "properties": {
                                        "timestamp": {
                                          "description": "The ISO-8601-compliant timestamp of this stop (or start). Format: dateTtime",
                                          "type": "string"
                                        },
                                        "iataCode": { "type": "string" },
                                        "name": { "type": "string" },
                                        "city": { "type": "string" },
                                        "countryCode": { "type": "string" }
                                      },
                                      "required": ["timestamp", "iataCode"]
                                    },
                                    "destination": {
                                      "description": "A stop/destination of a segment",
                                      "type": "object",
                                      "properties": {
                                        "timestamp": {
                                          "description": "The ISO-8601-compliant timestamp of this stop (or start). Format: dateTtime",
                                          "type": "string"
                                        },
                                        "iataCode": { "type": "string" },
                                        "name": { "type": "string" },
                                        "city": { "type": "string" },
                                        "countryCode": { "type": "string" }
                                      },
                                      "required": ["timestamp", "iataCode"]
                                    },
                                    "stops": {
                                      "type": "array",
                                      "items": {
                                        "type": "object",
                                        "properties": {
                                          "stopCheckpoint": {
                                            "description": "A stop/destination of a segment",
                                            "type": "object",
                                            "properties": {
                                              "timestamp": {
                                                "description": "The ISO-8601-compliant timestamp of this stop (or start). Format: dateTtime",
                                                "type": "string"
                                              },
                                              "iataCode": { "type": "string" },
                                              "name": { "type": "string" },
                                              "city": { "type": "string" },
                                              "countryCode": { "type": "string" }
                                            },
                                            "required": ["timestamp", "iataCode"]
                                          },
                                          "duration": {
                                            "description": "ISO-8601-compliant duration of the stop. Format: PnYnMnDTnHnMnS",
                                            "type": "string"
                                          },
                                          "departs": {
                                            "description": "The ISO-8601-compliant timestamp of the departure of this stop. Format: dateTtime",
                                            "type": "string"
                                          }
                                        },
                                        "required": ["duration", "departs"]
                                      }
                                    }
                                  },
                                  "required": ["duration", "stops"]
                                }
                              }
                            },
                            "required": [
                              "continuationToken",
                              "totalDuration",
                              "daysOfTravelCount",
                              "badges",
                              "fareSummaries",
                              "segments"
                            ]
                          }
                        },
                        "searchId": {
                          "format": "uuid",
                          "description": "A V4 UUID spec (RFC4122)",
                          "type": "string"
                        },
                        "travelerManifest": {
                          "type": "object",
                          "additionalProperties": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "anyOf": [
                                  { "const": "adult", "type": "string" },
                                  { "const": "child", "type": "string" },
                                  { "const": "infant", "type": "string" }
                                ]
                              },
                              "informationType": {
                                "anyOf": [
                                  { "const": "anonymous", "type": "string" },
                                  { "const": "loyalty_eligible", "type": "string" }
                                ]
                              },
                              "givenName": { "type": "string" },
                              "familyName": { "type": "string" },
                              "age": {
                                "description": "Only required for travelers of type \"child\"",
                                "type": "integer"
                              },
                              "loyaltyIds": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "iataAirlineCode": { "type": "string" },
                                    "memberId": { "type": "string" }
                                  },
                                  "required": ["iataAirlineCode", "memberId"]
                                }
                              }
                            },
                            "required": ["type", "informationType"]
                          }
                        },
                        "userTravelPolicy": {
                          "type": "object",
                          "properties": {
                            "maxPriceForTrip": {
                              "description": "The max amount the user is able to spend on the related trip",
                              "type": "number"
                            },
                            "maxRoundTripPrice": {
                              "description": "The max amount the user is able to spend on a round-trip flight",
                              "type": "number"
                            },
                            "maxOneWayTripPrice": {
                              "description": "The max amount the user is able to spend on a one-way flight",
                              "type": "number"
                            },
                            "cabinClassAllowance": {
                              "description": "The highest level of cabin class the user is able to travel in",
                              "anyOf": [
                                { "type": "string", "enum": ["economy"] },
                                { "type": "string", "enum": ["premium_economy"] },
                                { "type": "string", "enum": ["business"] },
                                { "type": "string", "enum": ["any"] }
                              ]
                            },
                            "maxTravelPriceBySlicePerTraveler": {
                              "description": "The max amount the user can spend on a flight per traveler",
                              "type": "number"
                            },
                            "maxTravelPriceBySlice": {
                              "description": "The max amount the user can spend on a flight for all travelers",
                              "type": "number"
                            },
                            "maxTravelPricePerTraveler": {
                              "description": "The max amount the user can spend on all flights in a trip per traveler",
                              "type": "number"
                            },
                            "maxTravelPrice": {
                              "description": "The max amount the user can spend on the entire trip, considering all flights and travelers",
                              "type": "number"
                            }
                          }
                        }
                      },
                      "required": ["results", "searchId", "userTravelPolicy"]
                    },
                    "meta": { "type": "object", "properties": {} }
                  },
                  "required": ["data"]
                }
              }
            }
          },
          "500": {
            "description": "Default Response",
            "content": {
              "text/html": {
                "schema": { "type": "object", "properties": { "head": { "type": "string" }, "body": { "type": "string" } } }
              },
              "application/json": {
                "schema": {
                  "anyOf": [
                    { "type": "object", "properties": { "tag": "ServerError" } },
                    { "type": "object", "properties": { "tag": "NetworkError" } },
                    { "type": "object", "properties": { "tag": "UnknownError" } },
                  ]
                }
              }
            }
          }
        }
      }
    },

    "/api/v2/limited/special_booking_requests/{sbr_id}/hotel_options": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "type": "object",
                      "properties": {
                        "meta": {
                          "type": "object",
                          "properties": {
                            "limit": { "type": "integer" },
                            "total": { "type": "integer" },
                            "offset": { "type": "integer" }
                          }
                        }
                      }
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": [
                              "id",
                              "estimated_cost",
                              "status",
                              "account_manager_note",
                              "account_manager",
                              "checklist",
                              "property"
                            ],
                            "properties": {
                              "id": {
                                "type": "object",
                                "properties": { "id": { "type": "number" } }
                              },
                              "estimated_cost": {
                                "nullable": true,
                                "type": "number",
                              },
                              "status": {
                                "type": "string",
                                "enum": ["ready_for_review", "approved", "denied"],
                              },
                              "account_manager_note": {
                                "nullable": true,
                                "type": "string",
                              },
                              "account_manager": {
                                "nullable": true,
                                "type": "object",
                                "properties": { "name": { "type": "string" } }
                              },
                              "checklist": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "label": { "type": "string" },
                                    "meets": { "type": "boolean" }
                                  }
                                }
                              },
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }

  },
}


// vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/reffer❳", () => {
//   vi.test("〖⛳️〗‹ ❲openapi.reffer❳: collects all ref-able schemas", () => {
//   })
// })

vi.describe("〖⛳️〗‹‹‹ ❲@traversable/openapi/reffer❳", () => {
  vi.test("〖⛳️〗‹ ❲openapi.reffer❳: extracts object schemas into separate object", () => {
    const [doc, refs, cycles] = openapi.reffer({ document: input, flags: { debug: true } })([])

    // console.log("doc", JSON.stringify(doc, null, 2))
    console.log("refs", Object.keys(refs))

    vi.assert.hasAllKeys(
      refs,
      [
        "paths//api/v1/searches/post/requestBody/content/application/json/schema",
        "paths//api/v1/searches/post/parameters/0/schema",
        "paths//api/v1/searches/post/responses/200/content/application/json/schema",
        "paths//api/v1/searches/post/responses/500/content/text/html/schema",
        "paths//api/v1/searches/post/responses/500/content/application/json/schema",
        "paths//api/v2/limited/special_booking_requests/{sbr_id}/hotel_options/get/responses/200/content/application/json/schema",
        // "paths//api/v1/searches/post/parameters/1/schema",
        // "paths//api/v1/searches/post/parameters/2/schema",
      ]
    )

    console.log("cycles", cycles)

    const cyc = [
      {
        firstSeen: 'paths//api/v1/searches/post/requestBody/content/application/json/schema',
        loc:       'paths//api/v1/searches/post/requestBody/content/application/json/schema'
      },
      {
        firstSeen: 'paths//api/v1/searches/post/parameters/0/schema',
        loc:       'paths//api/v1/searches/post/parameters/0/schema'
      },
      {
        firstSeen: 'paths//api/v1/searches/post/parameters/1/schema',
        loc:       'paths//api/v1/searches/post/parameters/1/schema'
      },
      {
        firstSeen: 'paths//api/v1/searches/post/parameters/2/schema',
        loc:       'paths//api/v1/searches/post/parameters/2/schema'
      },
      {
        firstSeen: 'paths//api/v1/searches/post/responses/200/content/application/json/schema',
        loc:       'paths//api/v1/searches/post/responses/200/content/application/json/schema'
      },
      {
        firstSeen: 'paths//api/v1/searches/post/responses/500/content/text/html/schema',
        loc:       'paths//api/v1/searches/post/responses/500/content/text/html/schema'
      },
      {
        firstSeen: 'paths//api/v1/searches/post/responses/500/content/application/json/schema',
        loc:       'paths//api/v1/searches/post/responses/500/content/application/json/schema'
      },
      {
        firstSeen: 'paths//api/v2/limited/special_booking_requests/{sbr_id}/hotel_options/get/responses/200/content/application/json/schema',
        loc:       'paths//api/v2/limited/special_booking_requests/{sbr_id}/hotel_options/get/responses/200/content/application/json/schema'
      }
    ]


    // vi.assert.deepEqual(
    //   cycles,
    //   [
    //     {
    //       "firstSeen": "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/originIataCode",
    //       "loc":       "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/destinationIataCode",
    //       "value": { "format": "iataCode", "type": "string" },
    //     },
    //     {
    //       "firstSeen": "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/departureTime/properties/from",
    //       "loc": "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/departureTime/properties/to",
    //       "value": { "format": "time", "type": "string" },
    //     },
    //     {
    //       "firstSeen": "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/departureTime/properties/from",
    //       "loc": "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/arrivalTime/properties/from",
    //       "value": { "format": "time", "type": "string" },
    //     },
    //     {
    //       "firstSeen": "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/departureTime/properties/from",
    //       "loc": "paths/~01api~01v1~01searches/post/requestBody/content/application~01json/schema/properties/slices/items/properties/arrivalTime/properties/to",
    //       "value": { "format": "time", "type": "string" },
    //     },
    //     {
    //       "firstSeen": "paths/~01api~01v1~01searches/post/parameters/0/schema",
    //       "loc": "paths/~01api~01v1~01searches/post/parameters/1/schema",
    //       "value": {
    //         "format": "uuid",
    //         "type": "string",
    //       },
    //     },
    //     {
    //       "firstSeen": "paths/~01api~01v1~01searches/post/parameters/0/schema",
    //       "loc": "paths/~01api~01v1~01searches/post/parameters/2/schema",
    //       "value": {
    //         "format": "uuid",
    //         "type": "string",
    //       },
    //     },
    //   ]
    // )

  })
})

// const output = {
//   components: {
//     schemas: {
//       "#/components/schemas/api~1v1~1searches/post/responses/200/content/application~1json/schema": {
//         "type": "object",
//         "properties": {
//           "data": {
//             "type": "object",
//             "properties": {
//               "results": {
//                 "type": "array",
//                 "items": {
//                   "type": "object",
//                   "properties": {
//                     "continuationToken": {
//                       "description": "A unique token used to fetch fares and slice offers for next slice of a trip",
//                       "minLength": 1,
//                       "type": "string"
//                     },
//                     "totalDuration": {
//                       "description": "ISO-8601-compliant duration from the scheduled takeoff of the first  segment to the scheduled landing of the last segment. Format: PnYnMnDTnHnMnS",
//                       "type": "string"
//                     },
//                     "daysOfTravelCount": {
//                       "description": "The number of days that the slice offer extends specific to the local timezones.",
//                       "type": "integer"
//                     },
//                     "badges": {
//                       "type": "object",
//                       "properties": {
//                         "fastest": {
//                           "description": "Boolean signifying if this slice offer offers the shortest travel time",
//                           "type": "boolean"
//                         }
//                       }
//                     },
//                     "fareSummaries": {
//                       "type": "object",
//                       "properties": {
//                         "shelf1FareSummary": {
//                           "description": "Fare summary for an NGS shelf",
//                           "type": "object",
//                           "properties": {
//                             "badges": {
//                               "type": "object",
//                               "properties": {
//                                 "cheapest": {
//                                   "description": "Boolean signifying if this fare offer is the cheapest fare",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "cabinClasses": {
//                               "type": "array",
//                               "items": {
//                                 "default": { "cabinClass": "economy" },
//                                 "type": "object",
//                                 "properties": {
//                                   "cabinClass": {
//                                     "anyOf": [
//                                       { "type": "string", "enum": ["unrecognized"] },
//                                       { "type": "string", "enum": ["unmapped"] },
//                                       { "type": "string", "enum": ["economy"] },
//                                       { "type": "string", "enum": ["premium_economy"] },
//                                       { "type": "string", "enum": ["business"] },
//                                       { "type": "string", "enum": ["first"] }
//                                     ]
//                                   },
//                                   "segmentOrdinal": { "type": "number" }
//                                 },
//                                 "required": ["cabinClass", "segmentOrdinal"]
//                               }
//                             },
//                             "expiresAt": {
//                               "format": "date-time",
//                               "description": "Timestamp for when this fare offer expires",
//                               "type": "string"
//                             },
//                             "fareBrandName": {
//                               "description": "Brand name for a fare. Example: Economy+",
//                               "type": "string"
//                             },
//                             "ngsShelfOrdinal": {
//                               "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
//                               "type": "number"
//                             },
//                             "price": {
//                               "description": "Price information for a fare",
//                               "type": "object",
//                               "properties": {
//                                 "currencyCode": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "default": "USD",
//                                       "type": "string"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 },
//                                 "totalValue": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The total price for this fare selection. Includes taxes and fees.",
//                                       "type": "number"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 }
//                               },
//                               "required": ["currencyCode", "totalValue"]
//                             },
//                             "travelPolicy": {
//                               "type": "object",
//                               "properties": {
//                                 "exceedsMaxPrice": {
//                                   "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 },
//                                 "exceedsCabinClassAllowance": {
//                                   "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "sliceAmenities": {
//                               "description": "Amenities available for the slice",
//                               "default": { "some_amenity": "available" },
//                               "type": "object",
//                               "additionalProperties": {
//                                 "description": "The availability of the amenity",
//                                 "anyOf": [
//                                   { "const": "unrecognized", "type": "string" },
//                                   { "const": "unknown", "type": "string" },
//                                   { "const": "available", "type": "string" },
//                                   { "const": "unavailable", "type": "string" },
//                                   { "const": "available_via_vendor", "type": "string" }
//                                 ]
//                               }
//                             },
//                             "travelerSliceAmenities": {
//                               "description": "Amenities available for the traveler",
//                               "default": {
//                                 "some_traveler_key": {
//                                   "baggage": {
//                                     "freeCarryOnBagsCount": 1,
//                                     "freeCheckedBagsCount": 1
//                                   }
//                                 }
//                               },
//                               "not": {}
//                             },
//                             "travelerSegmentAmenities": {
//                               "default": {
//                                 "some_traveler_key": [
//                                   { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
//                                 ]
//                               },
//                               "not": {}
//                             },
//                             "refund": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             },
//                             "ticketChange": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             }
//                           },
//                           "required": [
//                             "badges",
//                             "cabinClasses",
//                             "expiresAt",
//                             "fareBrandName",
//                             "ngsShelfOrdinal",
//                             "price",
//                             "travelPolicy",
//                             "sliceAmenities",
//                             "travelerSliceAmenities",
//                             "travelerSegmentAmenities",
//                             "refund",
//                             "ticketChange"
//                           ]
//                         },
//                         "shelf2FareSummary": {
//                           "description": "Fare summary for an NGS shelf",
//                           "type": "object",
//                           "properties": {
//                             "badges": {
//                               "type": "object",
//                               "properties": {
//                                 "cheapest": {
//                                   "description": "Boolean signifying if this fare offer is the cheapest fare",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "cabinClasses": {
//                               "type": "array",
//                               "items": {
//                                 "default": { "cabinClass": "economy" },
//                                 "type": "object",
//                                 "properties": {
//                                   "cabinClass": {
//                                     "anyOf": [
//                                       { "type": "string", "enum": ["unrecognized"] },
//                                       { "type": "string", "enum": ["unmapped"] },
//                                       { "type": "string", "enum": ["economy"] },
//                                       { "type": "string", "enum": ["premium_economy"] },
//                                       { "type": "string", "enum": ["business"] },
//                                       { "type": "string", "enum": ["first"] }
//                                     ]
//                                   },
//                                   "segmentOrdinal": { "type": "number" }
//                                 },
//                                 "required": ["cabinClass", "segmentOrdinal"]
//                               }
//                             },
//                             "expiresAt": {
//                               "format": "date-time",
//                               "description": "Timestamp for when this fare offer expires",
//                               "type": "string"
//                             },
//                             "fareBrandName": {
//                               "description": "Brand name for a fare. Example: Economy+",
//                               "type": "string"
//                             },
//                             "ngsShelfOrdinal": {
//                               "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
//                               "type": "number"
//                             },
//                             "price": {
//                               "description": "Price information for a fare",
//                               "type": "object",
//                               "properties": {
//                                 "currencyCode": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "default": "USD",
//                                       "type": "string"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 },
//                                 "totalValue": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The total price for this fare selection. Includes taxes and fees.",
//                                       "type": "number"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 }
//                               },
//                               "required": ["currencyCode", "totalValue"]
//                             },
//                             "travelPolicy": {
//                               "type": "object",
//                               "properties": {
//                                 "exceedsMaxPrice": {
//                                   "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 },
//                                 "exceedsCabinClassAllowance": {
//                                   "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "sliceAmenities": {
//                               "description": "Amenities available for the slice",
//                               "default": { "some_amenity": "available" },
//                               "type": "object",
//                               "additionalProperties": {
//                                 "description": "The availability of the amenity",
//                                 "anyOf": [
//                                   { "const": "unrecognized", "type": "string" },
//                                   { "const": "unknown", "type": "string" },
//                                   { "const": "available", "type": "string" },
//                                   { "const": "unavailable", "type": "string" },
//                                   { "const": "available_via_vendor", "type": "string" }
//                                 ]
//                               }
//                             },
//                             "travelerSliceAmenities": {
//                               "description": "Amenities available for the traveler",
//                               "default": {
//                                 "some_traveler_key": {
//                                   "baggage": {
//                                     "freeCarryOnBagsCount": 1,
//                                     "freeCheckedBagsCount": 1
//                                   }
//                                 }
//                               },
//                               "not": {}
//                             },
//                             "travelerSegmentAmenities": {
//                               "default": {
//                                 "some_traveler_key": [
//                                   { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
//                                 ]
//                               },
//                               "not": {}
//                             },
//                             "refund": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             },
//                             "ticketChange": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             }
//                           },
//                           "required": [
//                             "badges",
//                             "cabinClasses",
//                             "expiresAt",
//                             "fareBrandName",
//                             "ngsShelfOrdinal",
//                             "price",
//                             "travelPolicy",
//                             "sliceAmenities",
//                             "travelerSliceAmenities",
//                             "travelerSegmentAmenities",
//                             "refund",
//                             "ticketChange"
//                           ]
//                         },
//                         "shelf3FareSummary": {
//                           "description": "Fare summary for an NGS shelf",
//                           "type": "object",
//                           "properties": {
//                             "badges": {
//                               "type": "object",
//                               "properties": {
//                                 "cheapest": {
//                                   "description": "Boolean signifying if this fare offer is the cheapest fare",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "cabinClasses": {
//                               "type": "array",
//                               "items": {
//                                 "default": { "cabinClass": "economy" },
//                                 "type": "object",
//                                 "properties": {
//                                   "cabinClass": {
//                                     "anyOf": [
//                                       { "type": "string", "enum": ["unrecognized"] },
//                                       { "type": "string", "enum": ["unmapped"] },
//                                       { "type": "string", "enum": ["economy"] },
//                                       { "type": "string", "enum": ["premium_economy"] },
//                                       { "type": "string", "enum": ["business"] },
//                                       { "type": "string", "enum": ["first"] }
//                                     ]
//                                   },
//                                   "segmentOrdinal": { "type": "number" }
//                                 },
//                                 "required": ["cabinClass", "segmentOrdinal"]
//                               }
//                             },
//                             "expiresAt": {
//                               "format": "date-time",
//                               "description": "Timestamp for when this fare offer expires",
//                               "type": "string"
//                             },
//                             "fareBrandName": {
//                               "description": "Brand name for a fare. Example: Economy+",
//                               "type": "string"
//                             },
//                             "ngsShelfOrdinal": {
//                               "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
//                               "type": "number"
//                             },
//                             "price": {
//                               "description": "Price information for a fare",
//                               "type": "object",
//                               "properties": {
//                                 "currencyCode": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "default": "USD",
//                                       "type": "string"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 },
//                                 "totalValue": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The total price for this fare selection. Includes taxes and fees.",
//                                       "type": "number"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 }
//                               },
//                               "required": ["currencyCode", "totalValue"]
//                             },
//                             "travelPolicy": {
//                               "type": "object",
//                               "properties": {
//                                 "exceedsMaxPrice": {
//                                   "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 },
//                                 "exceedsCabinClassAllowance": {
//                                   "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "sliceAmenities": {
//                               "description": "Amenities available for the slice",
//                               "default": { "some_amenity": "available" },
//                               "type": "object",
//                               "additionalProperties": {
//                                 "description": "The availability of the amenity",
//                                 "anyOf": [
//                                   { "const": "unrecognized", "type": "string" },
//                                   { "const": "unknown", "type": "string" },
//                                   { "const": "available", "type": "string" },
//                                   { "const": "unavailable", "type": "string" },
//                                   { "const": "available_via_vendor", "type": "string" }
//                                 ]
//                               }
//                             },
//                             "travelerSliceAmenities": {
//                               "description": "Amenities available for the traveler",
//                               "default": {
//                                 "some_traveler_key": {
//                                   "baggage": {
//                                     "freeCarryOnBagsCount": 1,
//                                     "freeCheckedBagsCount": 1
//                                   }
//                                 }
//                               },
//                               "not": {}
//                             },
//                             "travelerSegmentAmenities": {
//                               "default": {
//                                 "some_traveler_key": [
//                                   { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
//                                 ]
//                               },
//                               "not": {}
//                             },
//                             "refund": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             },
//                             "ticketChange": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             }
//                           },
//                           "required": [
//                             "badges",
//                             "cabinClasses",
//                             "expiresAt",
//                             "fareBrandName",
//                             "ngsShelfOrdinal",
//                             "price",
//                             "travelPolicy",
//                             "sliceAmenities",
//                             "travelerSliceAmenities",
//                             "travelerSegmentAmenities",
//                             "refund",
//                             "ticketChange"
//                           ]
//                         },
//                         "shelf4FareSummary": {
//                           "description": "Fare summary for an NGS shelf",
//                           "type": "object",
//                           "properties": {
//                             "badges": {
//                               "type": "object",
//                               "properties": {
//                                 "cheapest": {
//                                   "description": "Boolean signifying if this fare offer is the cheapest fare",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "cabinClasses": {
//                               "type": "array",
//                               "items": {
//                                 "default": { "cabinClass": "economy" },
//                                 "type": "object",
//                                 "properties": {
//                                   "cabinClass": {
//                                     "anyOf": [
//                                       { "type": "string", "enum": ["unrecognized"] },
//                                       { "type": "string", "enum": ["unmapped"] },
//                                       { "type": "string", "enum": ["economy"] },
//                                       { "type": "string", "enum": ["premium_economy"] },
//                                       { "type": "string", "enum": ["business"] },
//                                       { "type": "string", "enum": ["first"] }
//                                     ]
//                                   },
//                                   "segmentOrdinal": { "type": "number" }
//                                 },
//                                 "required": ["cabinClass", "segmentOrdinal"]
//                               }
//                             },
//                             "expiresAt": {
//                               "format": "date-time",
//                               "description": "Timestamp for when this fare offer expires",
//                               "type": "string"
//                             },
//                             "fareBrandName": {
//                               "description": "Brand name for a fare. Example: Economy+",
//                               "type": "string"
//                             },
//                             "ngsShelfOrdinal": {
//                               "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
//                               "type": "number"
//                             },
//                             "price": {
//                               "description": "Price information for a fare",
//                               "type": "object",
//                               "properties": {
//                                 "currencyCode": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "default": "USD",
//                                       "type": "string"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 },
//                                 "totalValue": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The total price for this fare selection. Includes taxes and fees.",
//                                       "type": "number"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 }
//                               },
//                               "required": ["currencyCode", "totalValue"]
//                             },
//                             "travelPolicy": {
//                               "type": "object",
//                               "properties": {
//                                 "exceedsMaxPrice": {
//                                   "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 },
//                                 "exceedsCabinClassAllowance": {
//                                   "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "sliceAmenities": {
//                               "description": "Amenities available for the slice",
//                               "default": { "some_amenity": "available" },
//                               "type": "object",
//                               "additionalProperties": {
//                                 "description": "The availability of the amenity",
//                                 "anyOf": [
//                                   { "const": "unrecognized", "type": "string" },
//                                   { "const": "unknown", "type": "string" },
//                                   { "const": "available", "type": "string" },
//                                   { "const": "unavailable", "type": "string" },
//                                   { "const": "available_via_vendor", "type": "string" }
//                                 ]
//                               }
//                             },
//                             "travelerSliceAmenities": {
//                               "description": "Amenities available for the traveler",
//                               "default": {
//                                 "some_traveler_key": {
//                                   "baggage": {
//                                     "freeCarryOnBagsCount": 1,
//                                     "freeCheckedBagsCount": 1
//                                   }
//                                 }
//                               },
//                               "not": {}
//                             },
//                             "travelerSegmentAmenities": {
//                               "default": {
//                                 "some_traveler_key": [
//                                   { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
//                                 ]
//                               },
//                               "not": {}
//                             },
//                             "refund": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             },
//                             "ticketChange": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             }
//                           },
//                           "required": [
//                             "badges",
//                             "cabinClasses",
//                             "expiresAt",
//                             "fareBrandName",
//                             "ngsShelfOrdinal",
//                             "price",
//                             "travelPolicy",
//                             "sliceAmenities",
//                             "travelerSliceAmenities",
//                             "travelerSegmentAmenities",
//                             "refund",
//                             "ticketChange"
//                           ]
//                         },
//                         "shelf5FareSummary": {
//                           "description": "Fare summary for an NGS shelf",
//                           "type": "object",
//                           "properties": {
//                             "badges": {
//                               "type": "object",
//                               "properties": {
//                                 "cheapest": {
//                                   "description": "Boolean signifying if this fare offer is the cheapest fare",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "cabinClasses": {
//                               "type": "array",
//                               "items": {
//                                 "default": { "cabinClass": "economy" },
//                                 "type": "object",
//                                 "properties": {
//                                   "cabinClass": {
//                                     "anyOf": [
//                                       { "type": "string", "enum": ["unrecognized"] },
//                                       { "type": "string", "enum": ["unmapped"] },
//                                       { "type": "string", "enum": ["economy"] },
//                                       { "type": "string", "enum": ["premium_economy"] },
//                                       { "type": "string", "enum": ["business"] },
//                                       { "type": "string", "enum": ["first"] }
//                                     ]
//                                   },
//                                   "segmentOrdinal": { "type": "number" }
//                                 },
//                                 "required": ["cabinClass", "segmentOrdinal"]
//                               }
//                             },
//                             "expiresAt": {
//                               "format": "date-time",
//                               "description": "Timestamp for when this fare offer expires",
//                               "type": "string"
//                             },
//                             "fareBrandName": {
//                               "description": "Brand name for a fare. Example: Economy+",
//                               "type": "string"
//                             },
//                             "ngsShelfOrdinal": {
//                               "description": "The ordinal placement of this fare for NGS. Value can be 1-5",
//                               "type": "number"
//                             },
//                             "price": {
//                               "description": "Price information for a fare",
//                               "type": "object",
//                               "properties": {
//                                 "currencyCode": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "default": "USD",
//                                       "type": "string"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 },
//                                 "totalValue": {
//                                   "anyOf": [
//                                     {
//                                       "description": "The total price for this fare selection. Includes taxes and fees.",
//                                       "type": "number"
//                                     },
//                                     { "type": "null" }
//                                   ]
//                                 }
//                               },
//                               "required": ["currencyCode", "totalValue"]
//                             },
//                             "travelPolicy": {
//                               "type": "object",
//                               "properties": {
//                                 "exceedsMaxPrice": {
//                                   "description": "Describes if the related fare price exceeds the allowed price limit specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 },
//                                 "exceedsCabinClassAllowance": {
//                                   "description": "Describes if the related fare cabin class exceeds the allowed cabin class specified by the user's travel policy.",
//                                   "type": "boolean"
//                                 }
//                               }
//                             },
//                             "sliceAmenities": {
//                               "description": "Amenities available for the slice",
//                               "default": { "some_amenity": "available" },
//                               "type": "object",
//                               "additionalProperties": {
//                                 "description": "The availability of the amenity",
//                                 "anyOf": [
//                                   { "const": "unrecognized", "type": "string" },
//                                   { "const": "unknown", "type": "string" },
//                                   { "const": "available", "type": "string" },
//                                   { "const": "unavailable", "type": "string" },
//                                   { "const": "available_via_vendor", "type": "string" }
//                                 ]
//                               }
//                             },
//                             "travelerSliceAmenities": {
//                               "description": "Amenities available for the traveler",
//                               "default": {
//                                 "some_traveler_key": {
//                                   "baggage": {
//                                     "freeCarryOnBagsCount": 1,
//                                     "freeCheckedBagsCount": 1
//                                   }
//                                 }
//                               },
//                               "not": {}
//                             },
//                             "travelerSegmentAmenities": {
//                               "default": {
//                                 "some_traveler_key": [
//                                   { "segmentOrdinal": 1, "wifi": "available", "power": "available" }
//                                 ]
//                               },
//                               "not": {}
//                             },
//                             "refund": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             },
//                             "ticketChange": {
//                               "type": "object",
//                               "properties": {
//                                 "type": {
//                                   "description": "The type of condition for the fare: unknown, none, paid, or free",
//                                   "anyOf": [
//                                     { "type": "string", "enum": ["unknown"] },
//                                     { "type": "string", "enum": ["none"] },
//                                     { "type": "string", "enum": ["paid"] },
//                                     { "type": "string", "enum": ["free"] }
//                                   ]
//                                 },
//                                 "fee": {
//                                   "type": "object",
//                                   "properties": {
//                                     "currencyCode": {
//                                       "description": "The currency code for the type of currency this price is represented in.",
//                                       "type": "string"
//                                     },
//                                     "value": {
//                                       "description": "The value of the currency. This is a string to avoid floating point errors.",
//                                       "type": "string"
//                                     }
//                                   },
//                                   "required": ["currencyCode", "value"]
//                                 }
//                               },
//                               "required": ["type"]
//                             }
//                           },
//                           "required": [
//                             "badges",
//                             "cabinClasses",
//                             "expiresAt",
//                             "fareBrandName",
//                             "ngsShelfOrdinal",
//                             "price",
//                             "travelPolicy",
//                             "sliceAmenities",
//                             "travelerSliceAmenities",
//                             "travelerSegmentAmenities",
//                             "refund",
//                             "ticketChange"
//                           ]
//                         }
//                       }
//                     },
//                     "segments": {
//                       "type": "array",
//                       "items": {
//                         "type": "object",
//                         "properties": {
//                           "aircraftIataCode": { "type": "string" },
//                           "duration": {
//                             "description": "ISO-8601-compliant duration of the segment. Format: PnYnMnDTnHnMnS",
//                             "type": "string"
//                           },
//                           "owner": {
//                             "description": "Airline owning or operating a segment.",
//                             "type": "object",
//                             "properties": {
//                               "name": { "type": "string" },
//                               "iataCode": { "type": "string" },
//                               "flightNumber": { "type": "string" },
//                               "callSign": { "type": "string" }
//                             },
//                             "required": ["iataCode", "flightNumber"]
//                           },
//                           "operator": {
//                             "description": "Airline owning or operating a segment.",
//                             "type": "object",
//                             "properties": {
//                               "name": { "type": "string" },
//                               "iataCode": { "type": "string" },
//                               "flightNumber": { "type": "string" },
//                               "callSign": { "type": "string" }
//                             },
//                             "required": ["iataCode", "flightNumber"]
//                           },
//                           "origin": {
//                             "description": "A stop/destination of a segment",
//                             "type": "object",
//                             "properties": {
//                               "timestamp": {
//                                 "description": "The ISO-8601-compliant timestamp of this stop (or start). Format: dateTtime",
//                                 "type": "string"
//                               },
//                               "iataCode": { "type": "string" },
//                               "name": { "type": "string" },
//                               "city": { "type": "string" },
//                               "countryCode": { "type": "string" }
//                             },
//                             "required": ["timestamp", "iataCode"]
//                           },
//                           "destination": {
//                             "description": "A stop/destination of a segment",
//                             "type": "object",
//                             "properties": {
//                               "timestamp": {
//                                 "description": "The ISO-8601-compliant timestamp of this stop (or start). Format: dateTtime",
//                                 "type": "string"
//                               },
//                               "iataCode": { "type": "string" },
//                               "name": { "type": "string" },
//                               "city": { "type": "string" },
//                               "countryCode": { "type": "string" }
//                             },
//                             "required": ["timestamp", "iataCode"]
//                           },
//                           "stops": {
//                             "type": "array",
//                             "items": {
//                               "type": "object",
//                               "properties": {
//                                 "stopCheckpoint": {
//                                   "description": "A stop/destination of a segment",
//                                   "type": "object",
//                                   "properties": {
//                                     "timestamp": {
//                                       "description": "The ISO-8601-compliant timestamp of this stop (or start). Format: dateTtime",
//                                       "type": "string"
//                                     },
//                                     "iataCode": { "type": "string" },
//                                     "name": { "type": "string" },
//                                     "city": { "type": "string" },
//                                     "countryCode": { "type": "string" }
//                                   },
//                                   "required": ["timestamp", "iataCode"]
//                                 },
//                                 "duration": {
//                                   "description": "ISO-8601-compliant duration of the stop. Format: PnYnMnDTnHnMnS",
//                                   "type": "string"
//                                 },
//                                 "departs": {
//                                   "description": "The ISO-8601-compliant timestamp of the departure of this stop. Format: dateTtime",
//                                   "type": "string"
//                                 }
//                               },
//                               "required": ["duration", "departs"]
//                             }
//                           }
//                         },
//                         "required": ["duration", "stops"]
//                       }
//                     }
//                   },
//                   "required": [
//                     "continuationToken",
//                     "totalDuration",
//                     "daysOfTravelCount",
//                     "badges",
//                     "fareSummaries",
//                     "segments"
//                   ]
//                 }
//               },
//               "searchId": {
//                 "format": "uuid",
//                 "description": "A V4 UUID spec (RFC4122)",
//                 "type": "string"
//               },
//               "travelerManifest": {
//                 "type": "object",
//                 "additionalProperties": {
//                   "type": "object",
//                   "properties": {
//                     "type": {
//                       "anyOf": [
//                         { "const": "adult", "type": "string" },
//                         { "const": "child", "type": "string" },
//                         { "const": "infant", "type": "string" }
//                       ]
//                     },
//                     "informationType": {
//                       "anyOf": [
//                         { "const": "anonymous", "type": "string" },
//                         { "const": "loyalty_eligible", "type": "string" }
//                       ]
//                     },
//                     "givenName": { "type": "string" },
//                     "familyName": { "type": "string" },
//                     "age": {
//                       "description": "Only required for travelers of type \"child\"",
//                       "type": "integer"
//                     },
//                     "loyaltyIds": {
//                       "type": "array",
//                       "items": {
//                         "type": "object",
//                         "properties": {
//                           "iataAirlineCode": { "type": "string" },
//                           "memberId": { "type": "string" }
//                         },
//                         "required": ["iataAirlineCode", "memberId"]
//                       }
//                     }
//                   },
//                   "required": ["type", "informationType"]
//                 }
//               },
//               "userTravelPolicy": {
//                 "type": "object",
//                 "properties": {
//                   "maxPriceForTrip": {
//                     "description": "The max amount the user is able to spend on the related trip",
//                     "type": "number"
//                   },
//                   "maxRoundTripPrice": {
//                     "description": "The max amount the user is able to spend on a round-trip flight",
//                     "type": "number"
//                   },
//                   "maxOneWayTripPrice": {
//                     "description": "The max amount the user is able to spend on a one-way flight",
//                     "type": "number"
//                   },
//                   "cabinClassAllowance": {
//                     "description": "The highest level of cabin class the user is able to travel in",
//                     "anyOf": [
//                       { "type": "string", "enum": ["economy"] },
//                       { "type": "string", "enum": ["premium_economy"] },
//                       { "type": "string", "enum": ["business"] },
//                       { "type": "string", "enum": ["any"] }
//                     ]
//                   },
//                   "maxTravelPriceBySlicePerTraveler": {
//                     "description": "The max amount the user can spend on a flight per traveler",
//                     "type": "number"
//                   },
//                   "maxTravelPriceBySlice": {
//                     "description": "The max amount the user can spend on a flight for all travelers",
//                     "type": "number"
//                   },
//                   "maxTravelPricePerTraveler": {
//                     "description": "The max amount the user can spend on all flights in a trip per traveler",
//                     "type": "number"
//                   },
//                   "maxTravelPrice": {
//                     "description": "The max amount the user can spend on the entire trip, considering all flights and travelers",
//                     "type": "number"
//                   }
//                 }
//               }
//             },
//             "required": ["results", "searchId", "userTravelPolicy"]
//           },
//           "meta": { "type": "object", "properties": {} }
//         },
//         "required": ["data"]
//       },

//       "#/components/schemas/api~1v1~1searches/post/requestBody/content/application~1json/schema": {
//         "type": "object",
//         "properties": {
//           "slices": {
//             "minItems": 1,
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "originIataCode": { "format": "iataCode", "type": "string" },
//                 "destinationIataCode": { "format": "iataCode", "type": "string" },
//                 "departureDate": { "format": "date-time", "type": "string" },
//                 "departureTime": {
//                   "type": "object",
//                   "properties": {
//                     "from": { "format": "time", "type": "string" },
//                     "to": { "format": "time", "type": "string" }
//                   },
//                   "required": ["from", "to"]
//                 },
//                 "arrivalTime": {
//                   "type": "object",
//                   "properties": {
//                     "from": { "format": "time", "type": "string" },
//                     "to": { "format": "time", "type": "string" }
//                   },
//                   "required": ["from", "to"]
//                 }
//               },
//               "required": ["originIataCode", "destinationIataCode", "departureDate"]
//             }
//           },
//           "travelers": {
//             "minItems": 1,
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "type": {
//                   "anyOf": [
//                     { "type": "string", "enum": ["adult"] },
//                     { "type": "string", "enum": ["child"] },
//                     { "type": "string", "enum": ["infant"] }
//                   ]
//                 },
//                 "givenName": { "type": "string" },
//                 "familyName": { "type": "string" },
//                 "age": {
//                   "description": "Only required for travelers of type \"child\"",
//                   "type": "integer"
//                 },
//                 "loyaltyIds": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "properties": {
//                       "iataAirlineCode": { "type": "string" },
//                       "memberId": { "type": "string" }
//                     },
//                     "required": ["iataAirlineCode", "memberId"]
//                   }
//                 }
//               },
//               "required": ["type"]
//             }
//           },
//           "filterCriteria": {
//             "type": "object",
//             "properties": {
//               "maxSegments": { "type": "integer" },
//               "limitToCabinClass": {
//                 "anyOf": [
//                   { "type": "number", "enum": [0] },
//                   { "type": "number", "enum": [1] },
//                   { "type": "number", "enum": [2] },
//                   { "type": "number", "enum": [3] },
//                   { "type": "number", "enum": [4] },
//                   { "type": "number", "enum": [-1] }
//                 ]
//               },
//               "includedIataAirlineCodes": { "type": "array", "items": { "type": "string" } }
//             }
//           }
//         },
//         "required": ["slices", "travelers"]
//       },

//       "#/components/schemas/api~1v1~1searches/post/responses/500/content/text~1html/schema": { 
//         "type": "object", "properties": { "head": { "type": "string" }, "body": { "type": "string" } } 
//       },

//       "#components/schemas/api~1v1~1searches/post/responses/500/content/application~1json/schema": {
//         "anyOf": [
//           { "type": "object", "properties": { "tag": "ServerError" } },
//           { "type": "object", "properties": { "tag": "NetworkError" } },
//           { "type": "object", "properties": { "tag": "UnknownError" } },
//         ]
//       },

//       "#/components/schemas/api~1v2~1limited~1special_booking_requests~1{sbr_id}~1hotel_options/get/responses/200/content/application~1json/schema": {
//         "allOf": [
//           {
//             "type": "object",
//             "properties": {
//               "meta": {
//                 "type": "object",
//                 "properties": {
//                   "limit": { "type": "integer" },
//                   "total": { "type": "integer" },
//                   "offset": { "type": "integer" }
//                 }
//               }
//             }
//           },
//           {
//             "type": "object",
//             "properties": {
//               "data": {
//                 "type": "array",
//                 "items": {
//                   "type": "object",
//                   "additionalProperties": false,
//                   "required": [
//                     "id",
//                     "estimated_cost",
//                     "status",
//                     "account_manager_note",
//                     "account_manager",
//                     "checklist",
//                     "property"
//                   ],
//                   "properties": {
//                     "id": {
//                       "type": "object",
//                       "properties": { "id": { "type": "number" } }
//                     },
//                     "estimated_cost": {
//                       "nullable": true,
//                       "type": "number",
//                     },
//                     "status": {
//                       "type": "string",
//                       "enum": ["ready_for_review", "approved", "denied"],
//                     },
//                     "account_manager_note": {
//                       "nullable": true,
//                       "type": "string",
//                     },
//                     "account_manager": {
//                       "nullable": true,
//                       "type": "object",
//                       "properties": { "name": { "type": "string" } }
//                     },
//                     "checklist": {
//                       "type": "array",
//                       "items": {
//                         "type": "object",
//                         "properties": {
//                           "label": { "type": "string" },
//                           "meets": { "type": "boolean" }
//                         }
//                       }
//                     },
//                   }
//                 }
//               }
//             }
//           }
//         ]
//       },
//     }
//   },

//   paths: {
//     "/api/v1/searches": {
//       "post": {
//         "requestBody": {
//           "content": {
//             "application/json": {
//               "schema": { $ref: "#/components/schemas/api~1v1~1searches/post/requestBody/content/application~1json/schema" }
//             }
//           },
//           "required": true
//         },
//         "parameters": [
//           {
//             "schema": { "format": "uuid", "type": "string" },
//             "in": "header",
//             "name": "x-hotelengine-fss-search-id",
//             "required": false,
//             "description": "A V4 UUID spec (RFC4122)"
//           },
//           {
//             "schema": { "format": "uuid", "type": "string" },
//             "in": "header",
//             "name": "x-hotelengine-fss-trace-id",
//             "required": false,
//             "description": "A V4 UUID spec (RFC4122)"
//           },
//           {
//             "schema": { "format": "uuid", "type": "string" },
//             "in": "header",
//             "name": "x-hotelengine-fss-request-id",
//             "required": false,
//             "description": "A V4 UUID spec (RFC4122)"
//           }
//         ],
//         "responses": {
//           "200": {
//             "content": {
//               "application/json": {
//                 "schema": { $ref: "#/components/schemas/api~1v1~1searches/post/responses/200/content/application~1json/schema" }
//               }
//             }
//           },
//           "500": {
//             "description": "Default Response",
//             "content": {
//               "text/html": {
//                 "schema": { $ref: "#/components/schemas/api~1v1~1searches/post/responses/500/content/text~1html/schema" },
//               },
//               "application/json": {
//                 "schema": { $ref: "#components/schemas/api~1v1~1searches/post/responses/500/content/application~1json/schema" }
//               }
//             }
//           },
//         }

//       }

//     },

//     "/api/v2/limited/special_booking_requests/{sbr_id}/hotel_options": {
//       "get": {
//         "responses": {
//           "200": {
//             "content": {
//               "application/json": {
//                 "schema": {
//                   $ref: "#/components/schemas/api~1v2~1limited~1special_booking_requests~1{sbr_id}~1hotel_options/get/responses/200/content/application~1json/schema"
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }

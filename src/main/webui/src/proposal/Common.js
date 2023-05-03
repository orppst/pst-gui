export function ModelToJSON(model) {
    var jsonString = {};

    jsonString.title = model.title;

    return jsonString;
}

export function JSONToModel(jsonString) {
    var model = {};

    model.title = jsonString.title;

    return model;
}

export function findArrayElementByName(array, name) {
  return array.find((element) => {
    return element.name === name;
  })
}

export function uiSchemaCore() {
    return {
        hidden_person_id: {"ui:widget": "hidden"},
        "source":  {"Target": {"ui:field": "geo"}}
        };
}

export function schemaCore () {
    return {
               title: "Sample Proposal form",
               type: "object",
               "definitions": {
                   "target": {
                       type: "object",
                       properties: {
                           target_sourceName: {type:"string", title:"Source Name"},
                           coordinateSystem: {type: "string", title: "Source CoOrdinate System",
                               enum: ["J2000"]},
                           targetCoordinates: {
                               title: "Coordinates",
                               type: "object",
                               required: ["lat", "lon"],
                               properties: {
                                   lat: {type: "number"},
                                   lon: {type: "number"}
                                   }
                           },
                           positionEpoch: {type: "string", title: "Position Epoch", default: "J2013.123"}
                       },
                       required: ["target_sourceName"]
                   },
                   "spectral_line": {
                       type: "object", title: "Expected Spectral Line",
                       properties: {
                           start: {type: "number", title: "Frequency GHz", default: 1.4204058},
                           description: {type: "string", title: "Description", default: "HI"},
                       }
                   },
                   "spectral_window": {
                       type: "object", title: "Spectral Window",
                       properties: {
                           start: { type: "number", title: "Start GHz", default: 1.2},
                           end: { type: "number", title: "End GHz", default: 1.7},
                           spectral_resolution: { type: "number", title: "Spectral Resolution GHz", default: 0.5},
                           polarization: { type: "string", title: "Polarization", enum: ["LL","RR","LR","RL"], default: "LL"},
                           expected_spectral_line: {type: "object", title: "Spectral line", properties: {expected: {type: "string", "enum": ["Yes", "No"], default: "No"}},
                               allOf: [{
                                   "if": {"properties": {"expected": {"const": "Yes"}}},
                                   "then": {"properties": {spectral_line: {"$ref": "#/definitions/spectral_line"}}}}]
                           }
                       }
                   },

               },
               required: [ "title", "organization_name"]
           };
}
'use strict';
const fs = require('fs');

const xml2js = require('xml2js');
const Joi = require('@hapi/joi');
const AJV = require('ajv');

const schemaPath = `${__dirname}/../schema/jailbird-1.schema.json`;

module.exports = async function (xmlDoc) {
  const parser = new xml2js.Parser({
    //we use this to turn our xml file or root into a JS object
    strict: false, //empty tags ruin our strict validation
    async: true, //force async
    normalize: false, //don't mess with field names
  });
  const parsedObj = await parser.parseStringPromise(xmlDoc);

  let cleanedObj = null;

  try {
    cleanedObj = validateParsedXML(parsedObj); //this can fail and we want to trap it if it does
  } catch (e) {
    throw e;
  }

  const specObj = formatParsedToSpec(cleanedObj); //move over our cleaned object to our spec shape
  checkProcessedAgainstSchema(specObj); //make sure our spec shape aligns with spec but don't force it
  return JSON.stringify(specObj, null, 4); //prettyprint encoding and return
};

//validateParsedXML makes sure our freshly parsed XML looks correct enough. We use JOI for both shape and loose type/logical checking.
//the advantage of joi here is that it can help us fix and normalize small schema problems
function validateParsedXML(parsed = {}) {
  const rawSchema = Joi.object({
    //top level schema
    'TW-STORYDATA': Joi.object({
      //make sure we have a storydata object
      $: Joi.object({
        NAME: Joi.string().required(),
        STARTNODE: Joi.number().required(),
        CREATOR: Joi.string().required(),
        'CREATOR-VERSION': Joi.string().default(''),
        IFID: Joi.string().required(),
        FORMAT: Joi.string().required(),
        'FORMAT-VERSION': Joi.string().default(''),
        OPTIONS: Joi.string().default('').allow(''),
      }),
      STYLE: Joi.array().default([]),
      SCRIPT: Joi.array().default([]),
      'TW-PASSAGEDATA': Joi.array()
        .required()
        .items(
          Joi.object({
            _: Joi.string().required(),
            $: Joi.object({
              PID: Joi.number().required(),
              NAME: Joi.string().required(),
              TAGS: Joi.string().default('').allow(''),
            }).required(),
          })
        ),
    }),
  });

  const { value, error } = rawSchema.validate(parsed, {
    allowUnknown: true, //don't error if there are extra fields
    convert: true, //do fix our types if possible
    stripUnknown: false, //don't remove extra fields, we'll pass them on gracefully
  });

  if (error) throw new Error(error); //let our caller trap our error if need be

  return value;
}

function formatParsedToSpec(raw = {}) {
  const meta = raw['TW-STORYDATA'].$;
  const passages = raw['TW-STORYDATA']['TW-PASSAGEDATA'];

  const specString = {
    _meta: metaProcessor(meta),
    passages: [],
  };

  //now our passages
  specString.passages = passages
    .map((passage) => {
      const newPassage = metaProcessor(passage.$);

      newPassage.contents = passage._;
      return newPassage;
    })
    .sort((p1, p2) => p1.pid - p2.pid); //we need to sort since our earlier conversion processes may have mis-sorted

  return specString;
}

//metaProcessor is to normalize our keys with handling to fix tags
function metaProcessor(sourceMeta = []) {
  const newMeta = {};
  for (let k in sourceMeta) {
    const newK = k.toLowerCase().trim();
    switch (newK) {
      case 'tags':
        newMeta.tags = sourceMeta.TAGS.split(' ').map((tag) =>
          tag.trim().toLowerCase()
        ); //convert our tags string into an array
        break;
      default:
        newMeta[newK] = sourceMeta[k];
        break;
    }
  }
  return newMeta;
}

//checkProcessedAgainstSchema lets STDERR know if something went wonky and we aren't spec compliant
function checkProcessedAgainstSchema(processed) {
  const ajv = new AJV();
  const schema = fs.readFileSync(schemaPath);
  const isValid = ajv.validate(schema, processed);
  if (!isValid) console.warn('May not be perfectly valid', ajv.errors);
}

const { v1: Uuidv1 } = require('uuid');
const JWT = require('../utils/jwtDecoder');
const SFClient = require('../utils/sfmc-client');
const logger = require('../utils/logger');


/**
 * The Journey Builder calls this method for each contact processed by the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.execute = async (req, res) => {
  // decode data

  try {
    const data = JWT(req.body);
    logger.info(data);
    const id = Uuidv1();

    data.inArguments[0].Text = (req.body && req.body.inArguments && req.body.inArguments.length === 2 && req.body.inArguments[1].hasOwnProperty("phoneNumber")) ? req.body.inArguments[1].phoneNumber : null;

    await SFClient.saveData(process.env.DATA_EXTENSION_EXTERNAL_KEY, [
      {
        keys: {
          Id: id,
          SubscriberKey: data.inArguments[0].contactKey,
        },
        values: {
          Event: 'Place AWS Phone Call',
          Text: data.inArguments[0].Text,
        },
      },
    ]);
  } catch (error) {
    logger.error(error);
    logger.log(req.body);
  }

  res.status(200).send({
    status: 'ok',
  });
};

/**
 * Endpoint that receives a notification when a user saves the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.save = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  Endpoint that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.publish = (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 * The Journey Builder calls this method for each contact processed by the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.testExecute = async (req, res) => {
  // decode data

  try {
    const id = Uuidv1();
    const sample = {};
    sample.Text = (req.body && req.body.inArguments && req.body.inArguments.length === 2 && req.body.inArguments[1].hasOwnProperty("phoneNumber")) ? req.body.inArguments[1].phoneNumber : null;
    sample.Event = { name: 'Place AWS Phone Call', value: 'awsPhoneCall' };

    await SFClient.saveData(process.env.DATA_EXTENSION_EXTERNAL_KEY, [
      {
        keys: {
          Id: id,
          SubscriberKey: '0035e00000BWAYCAA5',
        },
        values: {
          Event: 'Journey Entry',
          Text: sample.Text,
        },
      },
    ]);
  } catch (error) {
    logger.error(error);
  }

  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  Endpoint that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.publish = (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 * Endpoint that receives a notification when a user performs
 * some validation as part of the publishing process.
 * @param req
 * @param res
 */
exports.validate = (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

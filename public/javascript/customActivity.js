'use strict';

const validateForm = function(cb) {
    $form = $('.js-settings-form');

    $form.validate({
        submitHandler: function(form) { },
        errorPlacement: function () { },
    });
    cb($form);
};

const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
let $form;
$(window).ready(onRender);

connection.on('initActivity', initialize);
connection.on('requestedTokens', onGetTokens);
connection.on('requestedEndpoints', onGetEndpoints);

connection.on('clickedNext', save);

const buttonSettings = {
    button: 'next',
    text: 'done',
    visible: true,
    enabled: false,
};

function saveData() {
    var options = {
        host: "http://localhost",
        port: 3000,
        path: '/journey/testExecute/',
        method: 'POST'
      };
      
    const userAction = async () => {
        const response = await fetch('http://localhost:3000/journey/testExecute/', {
            method: 'POST',
            //body: myBody, // string or object
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const myJson = await response.json(); //extract JSON from the http response
        
        // do something with myJson
        console.log('BODY: ' + myJson);
    }
    userAction.apply();
};
/*
      http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      }).end();    
      */


function callAWSOutboundFlow(message) {
    //AWS.config.loadFromPath('./config.json');
    //const file = path.join(__dirname, '..', 'public', 'config-template.json');
    //const configTemplate = fs.readFileSync(file, 'utf-8');
  
    AWS.config.update({ 
        "accessKeyId": "AKIARFE6OC4MBANZT3FN", 
        "secretAccessKey": "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", 
        "region": "eu-west-2" 
    });
    //AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'IDENTITY_POOL_ID'});
    
    var connect = new AWS.Connect({
        "region": "eu-west-2"
    });

    var params = {
        ContactFlowId: '3cf20927-ace1-45f2-b32a-660c8b5f5764', /* required */
        DestinationPhoneNumber: '+390683601427', /* required */
        InstanceId: 'a124aaa3-1c3d-404d-bf17-964eed9aefb4', /* required */
        Attributes: {            
        },
        //ClientToken: 'STRING_VALUE',
        QueueId: '7efa333e-d783-4cbb-89bd-c9454710b1d8',
        SourcePhoneNumber: '+441522431083'
    };
    alert("STARTING CALL:")
    connect.startOutboundVoiceContact(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        }
        else {
            console.log(data);           // successful response
        }   
    });
    alert("DONE:")
}

function onRender() {
    connection.trigger('ready');
    connection.trigger('requestTokens');
    connection.trigger('requestEndpoints');

    // validation
    validateForm(function($form) {
        $form.on('change click keyup input paste', 'input, textarea', function () {
            buttonSettings.enabled = $form.valid();
            connection.trigger('updateButton', buttonSettings);
        });
    });
}

/**
 * Initialization
 * @param data
 */
function initialize(data) {
    if (data) {
        payload = data;
    }
    const hasInArguments = Boolean(
        payload['arguments'] &&
        payload['arguments'].execute &&
        payload['arguments'].execute.inArguments &&
        payload['arguments'].execute.inArguments.length > 0
    );

    const inArguments = hasInArguments
        ? payload['arguments'].execute.inArguments
        : {};

    $.each(inArguments, function (index, inArgument) {
        $.each(inArgument, function (key, value) {
            const $el = $('#' + key);
            if($el.attr('type') === 'checkbox') {
                $el.prop('checked', value === 'true');
            } else {
                $el.val(value);
            }
        });
    });

    validateForm(function($form) {
        buttonSettings.enabled = $form.valid();
        connection.trigger('updateButton', buttonSettings);
    });
}

/**
 *
 *
 * @param {*} tokens
 */
function onGetTokens(tokens) {
    authTokens = tokens;
}

/**
 *
 *
 * @param {*} endpoints
 */
function onGetEndpoints(endpoints) {
    console.log(endpoints);
}

/**
 * Save settings
 */
function save() {
    if($form.valid()) {
        payload['metaData'].isConfigured = true;

        payload['arguments'].execute.inArguments = [
            {
                "contactKey": "{{Contact.Key}}"
            }
        ];

        $('.js-activity-setting').each(function () {
            const $el = $(this);
            const setting = {
                id: $(this).attr('id'),
                value: $(this).val()
            };

            $.each(payload['arguments'].execute.inArguments, function(index, value) {
                if($el.attr('type') === 'checkbox') {
                    if($el.is(":checked")) {
                        value[setting.id] = setting.value;
                    } else {
                        value[setting.id] = 'false';
                    }
                } else {
                    value[setting.id] = setting.value;
                }
            })
        });

        connection.trigger('updateActivity', payload);
    }
}

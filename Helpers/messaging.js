const request = require('request');

module.exports.message = async (number, message) => {
        const options = {
        'method': 'POST',
        'url': 'https://api.d7networks.com/messages/v1/send',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoLWJhY2tlbmQ6YXBwIiwic3ViIjoiNTU5MTc0MzQtZGNhYy00MDUwLWIzZmEtNzA1M2NiMDE1MTM1In0.-IbqSb9WAzrSi4iKyEXXnQcgr5yxwdEme9vJ1XVMljk'
        },
        body: JSON.stringify(
            {
                "to": `${9410891738}`,
                "content": `hi this is runnning successfully`,
                "from":"SMSINFO",
                "dlr":"yes",
                "dlr-method":"GET",
                "dlr-level":"2",
                "dlr-url":"http://yourcustompostbackurl.com"
            }
        )
    };

    new Promise((resolve, reject) => {
        // resolve('Hello world')
        request(options, function (error, response) {
            if(error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    })
}

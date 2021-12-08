const Mux = require ('@mux/mux-node');
const { Video } = new Mux("6beb79cb-e128-4c64-89d0-cb0cb6c5ff54","QjG8MqzfVQaWvUWGLLTVijLHWLcPsWCcQupWXYP0jwfgR65b3MnYduKTscejraJfnaWbEdOkrrB");

exports.handler = async function(event, context) {


    const videosArray = await Video.Assets.list({limit:100});
    
    try{
        return {
            statusCode: 200,
            body: JSON.stringify({message: videosArray})
        } 
    }
    catch (err) {
        return({statusCode: 422, 
            body: JSON.stringify({message:'Error'})
        })
    }
}


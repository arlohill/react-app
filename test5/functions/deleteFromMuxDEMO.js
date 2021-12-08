const Mux = require ('@mux/mux-node');
const { Video } = new Mux("6beb79cb-e128-4c64-89d0-cb0cb6c5ff54","QjG8MqzfVQaWvUWGLLTVijLHWLcPsWCcQupWXYP0jwfgR65b3MnYduKTscejraJfnaWbEdOkrrB");

exports.handler = async function(event, context) {

    const data = JSON.parse(event.body);
    const id = data.assetId;

    
    
    try{
        await Video.Assets.del(id);
        return {
            statusCode: 200,
            body: JSON.stringify({message: "File deleted"})
        } 
    }
    catch (err) {
        return({statusCode: 422, 
            body: JSON.stringify({message:'Error: could not delete file'})
        })
    }
}


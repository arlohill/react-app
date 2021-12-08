const Mux = require ('@mux/mux-node');
const { Video } = new Mux("6beb79cb-e128-4c64-89d0-cb0cb6c5ff54","QjG8MqzfVQaWvUWGLLTVijLHWLcPsWCcQupWXYP0jwfgR65b3MnYduKTscejraJfnaWbEdOkrrB");

exports.handler = async function(event, context) {



    const data= JSON.parse(event.body)
     
    
    try{
        const result = await Video.Assets.create({
            input: data.input,
            playback_policy: ["public"],
            mp4_support:"standard" 
        });
        return {
            statusCode: 200,
            body: JSON.stringify({message: "Your recording is uploading"})
            // body: JSON.stringify({message: result})
            }
         
    }
    catch (err) {
        return({statusCode: 422, 
            body: JSON.stringify({message:'There was an error uploading your video file.'})
        })
    }
}


const Mux = require ('@mux/mux-node');
const { Video } = new Mux("4100efdb-e648-4287-ad0a-50e9875a238b","TyiPEfPzEcz/tl/0sYh5ndPpNIwaom0mQaLRiDQ4E+pX1nH1Xl9XDJWXiPYtgx5QRfi/8ukakFh");

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


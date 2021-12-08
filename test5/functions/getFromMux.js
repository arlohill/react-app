const Mux = require ('@mux/mux-node');
const { Video } = new Mux("4100efdb-e648-4287-ad0a-50e9875a238b","TyiPEfPzEcz/tl/0sYh5ndPpNIwaom0mQaLRiDQ4E+pX1nH1Xl9XDJWXiPYtgx5QRfi/8ukakFh");

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


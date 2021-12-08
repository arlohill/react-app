

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// The ID of your GCS bucket
const bucketName = 'secondbody_videouploads';

// The path to your file to upload
// const filePath = 'path/to/your/file';

// The new ID for your GCS file
// const destFileName = 'your-new-file-name';

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

async function uploadFile(file,name) {
  await storage.bucket(bucketName).upload(file, {
    destination: name,
  });

  console.log(`${name} uploaded to ${bucketName}`);
}

uploadFile().catch(console.error);
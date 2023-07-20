var Minio = require("minio");


export var minioClient = new Minio.Client({
    endPoint: "134.94.65.182", //`${process.env.DB_HOST}`,
    port: 9000,
    useSSL: false,
    accessKey: "minioadmin", // `${process.env.DB_USER}`,
    secretKey: "minioadmin" // `${process.env.DB_PASS}`,
  });


export function createProject(projectName, metadata){
    minioClient.makeBucket(projectName, projectName, function(err) {
    if (err) return console.log('Error creating bucket.', err)
    })
    minioClient.putObject(projectName, "RNAseq/", "",metadata);
    minioClient.putObject(projectName, "DNAseq/", "",metadata);
    minioClient.putObject(projectName, "DNAmeth/", "",metadata);
    minioClient.putObject(projectName, "Meta/", "",metadata);
    minioClient.putObject(projectName, "Pheno/", "",metadata);
    minioClient.putObject(projectName, "Plink/", "",metadata);
  }



  // function uploadFile(projectName, prefix) {
  //   minioClient.putObject(projectName, `${prefix}/`, Buffer.from(''), 0, 'application/x-directory', metadata, function (err, etag) {
  //     if (err) {
  //       return console.log(`Error creating object with prefix "${prefix}":`, err);
  //     }
  //     console.log(`Object with prefix "${prefix}" created successfully!`);
  //   });
  // }



  export function uploadFile(projectName, dType, buffer){

    try {
      minioClient.putObject(projectName, dType, buffer); // Replace 'us-east-1' with your preferred region
    } catch (err) {
      console.error('Error creating bucket:', err);
    }
  }

  



// export function getMetadata(projectName){
//   // var stream = minioClient.extensions.listObjectsV2WithMetadata(projectName,'', true,'')
//   // stream.on('data', function(obj) { 
//   //   console.log(obj.metadata)
//   // } )
//   var stream = minioClient.listObjectsV2(projectName,'', true,{IncludeVersion:true});
//   return stream;

// }


  // export function uploadFile(projectName, datatype, fileName, filePath, metadata){
  //   var destinationPath = projectName
  //   minioClient.fPutObject(destinationPath, fileName, filePath, metadata, function(err, objInfo) {
  //       if(err) {
  //           return console.log(err)
  //       }
  //       console.log("Success", objInfo.etag, objInfo.versionId)
  //   })
  // }


export function listObjectsInFolder(bucketName, folderName) {
  const objectsList = [];
  const objectsStream = minioClient.listObjectsV2(bucketName, folderName, true);

  objectsStream.on('data', (obj) => {
    objectsList.push(obj.name);
  });

  objectsStream.on('error', (err) => {
    console.log('Error occurred while listing objects:', err);
  });

  objectsStream.on('end', () => {
    console.log('this storage object is read successfully until the end');
  });
  return objectsList

}


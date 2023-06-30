// // import React from 'react'
// // import Iframe from 'react-iframe'
// // // import Minio from 'minio-js/dist/main/minio.js'
// // import Iframe from "react-iframe";
// // var Minio = require("minio");
// import ReadString from './papa'
// import Papa from 'papaparse';
// import IconTabs from './iconTabs'
// import TabPanel from './tabs'
// import { Typography } from '@mui/material';
// import { useState } from 'react';
// import { minioClient, createProject, listObjectsInFolder } from '/minioClient/helper.js'

// // var stream = minioClient.listObjectsV2('modem','', true,'');
// // stream.on('data', function(obj) { console.log(obj) } );
// // stream.on('error', function(err) { console.log(err) } );

// console.log(listObjectsInFolder('mydata2', 'Pheno'));

// // var size = 0
// // minioClient.getObject('modem', 'Pheno/Agri_traits.csv', function(err, dataStream) {
// //   if (err) {
// //     return console.log(err)
// //   }

// //   Papa.parse(dataStream, {
// //     delimiter: ',',
// //     escapeChar: '\\',
// //     header: true,
// //     complete: function(results){
// //         let data = results.data;
// //         // console.table(data2);
// //         data.forEach(arr =>{
// //           console.log(arr.accession);

// //         })
// //     }
// //   })
// //   dataStream.on('end', function() {
// //     // console.log('End. Total size = ' + size)
// //   })
// //   dataStream.on('error', function(err) {
// //     console.log(err)
// //   })
// // })



// // var size = 0
// // reads 30 bytes from the offset 10.
// // minioClient.getPartialObject('modem', 'Agri_traits2.csv', 0, 10, function(err, dataStream) {
//   // if (err) {
//   //   return console.log(err)
//   // }
//   // dataStream.on('data', function(chunk) {
//   //   logChunks(chunk);
//   //   size += chunk.length
//   // })
//   // dataStream.on('end', function() {
//   //   console.log('End. Total size = ' + size)
//   // })
//   // dataStream.on('error', function(err) {
//   //   console.log(err)
//   // })
  
// // })






// var bucketList = [];
// minioClient.listBuckets(function(err, buckets) {

//   buckets.map((item, index) => (bucketList.push(item.name)))
//   // console.log(buckets)
// });

// // var stream = minioClient.extensions.listObjectsV2WithMetadata('modem','', true,'')
// // stream.on('data', function(obj) { console.log(obj) } )
// // stream.on('error', function(err) { console.log(err) } )

// // createProject('salma5');

// export function DataManagement() {
//   // const [bucketList, setBucketList] = useState([]);

// //   minioClient.listBuckets(function(err, buckets) {
// //     var newBucketList = [];
// //     buckets.map((item, index) => (newBucketList.push(item.name)))
// //     setBucketList(newBucketList);
// // });

  
//   return (
//     <>
//       {/* <IconTabs/> */}
//       <TabPanel existingBuckets = {bucketList}/>
    
//     </>


//   )
// }

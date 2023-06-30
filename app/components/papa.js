import React from 'react';

import { usePapaParse } from 'react-papaparse';

export default function ReadString(dataStream) {
  const { readString } = usePapaParse();

  const handleReadString = () => {
    // const csvString = 'Column 1,Column 2,Column 3,Column 4 1.1,1.2,1.3,1.4 2.1,2.2,2.3,2.4 3.1,3.2,3.3,3.4 4,5,6,7';

    // readString(csvString, {
    //   worker: true,
    //   complete: (results) => {
    //     console.log('---------------------------');
    //     console.log(results);
    //     console.log('---------------------------');
    //   },
    // });

    Papa.parse(props.dataStream, {
        delimiter: ',',
        escapeChar: '\\',
        header: true,
        // chunk: procData,
        // complete: finSearch,
        // error: function (error) {
        //   process.send(['search-failed', 'process']); //mainWindow.webContents.send('search-failed', 'process');
        //   console.log(error);
        // },
        complete: function(results){
            let data2 = results.data;
            console.log(data2);
        }
    })


  return <button onClick={() => handleReadString()}>readString</button>;
}
}
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Autocomplete, formControlLabelClasses, TextField } from '@mui/material';
import { minioClient, listObjectsInFolder } from '/minioClient/helper.js'
import { 	  List, ListItem,ListItemText, ListItemButton, ListItemIcon } from  '@mui/material';

var bucketList = [];
minioClient.listBuckets(function(err, buckets) {
  buckets.map((item, index) => (bucketList.push(item.name)))
});

var inputDataTypes = [ "DNAmeth", "DNAseq", "Meta", "Pheno", "Plink", "RNAseq" ];

export default function DataSelectionBar() {
  const [chosenProject, setChosenProject]= React.useState('');
  const [chosenDataType, setchosenDataType]= React.useState('');
  const [chosenFile, setChosenFile] = React.useState('');
  const [inputFiles, setInputFiles] = React.useState([]);

  React.useEffect(() => {
    fetchObjects();
  },[chosenProject,chosenDataType])

  const fetchObjects = async () => {
    // console.log(chosenProject);
    // console.log(chosenDataType);
    const objectsList = [];
    if(chosenProject != ''){
      var stream = minioClient.listObjectsV2(chosenProject,chosenDataType, true,'')
      stream.on('data', function(obj) { objectsList.push(obj.name) } )
      stream.on('error', function(err) { console.log(err) } )
      setInputFiles(objectsList);    
    }
  }


  return (
    <Box
      sx={{
        display: 'flex',
        '& > :not(style)': {
          m: 1,
          width: '50%',
          // border: 1.5,
          color: 'primary.main',
          boxShadow: 1 ,
          padding : 1.5
        }
      }}
    >
  		<Autocomplete
				options={bucketList}
				sx={{ width: 300 }}
				renderInput={(params) => <TextField {...params} label="choose project" />}
				onInputChange = {(e) => setChosenProject(e.target.innerHTML)}
			/>
      <Autocomplete
				options={inputDataTypes}
				sx={{ width: 300 }}
				renderInput={(params) => <TextField {...params} label="choose data type" />}
				onInputChange = {(e) => setchosenDataType(e.target.innerHTML)}
			/>
      <Autocomplete
				options={inputFiles}
				sx={{ width: 300 }}
				renderInput={(params) => <TextField {...params} label="data files" />}
				onInputChange = {(e) => setChosenFile(e.target.value)}
			/>
      
    </Box>
  );
}
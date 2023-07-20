import * as React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Autocomplete, Button, Input, InputBase } from '@mui/material';
import { TextField } from '@mui/material';
import { minioClient, createProject, getMetadata,uploadFile } from '/minioClient/helper.js'
import Paper from '@mui/material/Paper';
import { useRef } from 'react';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

function arrayBufferToBuffer(arrayBuffer) {
  return Buffer.from(arrayBuffer);
}

async function streamToBuffer(readableStream) {
  const reader = readableStream.getReader();
  const chunks = [];

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        chunks.push(value);
      }
    }

    const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const buffer = Buffer.concat(chunks, totalLength);

    return buffer;
  } catch (error) {
    throw new Error('Error reading file as buffer.');
  } finally {
    reader.releaseLock();
  }
}




export default function FullWidthTabs(props) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  // New project
  const [newProjName, setNewProjName] = React.useState('');
  const [projId, setProjId] = React.useState('');
  const [coordinator, setCoordinator] = React.useState('');
  const [institute, setInstitute] = React.useState('');
  const [publication, setPublication] = React.useState('');
  const [misc, setMisc] = React.useState('');
  const [subdir, setSubdir] = React.useState('');
  const inputFile = useRef(null)

  // Existing project
  const [selectedProj, setSelectedProj] = React.useState('');
  const [metadata, setMetadata] = React.useState('');


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const handleCreateProj = () => {
    var meta = { 
      "pject_name" : newProjName,
      "project_id" : projId,
      "project_coordinator" : coordinator,
      "host_institute" : institute,
      "publication" : publication,
      "status" : misc
    }
    createProject(newProjName, meta);
    alert(`Project "${newProjName}" created successfully`)
  }

  const hadleSetMetaData = (projectName) => {
    var stream = minioClient.extensions.listObjectsV2WithMetadata(projectName,'', true,'')
    stream.on('data', function(obj) { 
      setMetadata(obj.metadata)
     } )

  }

  const handleButtonClick = () => {
    inputFile.current.click();
  };

  const handleFileInputChange = async () => {
    const files = inputFile.current.files;
  
    for (const file of files) {
      const fileName = file.name;
      const isBinaryFile = fileName.search('bed') !== -1;
  
      if (!isBinaryFile) {
        const reader = new FileReader();
  
        reader.onload = async (event) => {
          const text = event.target.result;
          console.log(`${subdir}/${fileName}`);
          uploadFile(selectedProj, `${subdir}/${fileName}`, text);
        };
  
        if (file) {
          reader.readAsText(file); // Use readAsText for text files
        }
      } else {
        const stream = await file.stream();
        const buffer = await streamToBuffer(stream);
        console.log(buffer);
        uploadFile(selectedProj, `${subdir}/${fileName}`, buffer);
      }
    }

    alert('Files uploaded successfully')
  };
  
  

  

  

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Create New Projects" {...a11yProps(0)} />
          <Tab label="Manage Existing Projects" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >

      {/* First tab */}
        <TabPanel value={value} index={0} dir={theme.direction}>
          <Typography variant = 'h4'> Creat New Project</Typography>
          <p>This page describes the input data and the associated meta data. Here ....</p>

          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1,  width: '100%' },
              gap: 2
            
            }}
          >
            <TextField  label="Project name" id="projectName" 
                  onMouseOut={(event) => {
                    setNewProjName(event.target.value)
                  }}
            />


            <TextField  label="Project id" id="projectId" 
            onMouseOut={(event) => {
                setProjId(event.target.value)
                }}
          />
            <TextField   label="Project Coordinator" id="Coordinator" 
                            onMouseOut={(event) => {
                              setCoordinator(event.target.value)
                  }}
            />
            <TextField   label="Project Institute" id="Institute"
                          onMouseOut={(event) => {
                            setInstitute(event.target.value)
                  }} />
            <TextField   label="Publication" id="publiscation" 
                            onMouseOut={(event) => {
                              setPublication(event.target.value)
                  }}
            />
            <TextField   label="Misceleneous" id="misc" 
                            onMouseOut={(event) => {
                  setMisc(event.target.value)
                  }}
            />
          </Box>

          <Button variant = 'contained' onClick={handleCreateProj} >Create Project</Button>
        </TabPanel>
        

      {/* Second tab */}
        <TabPanel value={value} index={1} dir={theme.direction}>
        <Typography variant = 'h4'> Existing Projects</Typography>
        <Autocomplete
				options= {props.existingBuckets}
        onChange={(event, newValue) => {
          hadleSetMetaData(newValue);
          setSelectedProj(newValue);
        }}
				sx={{ width: '100%' }}
				renderInput={(listItems) => <TextField {...listItems} label = 'Choose Project'/> }							
		/>

    <Box
      sx={{
        display: 'flex',
        '& > :not(style)': {
          m: 1,
          width: '50%',
          border: 1.5,
          color: 'primary.main',
          boxShadow: 1,
          padding : 1.5
        },
      }}
    >
      <Paper variant="outlined" >
      <Typography variant = 'h5'> Meta Data</Typography>
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </Paper>
      
      <Paper variant="outlined" square>
        <Box     
           component="form"
                    sx={{
                      '& .MuiTextField-root': { m: 1,  width: '100%' },
                      gap: 2}}
            >
          <Typography variant = 'h5'> upload Data</Typography>
          <Autocomplete
            options= {[ "DNAmeth", "DNAseq", "Meta", "Pheno", "Plink", "RNAseq" ]}
            // value={'Choose data type'}
            onChange={(event, newValue) => {
                setSubdir(newValue)
            console.log(newValue)}}
            sx={{ width: 500 }}
            renderInput={(listItems) => <TextField {...listItems} label = 'Choose data type'/> }							
          />
          <Button onClick={handleButtonClick} variant="outlined" sx={{ width: 500, marginLeft:1, padding:1 }}>
          Select own data 
          <input type="file" ref = {inputFile} id="file" style = { {display : 'none'}} onChange={handleFileInputChange} multiple/>

          </Button>

          </Box>
        </Paper> 
      </Box>
    </TabPanel>

  </SwipeableViews>
</Box>



  );
}
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
  const [fileName, setFileName] = React.useState('');

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
  const handleUpload = () => {
    var objFileName = subdir + '/' + fileName.split('\\').slice(-1);
    minioClient.putObject(selectedProj, objFileName, fileName, function(err, res) {
      if (err) return console.log('err:', err)
      console.log('File uploaded successfully:', res)
    })

 }
  const hadleSetMetaData = (projectName) => {
    // gets the meta data of existing projects
    // console.log(projectName);
    var stream = minioClient.extensions.listObjectsV2WithMetadata(projectName,'', true,'')
    stream.on('data', function(obj) { 
      setMetadata(obj.metadata)
      // console.log(obj.name, obj.lastModified, obj.lastModified, obj.metadata)
     } )

  }

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
          <TextField helperText = 'Choose one or multiple files for uploading to the database' type="file" onChange={(e) => {setFileName(e.target.value)}} />
     
          <Button variant = 'contained'  onClick={handleUpload} >Upload</Button>
          </Box>
        </Paper> 
      </Box>
    </TabPanel>

  </SwipeableViews>
</Box>



  );
}

"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import { Autocomplete, List, ListItem, TextField } from '@mui/material'
import { Button } from '@mui/material';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import Head from 'next/head';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import { useRef } from 'react';
import Papa from "papaparse";
import parse from 'html-react-parser';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';




import PlotlyPlots from './PlotlyPlots2';
import ManhattanPlot from '../components/ManhattanPlot'
import { minioClient, createProject, getMetadata,uploadFile } from '/minioClient/helper.js'
import { listObjectsInFolder } from '/minioClient/helper.js'



import publicPhenoDataSets from '/public/publicPhenoDataSets.json';
import publicGwasDataSets from '/public/publicGwasDataSets.json';
import documentation from '../components/documentation.json';
import publicFastqDataSets from '/public/publicFastqDataSets'
import FastQC from './Fastqc';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

var docs = Object.values(documentation)
var pPhenoDataSets = Object.values(publicPhenoDataSets)
var pGwasDataSets = Object.values(publicGwasDataSets)
var pFastqDataSets = Object.values(publicFastqDataSets)

// const isObjectEmpty = (objectName) => {
//   return Object.keys(objectName).length === 0
// }

export function Analysis(props) {
  const [value, setValue] = useState("0");
  const tool = props.tool;

  const [toolsUsage, setToolsUsage] = useState("")
  const inputFile = useRef(null)
  const [file, setFile] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  
  const [selected_plot_type, setSelectedPlotType] = useState('');
  const [col_names, setColNames] = useState([]);
  const [selectedXvar, setSelectedXvar] = useState('');
	const [selectedYvar, setSelectedYvar] = useState('');
  
  const [open, setOpen] = useState(false);
  const [isToggled, setPlotIsToggled] = useState(false);
  const [plotSchema, setPlotSchema] = useState({})
  const [plotTitle, setPlotTitle] = useState("")
  const [xLable, setXlable] = useState("")
  const [yLable, setYlable] = useState("")
  const [isMultiTrace, setIsMultiTrace] = useState(false)

  // Manage input data

  const [isPublic, setIspublic] = useState(true)
  const [isMinioData, setIsMinioData] = useState(false)
  const [isOwnData, setIsOwnData] = useState(false)

  const [state, setState] = useState({});
  const [url, setUrl] = useState('');


  const [plinkResults, setPlinkResults] = useState([]);
  const [isToggledManhattan, setPlotIsToggledManhattan] = useState(false);
  const [gwasOnPubData, setGwasOnPubData] = useState(false)
  const [mdsData, setMdsData] = useState(null)

/////////////////// 1.  handle Minio data ////////////////////
const [bucketList, setBucketList] = useState([]);
const [chosenProject, setChosenProject]= React.useState('');
const [chosenDataType, setchosenDataType]= React.useState('');
const [chosenFile, setChosenFile] = React.useState('');
const [inputFiles, setInputFiles] = React.useState([]);
const [minioGwasUrls, setMinioGwasUrls] = useState({})
const [plinkFiles, setPlinkFiles] = useState({})
const [plinkMinioFiles, setPlinkMinioFiles] = useState([])

var inputDataTypes = [ "DNAmeth", "DNAseq", "Meta", "Pheno", "Plink", "RNAseq" ];
useEffect(() => {
  var newBuckets = []
  minioClient.listBuckets(function(err, buckets) {
    buckets.map((item, index) => (newBuckets.push(item.name))) 
  });
	setBucketList(newBuckets)
},[])


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


const handleMinioProjectData = () =>{
  // console.log("The chosen file :" , chosenFile)
  // console.log("The chosen project :" , chosenProject)
  if(tool == "VisPheno" && isMinioData){
    var size = 0
    minioClient.getObject(chosenProject, chosenFile, function(err, dataStream) {
      console.log(dataStream)
      if (err) {
        return console.log("There is this error fetching data",err)
      }
      Papa.parse(dataStream, {
        // delimiter: ',',
        // escapeChar: '\\',
        header: true,
        complete: function(results){
            let data = results.data;
            setData(data)
        }
      })
      dataStream.on('end', function() {
      })
      dataStream.on('error', function(err) {
        console.log(err)
      })
    })
  }else if(tool == "GWAS" && isMinioData){
    console.log("The chosen file :" , chosenFile)
    console.log("The chosen project :" , chosenProject)
    const objectsStream = minioClient.listObjectsV2(chosenProject, "Plink", true);
    var gwasUrls = {}
    var plinkDataInFiles = [];
    objectsStream.on('data', (obj) => {
      // console.log(obj.name);
    plinkFiles[obj.name.split('.')[1]] = obj.name
    minioClient.presignedGetObject(chosenProject, obj.name, 24*60*60, function(err, presignedUrl) {
    if (err) return console.log(err)
      gwasUrls[obj.name.split('.')[1]] = presignedUrl
    })
    });
    setMinioGwasUrls(gwasUrls)
    console.log(gwasUrls)
  }
}

  /////////// 2.  hanlde Public Data Sets ////////////////////
  const [publicDataSets, setPublicDataSets] = useState([])
  const [fastpReported, setFastpReported] = useState(false)
  const [parseToggled, setParseToggled] = useState(true)
  const handlePublicDataSets = () => {
    var publicdataSets = [];
    if(tool=="VisPheno"){
      pPhenoDataSets.map(item => {
        publicdataSets.push(item.id)
      })
      setPublicDataSets(publicdataSets)
    }else if(tool=="GWAS"){
      pGwasDataSets.map(item => {
        publicdataSets.push(item.id)
      })
      setPublicDataSets(publicdataSets)
    }else if(tool == "Fastp"){
      pFastqDataSets.map(item => {
        publicdataSets.push(item.id)
      })
      setPublicDataSets(publicdataSets)
    }
  }

  const handleParse = () => {
    fetch(url)
      .then(res => res.blob()) // Gets the response and returns it as a blob
      .then(blob => {
      setFile(blob);
        }
      )
		if (!file) return setError("Enter a valid file");
		const reader = new FileReader();
		reader.onload = async ({ target }) => {
      if(tool != 'GWAS'){
        const csv = Papa.parse(target.result, { header: true });
        const parsedData = csv?.data;
        setData(parsedData);
      }else if(isPublic){ // This condition tells if the data is public as well the selected tool is GWAS
        const gwaData = parseQassoc(target.result, ' ');
        var filteredArray = gwaData.filter((obj) => obj['P'] !== 'NA');
        setData(filteredArray);
      }
        };
		reader.readAsText(file);

	};

  useEffect(()=>{
    if(data ){
      var obj = data[0]
      var keys = Object.keys(obj || {})
      // console.log(keys)
      setColNames(keys);
    }
  },[data])


  useEffect(() => {

    handlePublicDataSets()
    handleUsage()


    if(tool == "Fastp"){
      setParseToggled(false)
    }else{
      handleParse()
      if(tool == "GWAS" || tool == "PCA"){
        loadPlink();
      }
    }

  }, [tool, url ])

  // perform GWAS

  const handleGwasPublic = () => {
    setGwasOnPubData(true)
  }

// Import Plink or any other dependencies here, if required

// const handleMinioGWAS = () => {
//   console.log("Performing GWAS on data stored in Minio object Storage");
//   console.log("The Selected project is:", chosenProject);
//   console.log("The input files are:", plinkFiles.fam, plinkFiles.bed, plinkFiles.bim);

//   var fam = minioGwasUrls.fam;
//   var bim = minioGwasUrls.bim;
//   var bed = minioGwasUrls.bed;
//   var plinkInputFiles = [fam, bim, bed];
//   var fileNames = ["plink.fam", "plink.bim", "plink.bed"];

//   window.Plink().then(Module => {
//     plinkInputFiles.map((url, index) => {
//       fetch(url)
//         .then(response => {
//           if (index === 2) {
//             // Binary file (bed)
//             return response.blob();
//           } else {
//             var text = response.clone().text();
//             return text
//           }
//         })
//         .then(data => {
//           const reader = new FileReader();
//           reader.onload = (e) => {
//             // const fileContents = new Uint8Array(e.target.result);
//             if (index === 2) {
//               // Binary file (bed)
//               const reader = new FileReader();
//               reader.onload = (e) => {
//                 const fileContents = e.target.result;
//                 Module.FS_createDataFile(
//                   "/", // folder
//                   fileNames[index], // filename
//                   fileContents, // content
//                   true, // read
//                   true // write
//                 );
//                 console.log(Module.FS.readdir('.'));
//                 if (isSubsetOf(["plink.bim", "plink.fam", "plink.bed"], Module.FS.readdir('.'))) {
//                   console.log(Module.FS.readdir('.'));
//                   console.log("Tool is : ",tool)
//                   console.log("This is correct data", isMinioData)
      
//                     if (tool == "GWAS" && isMinioData) {
//                       Module.callMain(["--bfile", "plink", "--assoc", "--allow-no-sex"]);
//                       if (isSubsetOf(["plink.assoc"], Module.FS.readdir('.'))) {
//                         var string = new TextDecoder().decode(Module.FS.readFile('/plink.assoc'));
//                       } else if (isSubsetOf(["plink.qassoc"], Module.FS.readdir('.'))) {
//                         var string = new TextDecoder().decode(Module.FS.readFile('/plink.qassoc'));
//                       }
//                       console.log(string)
//                       const multiArray = parseQassoc(string, ' ');
//                       var filteredArray = multiArray.filter(obj => obj['P'] !== 'NA');
//                       setPlinkResults(filteredArray);
//                       setPlotIsToggledManhattan(true);
//                     } else if (tool == "PCA" && isMinioData) {
//                       Module.callMain(["--bfile", "plink", "--genome"]);
//                       Module.callMain(["--bfile", "plink", "--read-genome", "plink.genome", "--cluster", "--ppc", "0.0001", "--mds-plot", "2"]);
//                       // console.log("Files After", Module.FS.readdir('.'));
//                       var string = new TextDecoder().decode(Module.FS.readFile('/plink.mds'));
//                       const multiArray = parseQassoc(string, ' ');
//                       setMdsData(multiArray);
//                     }
//                   }
//                 // Rest of your code...
//               };
//               reader.readAsBinaryString(data);
//             } else {
//               // Text files (fam, bim)
//               const fileContents = data;
//               console.log(fileContents)
//               Module.FS_createDataFile(
//                 "/", // folder
//                 fileNames[index], // filename
//                 fileContents, // content
//                 true, // read
//                 true // write
//               );
//             }
//           };
//           reader.readAsBinaryString(data);
//         })
//         .catch(error => {
//           console.error('Error fetching file:', error);
//         });

//     });
//   });
// };


// const handleMinioGWAS = () => {
//   console.log("Performing GWAS on data stored in Minio object Storage");
//   console.log("The Selected project is:", chosenProject);
//   console.log("The input files are:", plinkFiles.fam, plinkFiles.bed, plinkFiles.bim);


//     }

// Helper function to check if an array is a subset of another array
function isSubsetOf(subset, array) {
  return subset.every(element => array.includes(element));
}


 
  const loadPlink = () => {
    const initializeModule = async () => {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "wasm/plink.js"; // Replace '/path/to/wasm.js' with the correct wasm path
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
      // const Module = await window.Plink();
      // Module.callMain(["--help"])
    };
    initializeModule();
  }

  function isSubsetOf(set, subset) {
    for (let i = 0; i < set.length; i++) {
        if (subset.indexOf(set[i]) == -1) {
            return false;
        }
    }
    return true;
  }

  function parseQassoc(fileContent, delimiter) {
    const rows = fileContent.split('\n');
    const header = rows.shift().split(delimiter).filter((value) => value !== '');
    const resultArray = [];
  
    rows.forEach((row) => {
      const columns = row.split(delimiter).filter((value) => value !== '');
      const obj = {};
  
      columns.forEach((column, index) => {
        const key = header[index];
        const value = column;
        obj[key] = value;
      });
  
    resultArray.push(obj);
  
    });
  
    return resultArray;
  }

  const handleGWAS = () => {

    if(isOwnData){
      var analysisFiles = inputFile.current.files;
      window.Plink().then(Module => {
        const readers = [];
        for (let i = 0; i < analysisFiles.length; i++) {
          const reader = new FileReader();
          // reader.readAsBinaryString(analysisFiles[2]);
          readers.push(reader);
          reader.onload = () => {
            const fileContents = reader.result;      
            // upLoadToBrowser(files[i].name, fileContents)
            Module.FS_createDataFile(
            "/", // folder
            `plink.${analysisFiles[i].name.split('.')[1]}`, // filename
            fileContents, // content
            true, // read
            true, // write
            );
            if(isSubsetOf(["plink.bim", "plink.fam", "plink.bed"], Module.FS.readdir('.'))){
              if(tool == "GWAS" ){
                Module.callMain(["--bfile", "plink", "--assoc", "--allow-no-sex" ])
                if(isSubsetOf(["plink.assoc"], Module.FS.readdir('.'))){
                  var string = new TextDecoder().decode(Module.FS.readFile('/plink.assoc'));
                }else if(isSubsetOf(["plink.qassoc"], Module.FS.readdir('.'))){
                  var string = new TextDecoder().decode(Module.FS.readFile('/plink.qassoc'));
                }
                const multiArray = parseQassoc(string, ' ');
                var filteredArray = multiArray.filter((obj) => obj['P'] !== 'NA');
                setPlinkResults(filteredArray); 
                setPlotIsToggledManhattan(true)
            }else if(tool=="PCA" ){
              Module.callMain(["--bfile", "plink", "--genome"])
              Module.callMain(["--bfile", "plink", "--read-genome", "plink.genome", "--cluster", "--ppc", "0.0001", "--mds-plot", "2"])
              console.log("Files After", Module.FS.readdir('.')) 
              var string = new TextDecoder().decode(Module.FS.readFile('/plink.mds'));
              const multiArray = parseQassoc(string, ' ');
              setMdsData(multiArray)
             }
            } 
          };
          reader.readAsBinaryString(analysisFiles[i]);
        }  
      })
    }else if(isMinioData){
      console.log("Reading data from your selected Minio project: ", chosenProject)

      window.Plink().then(Module => {
        var fam = minioGwasUrls.fam;
        var bim = minioGwasUrls.bim;
        var bed = minioGwasUrls.bed;
        var plinkInputFiles = [fam, bim, bed];
        var fileNames = ["plink.fam", "plink.bim", "plink.bed"];
        fileNames.map((fileName, index) =>{
          fetch(plinkInputFiles[index])
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onload = () => {
              const fileContents = reader.result;  
              Module.FS_createDataFile(
                "/", // folder
                fileName, // filename
                fileContents, // content
                true, // read
                true, // write
                ); 
                if(isSubsetOf(["plink.bim", "plink.fam", "plink.bed"], Module.FS.readdir('.'))){
                  if(tool == "GWAS" ){
                    Module.callMain(["--bfile", "plink", "--assoc", "--allow-no-sex" ])
                    if(isSubsetOf(["plink.assoc"], Module.FS.readdir('.'))){
                      var string = new TextDecoder().decode(Module.FS.readFile('/plink.assoc'));
                    }else if(isSubsetOf(["plink.qassoc"], Module.FS.readdir('.'))){
                      var string = new TextDecoder().decode(Module.FS.readFile('/plink.qassoc'));
                    }
                    const multiArray = parseQassoc(string, ' ');
                    var filteredArray = multiArray.filter((obj) => obj['P'] !== 'NA');
                    setPlinkResults(filteredArray); 
                    setPlotIsToggledManhattan(true)
                }else if(tool=="PCA"){
                  Module.callMain(["--bfile", "plink", "--genome"])
                  Module.callMain(["--bfile", "plink", "--read-genome", "plink.genome", "--cluster", "--ppc", "0.0001", "--mds-plot", "2"])
                  console.log("Files After", Module.FS.readdir('.')) 
                  var string = new TextDecoder().decode(Module.FS.readFile('/plink.mds'));
                  const multiArray = parseQassoc(string, ' ');
                  setMdsData(multiArray)
                 }
                } 
            };
            reader.readAsBinaryString(blob);
          })  

        })

  
      })
      



  
          
          
    }
  }
  const handleStateChange = (event) => {
		setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
	};


  const handleClose = () => {
    handlePLOT();
    setOpen(false);

    };

  const handleButtonClick = () => {
    inputFile.current.click();
  };

  // Existing project in Minio db
  const handleChange = (event, newValue) => {
    setValue(newValue);
    if(newValue == "1"){
      setIsMinioData(true)
      setIsOwnData(false)
      setIspublic(false)
      console.log("using Minio data")
    }else if(newValue == "2"){
      setIsMinioData(false)
      setIsOwnData(true)
      setIspublic(false)
      console.log("using own data")
    }else{
      setIsMinioData(false)
      setIsOwnData(false)
      setIspublic(true)
      console.log("using public data")
    }
  };

  // Tools usage

  const handleUsage = () => {
    {docs.map((key,index) => {
      if(docs[index].id === tool){
        setToolsUsage(docs[index].usage)
      }
    })
    }

  }

  // setting up data public data sets
  const handleFileInputChange = () => {
    console.log("Numbr of files used from own data is ",inputFile.current.files.length)
    const file = inputFile.current.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const blob = new Blob([event.target.result], { type: file.type });
      setFile(blob);
    };

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() =>{
    if(selected_plot_type == 'boxplot' || selected_plot_type == "line"|| selected_plot_type == 'violin' || selected_plot_type == "raincloud" || selected_plot_type == "heatMap"){
      setIsMultiTrace(true)
      setOpen(true)
      var newState = {}
      setState(newState)
  
    }else{
      setIsMultiTrace(false)
    }
  },[selected_plot_type])

  useEffect(() =>{
    setPlotSchema(plotSchema)
    handlePLOT();
  },[selectedXvar, selectedYvar, plotTitle, xLable, yLable])


  var handlePLOT = () =>{
    var  plotSchema = {
      inputData : data,
      ploty_type : '',
      variablesToPlot : [],
      plotTitle : plotTitle,
      xLable : xLable,
      yLable : yLable
    } 
    if(selected_plot_type === 'boxplot'){
      plotSchema.ploty_type = 'boxplot'
      plotSchema.variablesToPlot = Object.keys(state);

    }else if(selected_plot_type === 'violin' ){
      plotSchema.ploty_type = 'violin'
      plotSchema.variablesToPlot = Object.keys(state);
    }else if(selected_plot_type === 'line' ){
      plotSchema.ploty_type = 'line'
      plotSchema.variablesToPlot = Object.keys(state);

    }else if(selected_plot_type === 'raincloud'){
      plotSchema.ploty_type = 'raincloud'
      plotSchema.variablesToPlot = Object.keys(state);

    }else if(selected_plot_type === 'heatMap'){
      plotSchema.ploty_type = 'heatMap'
      plotSchema.variablesToPlot = Object.keys(state);

    }else{
      plotSchema.ploty_type = selected_plot_type      
      plotSchema.variablesToPlot = [selectedXvar, selectedYvar]
    }

    setPlotSchema(plotSchema)


    // var newState = {}
    // setState(newState)

  }

  var handleFastpReported = () => {
    setFastpReported(true)
  }


  return (
    <>
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
        <Typography variant = 'h5'> Usage
          <Typography sx={{marginLeft:2}}>  
              {parse(toolsUsage)}
          </Typography>
        </Typography>   
      </Paper>


    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Public Data" value="0" />
            <Tab label="Project Data" value="1" />
            <Tab label="Own Data" value="2"/>
          </TabList>
        </Box>
        {/* First tab */}
        <TabPanel value="0" >
            <Autocomplete
                options={publicDataSets}      
                sx={{ width: 500 , marginTop:3}}
                
                renderInput={(params) => <TextField {...params} label="Select Project Data" key={params.key} />}
                // renderInput={(params) => <TextField {...params} label="Select Project Data" />}
                onInputChange = {(e,v) => {
                                if(tool == "GWAS" && isPublic){
                                  pGwasDataSets.map(item => {
                                    if(item.id == v){
                                      setUrl(item.url)
                                    }})
                                }else if(tool == "VisPheno" && isPublic){
                                  pPhenoDataSets.map(item => {
                                    if(item.id == v){
                                      setUrl(item.url)
                                    }})
                                }else if(tool == "Fastp" && isPublic){
                                  pFastqDataSets.map(item => {
                                    if(item.id == v){
                                      setUrl(item.url)
                                      setFastpReported(false)

                                    }})
                                }
              
                              }
                            }
              />

        </TabPanel>
        <TabPanel value="1">
          <Box sx={{display: 'flex', '& > :not(style)': {m: 0.5,width: '50%', color: 'primary.main', padding : 0.1 }}}> 
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
              onInputChange = {(e,v) => setChosenFile(v)}
            />
            </Box>

        </TabPanel>



        <TabPanel value="2">
          <div>
            <Grid sx = {{ width: 500 , marginTop:2}} container columns={2} columnGap = {2}>  
              <Button sx = {{ width: 500 , marginTop:2}} onClick={handleButtonClick} variant="outlined" >
              <b>Select own data </b>
              <input type="file" multiple ref = {inputFile} id="file" style = { {display : 'none'}} onChange={handleFileInputChange}/>
              </Button>

            </Grid>
          </div>

        </TabPanel>

        {!parseToggled || 
                <Button sx = {{ width: 500 , marginTop:2}} variant="constained" onClick={() =>{handleParse();handleMinioProjectData()}} >
                <b>Parse</b>
          </Button>

        }
      </TabContext>
    </Box>
    </Box>
    
    {/* handle Tools + corresponding pages */}
    <div style={{padding : 20}}>

      {/* //////////////////////// Visualize phenotypes /////////////////////////////////////////// */}
      {tool != "VisPheno" || 
      
        <div >  
          <Grid className="top-grid" container columns={2} columnGap = {2}>
            <Autocomplete
              options={['bar','line', 'histogram', 'boxplot', 'scatter', 'linReg','violin', 'raincloud']}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="choose plot type" />}
              onInputChange = {(e, v) => setSelectedPlotType(v)}
            />
            <Button variant="contained" onClick={() => {setPlotIsToggled(true)}}>Plot</Button>
            </Grid>

          <Grid className="top-grid" container columns={3} columnGap = {2}>

        {isMultiTrace ? "" : 

                    <Grid sx = {{marginTop:2}} className="top-grid" container columns={2} columnGap = {2}>

                    { selected_plot_type == 'histogram'  ?  
                                      <Autocomplete
                                        options={col_names}
                                        sx={{ width: 300 }}
                                        renderInput={(params) => <TextField {...params} label="choose x-variable" />}
                                        onInputChange = {(e) => setSelectedXvar(e.target.innerHTML)}
                                      />
                                      :   
                                      <Grid sx = {{marginTop:2}} className="top-grid" container columns={2} columnGap = {2}>
                                        <Autocomplete
                                          options={col_names}
                                          sx={{ width: 300 }}
                                          renderInput={(params) => <TextField {...params} label="choose x-variable" />}
                                          onInputChange = {(e) => setSelectedXvar(e.target.innerHTML)}
                                        />
                                        <Autocomplete
                                          options={col_names}
                                          sx={{ width: 300 }}
                                          renderInput={(params) => <TextField {...params} label="choose y-variable" />}
                                          onInputChange = {(e) => setSelectedYvar(e.target.innerHTML)}
                                        />
                                      </Grid>
                                }



                    </Grid>
        }

<Grid sx = {{marginTop:2}} className="top-grid" container columns={3} columnGap = {2}>
                      <TextField sx={{ width: 300 }} onChange={(e) => {setPlotTitle(e.target.value)}} label="Update  plot title" ></TextField>
                      <TextField sx={{ width: 300 }} onChange={(e) => {setXlable(e.target.value)}} label="Update  x label " ></TextField>
                      <TextField sx={{ width: 300 }} onChange={(e) => {setYlable(e.target.value)}} label="Update  y label " ></TextField>
                    </Grid> 


        
          </Grid>
          

          {!isToggled || 
            <PlotlyPlots plotSchema = {plotSchema} />
          }
  
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Select Box Plots</DialogTitle>
            <DialogContent >
            <FormGroup variant="standard" sx={{ width: 1000 , m: 1}}>
                {col_names.map((item) => <FormControlLabel 
                              control={<Checkbox onChange={handleStateChange} name={item} />}
                              label={item}
                            />)}
              </FormGroup>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      }

      {/* /////////////////////////// GWAS ////////////////////////////////////////////////////////// */}

      {tool != "GWAS" ||
        <div padding={2}> 

        <Stack spacing={0}>
          <Item>
            <Typography variant='h5' > Genome wide Association Analysis (GWAS)</Typography> 
          </Item>
          <Item>
            <Typography variant='h6' > 1. PUBLIC DATA: Explore legacy GWAS data sets </Typography> 
            <Button variant = 'contained' onClick={handleGwasPublic} color="primary">
                  run gwas TOOL
            </Button>
          </Item>

          <Item>
          <Typography variant='h6' > 2. Perform GWAS Analyis on you project data </Typography> 
          <Button variant = 'contained' onClick={handleGWAS} color="primary">
              Run gwas Tool
            </Button>


          </Item>

          <Item>
          <Typography variant='h6' > 3. Perform GWAS Analyis on your local data </Typography> 
          <Button variant = 'contained' onClick={handleGWAS} color="primary">
              Run gwas Tool
            </Button>

         </Item>
         <Item>
         {  !isToggledManhattan  || <div>
          <Typography variant='h6' > Results </Typography> 
          <ManhattanPlot inputArray = {plinkResults}/>
          </div> }
        {  !gwasOnPubData || <div>
          <Typography variant='h5' > Results </Typography> 
          <ManhattanPlot inputArray = {data}/> 
        </div>}
         </Item>
        </Stack>


        </div>
      }
    </div>

    {/* /////////////////////////// LD Analysis ///////////////////////////////////////////////////// */}


    {tool != "LD_Analysis" ||
      <div>
        <p>under construction</p>
      </div>
    }

    {/* <Gff3Reader url = {'https://plabipd.de/projects/ata/camelinagff3'}>This is gffreader</Gff3Reader>  This part does not work as proxy is also not allowed*/}
    <Head>
        <script src="/wasm/plink.js" /> {/* Add the script tag to the head */}
        {/* <script src="https://biowasm.com/cdn/v3/aioli.js"></script> */}
    </Head>


    {/* /////////////////////////// FastP //////////////////////////////////////////////////////////////// */}


    {tool != "Fastp"  || 
    <div>
    <Typography variant = "h4" sx={{marginTop:10}}> Fastp </Typography>
    <Typography variant = "p" sx={{marginTop:10}}> Check the qualitly of your fastq data before and after trimming </Typography>
    <Button  sx={{marginTop:5}} variant = 'contained' onClick={handleFastpReported}>
    run fastp
    </Button>


    <Typography variant = "h4" sx={{marginTop:10}}> Summary Statistics (QC) </Typography>

    </div>
    
     }
     {!(tool == "Fastp") | !(fastpReported) ||    
      <FastQC sx={{marginTop:10}} url = {url}></FastQC>}


    {/* /////////////////////////// PCA //////////////////////////////////////////////////////////////////////// */}
    {tool != "PCA" ||
              <div padding={2}> 
                <Typography variant='h5' > Population Stratification Scaling Analysis</Typography> 
                <Button variant = 'contained' onClick={handleGWAS} color="primary">
                            perform MDS
                          </Button>
                {!mdsData ||                         
                    <div>
                      <Typography variant='h5' > 1. Multidimentional Scaling (MDS)</Typography> 
                      <PlotlyPlots plotSchema={{ploty_type :"clustering", inputData : mdsData,  variablesToPlot: ["C1", "C2"], plotTitle : "Multidimentional Scaling", xLable : "PC1", yLable : "PC2"  } }/>
                    </div>
                }
              </div>
      }


    </>
  );
}

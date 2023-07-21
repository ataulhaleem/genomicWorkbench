'use client'
import * as React from 'react'
import Box from '@mui/material/Box'
import { Autocomplete, List, ListItem, TextField } from '@mui/material'
import { Button } from '@mui/material'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Tab from '@material-ui/core/Tab'
import TabContext from '@material-ui/lab/TabContext'
import TabList from '@material-ui/lab/TabList'
import TabPanel from '@material-ui/lab/TabPanel'
import Head from 'next/head'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { useState, useEffect } from 'react'
import { useRef } from 'react'
import Papa from 'papaparse'
import parse from 'html-react-parser'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import LoadingButton from '@mui/lab/LoadingButton';

import PlotlyPlots from './PlotlyPlots2'
import MenuItem from '@mui/material/MenuItem';
import { FormControl, InputLabel, Select } from '@mui/material';

import ManhattanPlot from '../components/ManhattanPlot'
import Mapman from './Mapman'
import { minioClient } from '/minioClient/helper.js'

import publicPhenoDataSets from '/public/publicPhenoDataSets.json'
import publicGwasDataSets from '/public/publicGwasDataSets.json'
import documentation from '../components/documentation.json'
import publicFastqDataSets from '/public/publicFastqDataSets'
import FastQC from './Fastqc'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.primary
}))

var docs = Object.values(documentation)
var pPhenoDataSets = Object.values(publicPhenoDataSets)
var pGwasDataSets = Object.values(publicGwasDataSets)
var pFastqDataSets = Object.values(publicFastqDataSets)


export function Analysis (props) {
  const tool = props.tool

  const [waitMsg, setWaitMsg] = useState('')
  const [parseToggled, setParseToggled] = useState(true)

  // Manage input data
  const [isPublic, setIspublic] = useState(true)
  const [isMinioData, setIsMinioData] = useState(false)
  const [isOwnData, setIsOwnData] = useState(false)
  const [value, setValue] = useState('0') //handle tabs

  // Online public data urls
  const [url, setUrl] = useState('')

  // Tools usage
  const [toolsUsage, setToolsUsage] = useState('')

  // Minio
  const [bucketList, setBucketList] = useState([])
  const [chosenProject, setChosenProject] = React.useState('')
  const [chosenDataType, setchosenDataType] = React.useState('')
  const [chosenFile, setChosenFile] = React.useState('')
  const [inputFiles, setInputFiles] = React.useState([])
  const [minioGwasUrls, setMinioGwasUrls] = useState({})
  const [plinkFiles, setPlinkFiles] = useState({})

  // local data
  const inputFile = useRef(null)
  const [file, setFile] = useState('')
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [publicDataSets, setPublicDataSets] = useState([])

  //  GWAS tool
  const [plinkResults, setPlinkResults] = useState([])
  const [isToggledManhattan, setPlotIsToggledManhattan] = useState(false)
  const [gwasOnPubData, setGwasOnPubData] = useState(false)
  const [mdsData, setMdsData] = useState(null)
  const [loading, setLoading] = React.useState(false);

  // VisPehno
  const [selected_plot_type, setSelectedPlotType] = useState('')
  const [col_names, setColNames] = useState([])
  const [selectedXvar, setSelectedXvar] = useState('')
  const [selectedYvar, setSelectedYvar] = useState('')
  const [open, setOpen] = useState(false)
  const [isToggled, setPlotIsToggled] = useState(false)
  const [plotSchema, setPlotSchema] = useState({})
  const [isNewSchema, setIsNewSchema] = useState(0)
  const [filteredData, setFilteredData] = useState([])

  const [plotTitle, setPlotTitle] = useState('')
  const [xLable, setXlable] = useState('')
  const [yLable, setYlable] = useState('')
  const [isMultiTrace, setIsMultiTrace] = useState(false)
  const [state, setState] = useState({})

  const [filters, setFilters] = useState([
    { key: '', comparison: '', value: '', logicalOperator: '' },
  ]);

  

  // Fastp
  const [isFastqProcessed, setFastqProcessed] = useState(false)

  const handleUsage = () => {
    {
      docs.map((key, index) => {
        if (docs[index].id === tool) {
          setToolsUsage(docs[index].usage)
        }
      })
    }
  }

  // handle Minio data
  const handleChange = (event, newValue) => {
    setValue(newValue)
    if (newValue == '1') {
      setIsMinioData(true)
      setIsOwnData(false)
      setIspublic(false)
      console.log('using Minio data')
    } else if (newValue == '2') {
      setIsMinioData(false)
      setIsOwnData(true)
      setIspublic(false)
      console.log('using own data')
    } else {
      setIsMinioData(false)
      setIsOwnData(false)
      setIspublic(true)
      console.log('using public data')
    }
  }

  useEffect(() => {
    var newBuckets = []
    minioClient.listBuckets(function (err, buckets) {
      buckets.map((item, index) => newBuckets.push(item.name))
    })
    setBucketList(newBuckets)
  }, [])

  React.useEffect(() => {
    fetchObjects()
  }, [chosenProject, chosenDataType])

  const fetchObjects = async () => {
    // console.log(chosenProject);
    // console.log(chosenDataType);
    const objectsList = []

    if (chosenProject != '') {

      if(tool == "VisPheno"){
        var dType = "Pheno/"
      }else if(tool == "GWAS" || tool == "PCA"){
        var dType = "Plink/"
      }


      var stream = minioClient.listObjectsV2(
        chosenProject,
        dType,
        true,
        ''
      )
      stream.on('data', function (obj) {
        if(!(objectsList.includes(obj.name.split('/')[1].split('.')[0]))){
            objectsList.push(obj.name.split('/')[1].split('.')[0])
        }
      })
      stream.on('error', function (err) {
        console.log(err)
      })
    }


    setInputFiles(objectsList)

  }

  const handleMinioProjectData = () => {
    // console.log("The chosen file :" , chosenFile)
    // console.log("The chosen project :" , chosenProject)
    if (tool == 'VisPheno' && isMinioData) {
      var size = 0
      minioClient.getObject(
        chosenProject,
        `Pheno/${chosenFile}.csv`,
        function (err, dataStream) {
          // console.log(dataStream)
          if (err) {
            return console.log('There is this error fetching data', err)
          }
          Papa.parse(dataStream, {
            // delimiter: ',',
            // escapeChar: '\\',
            header: true,
            complete: function (results) {
              let data = results.data
              setData(data)
            }
          })
          dataStream.on('end', function () {})
          dataStream.on('error', function (err) {
            console.log(err)
          })
        }
      )
    } else if (tool == 'GWAS' && isMinioData || tool == 'PCA' && isMinioData ) {
      console.log('The chosen project :', chosenProject)
      console.log('The chosen data set :', chosenFile)
      const objectsStream = minioClient.listObjectsV2(
        chosenProject,
        'Plink',
        true
      )
      var gwasUrls = {}
      objectsStream.on('data', obj => {
        if(chosenFile == obj.name.split('/')[1].split('.')[0]){
          plinkFiles[obj.name.split('.')[1]] = obj.name
          minioClient.presignedGetObject(
            chosenProject,
            obj.name,
            24 * 60 * 60,
            function (err, presignedUrl) {
              if (err) return console.log(err)
              gwasUrls[obj.name.split('.')[1]] = presignedUrl
            }
          )
        }
        setMinioGwasUrls(gwasUrls)
      })
      // console.log(gwasUrls)
    } else if (tool == 'Fastp') {
      console.log('This is under construction')
      // minioClient.presignedGetObject(chosenProject, chosenFile, 24*60*60, function(err, presignedUrl) {
      //     setUrl(presignedUrl)
      //   })
    }
  }

  //  hanlde Public Data Sets
  const handleFileInputChange = () => {
    console.log(
      'Numbr of files used from own data is ',
      inputFile.current.files.length
    )
    const file = inputFile.current.files[0]
    const reader = new FileReader()
    reader.onload = event => {
      const blob = new Blob([event.target.result], { type: file.type })
      setFile(blob)
    }
    if (file) {
      reader.readAsArrayBuffer(file)
    }
  }

  const handlePublicDataSets = () => {
    var publicdataSets = []
    if (tool == 'VisPheno') {
      pPhenoDataSets.map(item => {
        publicdataSets.push(item.id)
      })
      setPublicDataSets(publicdataSets)
    } else if (tool == 'GWAS') {
      pGwasDataSets.map(item => {
        publicdataSets.push(item.id)
      })
      setPublicDataSets(publicdataSets)
    } else if (tool == 'Fastp') {
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
        setFile(blob)
      })
    if (!file) return setError('Enter a valid file')
    const reader = new FileReader()
    reader.onload = async ({ target }) => {
      if (tool != 'GWAS') {
        const csv = Papa.parse(target.result, { header: true })
        const parsedData = csv?.data
        setData(parsedData)
      } else if (isPublic) {
        // This condition tells if the data is public as well the selected tool is GWAS
        const gwaData = parseQassoc(target.result, ' ')
        var filteredArray = gwaData.filter(obj => obj['P'] !== 'NA')
        setData(filteredArray)
      }
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    if (data) {
      var obj = data[0]
      var keys = Object.keys(obj || {})
      // console.log(keys)
      setColNames(keys)
    }
  }, [data])

  useEffect(() => {
    handlePublicDataSets()
    handleUsage()

    if (tool == 'Fastp') {
      setParseToggled(false)
    } else {
      handleParse()
      if (tool == 'GWAS' || tool == 'PCA') {
        loadPlink()
      }
    }
  }, [tool, url])

  // perform GWAS



  const handleGwasPublic = () => {
    setGwasOnPubData(true)
  }

  // Helper function to check if an array is a subset of another array
  function isSubsetOf (subset, array) {
    return subset.every(element => array.includes(element))
  }

  const loadPlink = () => {
    const initializeModule = async () => {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'wasm/plink.js' // Replace '/path/to/wasm.js' with the correct wasm path
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })
      // const Module = await window.Plink();
      // Module.callMain(["--help"])
    }
    initializeModule()
  }

  function isSubsetOf (set, subset) {
    for (let i = 0; i < set.length; i++) {
      if (subset.indexOf(set[i]) == -1) {
        return false
      }
    }
    return true
  }

  function parseQassoc (fileContent, delimiter) {
    const rows = fileContent.split('\n')
    const header = rows
      .shift()
      .split(delimiter)
      .filter(value => value !== '')
    const resultArray = []

    rows.forEach(row => {
      const columns = row.split(delimiter).filter(value => value !== '')
      const obj = {}

      columns.forEach((column, index) => {
        const key = header[index]
        const value = column
        obj[key] = value
      })

      resultArray.push(obj)
    })

    return resultArray
  }

  const handleGWAS = (e, v) => {
    if (isOwnData) {
      var analysisFiles = inputFile.current.files
      window.Plink().then(Module => {
        const readers = []
        for (let i = 0; i < analysisFiles.length; i++) {
          const reader = new FileReader()
          readers.push(reader)
          reader.onload = () => {
            const fileContents = reader.result
            Module.FS_createDataFile(
              '/',
              `plink.${analysisFiles[i].name.split('.')[1]}`,
              fileContents,
              true,
              true
            )
            if (
              isSubsetOf(
                ['plink.bim', 'plink.fam', 'plink.bed'],
                Module.FS.readdir('.')
              )
            ) {
              if (tool == 'GWAS') {
                if (v == 'without') {
                  console.log('performing GWAS with out correction')
                  Module.callMain([
                    '--bfile',
                    'plink',
                    '--maf',
                    '0.05',
                    '--mind',
                    '0.1',
                    '--assoc',
                    '--allow-no-sex'
                  ])
                } else {
                  console.log('performing GWAS with correction')
                  Module.callMain([
                    '--bfile',
                    'plink',
                    '--maf',
                    '0.05',
                    '--genome',
                    '--allow-no-sex'
                  ])
                  Module.callMain([
                    '--bfile',
                    'plink',
                    '--maf',
                    '0.05',
                    '--mind',
                    '0.1',
                    '--read-genome',
                    'plink.genome',
                    '--cluster',
                    '--ppc',
                    '0.0001',
                    '--mds-plot',
                    '2',
                    '--allow-no-sex'
                  ])
                  Module.callMain([
                    '--bfile',
                    'plink',
                    '--maf',
                    '0.05',
                    '--mind',
                    '0.1',
                    '--covar',
                    'plink.mds',
                    '--covar-name',
                    'C1,C2',
                    '--linear',
                    '--allow-no-sex'
                  ])
                }
                if (isSubsetOf(['plink.assoc'], Module.FS.readdir('.'))) {
                  var string = new TextDecoder().decode(
                    Module.FS.readFile('/plink.assoc')
                  )
                } else if (
                  isSubsetOf(['plink.qassoc'], Module.FS.readdir('.'))
                ) {
                  var string = new TextDecoder().decode(
                    Module.FS.readFile('/plink.qassoc')
                  )
                }
                const multiArray = parseQassoc(string, ' ')
                var filteredArray = multiArray.filter(obj => obj['P'] !== 'NA')
                setPlinkResults(filteredArray)
                setPlotIsToggledManhattan(true)

                Module.FS.readdir('.').map(fileName => {
                  if(!fileName.search('plink')){
                    Module.FS.unlink(fileName)
                    console.log('Cleaning VFS: Removed', fileName)
            
                  }})

                
              } else if (tool == 'PCA') {
                console.log("This is PCA")
                Module.callMain(['--bfile', 'plink', '--genome'])
                Module.callMain([
                  '--bfile',
                  'plink',
                  '--read-genome',
                  'plink.genome',
                  '--cluster',
                  '--ppc',
                  '0.0001',
                  '--mds-plot',
                  '2'
                ])
                console.log('Files After Analysis', Module.FS.readdir('.'))
                var string = new TextDecoder().decode(
                  Module.FS.readFile('/plink.mds')
                )
                const multiArray = parseQassoc(string, ' ')
                setMdsData(multiArray)
                Module.FS.readdir('.').map(fileName => {
                  if(!fileName.search('plink')){
                    Module.FS.unlink(fileName)
                    console.log('Cleaning VFS: Removed', fileName)
            
                  }})

              }
            }
          }
          reader.readAsBinaryString(analysisFiles[i])
        }
      })
    } else if (isMinioData) {
      console.log(        'Reading data from your selected Minio project: ',        chosenProject      )
      console.log(        'You are Running: ',        tool      )

      window.Plink().then(Module => {
        var fam = minioGwasUrls.fam
        var bim = minioGwasUrls.bim
        var bed = minioGwasUrls.bed
        var plinkInputFiles = [fam, bim, bed]
        var fileNames = ['plink.fam', 'plink.bim', 'plink.bed']
        fileNames.map((fileName, index) => {
          fetch(plinkInputFiles[index])
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader()
              reader.onload = () => {
                const fileContents = reader.result
                Module.FS_createDataFile(
                  '/', // folder
                  fileName, // filename
                  fileContents, // content
                  true, // read
                  true // write
                )
                if (isSubsetOf(['plink.bim', 'plink.fam', 'plink.bed'],Module.FS.readdir('.'))) {
                  if (tool == 'GWAS') {

                    if (v == 'without') {
                      console.log('performing GWAS with out correction')
                      Module.callMain([
                        '--bfile',
                        'plink',
                        '--maf',
                        '0.05',
                        '--mind',
                        '0.1',
                        '--assoc',
                        '--allow-no-sex'
                      ])
                    console.log('Files After Analysis', Module.FS.readdir('.'))
                    } else {
                      Module.callMain([
                        '--bfile',
                        'plink',
                        '--maf',
                        '0.05',
                        '--genome',
                        '--allow-no-sex'
                      ])
                      Module.callMain([
                        '--bfile',
                        'plink',
                        '--maf',
                        '0.05',
                        '--mind',
                        '0.1',
                        '--read-genome',
                        'plink.genome',
                        '--cluster',
                        '--ppc',
                        '0.0001',
                        '--mds-plot',
                        '2',
                        '--allow-no-sex'
                      ])
                      Module.callMain([
                        '--bfile',
                        'plink',
                        '--maf',
                        '0.05',
                        '--mind',
                        '0.1',
                        '--covar',
                        'plink.mds',
                        '--covar-name',
                        'C1,C2',
                        '--linear',
                        '--allow-no-sex'
                      ])
                      console.log('performing GWAS with correction')
                      console.log('Files After Analysis', Module.FS.readdir('.'))
                    }
                    if (isSubsetOf(['plink.assoc'], Module.FS.readdir('.'))) {
                      var string = new TextDecoder().decode(
                        Module.FS.readFile('/plink.assoc')
                      )
                    } else if (
                      isSubsetOf(['plink.qassoc'], Module.FS.readdir('.'))
                    ) {
                      var string = new TextDecoder().decode(
                        Module.FS.readFile('/plink.qassoc')
                      )
                    }
                    const multiArray = parseQassoc(string, ' ')
                    var filteredArray = multiArray.filter(
                      obj => obj['P'] !== 'NA'
                    )
                    setPlinkResults(filteredArray)
                    setPlotIsToggledManhattan(true)

                    Module.FS.readdir('.').map(fileName => {
                      if(!fileName.search('plink')){
                        Module.FS.unlink(fileName)
                        console.log('Cleaning VFS: Removed', fileName)
                
                      }})

                  } else if (tool == 'PCA') {
                    Module.callMain(['--bfile', 'plink', '--genome'])
                    console.log('Files After', Module.FS.readdir('.'))
                    Module.callMain([
                      '--bfile',
                      'plink',
                      '--read-genome',
                      'plink.genome',
                      '--cluster',
                      '--ppc',
                      '0.0001',
                      '--mds-plot',
                      '2'
                    ])
                    console.log('Files After Analysis', Module.FS.readdir('.'))
                  var string = new TextDecoder().decode(
                      Module.FS.readFile('/plink.mds')
                    )
                    const multiArray = parseQassoc(string, ' ')
                    setMdsData(multiArray)
                    Module.FS.readdir('.').map(fileName => {
                      if(!fileName.search('plink')){
                        Module.FS.unlink(fileName)
                        console.log('Cleaning VFS: Removed', fileName)
                
                      }})
  
                  }
                }
              }
              reader.readAsBinaryString(blob)
            })
        })
      })
    }
  }

  const handleButtonClick = () => {
    inputFile.current.click()
  }

  const handleStateChange = event => {
    setState({
      ...state,
      [event.target.name]: event.target.checked
    })
  }

  const handleClose = () => {
    handlePLOT()
    setOpen(false)
  }

  useEffect(() => {
    if (
      selected_plot_type == 'boxplot' ||
      selected_plot_type == 'line' ||
      selected_plot_type == 'violin' ||
      selected_plot_type == 'raincloud' ||
      selected_plot_type == 'heatMap'
    ) {
      setIsMultiTrace(true)
      setOpen(true)
      var newState = {}
      setState(newState)
    } else {
      setIsMultiTrace(false)
    }
  }, [selected_plot_type])

  useEffect(() => {
    handlePLOT()
  }, [
    selectedXvar,
    selectedYvar,
    selected_plot_type,
    plotTitle,
    xLable,
    yLable,
    isNewSchema,
    filteredData
  ])

  var handlePLOT = () => {
    var schema1 = {
      inputData: data,
      ploty_type: '',
      variablesToPlot: [],
      plotTitle: plotTitle,
      xLable: xLable,
      yLable: yLable
    }
    if (selected_plot_type === 'boxplot') {
      schema1.ploty_type = 'boxplot'
      schema1.variablesToPlot = Object.keys(state)
    } else if (selected_plot_type === 'violin') {
      schema1.ploty_type = 'violin'
      schema1.variablesToPlot = Object.keys(state)
    } else if (selected_plot_type === 'line') {
      schema1.ploty_type = 'line'
      schema1.variablesToPlot = Object.keys(state)
    } else if (selected_plot_type === 'raincloud') {
      schema1.ploty_type = 'raincloud'
      schema1.variablesToPlot = Object.keys(state)
    } else if (selected_plot_type === 'heatMap') {
      schema1.ploty_type = 'heatMap'
      schema1.variablesToPlot = Object.keys(state)
    } else {
      schema1.ploty_type = selected_plot_type
      schema1.variablesToPlot = [selectedXvar, selectedYvar]
    }

    if(isNewSchema == 0){
    setPlotSchema(schema1)
  }else{
    var changedSchema = schema1;
    changedSchema.inputData = filteredData
    setPlotSchema(changedSchema)
  }

  }

  
    const handleAddFilter = () => {
      setFilters([...filters, { key: '', comparison: '', value: '', logicalOperator: 'AND' }]);
      setFilteredData(filteredData)
    };
  
    const handleRemoveFilter = (index) => {
      setFilters((prevFilters) => prevFilters.filter((_, i) => i !== index));
      setFilteredData(filteredData)
    };
  
    const handleResetFilters = () => {
      setFilters([{ key: '', comparison: '', value: '', logicalOperator: '' }]);
      setFilteredData(data)  // as the plot is not taking data from filtered data, so set filtered data to original data
    };
  
    const applyFilters = () => {
      const filteredData = data.filter((item) => {
        return filters.every((filter) => {
          const { key, comparison, value, logicalOperator } = filter;
          if (!key || !comparison || !value) {
            return true;
          }
    
          const itemValue = item[key];
          switch (comparison) {
            case '=':
              return itemValue === value;
            case '!=':
              return itemValue !== value;
            case '<':
              return itemValue < value;
            case '>':
              return itemValue > value;
            case '<=':
              return itemValue <= value;
            case '>=':
              return itemValue >= value;
            default:
              return true;
          }
        });
      });
      setFilteredData(filteredData)
      setIsNewSchema(+1)
      // console.log(filteredData)

    };


    // MapMan
    const [svgUrl, setSvgURL] = useState('');
    const [mercatorData, setMerctorData] = useState({})

  return (
    <>
      {/* <Gff3Reader url = {'https://plabipd.de/projects/ata/camelinagff3'}>This is gffreader</Gff3Reader>  This part does not work as proxy is also not allowed*/}
      <Head>
        <script src='/wasm/plink.js' /> {/* Add the script tag to the head */}
      </Head>

      <Box
        sx={{
          display: 'flex',
          '& > :not(style)': {
            m: 1,
            width: '50%',
            border: 1.5,
            color: 'primary.main',
            boxShadow: 1,
            padding: 1.5
          }
        }}
      >
        <Paper variant='contained'>
          <Typography variant='h5'>
            Usage
            <Typography sx={{ marginLeft: 2 }}>{parse(toolsUsage)}</Typography>
          </Typography>
        </Paper>

        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList
                onChange={handleChange}
                aria-label='lab API tabs example'
              >
                <Tab label='Public Data' value='0' />
                <Tab label='Project Data' value='1' />
                <Tab label='Own Data' value='2' />
              </TabList>
            </Box>
            {/* First tab */}
            
            
            <TabPanel value='0'>
            { !(tool == 'PCA')  ?
            

              <Autocomplete
                options={publicDataSets}
                sx={{ width: 500, marginTop: 3 }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Select Project Data'
                    key={params.key}
                  />
                )}
                // renderInput={(params) => <TextField {...params} label="Select Project Data" />}
                onInputChange={(e, v) => {
                  if (tool == 'GWAS') {
                    pGwasDataSets.map(item => {
                      if (item.id == v) {
                        setUrl(item.url)
                      }
                    })
                  } else if (tool == 'VisPheno') {
                    pPhenoDataSets.map(item => {
                      if (item.id == v) {
                        setUrl(item.url)
                      }
                    })
                  } else if (tool == 'Fastp') {
                    pFastqDataSets.map(item => {
                      if (item.id == v) {
                        setUrl(item.url)
                      }
                    })
                  }
                }}
              />             :
              console.log("")
            }

            </TabPanel>
            

            <TabPanel value='1'>
              <Box
                sx={{
                  display: 'flex',
                  '& > :not(style)': {
                    m: 0.5,
                    width: '50%',
                    color: 'primary.main',
                    padding: 0.1
                  }
                }}
              >
                
                <Autocomplete
                  options={bucketList}
                  sx={{ width: 300 }}
                  renderInput={params => (
                    <TextField {...params} label='Choose a Project' />
                  )}
                  onInputChange={e => setChosenProject(e.target.innerHTML)}
                />

                <Autocomplete
                  options={inputFiles}
                  sx={{ width: 300 }}
                  renderInput={params => (
                    <TextField {...params} label='Choose a Dataset' />
                  )}
                  onInputChange={(e, v) => setChosenFile(v)}
                />

              </Box>
            </TabPanel>
            <TabPanel value='2'>
              <div>
                <Grid
                  sx={{ width: 500, marginTop: 2 }}
                  container
                  columns={2}
                  columnGap={2}
                >
                  <Button
                    sx={{ width: 500, marginTop: 2 }}
                    onClick={handleButtonClick}
                    variant='contained'
                  >
                    <b>Select own data </b>
                    <input
                      type='file'
                      multiple
                      ref={inputFile}
                      id='file'
                      style={{ display: 'none' }}
                      onChange={handleFileInputChange}
                    />
                  </Button>
                </Grid>
              </div>
            </TabPanel>

            {!parseToggled || !(tool == 'PCA' && isPublic) ?  
            
              <Button
                sx={{ width: 500, marginTop: 2 }}
                variant='constained'
                onClick={() => {
                  handleParse()
                  handleMinioProjectData()
                }}
              >
                <b>Parse</b>
              </Button>
              :
              <h6>Select PROJECT DATA or OWN DATA tabs</h6>
            
            }
          </TabContext>
        </Box>
      </Box>

      {/* handle Tools + corresponding pages */}
      <div style={{ padding: 10 }}>

        {/* //////////////////////// Visualize phenotypes /////////////////////////////////////////// */}
        {tool != 'VisPheno' || (
          <div>
            <Stack spacing={2}>

              
                            <Item
                            sx={{ marginTop: 0.5, border: 1, borderColor: 'lightblue' }}
                            >
                              <Typography variant="h5">Query Builder</Typography>
            <Grid container spacing={2} sx={{ marginTop: 0.5}}>
    {filters.map((filter, index) => (
      <React.Fragment key={index}>
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={ col_names } // Assuming all objects have the same keys
            value={filter.key}
            onChange={(event, newValue) => {
              setFilters((prevFilters) =>
                prevFilters.map((prevFilter, i) =>
                  i === index ? { ...prevFilter, key: newValue } : prevFilter
                )
              );
            }}
            renderInput={(params) => <TextField {...params} label="Select Key" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Comparison</InputLabel>
            <Select
              value={filter.comparison}
              onChange={(event) => {
                setFilters((prevFilters) =>
                  prevFilters.map((prevFilter, i) =>
                    i === index ? { ...prevFilter, comparison: event.target.value } : prevFilter
                  )
                );
              }}
            >
              <MenuItem value="=">=</MenuItem>
              <MenuItem value="!=">≠</MenuItem>
              <MenuItem value="<">{'<'}</MenuItem>
              <MenuItem value=">">{'>'}</MenuItem>
              <MenuItem value="<=">{'≤'}</MenuItem>
              <MenuItem value=">=">{'≥'}</MenuItem>
            </Select>
            
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            value={filter.value}
            onChange={(event) => {
              setFilters((prevFilters) =>
                prevFilters.map((prevFilter, i) =>
                  i === index ? { ...prevFilter, value: event.target.value } : prevFilter
                )
              );
            }}
            label="Comparison Value"
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={3}>
          {index < filters.length - 1 && (
            <FormControl fullWidth>
              <InputLabel>Logical Operator</InputLabel>
              <Select
                value={filter.logicalOperator}
                onChange={(event) => {
                  setFilters((prevFilters) =>
                    prevFilters.map((prevFilter, i) =>
                      i === index
                        ? { ...prevFilter, logicalOperator: event.target.value }
                        : prevFilter
                    )
                  );
                }}
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
              </Select>
            </FormControl>
          )}

          {index === filters.length - 1 && (
            <Button size="large" variant="contained" onClick={handleAddFilter} fullWidth>
              Add Filter
            </Button>
          )}

          {filters.length > 1 && (
            <Button size="large" variant="contained" onClick={() => handleRemoveFilter(index)} fullWidth>
              Remove Filter
            </Button>
          )}
        </Grid>
      </React.Fragment>
    ))}

    <Grid item xs={12}>
      <Button size="large" variant="contained" color="primary" onClick={applyFilters} fullWidth>
        Apply Filters
      </Button>
      <Button size="large" variant="contained" color="secondary" onClick={handleResetFilters} fullWidth>
        Reset Filters
      </Button>
    </Grid>
  </Grid>

            </Item>

              <Item
                sx={{ marginTop: 0.5, border: 1, borderColor: 'lightblue' }}
              >
                <Typography sx={{ marginTop: 0.5, marginBottom:1}} variant='h5'>Plotting Options</Typography>
                <Grid className='top-grid' container columns={2} columnGap={2}>
                  <Autocomplete
                    options={[
                      'bar',
                      'line',
                      'histogram',
                      'boxplot',
                      'scatter',
                      'linReg',
                      'violin',
                      'raincloud'
                    ]}
                    sx={{ width: 300 }}
                    renderInput={params => (
                      <TextField {...params} label='choose plot type' />
                    )}
                    onInputChange={(e, v) => setSelectedPlotType(v)}
                  />
                  <Button
                    variant='contained'
                    onClick={() => {
                      setPlotIsToggled(true)
                    }}
                  >
                    Plot
                  </Button>
                </Grid>
                <Grid className='top-grid' container columns={3} columnGap={2}>
                  {isMultiTrace ? (
                    ''
                  ) : (
                    <Grid
                      sx={{ marginTop: 2 }}
                      className='top-grid'
                      container
                      columns={2}
                      columnGap={2}
                    >
                      {selected_plot_type == 'histogram' ? (
                        <Autocomplete
                          options={col_names}
                          sx={{ width: 300 }}
                          renderInput={params => (
                            <TextField {...params} label='choose x-variable' />
                          )}
                          onInputChange={e =>
                            setSelectedXvar(e.target.innerHTML)
                          }
                        />
                      ) : (
                        <Grid
                          sx={{ marginTop: 2 }}
                          className='top-grid'
                          container
                          columns={2}
                          columnGap={2}
                        >
                          <Autocomplete
                            options={col_names}
                            sx={{ width: 300 }}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label='choose x-variable'
                              />
                            )}
                            onInputChange={e =>
                              setSelectedXvar(e.target.innerHTML)
                            }
                          />
                          <Autocomplete
                            options={col_names}
                            sx={{ width: 300 }}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label='choose y-variable'
                              />
                            )}
                            onInputChange={e =>
                              setSelectedYvar(e.target.innerHTML)
                            }
                          />
                        </Grid>
                      )}
                    </Grid>
                  )}
                  <Grid
                    sx={{ marginTop: 2 }}
                    className='top-grid'
                    container
                    columns={3}
                    columnGap={2}
                  >
                    <TextField
                      sx={{ width: 300 }}
                      onChange={e => {
                        setPlotTitle(e.target.value)
                      }}
                      label='Update  plot title'
                    ></TextField>
                    <TextField
                      sx={{ width: 300 }}
                      onChange={e => {
                        setXlable(e.target.value)
                      }}
                      label='Update  x label '
                    ></TextField>
                    <TextField
                      sx={{ width: 300 }}
                      onChange={e => {
                        setYlable(e.target.value)
                      }}
                      label='Update  y label '
                    ></TextField>
                  </Grid>
                </Grid>
              </Item>

              {!isToggled || (
                <Item
                  sx={{ marginTop: 4, border: 1, borderColor: 'lightblue' }}
                >
                  <PlotlyPlots plotSchema={plotSchema} />
                </Item>
              )}
            </Stack>

            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Select Box Plots</DialogTitle>
              <DialogContent>
                <FormGroup variant='standard' sx={{ width: 1000, m: 1 }}>
                  {col_names.map(item => (
                    <FormControlLabel
                      control={
                        <Checkbox onChange={handleStateChange} name={item} />
                      }
                      label={item}
                    />
                  ))}
                </FormGroup>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color='primary'>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}

        {/* /////////////////////////// GWAS ////////////////////////////////////////////////////////////// */}

        {tool != 'GWAS' || (
          <Stack spacing={2}>
            <Item>
              <Typography variant='h5'>
                Genome wide Association Analysis (GWAS)
              </Typography>

              <Grid
                container
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{
                  marginTop: 2,
                  border: 1,
                  xs: 2,
                  md: 3,
                  borderColor: 'lightblue'
                }}
              >
                <div>
                  <Typography variant='h6' sx={{ marginLeft: 1, p: 2 }}>
                    1. PUBLIC DATA: Explore legacy GWAS data sets
                  </Typography>
                </div>
                <Stack spacing={2} padding={2}>
                  <Button
                    sx={{ marginRight: 1, p: 2 }}
                    variant='contained'
                    onClick={handleGwasPublic}
                    color='secondary'
                    size='large'
                  >
                    PLOT PUBLIC GWAS RESULTS
                  </Button>
                </Stack>
              </Grid>

              <Grid
                container
                direction='row'
                justifyContent='space-between'
                alignItems='baseline'
                sx={{
                  marginTop: 2,
                  border: 1,
                  xs: 2,
                  md: 3,
                  borderColor: 'lightblue'
                }}
              >
                <div>
                  <Typography variant='h6' sx={{ marginLeft: 1, p: 2 }}>
                    2. Perform GWAS Analyis on you project data
                  </Typography>
                  <Typography variant='h6' sx={{ marginLeft: 1, p: 2 }}>
                    3. Perform GWAS Analyis on your local data
                  </Typography>
                </div>

                <Stack spacing={2} padding={2}>
                  <Button  variant="contained"
                    color='secondary'
                    size='large'
                    onClick={(e) => {
                      handleGWAS(e, 'without');
                    }}
                  >
                    Single Marker GWAS
                  </Button>
                  <Button
                    variant='contained'
                    color='secondary'
                    size='large'
                    onClick={e => {
                      handleGWAS(e, 'with')
                    }}
                  >
                    Population-Corrected GWAS
                  </Button>
                </Stack>
              </Grid>
            </Item>

            {!isToggledManhattan || (
              <Item sx={{ marginTop: 4, border: 1, borderColor: 'lightblue' }}>
                <Typography variant='h6'> Results: Own Data </Typography>
                <ManhattanPlot inputArray={plinkResults} />
              </Item>
            )}
            {!gwasOnPubData || (
              <Item sx={{ marginTop: 4, border: 1, borderColor: 'lightblue' }}>
                <Typography variant='h5'>
                  Results: Public GWAS Catalogue
                </Typography>
                <ManhattanPlot inputArray={data} />
              </Item>
            )}
          </Stack>
        )}

        {/* /////////////////////////// LD Analysis ////////////////////////////////////////////////////////// */}
        {tool != 'LD_Analysis' || (
          <div>
            <p>under construction</p>
          </div>
        )}

        {/* /////////////////////////// FastP //////////////////////////////////////////////////////////////// */}
        {tool != 'Fastp' || (
          <div>
            <Typography variant='h4' sx={{ marginTop: 10 }}>
              Fastp
            </Typography>
            <Typography variant='p' sx={{ marginTop: 10 }}>
              Check the qualitly of your fastq data before and after trimming
            </Typography>
            <Button
              sx={{ marginTop: 5 }}
              variant='contained'
              onClick={handleFastp}
            >
              run fastp
            </Button>
            <Typography variant='h4' sx={{ marginTop: 10 }}>
              Summary Statistics (QC)
            </Typography>
          </div>
        )}
        {!isFastqProcessed || (
          <FastQC sx={{ marginTop: 10 }} url={url}></FastQC>
        )}
        {/* <FastQC sx={{marginTop:10}} blob = {file} url = {url}></FastQC> */}

        {/* /////////////////////////// PCA ////////////////////////////////////////////////////////////////// */}
        {tool != 'PCA' || (
          <div padding={2}>
            <Typography variant='h5'>
              Population Stratification Scaling Analysis
            </Typography>
            <Button variant='contained' onClick={handleGWAS} color='primary'>
              perform MDS
            </Button>
            {!mdsData || (
              <div>
                <Typography variant='h5'>
                  1. Multidimentional Scaling (MDS)
                </Typography>
                <PlotlyPlots
                  plotSchema={{
                    ploty_type: 'clustering',
                    inputData: mdsData,
                    variablesToPlot: ['C1', 'C2'],
                    plotTitle: 'Multidimentional Scaling',
                    xLable: 'PC1',
                    yLable: 'PC2'
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div>
      <Mapman src={"./m4diagrams/X4.5_Metabolism_overview.svg"} />


        </div>
      </div>
    </>
  )
}

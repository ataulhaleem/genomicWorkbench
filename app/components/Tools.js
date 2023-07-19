import React from 'react'
import Box from '@mui/material/Box';
import CardTemplate from './CardTemplate';


export function Tools() {
  return (
    <>
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        '& > :not(style)': {
          m: 1,
          width: 400,
          height: 400,
        },
      }}
    >
    
      <CardTemplate
      myImage = './dataViz.jpg' 
      title = 'VisPheno' 
      description = 'A tool to create interactive plots with plotly.js, using data from a csv or the backend DB' />

      <CardTemplate
          myImage = './pca.png' 
        title = 'PCA' 
        description = 'Population stratification'
        />

      <CardTemplate
          myImage = './LDplot.png' 
        title = 'LD analysis' 
        description = 'Find correlations among genetic markers '
        />

      <CardTemplate
        myImage = './gwas.jpg' 
        title = 'GWAS' 
        description = 'Minecraft Dungeons is '
        />

      <CardTemplate
        myImage = './fastp.png' 
        title = 'Fastp' 
        description = 'Analyze sequencing qualitly of FastQ data'/>
    </Box>
    </>
  );
}

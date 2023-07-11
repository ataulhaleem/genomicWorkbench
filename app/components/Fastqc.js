import React, { useMemo, useEffect, useState } from 'react'
import Aioli from "@biowasm/aioli";
import { useTable } from 'react-table'
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));


export default function FastQC(props) {
  const url = props.url

  const [summaryBeforefiltering, setSummaryBeforeFiltering] = useState({})
  const [summaryAfterFiltering, setSummaryAfterFiltering] = useState({})
  const [data, setData] = useState([]);
  const [keys, setKeys] = useState([])
  
  const fastp = async () => {
    const CLI = await new Aioli(["fastp/0.20.1"]);
    await CLI.mount([
      { name: "fastqfile", url: url },
  ]);
    await CLI.exec("fastp -i fastqfile");
    const json = await CLI.cat("fastp.json");
    const obj = await JSON.parse(json);
    setKeys(Object.keys(obj.summary.after_filtering))
    setSummaryBeforeFiltering(obj.summary.before_filtering)
    setSummaryAfterFiltering(obj.summary.after_filtering)
    setData([obj])
    console.log(obj)

  }

useEffect(()=>{
  fastp()
},[])




  return (
    <>
    <div>

    <TableContainer   component={Paper}>
      <Table  sx={{ minWidth: 300, maxWidth:800 }} aria-label="customized table">
        <TableHead>
          <TableRow >
            <StyledTableCell align="left">Statistic</StyledTableCell>
            <StyledTableCell align="left">Before Filtering </StyledTableCell>
            <StyledTableCell align="left">After Filtering</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map((key) => (
            <StyledTableRow key={key}>
              <StyledTableCell align="left">{key}</StyledTableCell>
              <StyledTableCell align="left">{summaryBeforefiltering[key]}</StyledTableCell>
              <StyledTableCell align="left">{summaryAfterFiltering[key]}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Typography variant = "h4" sx={{marginTop:10}}> More is coming </Typography>

    </div>
    
    
  
    </>

  )
}

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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


export default function StyledTable(props) {
    const data = props.data;
    const summary = data.summary;
    if(!summary){
        console.log(summary)
        // var keys = Object.keys(summary.before_filtering);
        // console.log(keys)
    }



  return (
    <TableContainer  sx={{ minWidth: 400, maxWidth:600 }} component={Paper}>
      <Table aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Statistic</StyledTableCell>
            <StyledTableCell align="right">Before Filtering </StyledTableCell>
            <StyledTableCell align="right">After Filtering</StyledTableCell>

          </TableRow>
        </TableHead>

        <TableBody>
          {keys.map((key) => (
            <StyledTableRow key={key}>
              <StyledTableCell component="th" scope="row">
              </StyledTableCell>
              <StyledTableCell align="right">{summary.before_filtering[key]}</StyledTableCell>
              <StyledTableCell align="right">{summary.after_filtering[key]}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
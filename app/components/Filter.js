import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import { FormControl, InputLabel, Select } from '@mui/material';

const FilterComponent = (props) => {
    const [filters, setFilters] = useState([
        { key: '', comparison: '', value: '', logicalOperator: '' },
      ]);
    
      const handleAddFilter = () => {
        setFilters([...filters, { key: '', comparison: '', value: '', logicalOperator: 'AND' }]);
      };
    
      const handleRemoveFilter = (index) => {
        setFilters((prevFilters) => prevFilters.filter((_, i) => i !== index));
      };
    
      const handleResetFilters = () => {
        setFilters([{ key: '', comparison: '', value: '', logicalOperator: '' }]);
      };
    
      const applyFilters = () => {
        // TODO: Implement the logic to apply the filters
        console.log('Applied Filters:', filters);
      };

  return (
    <Grid item xs={12} md={3} key={index}>
    <Autocomplete
      options={Object.keys(props.data)} // Assuming all objects have the same keys
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

    {index < filters.length - 1 && (
      <FormControl fullWidth>
        <InputLabel>Logical Operator</InputLabel>
        <Select
          value={filter.logicalOperator}
          onChange={(event) => {
            setFilters((prevFilters) =>
              prevFilters.map((prevFilter, i) =>
                i === index ? { ...prevFilter, logicalOperator: event.target.value } : prevFilter
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
      <Button variant="outlined" onClick={handleAddFilter} fullWidth>
        Add Filter
      </Button>
    )}

    {filters.length > 1 && (
      <Button variant="outlined" onClick={() => handleRemoveFilter(index)} fullWidth>
        Remove Filter
      </Button>
    )}
  </Grid>
  );
};

export default FilterComponent;

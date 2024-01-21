import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import React, { useMemo } from 'react';

import { Parameter } from '../lib/openSCAD/parseParameter';

type Parameters = Parameter[];

type Props = {
  parameters: Parameters;
  onChange: (parameters: Parameters) => void;
};

export default function Customizer({ parameters, onChange }: Props) {
  const changeParameter = (name: string, newValue?) => {
    const newParameters = parameters.map((parameter) => {
      if (parameter.name === name) {
        if (parameter.type === 'number') {
          newValue = Number(newValue);
        }

        return {
          ...parameter,
          value: newValue,
        };
      }
      return parameter;
    });
    onChange(newParameters);
  };

  const handleParameterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    changeParameter(event.target.name, event.target.value);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeParameter(event.target.name, event.target.checked);
  };

  const handleAutocompleteChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue?
  ) => {
    changeParameter(event.target.name, newValue);
  };

  // Group parameters
  const groups = useMemo(
    () =>
      parameters.reduce((acc, parameter) => {
        if (parameter.group) {
          if (!acc[parameter.group]) {
            acc[parameter.group] = [];
          }
          acc[parameter.group].push(parameter);
        } else {
          acc[''] = acc[''] || [];
          acc[''].push(parameter);
        }
        return acc;
      }, {}) as { [key: string]: Parameters },
    [parameters]
  );

  return (
    <div style={{ height: '100%', overflow: 'scroll' }}>
      {Object.entries(groups)
        .filter((x) => x[0].toLowerCase() !== 'hidden')
        .map(([groupName, groupParams], idx) => (
          <Accordion defaultExpanded={idx === 0} key={idx}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              {groupName || <i>Common Parameters</i>}
            </AccordionSummary>
            <AccordionDetails>
              {groupParams.map((parameter) => {
                if (
                  parameter.type === 'number' ||
                  parameter.type === 'string'
                ) {
                  if (parameter.options) {
                    return (
                      <TextField
                        select
                        label={parameter.description || parameter.name}
                        fullWidth
                        key={parameter.name}
                        name={parameter.name}
                        onChange={handleParameterChange}
                        value={parameter.value}
                        sx={{ mt: 2, p: 1 }}
                      >
                        {parameter.options.map((option, idx) => (
                          <MenuItem key={idx} value={option.value}>
                            {option.label || option.value}
                          </MenuItem>
                        ))}
                      </TextField>
                    );
                  }

                  return (
                    <TextField
                      label={parameter.description || parameter.name}
                      fullWidth
                      type={parameter.type}
                      key={parameter.name}
                      name={parameter.name}
                      onChange={handleParameterChange}
                      value={parameter.value}
                      InputProps={{
                        inputProps: {
                          maxLength: parameter.range?.max,
                          min: parameter.range?.min,
                          max: parameter.range?.max,
                          step: parameter.range?.step,
                        },
                      }}
                      sx={{ mt: 2, p: 1 }}
                    />
                  );
                } else if (
                  parameter.type === 'number[]' ||
                  parameter.type === 'string[]'
                ) {
                  return (
                    <Autocomplete
                      key={parameter.name}
                      freeSolo
                      options={[]}
                      multiple
                      value={parameter.value as string[] | number[] | boolean[]}
                      onChange={handleAutocompleteChange}
                      renderInput={(params) => {
                        return (
                          <TextField
                            label={parameter.description || parameter.name}
                            fullWidth
                            key={parameter.name}
                            name={parameter.name}
                            InputProps={{
                              inputProps: {
                                maxLength: parameter.range?.max,
                                min: parameter.range?.min,
                                max: parameter.range?.max,
                                step: parameter.range?.step,
                              },
                            }}
                            sx={{ mt: 2, p: 1 }}
                            {...params}
                            type={parameter.type}
                          />
                        );
                      }}
                    />
                  );
                } else if (parameter.type === 'boolean') {
                  return (
                    <FormGroup key={parameter.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name={parameter.name}
                            onChange={handleCheckboxChange}
                            checked={parameter.value === true}
                          />
                        }
                        label={parameter.description || parameter.name}
                      />
                    </FormGroup>
                  );
                }
                return (
                  <div key={parameter.name}>
                    {parameter.name} {parameter.type}
                  </div>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))}
    </div>
  );
}

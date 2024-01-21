import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import React, { useMemo } from 'react';

import { Parameter } from '../lib/openSCAD/parseParameter';

type Parameters = Parameter[];

type Props = {
  parameters: Parameters;
  onChange: (parameters: Parameters) => void;
};

export default function Customizer({ parameters, onChange }: Props) {
  const handleParameterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newParameters = parameters.map((parameter) => {
      if (parameter.name === event.target.name) {
        return {
          ...parameter,
          value: event.target.value,
        };
      }
      return parameter;
    });
    onChange(newParameters);
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
      {Object.entries(groups).map(([groupName, groupParams], idx) => (
        <Accordion defaultExpanded={idx === 0} key={idx}>
          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
            {groupName}
          </AccordionSummary>
          <AccordionDetails>
            {groupParams.map((parameter) => {
              if (parameter.type === 'number' || parameter.type === 'string') {
                return (
                  <TextField
                    label={parameter.description || parameter.name}
                    fullWidth
                    type={parameter.type}
                    key={parameter.name}
                    name={parameter.name}
                    onChange={handleParameterChange}
                    value={parameter.value}
                    sx={{ mt: 2, p: 1 }}
                  />
                );
              } else if (parameter.type === 'boolean') {
                return (
                  <FormGroup key={parameter.name}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name={parameter.name}
                          onChange={handleParameterChange}
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

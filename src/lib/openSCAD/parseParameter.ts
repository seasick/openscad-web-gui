type ParameterOption = {
  value: string | number;
  label: string;
};

type ParameterRange = {
  min?: number;
  max?: number;
  step?: number;
};

type ParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'string[]'
  | 'number[]'
  | 'boolean[]';

export type Parameter = {
  name: string;
  type: ParameterType;
  value: string | boolean | number | string[] | number[] | boolean[];
  description?: string;
  group?: string;
  range?: ParameterRange;
  options?: ParameterOption[];
  maxLength?: number;
};

export default function parseParameters(script: string): Parameter[] {
  // Limit the script to the upper part of the file. We don't want to parse the
  // entire file, just the parameters. This can be done by searching for the
  // first occurence of the `module` or `function` keyword.
  script = script.split(/^(module |function )/m)[0];

  const parameters: Record<string, Parameter> = {};
  const parameterRegex =
    /^([a-z0-9A-Z_$]+)\s*=\s*([^;]+);[\t\f\cK ]*(\/\/[^\n]*)?/gm; // TODO: Use AST parser instead of regex
  const groupRegex = /^\/\*\s*\[([^\]]+)\]\s*\*\//gm;

  const groupSections: { id: string; group: string; code: string }[] = [
    {
      id: '',
      group: undefined,
      code: script,
    },
  ];
  let tmpGroup;

  // Find groups
  while ((tmpGroup = groupRegex.exec(script))) {
    groupSections.push({
      id: tmpGroup[0],
      group: tmpGroup[1].trim(),
      code: '',
    });
  }

  // Add code to groupSections
  groupSections.forEach((group, index) => {
    const nextGroup = groupSections[index + 1];
    const startIndex = script.indexOf(group.id);
    const endIndex = nextGroup ? script.indexOf(nextGroup.id) : script.length;
    group.code = script.substring(startIndex, endIndex);
  });

  // If we have more then one group, we need to adjust the code of the first group.
  // It should onyl have the code that is above the first group.
  if (groupSections.length > 1) {
    groupSections[0].code = script.substring(
      0,
      script.indexOf(groupSections[1].id)
    );
  }

  groupSections.forEach((groupSection) => {
    let match;
    while ((match = parameterRegex.exec(groupSection.code)) !== null) {
      const name = match[1];
      const value = match[2];
      const typeAndValue = convertType(value);

      // If type and value cannot be determined, we do not use that parameter
      if (!typeAndValue) {
        continue;
      }

      let description: string;
      let options: ParameterOption[];
      let range: ParameterRange;

      // Check if the value is another variable or an expression. If so, we can continue to the next
      // parameter because everything after this variable (including itself) is not a parameter. Also
      // check if the value is a string that contains a newline. If so, we will also abort the parsing
      if (
        value !== 'true' && // true and false are valid values
        value !== 'false' &&
        (value.match(/^[a-zA-Z_]/) || value.split('\n').length > 1)
      ) {
        continue;
      }

      if (match[3]) {
        const rawComment = match[3].replace(/^\/\/\s*/, '').trim();
        const cleaned = rawComment.replace(/^\[+|\]+$/g, '');

        if (!isNaN(rawComment)) {
          // If the cleaned comment is a number, then we assume that it is a step
          // value (or maximum length in case of a string)
          if (typeAndValue.type === 'string') {
            range = { max: parseFloat(cleaned) };
          } else {
            range = { step: parseFloat(cleaned) };
          }
        } else if (rawComment.startsWith('[') && cleaned.includes(',')) {
          // If the options contain commas, we assume that those are options for a select element.
          options = cleaned
            .trim()
            .split(',')
            .map((option) => {
              const parts = option.trim().split(':');
              let value = parts[0];
              const label = parts[1];
              if (typeAndValue.type === 'number') {
                value = parseFloat(value);
              }

              return { value, label };
            });
        } else if (cleaned.match(/([0-9]+:?)+/)) {
          // If the cleaned comment contains a colon, we assume that it is a range
          const [min, maxOrStep, max] = cleaned.trim().split(':');

          if (min && (maxOrStep || max)) {
            range = { min: parseFloat(min) };
          }
          if (max || maxOrStep || min) {
            range = { ...range, max: parseFloat(max || maxOrStep || min) };
          }
          if (max && maxOrStep) {
            range = { ...range, step: parseFloat(maxOrStep) };
          }
        }
      }

      // Now search for the comment right above the parameter definition. This is done
      // by splitting the script at the parameter definition and using the last line
      // before the definition.
      const splitted = script
        .split(new RegExp(`^${escapeRegExp(match[0])}`, 'gm'))[0]
        .trim()
        .split('\n')
        .reverse();

      const lastLineBeforeDefinition = splitted[0];
      if (lastLineBeforeDefinition.trim().startsWith('//')) {
        description = lastLineBeforeDefinition.replace(/^\/\/\s*/, '');
      }

      // Using names as keys to avoid duplicates
      parameters[name] = {
        description,
        group: groupSection.group,
        name,
        range,
        options,
        ...typeAndValue,
      };
    }
  });

  return Object.values(parameters);
}

function convertType(rawValue): {
  value: string | boolean | number;
  type: ParameterType;
} {
  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    // Raw value matches something like `123.123` or `123`.
    return { value: parseFloat(rawValue), type: 'number' };
  } else if (rawValue === 'true' || rawValue === 'false') {
    // Raw value matches `true` or `false`.
    return { value: rawValue === 'true', type: 'boolean' };
  } else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
    // Raw values is an array
    const arrayValue = rawValue
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim());

    if (arrayValue.every((item) => /^\d+(\.\d+)?$/.test(item))) {
      return {
        value: arrayValue.map((item) => parseFloat(item)),
        type: 'number[]',
      };
    } else if (arrayValue.every((item) => /^".*"$/.test(item))) {
      return {
        value: arrayValue.map((item) => item.slice(1, -1)),
        type: 'string[]',
      };
    } else if (
      arrayValue.every((item) => item === 'true' || item === 'false')
    ) {
      return {
        value: arrayValue.map((item) => item === 'true'),
        type: 'boolean[]',
      };
    }
  } else {
    // Remove quotes
    rawValue = rawValue.replace(/^"(.*)"$/, '$1');
    return { value: rawValue, type: 'string' };
  }
}

// https://stackoverflow.com/a/6969486/1706846
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export type Parameter = {
  name: string;
  type: 'string' | 'number' | 'boolean';
  value: string | boolean | number;
  description?: string;
};

export default function parseParameters(script: string) {
  const parameters: Parameter[] = [];
  const parameterRegex = /^(\w+)\s*=\s*([^;]+)/gm;

  // Limit the script to the upper part of the file. We don't want to parse the
  // entire file, just the parameters. This can be done by searching for the
  // first occurence of the `module` or `function` keyword.
  const splitted = script.split(/^(module |function )/m);

  script = splitted[0];

  let match;
  while ((match = parameterRegex.exec(script)) !== null) {
    const name = match[1];
    const value = match[2];
    // const description = match[3].trim();

    parameters.push({
      name,
      ...convertType(value),
    });
  }

  return parameters;
}

function convertType(rawValue): {
  value: string | boolean | number;
  type: 'string' | 'number' | 'boolean';
} {
  if (/^\d+(\.\d+)?$/.test(rawValue)) {
    return { value: parseFloat(rawValue), type: 'number' };
  } else if (rawValue === 'true' || rawValue === 'false') {
    return { value: rawValue === 'true', type: 'boolean' };
  } else {
    // Remove quotes
    rawValue = rawValue.replace(/^"(.*)"$/, '$1');
    return { value: rawValue, type: 'string' };
  }
}

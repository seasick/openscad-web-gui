export type Parameter = {
  name: string;
  type: 'string' | 'number' | 'boolean';
  value: string | boolean | number;
  description?: string;
};

export default function parseParameters(script: string): Parameter[] {
  const parameters: Record<string, Parameter> = {};
  const parameterRegex = /^(\w+)\s*=\s*([^;]+)/gm; // TODO: Use AST parser instead of regex

  // Limit the script to the upper part of the file. We don't want to parse the
  // entire file, just the parameters. This can be done by searching for the
  // first occurence of the `module` or `function` keyword.
  script = script.split(/^(module |function )/m)[0];

  let match;
  while ((match = parameterRegex.exec(script)) !== null) {
    const name = match[1];
    const value = match[2];
    let description;

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
      name,
      description,
      ...convertType(value),
    };
  }

  return Object.values(parameters);
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

// https://stackoverflow.com/a/6969486/1706846
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

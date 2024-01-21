export type Parameter = {
  name: string;
  type: 'string' | 'number' | 'boolean';
  value: string | boolean | number;
  description?: string;
  group?: string;
};

export default function parseParameters(script: string): Parameter[] {
  // Limit the script to the upper part of the file. We don't want to parse the
  // entire file, just the parameters. This can be done by searching for the
  // first occurence of the `module` or `function` keyword.
  script = script.split(/^(module |function )/m)[0];

  const parameters: Record<string, Parameter> = {};
  const parameterRegex = /^([a-z0-9A-Z_$]+)\s*=\s*([^;]+)/gm; // TODO: Use AST parser instead of regex
  const groupRegex = /^\/\*\s*\[([^\]]+)\]\s*\*\//gm;

  const groupSections: { id: string; group: string; code: string }[] = [];
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

  // If there are no groups, add the entire script as a group
  if (!groupSections.length) {
    groupSections.push({
      id: '',
      group: undefined,
      code: script,
    });
  }

  groupSections.forEach((groupSection) => {
    let match;
    while ((match = parameterRegex.exec(groupSection.code)) !== null) {
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
        description,
        group: groupSection.group,
        name,
        ...convertType(value),
      };
    }
  });

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

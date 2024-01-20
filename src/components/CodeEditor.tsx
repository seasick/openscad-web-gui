import React from 'react';

interface CodeEditorProps {
  code: string;
  disabled?: boolean;
  onChange: (newCode: string) => void;
}

export default function CodeEditor({
  code,
  disabled,
  onChange,
}: CodeEditorProps) {
  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexFlow: 'column' }}>
      <textarea
        readOnly={disabled}
        value={code}
        onChange={handleCodeChange}
        style={{
          width: '100%',
          flexGrow: 1,
          resize: 'none',
          padding: 12,
          backgroundColor: disabled ? '#ccc' : '#fff',
        }}
      />
    </div>
  );
}

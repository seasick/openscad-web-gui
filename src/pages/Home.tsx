import Button from '@mui/material/Button';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const handleCreateNewFile = () => {
    navigate('/editor');
  };
  const handleImportFile = () => {
    navigate('/import');
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleCreateNewFile}>
        Create New File
      </Button>
      <Button variant="contained" color="secondary" onClick={handleImportFile}>
        Import File
      </Button>
    </div>
  );
};

export default Home;

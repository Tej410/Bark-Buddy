import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';
import { login } from '../api.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await login(name, email); 
      localStorage.setItem('user', JSON.stringify(response)); // Store the response in local storage
      console.log(response);
      navigate('/search');
    } catch (error) {
      setError('Login failed. Please check your name and email.');
      console.error('Login error:', error);
    }
  };

  return (
    <Container maxWidth="xs" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', // Full viewport height
    }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Find your Bark Buddy!
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <Typography color="error">{error}</Typography>}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ width: '50%' }} // Set the button width to 50%
          >
            Log In
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default LoginPage;
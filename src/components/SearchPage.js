import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Pagination, 
  Dialog,
  FormControlLabel,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { getBreeds, searchDogs, getDogDetails, logout, getMatch } from '../api';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../api';

const SearchPage = () => {
  const navigate = useNavigate();
  const [allFilteredDogs, setAllFilteredDogs] = useState([]);
  const [loadingDogs, setLoadingDogs] = useState(false);
  const [errorDogs, setErrorDogs] = useState('');
  const [breeds, setBreeds] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  const [errorBreeds, setErrorBreeds] = useState('');
  const [sortField, setSortField] = useState('breed');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentDogs, setCurrentDogs] = useState([]);
  const [favoriteDogs, setFavoriteDogs] = useState([]); 
  const [match, setMatch] = useState(null); 
  const [matchDialogOpen, setMatchDialogOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  // Logout 
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Favorites
  const handleFavoriteChange = (dogId) => {
    setFavoriteDogs((prevFavorites) =>
      prevFavorites.includes(dogId)
        ? prevFavorites.filter((id) => id !== dogId) // Remove if already in favorites
        : [...prevFavorites, dogId] // Add if not in favorites
    );
  };

  // Fetching Breeds
  const fetchBreeds = React.useCallback(async () => {
    try {
      const data = await getBreeds();
      setBreeds(data);
      setLoadingBreeds(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/"); // Navigate to "/" if the response code is 401
      }
      setErrorBreeds('Failed to load breeds.');
      setLoadingBreeds(false);
      console.error('Error fetching breeds:', error);
    }
  },[navigate]);

  // Fetching Dog data
  const fetchDogData = React.useCallback(async () => {
    setLoadingDogs(true);
    setErrorDogs('');
    try {
      if (breeds.length > 0) {
        const searchParams = {
          breeds: selectedBreeds,
          sort: `${sortField}:${sortDirection}`,
          size: 50,
        };
        const searchResponse = await searchDogs(searchParams);
        if (searchResponse.resultIds && searchResponse.resultIds.length > 0) {
          const dogDetails = await getDogDetails(searchResponse.resultIds);
          
          const uniqueDogs = Array.from(new Map(dogDetails.map(dog => [dog.id, dog])).values());
          setAllFilteredDogs(uniqueDogs);
          const indexOfLastDog = currentPage * itemsPerPage;
          const indexOfFirstDog = indexOfLastDog - itemsPerPage;
          setCurrentDogs( uniqueDogs.slice(indexOfFirstDog, indexOfLastDog));
        }
      } else {
        const searchParams = {
          sort: `${sortField}:${sortDirection}`,
          size: 50,
        };
        const searchResponse = await searchDogs(searchParams);
        if (searchResponse.resultIds && searchResponse.resultIds.length > 0) {
          const dogDetails = await getDogDetails(searchResponse.resultIds);
          setAllFilteredDogs(dogDetails);
          const indexOfLastDog = currentPage * itemsPerPage;
          const indexOfFirstDog = indexOfLastDog - itemsPerPage;
          setCurrentDogs( dogDetails.slice(indexOfFirstDog, indexOfLastDog));
        } else {
          setAllFilteredDogs([]);
        }
      }
      setLoadingDogs(false);
    } catch (error) {
      setErrorDogs('Failed to load dogs.');
      setLoadingDogs(false);
      console.error('Error fetching dogs:', error);
    }
  }, [breeds.length, selectedBreeds, sortField, sortDirection, currentPage]);

  useEffect(() => {
    fetchBreeds();
  }, [fetchBreeds]);

  useEffect(() => {
    fetchDogData();
    console.log({selectedBreeds});
  }, [selectedBreeds, sortField, sortDirection, fetchDogData]);

  const handleBreedChange = (event) => {
    setSelectedBreeds(event.target.value);
  };

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('User not authenticated:', error);
        navigate('/');
      }
    };

    verifyLogin();
  }, [navigate]);

  // Finding Match
  const handleFindMatch = async () => {
    try {
      const matchResult = await getMatch(favoriteDogs); // Call getMatch with favoriteDogs
      console.log(matchResult);
      const matchedDog = allFilteredDogs.find((dog) => dog.id === matchResult.match); // Find the matched dog by ID
      setMatch(matchedDog);
      setMatchDialogOpen(true); // Open the match dialog
    } catch (error) {
      console.log(error);
      console.error('Failed to find match:', error);
    }
  };

  const handleCloseMatchDialog = () => {
    setMatchDialogOpen(false);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSortDirectionChange = (event) => {
    setSortDirection(event.target.value);
  };

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Browse Dogs
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        style={{ marginBottom: '16px' }}
      >
        Logout
      </Button>

      {loadingBreeds && <Typography>Loading breeds...</Typography>}
      {errorBreeds && <Typography color="error">{errorBreeds}</Typography>}

      {breeds.length > 0 && (
        <FormControl fullWidth margin="normal">
          <InputLabel id="breed-filter-label">Filter by Breed</InputLabel>
          <Select
            labelId="breed-filter-label"
            id="breed-filter"
            multiple
            value={selectedBreeds}
            onChange={handleBreedChange}
            renderValue={(selected) => selected.join(', ')}
          >
            {breeds.map((breed) => (
              <MenuItem key={breed} value={breed}>
                <Checkbox checked={selectedBreeds.includes(breed)} />
                <ListItemText primary={breed} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel id="sort-direction-label">Sort Direction</InputLabel>
        <Select
          labelId="sort-direction-label"
          id="sort-direction"
          value={sortDirection}
          onChange={handleSortDirectionChange}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>

      {loadingDogs && <Typography>Loading dogs...</Typography>}
      {errorDogs && <Typography color="error">{errorDogs}</Typography>}

      <Grid container spacing={2}>
        {!loadingDogs && !errorDogs && currentDogs.map((dog) => (
          <Grid item key={dog.id} xs={12} sm={6} md={3} lg={3}>
            <Card style={{ height: '300px', width: '275px', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={dog.img}
                alt={dog.name}
                style={{ objectFit: 'cover' }}
              />
              <CardContent style={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {dog.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Breed: {dog.breed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age: {dog.age}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zip Code: {dog.zip_code}
                </Typography>
                <FormControlLabel
                    control={
                      <Checkbox
                        checked={favoriteDogs.includes(dog.id)}
                        onChange={() => handleFavoriteChange(dog.id)}
                      />
                    }
                    label="Favorite"
                  />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Pagination
        count={Math.ceil(allFilteredDogs.length / itemsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleFindMatch}
        disabled={favoriteDogs.length === 0}
        style={{ marginTop: '16px' }}
      >
        Find Match
      </Button>

      <Dialog open={matchDialogOpen} onClose={handleCloseMatchDialog}>
        <DialogTitle>Match Result</DialogTitle>
        <DialogContent>
          {match ? (
            <>
              <Typography variant="h6">{match.name}</Typography>
              <Typography>Breed: {match.breed}</Typography>
              <Typography>Age: {match.age}</Typography>
              <Typography>Zip Code: {match.zip_code}</Typography>
              <CardMedia
              component="img"
              height="140"
              image={match.img}
              alt={match.name}
              style={{ objectFit: 'cover', marginTop: '16px' }}
              />
            </>
          ) : (
            <Typography>No match found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMatchDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SearchPage;
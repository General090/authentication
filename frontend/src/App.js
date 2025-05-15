import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Set base URL for axios
axios.defaults.baseURL = 'http://localhost:5000/api';

// Auth context
const AuthContext = React.createContext();

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      setAuthState({
        isAuthenticated: true,
        user,
        token
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <Router>
        <div className="container">
          <nav className="navbar">
            <Link to="/">Home</Link>
            {!authState.isAuthenticated ? (
              <>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
              </>
            ) : (
              <>
                <Link to="/profile">Profile</Link>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setAuthState({
                    isAuthenticated: false,
                    user: null,
                    token: null
                  });
                }}>Logout</button>
              </>
            )}
          </nav>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// Home component
function Home() {
  const { authState } = React.useContext(AuthContext);
  
  return (
    <div>
      <h1>Welcome to Auth Demo</h1>
      {authState.isAuthenticated ? (
        <p>Hello, {authState.user.username}! You are logged in.</p>
      ) : (
        <p>Please register or login to continue.</p>
      )}
    </div>
  );
}

// Register component
function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setAuthState } = React.useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.userId,
        username: response.data.username
      }));
      setAuthState({
        isAuthenticated: true,
        user: {
          id: response.data.userId,
          username: response.data.username
        },
        token: response.data.token
      });
      setMessage('Registration successful!');
      navigate('/profile');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

// Login component
function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setAuthState } = React.useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.userId,
        username: response.data.username
      }));
      setAuthState({
        isAuthenticated: true,
        user: {
          id: response.data.userId,
          username: response.data.username
        },
        token: response.data.token
      });
      setMessage('Login successful!');
      navigate('/profile');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

// Profile component
function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const { authState, setAuthState } = React.useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/profile/${authState.user.id}`, {
          headers: {
            Authorization: `Bearer ${authState.token}`
          }
        });
        setProfile(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          password: ''
        });
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error fetching profile');
      }
    };
    
    if (authState.isAuthenticated) {
      fetchProfile();
    }
  }, [authState]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/profile/${authState.user.id}`, formData, {
        headers: {
          Authorization: `Bearer ${authState.token}`
        }
      });
      setMessage('Profile updated successfully!');
      
      // Update auth state if username changed
      if (formData.username !== authState.user.username) {
        const updatedUser = {
          id: authState.user.id,
          username: formData.username
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAuthState({
          ...authState,
          user: updatedUser
        });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await axios.delete(`/profile/${authState.user.id}`, {
          headers: {
            Authorization: `Bearer ${authState.token}`
          }
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null
        });
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error deleting account');
      }
    }
  };

  if (!authState.isAuthenticated) {
    return <p>Please login to view your profile.</p>;
  }

  return (
    <div>
      <h2>Profile</h2>
      {profile && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>New Password (leave blank to keep current):</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Update Profile</button>
          <button type="button" onClick={handleDelete} style={{ marginLeft: '10px', backgroundColor: 'red' }}>
            Delete Account
          </button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
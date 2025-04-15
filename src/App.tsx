import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  Tab,
  Tabs,
  IconButton,
  Slider,
  Tooltip,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { 
  Calculate as CalculateIcon, 
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { calculateSubnet, reverseSubnet } from './utils/subnet';

// Création du thème personnalisé
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffd700',
    },
    secondary: {
      main: '#ffeb3b',
    },
    background: {
      default: '#111111',
      paper: '#1a1a1a',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ResultItemProps {
  label: string;
  value: string;
  onCopy: () => void;
}

function ResultItem({ label, value, onCopy }: ResultItemProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 2,
      p: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 1,
    }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          {label}
        </Typography>
        <Typography>{value}</Typography>
      </Box>
      <Tooltip title="Copy">
        <IconButton onClick={onCopy} size="small" sx={{ color: '#ffd700' }}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [ipAddress, setIpAddress] = useState('');
  const [subnetMask, setSubnetMask] = useState('');
  const [numHosts, setNumHosts] = useState('');
  const [result, setResult] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setResult(null);
  };

  const calculateSubnetHandler = () => {
    try {
      const subnetInfo = calculateSubnet(ipAddress, subnetMask);
      setResult(subnetInfo);
    } catch (error) {
      setResult({ error: 'Invalid IP address or subnet format' });
    }
  };

  const calculateReverseSubnet = () => {
    try {
      const hosts = parseInt(numHosts);
      if (isNaN(hosts) || hosts < 1 || hosts > 16777214) {
        throw new Error('Invalid number of hosts');
      }
      const cidr = reverseSubnet(hosts);
      setResult({
        cidr,
        mask: `/${cidr}`,
        totalHosts: Math.pow(2, 32 - cidr) - 2,
      });
    } catch (error) {
      setResult({ error: 'Invalid number of hosts' });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({
        open: true,
        message: `${label} copied to clipboard`,
      });
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const marks = [
    { value: 1, label: '1' },
    { value: 254, label: '254' },
    { value: 65534, label: '65,534' },
    { value: 16777214, label: '16,777,214' },
  ];

  function valuetext(value: number) {
    return value.toLocaleString();
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #111111 0%, #2c2c2c 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ 
            width: '100%',
            textAlign: 'center',
            padding: '2rem 0',
            marginBottom: '2rem'
          }}>
            <Typography
              variant="h2"
              component="h1"
              className="ninja-title"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 900,
                textTransform: 'uppercase',
                mb: 4
              }}
            >
              SubNinja
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              background: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  color: '#ffd700',
                },
              }}
            >
              <Tab label="Subnet Calculator" />
              <Tab label="Reverse Subnet" />
              <Tab label="Learn to Subnet" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
                <Box flex={1}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      backgroundColor: 'rgba(26, 26, 26, 0.95)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ color: '#ffd700' }}>
                      Input
                    </Typography>
                    <TextField
                      fullWidth
                      label="IP Address (e.g. 192.168.1.0/24)"
                      variant="outlined"
                      value={ipAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIpAddress(e.target.value)}
                      margin="normal"
                      error={!!error}
                      helperText={error}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Subnet Mask (e.g. 255.255.255.0)"
                      variant="outlined"
                      value={subnetMask}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubnetMask(e.target.value)}
                      margin="normal"
                      error={!!error}
                      helperText={error}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<CalculateIcon />}
                        onClick={calculateSubnetHandler}
                        sx={{
                          background: 'linear-gradient(45deg, #ffd700 30%, #ffeb3b 90%)',
                          color: 'black',
                          fontWeight: 'bold',
                        }}
                      >
                        Calculate
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                          setIpAddress('');
                          setSubnetMask('');
                          setResult(null);
                        }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Paper>
                </Box>
                <Box flex={1}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      backgroundColor: 'rgba(26, 26, 26, 0.95)',
                      borderRadius: 2,
                      height: '100%'
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ color: '#ffd700' }}>
                      Results
                    </Typography>
                    {result && !result.error && (
                      <Box>
                        <ResultItem 
                          label="Network"
                          value={result.network}
                          onCopy={() => copyToClipboard(result.network, "Network")}
                        />
                        <ResultItem 
                          label="CIDR"
                          value={`/${result.cidr}`}
                          onCopy={() => copyToClipboard(`/${result.cidr}`, "CIDR")}
                        />
                        <ResultItem 
                          label="Subnet Mask"
                          value={result.mask}
                          onCopy={() => copyToClipboard(result.mask, "Subnet Mask")}
                        />
                        <ResultItem 
                          label="First Host"
                          value={result.firstHost}
                          onCopy={() => copyToClipboard(result.firstHost, "First Host")}
                        />
                        <ResultItem 
                          label="Last Host"
                          value={result.lastHost}
                          onCopy={() => copyToClipboard(result.lastHost, "Last Host")}
                        />
                        <ResultItem 
                          label="Broadcast"
                          value={result.broadcast}
                          onCopy={() => copyToClipboard(result.broadcast, "Broadcast")}
                        />
                        <ResultItem 
                          label="Next Network"
                          value={result.nextNetwork}
                          onCopy={() => copyToClipboard(result.nextNetwork, "Next Network")}
                        />
                        <ResultItem 
                          label="Total Hosts"
                          value={result.totalHosts.toLocaleString()}
                          onCopy={() => copyToClipboard(result.totalHosts.toString(), "Total Hosts")}
                        />
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3, py: 4 }}>
                <TextField
                  fullWidth
                  label="Number of Hosts"
                  variant="outlined"
                  value={numHosts}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      setNumHosts('');
                    } else {
                      const numValue = parseInt(inputValue);
                      if (!isNaN(numValue) && numValue >= 1 && numValue <= 16777214) {
                        setNumHosts(inputValue);
                      }
                    }
                  }}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: { textAlign: 'left' }
                  }}
                  helperText="Enter the number of hosts"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 215, 0, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 215, 0, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ffd700',
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<CalculateIcon />}
                  onClick={calculateReverseSubnet}
                  sx={{
                    background: 'linear-gradient(45deg, #ffd700 30%, #ffeb3b 90%)',
                    color: 'black',
                    fontWeight: 'bold',
                  }}
                >
                  Calculate
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setNumHosts('');
                    setResult(null);
                  }}
                >
                  Reset
                </Button>
              </Box>

              {result && !result.error && tabValue === 1 && (
                <Box sx={{ mt: 2 }}>
                  <ResultItem 
                    label="Recommended CIDR"
                    value={result.mask}
                    onCopy={() => copyToClipboard(result.mask, "CIDR")}
                  />
                  <ResultItem 
                    label="Available Hosts"
                    value={result.totalHosts.toLocaleString()}
                    onCopy={() => copyToClipboard(result.totalHosts.toString(), "Available Hosts")}
                  />
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: '#ffd700', mb: 3 }}>
                  Understanding Subnetting
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                    What is Subnetting?
                  </Typography>
                  <Typography paragraph>
                    Subnetting is like dividing a large neighborhood into smaller sections. Each section (subnet) gets its own range of addresses, making it easier to manage and organize the network.
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                    Key Concepts
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3 
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      IPv4 Address Structure
                    </Typography>
                    <Typography paragraph>
                      An IPv4 address consists of 32 bits total, divided into:
                    </Typography>
                    <Box sx={{ ml: 2, mb: 2 }}>
                      <Typography>• 4 octets (8 bits each)</Typography>
                      <Typography>• Written in decimal format (0-255)</Typography>
                      <Typography>• Separated by dots</Typography>
                      <Typography>Example: 192.168.1.0</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      CIDR Notation
                    </Typography>
                    <Box sx={{ ml: 2, mb: 2 }}>
                      <Typography>• Written as /n (where n = number of network bits)</Typography>
                      <Typography>• Range from /0 to /32</Typography>
                      <Typography>• Example: /24 means:</Typography>
                      <Box sx={{ ml: 2, mt: 1 }}>
                        <Typography>- First 24 bits = Network portion</Typography>
                        <Typography>- Remaining 8 bits = Host portion</Typography>
                        <Typography>- Total: 32 bits (IPv4 standard)</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      Subnet Mask
                    </Typography>
                    <Box sx={{ ml: 2, mb: 2 }}>
                      <Typography>• 32-bit number that defines network boundaries</Typography>
                      <Typography>• Network portion: all 1's</Typography>
                      <Typography>• Host portion: all 0's</Typography>
                      <Typography>• Example: 255.255.255.0 (/24)</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                    How to Calculate Subnet Components
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      Example: 192.168.1.0/24
                    </Typography>
                    
                    <Box sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      p: 2,
                      borderRadius: 1,
                      mb: 2,
                      fontFamily: 'monospace'
                    }}>
                      <Typography sx={{ mb: 1, color: '#ffd700' }}>Step-by-Step Calculation:</Typography>
                      
                      <Typography sx={{ mb: 1 }}>1. Network Address (First address in range)</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • IP:    192.168.1.0
                        • Mask:  255.255.255.0
                        • Result: 192.168.1.0 (AND operation)
                      </Typography>

                      <Typography sx={{ mb: 1 }}>2. First Host Address</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • Network address + 1
                        • Result: 192.168.1.1
                      </Typography>

                      <Typography sx={{ mb: 1 }}>3. Last Host Address</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • Broadcast address - 1
                        • Result: 192.168.1.254
                      </Typography>

                      <Typography sx={{ mb: 1 }}>4. Broadcast Address (Last address in range)</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • Network address + Size - 1
                        • For /24: Network + 255
                        • Result: 192.168.1.255
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      p: 2,
                      borderRadius: 1,
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" sx={{ color: '#ffd700', mb: 1 }}>
                        Address Range Table
                      </Typography>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: 1,
                        fontFamily: 'monospace'
                      }}>
                        <Typography>Network:</Typography>
                        <Typography>192.168.1.0</Typography>
                        <Typography>First Host:</Typography>
                        <Typography>192.168.1.1</Typography>
                        <Typography>Last Host:</Typography>
                        <Typography>192.168.1.254</Typography>
                        <Typography>Broadcast:</Typography>
                        <Typography>192.168.1.255</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                    Binary Representation
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      Network (192.168.1.0) and Mask (/24)
                    </Typography>
                    <Box sx={{ fontFamily: 'monospace', mb: 2 }}>
                      <Typography sx={{ mb: 1 }}>IP Address:</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        <span style={{ color: '#4CAF50' }}>11000000.10101000.00000001</span>
                        <span style={{ color: '#FF9800' }}>.00000000</span>
                      </Typography>
                      <Typography sx={{ mb: 1 }}>Subnet Mask:</Typography>
                      <Typography sx={{ ml: 2 }}>
                        <span style={{ color: '#4CAF50' }}>11111111.11111111.11111111</span>
                        <span style={{ color: '#FF9800' }}>.00000000</span>
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: 'monospace' }}>
                      <span style={{ color: '#4CAF50' }}>Network (24 bits)</span> | 
                      <span style={{ color: '#FF9800' }}> Host (8 bits)</span> = 
                      <span style={{ color: '#ffd700' }}> 32 bits total (IPv4)</span>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                    Network Size Reference Table
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3,
                    overflowX: 'auto'
                  }}>
                    <Box sx={{ 
                      display: 'table',
                      width: '100%',
                      fontFamily: 'monospace',
                      borderCollapse: 'collapse',
                      '& > div': {
                        display: 'table-row',
                        '& > div': {
                          display: 'table-cell',
                          padding: '8px',
                          borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }
                      }
                    }}>
                      <Box sx={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <Box>CIDR</Box>
                        <Box>Subnet Mask</Box>
                        <Box>Total IPs</Box>
                        <Box>Usable Hosts</Box>
                        <Box>Common Use</Box>
                      </Box>
                      <Box>
                        <Box>/24</Box>
                        <Box>255.255.255.0</Box>
                        <Box>256</Box>
                        <Box>254</Box>
                        <Box>Small to medium LAN</Box>
                      </Box>
                      <Box>
                        <Box>/25</Box>
                        <Box>255.255.255.128</Box>
                        <Box>128</Box>
                        <Box>126</Box>
                        <Box>Small LAN segment</Box>
                      </Box>
                      <Box>
                        <Box>/26</Box>
                        <Box>255.255.255.192</Box>
                        <Box>64</Box>
                        <Box>62</Box>
                        <Box>Small office</Box>
                      </Box>
                      <Box>
                        <Box>/27</Box>
                        <Box>255.255.255.224</Box>
                        <Box>32</Box>
                        <Box>30</Box>
                        <Box>Point-to-point</Box>
                      </Box>
                      <Box>
                        <Box>/28</Box>
                        <Box>255.255.255.240</Box>
                        <Box>16</Box>
                        <Box>14</Box>
                        <Box>Small network segment</Box>
                      </Box>
                      <Box>
                        <Box>/29</Box>
                        <Box>255.255.255.248</Box>
                        <Box>8</Box>
                        <Box>6</Box>
                        <Box>Minimal subnet</Box>
                      </Box>
                      <Box>
                        <Box>/30</Box>
                        <Box>255.255.255.252</Box>
                        <Box>4</Box>
                        <Box>2</Box>
                        <Box>Router links</Box>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                    Network Boundary Calculations
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      Finding Network Boundaries (Example with 192.168.1.0/24)
                    </Typography>
                    
                    <Box sx={{ fontFamily: 'monospace', mb: 2 }}>
                      <Typography sx={{ mb: 1 }}>1. Network Size</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • Formula: 2^(32-CIDR)
                        • For /24: 2^(32-24) = 2^8 = 256 addresses
                      </Typography>

                      <Typography sx={{ mb: 1 }}>2. Network Address</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • IP AND Subnet Mask
                        • 192.168.1.0 AND 255.255.255.0
                      </Typography>

                      <Typography sx={{ mb: 1 }}>3. Next Network</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • Network Address + Network Size
                        • 192.168.1.0 + 256 = 192.168.2.0
                      </Typography>

                      <Typography sx={{ mb: 1 }}>4. Broadcast Address</Typography>
                      <Typography sx={{ ml: 2, mb: 2 }}>
                        • Next Network - 1
                        • 192.168.2.0 - 1 = 192.168.1.255
                      </Typography>

                      <Typography sx={{ mb: 1 }}>5. First & Last Host</Typography>
                      <Typography sx={{ ml: 2 }}>
                        • First: Network Address + 1
                        • Last: Broadcast Address - 1
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      Pro Tips for Network Engineers
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      <Typography sx={{ mb: 1 }}>• Network boundaries always fall on binary boundaries</Typography>
                      <Typography sx={{ mb: 1 }}>• Next network = Current network + 2^(32-CIDR)</Typography>
                      <Typography sx={{ mb: 1 }}>• For quick subnet mask conversion:</Typography>
                      <Box sx={{ ml: 2, mb: 1 }}>
                        <Typography>/24 = Last octet 0</Typography>
                        <Typography>/25 = Last octet 128</Typography>
                        <Typography>/26 = Last octet 192</Typography>
                        <Typography>/27 = Last octet 224</Typography>
                        <Typography>/28 = Last octet 240</Typography>
                        <Typography>/29 = Last octet 248</Typography>
                        <Typography>/30 = Last octet 252</Typography>
                      </Box>
                      <Typography>• Always verify network boundaries align with powers of 2</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                    IP Address Classes
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3,
                    overflowX: 'auto'
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      IP Address Classes
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Class</TableCell>
                            <TableCell>First Octet</TableCell>
                            <TableCell>First Bit Pattern</TableCell>
                            <TableCell>Network Bits</TableCell>
                            <TableCell>Host Bits</TableCell>
                            <TableCell>Default Mask</TableCell>
                            <TableCell>Range</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>A</TableCell>
                            <TableCell>1-126</TableCell>
                            <TableCell>0xxxxxxx</TableCell>
                            <TableCell>8</TableCell>
                            <TableCell>24</TableCell>
                            <TableCell>255.0.0.0</TableCell>
                            <TableCell>1.0.0.0 - 126.255.255.255</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>B</TableCell>
                            <TableCell>128-191</TableCell>
                            <TableCell>10xxxxxx</TableCell>
                            <TableCell>16</TableCell>
                            <TableCell>16</TableCell>
                            <TableCell>255.255.0.0</TableCell>
                            <TableCell>128.0.0.0 - 191.255.255.255</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>C</TableCell>
                            <TableCell>192-223</TableCell>
                            <TableCell>110xxxxx</TableCell>
                            <TableCell>24</TableCell>
                            <TableCell>8</TableCell>
                            <TableCell>255.255.255.0</TableCell>
                            <TableCell>192.0.0.0 - 223.255.255.255</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>D</TableCell>
                            <TableCell>224-239</TableCell>
                            <TableCell>1110xxxx</TableCell>
                            <TableCell colSpan={4}>Multicast Addresses</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>E</TableCell>
                            <TableCell>240-255</TableCell>
                            <TableCell>1111xxxx</TableCell>
                            <TableCell colSpan={4}>Reserved for Research</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      Special IP Addresses
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Address</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Use Case</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>0.0.0.0</TableCell>
                            <TableCell>Default Network</TableCell>
                            <TableCell>Source address for DHCP</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>127.0.0.1</TableCell>
                            <TableCell>Loopback</TableCell>
                            <TableCell>Local testing</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>169.254.0.0/16</TableCell>
                            <TableCell>Link Local</TableCell>
                            <TableCell>Auto IP when DHCP fails</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Private Ranges</TableCell>
                            <TableCell colSpan={2}>
                              10.0.0.0/8 (Class A)<br/>
                              172.16.0.0/12 (Class B)<br/>
                              192.168.0.0/16 (Class C)
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    p: 2, 
                    borderRadius: 1,
                    mb: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffd700', mb: 2 }}>
                      Key Points About IP Classes
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      <Typography sx={{ mb: 1 }}>• Class A: Large networks (16M hosts)</Typography>
                      <Typography sx={{ mb: 1 }}>• Class B: Medium networks (65K hosts)</Typography>
                      <Typography sx={{ mb: 1 }}>• Class C: Small networks (254 hosts)</Typography>
                      <Typography sx={{ mb: 1 }}>• 127.x.x.x is reserved for loopback</Typography>
                      <Typography sx={{ mb: 1 }}>• Private addresses cannot be routed on internet</Typography>
                      <Typography>• Modern networking uses CIDR instead of classes</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </TabPanel>

            {result?.error && (
              <Typography color="error" sx={{ mt: 2, p: 3 }}>
                Invalid input. Please check your values.
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbar.message.replace('copié dans le presse-papiers', 'copied to clipboard')}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;

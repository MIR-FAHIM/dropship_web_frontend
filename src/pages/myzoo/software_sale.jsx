import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Grid,
    Paper,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Link,
} from "@mui/material";
import SoftwareDetails from './details';
import CommitmentUI from './commitment';
import PaymentProcedure from './payment';
import ProcedurePage from './procedure';

const SoftwareSell = () => {
    const [activeTab, setActiveTab] = useState(0); // Tab control (Software Details, Commitment, Payment, Procedure)
 
 
    // Fetch employee profile when the component is mounted
    useEffect(() => {
        // Simulate fetching profile data
        

       
    }, []);

    

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        
    };

    return (
        <Box p={3}>
            <Paper sx={{ padding: 2 }}>
                {/* Tabs Section */}
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Software Offer">
                    <Tab label="Software Details" />
                    <Tab label="Commitment" />
                    <Tab label="Payment" />
                    <Tab label="Procedure" />
                </Tabs>

                {/* Content Section */}
                {activeTab === 0 && (
                    <Box>
                        <SoftwareDetails />
                        {/* Add your content for Software Details here */}
                    </Box>
                )}

                {/* Commitment Tab */}
                {activeTab === 1 && (
                    <Box>
                       <CommitmentUI/>
                    </Box>
                )}

                {/* Payment Tab */}
                {activeTab === 2 && (
                    <Box>
                        <PaymentProcedure/>
                    </Box>
                )}

                {/* Procedure Tab */}
                {activeTab === 3 && (
                    <ProcedurePage/>
                )}
            </Paper>
        </Box>
    );
};

export default SoftwareSell;

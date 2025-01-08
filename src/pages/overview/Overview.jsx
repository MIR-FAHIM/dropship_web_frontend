import React from "react";
import { useGetAllOverviewQuery } from "../../redux/features/overview"; // Adjust the import path as needed
import { Box, Typography, CircularProgress } from "@mui/material"; // Box for layout, Typography for text, CircularProgress for loading
import { styled } from "@mui/system"; // Import styled from @mui/system

// Soft pastel colors for cards
const softBlue = "#87CEFA"; // Soft Blue
const softYellow = "#FFFACD"; // Soft Yellow
const lightGray = "#D3D3D3"; // Light Gray
const sectionBackground = "#F0F8FF"; // Light background for sections

// Styled components using @mui/system
const DashboardContainer = styled("div")({
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
});

const SectionContainer = styled("div")({
  backgroundColor: sectionBackground,
  padding: "20px",
  borderRadius: "10px",
});

const SectionTitle = styled(Typography)({
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: "20px",
  color: "#333",
});

const GridContainer = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", // Responsive grid
  gap: "20px",
});

const Card = styled("div")({
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  padding: "20px",
  transition: "all 0.3s ease",
  ":hover": {
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-5px)", // Slight lift effect on hover
  },
});

const CardTitle = styled(Typography)({
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "10px",
});

const CardValue = styled(Typography)({
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#000",
});

const LoadingContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

const ErrorContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  color: "red",
});

// Dynamic background colors for cards based on data
const getCardColor = (value) => {
  if (value > 100) return softBlue; // Soft Blue if high value
  if (value > 50) return softYellow; // Soft Yellow for moderate values
  return lightGray; // Light Gray for low values
};

const Overview = () => {
  const { data, error, isLoading } = useGetAllOverviewQuery();

  // Show loading spinner
  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} />
      </LoadingContainer>
    );
  }

  // Show error message
  if (error) {
    return (
      <ErrorContainer>
        <span>Failed to load dashboard data</span>
      </ErrorContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Grids Section */}
      <SectionContainer>
        <SectionTitle>Grids</SectionTitle>
        <GridContainer>
          {/* Total Grids */}
          <Card style={{ backgroundColor: getCardColor(data.grid_stats.total_grids) }}>
            <CardTitle>Total Grids</CardTitle>
            <CardValue>{data.grid_stats.total_grids}</CardValue>
          </Card>

          {/* Occupied Grids */}
          <Card style={{ backgroundColor: getCardColor(data.grid_stats.occupied_grids) }}>
            <CardTitle>Occupied Grids</CardTitle>
            <CardValue>{data.grid_stats.occupied_grids}</CardValue>
          </Card>

          {/* Free Grids */}
          <Card style={{ backgroundColor: getCardColor(data.grid_stats.free_grids) }}>
            <CardTitle>Free Grids</CardTitle>
            <CardValue>{data.grid_stats.free_grids}</CardValue>
          </Card>
        </GridContainer>
      </SectionContainer>

      {/* Warehouse Section */}
      <SectionContainer>
        <SectionTitle>Warehouse</SectionTitle>
        <GridContainer>
          {/* Total Warehouses */}
          <Card style={{ backgroundColor: getCardColor(data.warehouse_stats.total_warehouses) }}>
            <CardTitle>Total Warehouses</CardTitle>
            <CardValue>{data.warehouse_stats.total_warehouses}</CardValue>
          </Card>

          {/* Active Warehouses */}
          <Card style={{ backgroundColor: getCardColor(data.warehouse_stats.active_warehouses) }}>
            <CardTitle>Active Warehouses</CardTitle>
            <CardValue>{data.warehouse_stats.active_warehouses}</CardValue>
          </Card>

          {/* Inactive Warehouses */}
          <Card style={{ backgroundColor: getCardColor(data.warehouse_stats.inactive_warehouses) }}>
            <CardTitle>Inactive Warehouses</CardTitle>
            <CardValue>{data.warehouse_stats.inactive_warehouses}</CardValue>
          </Card>
        </GridContainer>
      </SectionContainer>

      {/* Billing Section */}
      <SectionContainer>
        <SectionTitle>Billing</SectionTitle>
        <GridContainer>
          {/* Total Payments */}
          <Card style={{ backgroundColor: getCardColor(data.payment_stats.total_payments) }}>
            <CardTitle>Total Payments</CardTitle>
            <CardValue>{data.payment_stats.total_payments}</CardValue>
          </Card>

          {/* Total Payment Amou
          
          t */}
          <Card style={{ backgroundColor: getCardColor(data.payment_stats.total_amount) }}>
            <CardTitle>Total Payment Amount</CardTitle>
            <CardValue>${data.payment_stats.total_amount}</CardValue>
          </Card>
           {/* Total Transactions */}
           <Card style={{ backgroundColor: getCardColor(data.transaction_stats.total_transactions) }}>
            <CardTitle>Total Transactions</CardTitle>
            <CardValue>{data.transaction_stats.total_transactions}</CardValue>
          </Card>

          {/* Total Transaction Amount */}
          <Card style={{ backgroundColor: getCardColor(data.transaction_stats.total_amount) }}>
            <CardTitle>Total Transaction Amount</CardTitle>
            <CardValue>${data.transaction_stats.total_amount}</CardValue>
          </Card>
        </GridContainer>
      </SectionContainer>

      {/* Clients and Transactions Section */}
      <SectionContainer>
        <SectionTitle>Clients</SectionTitle>
        <GridContainer>
          {/* Total Clients */}
          <Card style={{ backgroundColor: getCardColor(data.client_stats.total_clients) }}>
            <CardTitle>Total Clients</CardTitle>
            <CardValue>{data.client_stats.total_clients}</CardValue>
          </Card>

         
        </GridContainer>
      </SectionContainer>
    </DashboardContainer>
  );
};

export default Overview;

import React from 'react';
import { Box, Paper, Typography, Grid, List, ListItem, ListItemText, Divider, Button } from '@mui/material';

const PaymentProcedure = () => {
  return (
    <Box p={3}>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          পেমেন্ট প্রক্রিয়া
        </Typography>

        <Typography variant="h6" gutterBottom>
          আমাদের সেবা এবং পেমেন্টের বিস্তারিত:
        </Typography>

        <Grid container spacing={3}>
          {/* First Payment Section: Advanced Payment */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" gutterBottom>
                ১. **এডভান্স পেমেন্ট (৯০,০০০ টাকা)**
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="এই পেমেন্টে অন্তর্ভুক্ত থাকবে:"
                    secondary="কোড কেনা, ডোমেইন এবং সার্ভার সেটআপ"
                  />
                </ListItem>
              </List>
              <Typography variant="body2" color="textSecondary">
                এই পেমেন্টের মাধ্যমে আমরা আপনার সিস্টেমের জন্য সমস্ত কোড, ডোমেইন, এবং সার্ভার সেটআপ সম্পন্ন করব।
              </Typography>
            </Paper>
          </Grid>

          {/* Second Payment Section: Full Product Launch */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" gutterBottom>
                ২. **ফুল প্রোডাক্ট লঞ্চ (৭০,০০০ টাকা)**
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="এই পেমেন্টে অন্তর্ভুক্ত থাকবে:"
                    secondary="ওয়েবসাইট প্যানেল প্রোডাকশন লাইভ, অ্যান্ড্রয়েড অ্যাপ সেটআপ"
                  />
                </ListItem>
              </List>
              <Typography variant="body2" color="textSecondary">
                এই পেমেন্টের মাধ্যমে আপনার ওয়েবসাইট প্যানেল লাইভ করা হবে এবং অ্যান্ড্রয়েড অ্যাপ্লিকেশন প্রস্তুত করা হবে।
              </Typography>
            </Paper>
          </Grid>

          {/* Third Payment Section: iOS Setup */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" gutterBottom>
                ৩. **অ্যাডিশনাল পেমেন্ট (৪০,০০০ টাকা)**
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="এই পেমেন্টে অন্তর্ভুক্ত থাকবে:"
                    secondary="আইওএস অ্যাপ সেটআপ"
                  />
                </ListItem>
              </List>
              <Typography variant="body2" color="textSecondary">
                এই পেমেন্টের মাধ্যমে আইওএস অ্যাপ সেটআপ সম্পন্ন করা হবে এবং অ্যাপ স্টোরে পুশ করা হবে।
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ margin: '20px 0' }} />

        {/* Payment Total Breakdown */}
        <Typography variant="h5" gutterBottom>
          মোট পেমেন্ট বিবরণ:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="এডভান্স পেমেন্ট"
              secondary="৯০,০০০ টাকা (কোড কেনা, ডোমেইন, সার্ভার সেটআপ)"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="ফুল প্রোডাক্ট লঞ্চ"
              secondary="৭০,০০০ টাকা (ওয়েবসাইট লাইভ, অ্যান্ড্রয়েড অ্যাপ সেটআপ)"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="অ্যাডিশনাল পেমেন্ট (আইওএস অ্যাপ)"
              secondary="৪০,০০০ টাকা"
            />
          </ListItem>
        </List>

        <Divider sx={{ margin: '20px 0' }} />

        <Typography variant="h6" gutterBottom>
          **মোট পেমেন্ট:** ২,০০,০০০ টাকা
        </Typography>

        {/* Contact and Action Button */}
        <Box mt={3} display="flex" justifyContent="center">
          <Button variant="contained" color="primary" size="large">
            পেমেন্ট সম্পন্ন করুন
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentProcedure;

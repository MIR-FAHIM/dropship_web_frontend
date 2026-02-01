import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider, Stepper, Step, StepLabel, Button } from '@mui/material';

const ProcedurePage = () => {
  // Steps array to display each step
  const steps = [
    "চলমান আলোচনা এবং চুক্তি",
    "ডেমো পরীক্ষা এবং অন্যান্য ইনকোয়ারি সমাধান",
    "আপনার পণ্যের চূড়ান্ত নিশ্চিতকরণ",
    "এডভান্স পেমেন্ট",
    "সিস্টেম সেটআপ প্রক্রিয়া শুরু",
    "ওয়েবসাইট এবং অ্যাপ লাইভ সেটআপ",
    "ব্যবসা সম্পূর্ণ প্রোডাকশন এবং লঞ্চ",
    "পূর্ণ সমর্থন এবং রক্ষণাবেক্ষণ"
  ];

  return (
    <Box p={3}>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          আমাদের চুক্তি প্রক্রিয়া
        </Typography>

        <Typography variant="h6" gutterBottom>
          আমাদের সাথে আপনার ব্যবসা শুরু করার জন্য নিম্নলিখিত পদক্ষেপগুলি অনুসরণ করবেন:
        </Typography>

        {/* Stepper for process overview */}
        <Stepper activeStep={-1} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ margin: '20px 0' }} />

        {/* Detailed Steps List */}
        <Typography variant="h5" gutterBottom>
          চুক্তি সম্পন্ন করার বিস্তারিত পদক্ষেপ:
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="Step 1: চলমান আলোচনা এবং চুক্তি"
              secondary="আপনি আমাদের সাথে আলোচনা শুরু করবেন এবং আপনার প্রয়োজনীয় সেবা সম্পর্কে বিস্তারিত জানাবেন।"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Step 2: ডেমো পরীক্ষা এবং অন্যান্য ইনকোয়ারি সমাধান"
              secondary="আপনি আমাদের ডেমো পরীক্ষা করবেন এবং যেকোনো অন্য ইনকোয়ারি বা প্রশ্নের উত্তর আমাদের টিম থেকে পাবেন।"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Step 3: আপনার পণ্যের চূড়ান্ত নিশ্চিতকরণ"
              secondary="ডেমো পরীক্ষা ও আপনার প্রয়োজনীয়তার সাথে পুরোপুরি সন্তুষ্ট হলে, আপনি আপনার পণ্যটি চূড়ান্তভাবে নিশ্চিত করবেন।"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Step 4: এডভান্স পেমেন্ট"
              secondary="চূড়ান্ত নিশ্চিতকরণের পর, আপনি এডভান্স পেমেন্ট করবেন।"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Step 5: সিস্টেম সেটআপ প্রক্রিয়া শুরু"
              secondary="এডভান্স পেমেন্ট পাওয়ার পর, আমাদের টিম আপনার সিস্টেম সেটআপ প্রক্রিয়া শুরু করবে।"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Step 6: ওয়েবসাইট এবং অ্যাপ লাইভ সেটআপ"
              secondary="আমাদের টিম আপনার ওয়েবসাইট এবং অ্যাপ সেটআপ সম্পন্ন করবে এবং লাইভ করবে।"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Step 7: ব্যবসা সম্পূর্ণ প্রোডাকশন এবং লঞ্চ"
              secondary="সর্বশেষে, আপনার সম্পূর্ণ সিস্টেম এবং অ্যাপস প্রোডাকশন লাইভ চালু হবে এবং বাজারে লঞ্চ হবে।"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Step 8: পূর্ণ সমর্থন এবং রক্ষণাবেক্ষণ"
              secondary="আমরা পুরো প্রক্রিয়া শেষে আপনার ব্যবসার জন্য ২৪/৭ সমর্থন ও রক্ষণাবেক্ষণ প্রদান করব।"
            />
          </ListItem>
        </List>

        <Divider sx={{ margin: '20px 0' }} />

        {/* Contact and Next Step */}
        <Box mt={3} display="flex" justifyContent="center">
          <Button variant="contained" color="primary" size="large">
            আরও জানতে যোগাযোগ করুন
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProcedurePage;

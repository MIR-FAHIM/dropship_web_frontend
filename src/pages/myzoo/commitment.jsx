import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const CommitmentUI = () => {
  return (
    <Box p={3}>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          আমাদের প্রতিশ্রুতি এবং সহায়তা
        </Typography>
        
        {/* Commitment Section */}
        <Typography variant="h5" gutterBottom>
          আপনার জন্য আমাদের প্রতিশ্রুতি:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="আপনার সফটওয়্যার সেটআপ আমরা সম্পূর্ণভাবে করবেন।"
              secondary="আমরা আপনার জন্য MyZoo Software and Website সফটওয়্যারটি ইন্সটল এবং কনফিগার করে দেব, যাতে আপনি সোজা ব্যবহার শুরু করতে পারেন।"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="আপনার ওয়েবসাইট ও মোবাইল অ্যাপ্সটি প্রস্তুত করা হবে।"
              secondary="আমরা তিনটি অ্যাপ (গ্রাহক, বিক্রেতা, ডেলিভারি) তৈরি করে আপনাকে দেব এবং এগুলো প্লে স্টোরে পুশ করে দেব।"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="ফিচারগুলি ১০০% কার্যকর থাকবে।"
              secondary="আপনার প্রয়োজনীয় সমস্ত ফিচার সঠিকভাবে কাজ করবে এবং আমরা কোনো ধরনের ত্রুটি বা বাগ চিহ্নিত হলে তা দ্রুত সমাধান করব।"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="সহায়তা ২৪/৭ উপলব্ধ।"
              secondary="আপনি যেকোনো সময়ে সহায়তা চাইলে আমাদের পেশাদার টিম আপনাকে সহায়তা করবে।"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="প্লে স্টোরে অ্যাপ পুশ ও প্রকাশ করা হবে।"
              secondary="আমরা আপনার গ্রাহক, বিক্রেতা এবং ডেলিভারি অ্যাপ তিনটি প্লে স্টোরে আপলোড ও প্রকাশ করে দেব।"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="বছরের পর বছর সমর্থন পাবেন।"
              secondary="আপনার সফটওয়্যার ও অ্যাপ্লিকেশনের জন্য বার্ষিক বা মাসিক সাপোর্ট প্যাকেজ পাবেন।"
            />
          </ListItem>
        </List>

        {/* Divider for separation */}
        <Divider sx={{ margin: "20px 0" }} />

        {/* Time Commitment */}
        <Typography variant="h5" gutterBottom>
          সময় এবং সেটআপ:
        </Typography>
        <Typography variant="body1" paragraph>
          আমরা ৫-৭ কার্যদিবসের মধ্যে আপনার সম্পূর্ণ সফটওয়্যার এবং অ্যাপ্লিকেশন সেটআপ শেষ করে দেব। 
          আপনি সোজা কাজে নেমে যেতে পারবেন, এবং আমরা পুরো প্রক্রিয়াটি সম্পূর্ণভাবে পরিচালনা করব। 
          প্রতিটি অ্যাপ (গ্রাহক, বিক্রেতা, ডেলিভারি) প্লে স্টোরে আপলোড করা হবে এবং সর্বোচ্চ মানের সাথে কাজ করবে।
        </Typography>

        {/* How it works Section */}
        <Typography variant="h5" gutterBottom>
          কীভাবে কাজ করবে?
        </Typography>
        <Typography variant="body1" paragraph>
          ১. **ফিচার হ্যান্ডওভার:** আপনার জন্য সমস্ত প্রধান ফিচার হ্যান্ডওভার করা হবে যা ব্যবসা পরিচালনা, বিক্রেতা ম্যানেজমেন্ট, পেমেন্ট গেটওয়ে, শিপিং কন্ট্রোল, প্রোডাক্ট ম্যানেজমেন্ট ইত্যাদি অন্তর্ভুক্ত থাকবে।
        </Typography>
        <Typography variant="body1" paragraph>
          ২. **সফটওয়্যার কনফিগারেশন:** আমাদের টিম সঠিকভাবে সফটওয়্যার কনফিগার করবে এবং আপনার ব্যবসার জন্য সেটিংস প্রস্তুত করবে।
        </Typography>
        <Typography variant="body1" paragraph>
          ৩. **অ্যাপ লঞ্চ:** গ্রাহক, বিক্রেতা, এবং ডেলিভারি অ্যাপ্লিকেশন প্লে স্টোরে আপলোড করা হবে এবং আপনার অনুমোদন প্রাপ্তি হলে তা প্রকাশ করা হবে।
        </Typography>

        {/* Action Button */}
        <Box mt={3} display="flex" justifyContent="center">
          <Button variant="contained" color="primary" size="large">
            আমাদের সাথে যোগাযোগ করুন
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CommitmentUI;

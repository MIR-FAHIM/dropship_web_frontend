// src/pages/ContactUsPage.jsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  Link,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SendIcon from "@mui/icons-material/Send";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { alpha } from "@mui/material/styles";
import { useCreateContactUsMutation } from "../../redux/features/order";

const DEFAULT_SUBJECTS = [
  "How will integrations be completed if I buy your software?",
  "What do we get after purchasing?",
  "What is the price?",
  "Who are you?",
  "Other",
];

const EMAIL = "ridoyfahim92@gmail.com";
const WHATSAPP = "+8801782084390"; // with country code

export default function ContactUsPage() {
  const theme = useTheme();
  const [createContactUs, { isLoading }] = useCreateContactUsMutation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: DEFAULT_SUBJECTS[0],
    message: "",
  });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.subject.trim()) return "Please choose a subject.";
    if (!form.message.trim()) return "Please add a short message.";
    return "";
  };

  // Payload that matches your /add-contact-us endpoint
  const buildPayload = () => ({
    person_name: form.name.trim(),
    email: form.email.trim(),
    mobile: form.phone.trim(),
    type: (form.subject || "general").trim(),
    status: "1",
    campaign_id: "0",
    website: typeof window !== "undefined" ? window.location.origin : "braintodo",
    additional_field_one: "",
    additional_field_two: "",
    query: form.message.trim(),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setSnack({ open: true, msg: err, sev: "error" });
      return;
    }

    try {
      const payload = buildPayload();
      const res = await createContactUs(payload).unwrap();

      // Flexible success detection (adjust if your API returns a different shape)
      const ok =
        res?.status === 200 ||
        res?.success === true ||
        String(res?.status).toLowerCase() === "success" ||
        res?.message?.toLowerCase?.().includes("success");

      if (!ok) throw new Error(res?.message || "Failed to submit. Please try again.");

      setSnack({
        open: true,
        msg: res?.message || "Thanks! Your message has been submitted. We’ll get back to you shortly.",
        sev: "success",
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: DEFAULT_SUBJECTS[0],
        message: "",
      });
    } catch (error) {
      setSnack({
        open: true,
        msg: error?.message || "Something went wrong. Please try again.",
        sev: "error",
      });
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Chip
            icon={<HelpOutlineIcon />}
            label="Contact us"
            sx={{
              mb: 1,
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
            }}
          />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            We’re here to help you run on BrainToDo in your organization
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tell us what you’re planning—integrations, pricing, or technical scope.
            We’ll respond fast with clear next steps.
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="stretch">
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Send us a message
              </Typography>

              {/* Suggested quick-subjects */}
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {DEFAULT_SUBJECTS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    onClick={() => setForm((f) => ({ ...f, subject: s }))}
                    sx={{
                      borderRadius: 1.5,
                      bgcolor:
                        form.subject === s
                          ? alpha(theme.palette.primary.main, 0.12)
                          : alpha(theme.palette.text.secondary, 0.08),
                    }}
                  />
                ))}
              </Stack>

              <Box component="form" onSubmit={onSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Your name"
                      value={form.name}
                      onChange={onChange("name")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={onChange("email")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Phone (optional)"
                      value={form.phone}
                      onChange={onChange("phone")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Subject"
                      value={form.subject}
                      onChange={onChange("subject")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Message"
                      value={form.message}
                      onChange={onChange("message")}
                      fullWidth
                      multiline
                      minRows={5}
                      placeholder="Tell us about your company, goals, and timeline. If you need integrations, mention the tools you use."
                    />
                  </Grid>
                </Grid>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SendIcon />}
                    disabled={isLoading}
                    sx={{ fontWeight: 800, textTransform: "none" }}
                  >
                    {isLoading ? "Sending..." : "Send message"}
                  </Button>

                  {/* Quick email & WhatsApp */}
                  <Button
                    variant="outlined"
                    href={`mailto:${EMAIL}`}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                    startIcon={<MailOutlineIcon />}
                  >
                    Email us
                  </Button>
                  <Button
                    variant="outlined"
                    href={`https://wa.me/${WHATSAPP.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textTransform: "none", fontWeight: 700 }}
                    startIcon={<WhatsAppIcon />}
                  >
                    WhatsApp
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Quick Contact + FAQ */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3} sx={{ height: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: "background.paper",
                }}
              >
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Contact details
                </Typography>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MailOutlineIcon fontSize="small" />
                    <Link href={`mailto:${EMAIL}`} underline="hover">
                      {EMAIL}
                    </Link>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIphoneIcon fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {WHATSAPP} (WhatsApp preferred)
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WhatsAppIcon fontSize="small" />
                    <Link
                      href={`https://wa.me/${WHATSAPP.replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Chat on WhatsApp
                    </Link>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: "background.paper",
                  flex: 1,
                }}
              >
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Frequently asked
                </Typography>

                <Divider sx={{ mb: 1.5 }} />

                <Accordion disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={700}>
                      How will integrations be completed if I buy your software?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      We start with a short discovery of your tools (e.g., HR, CRM, chat, SSO). Then we scope connectors,
                      map fields, and configure webhooks/APIs. You’ll get a staging preview, sign-off, and then a guided
                      production rollout with monitoring.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={700}>What do we get after purchasing?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      You receive a lifetime license, self-hosted deployment guide, database access, and ongoing updates
                      per your package. Enterprise also includes the React frontend source for deep customization.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={700}>What is the price?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      Pricing is one-time (no SaaS lock-in). Starter, Professional, and Enterprise tiers are available.
                      We can also scope custom modules or services if needed.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={700}>Who are you?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      BrainToDo is built and maintained by a dedicated product engineering team with hands-on delivery
                      experience across HRM, CRM, and project management. We offer one-to-one support and clear
                      implementation plans.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

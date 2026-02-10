import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	List,
	ListItem,
	Paper,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import {
	Add as AddIcon,
	Close as CloseIcon,
	Place as PlaceIcon,
} from "@mui/icons-material";
import {
	useGetUserAddressesQuery,
	useAddAddressMutation,
} from "../../../redux/features/address";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const CustomerAddress = ({
	userId,
	selectedAddress,
	onSelectAddress,
	onAddressesChange,
	onLoadingChange,
	openAddressModal,
	setOpenAddressModal,
	setMsg,
}) => {
	const theme = useTheme();

	const divider = theme.palette.divider;
	const surface = theme.palette.background.paper;
	const surface2 = theme.palette.action.hover;
	const ink = theme.palette.text.primary;
	const subInk = theme.palette.text.secondary;

	const [addrLoadedOnce, setAddrLoadedOnce] = useState(false);
	const [newName, setNewName] = useState("");
	const [newMobile, setNewMobile] = useState("");
	const [newDistrict, setNewDistrict] = useState("");
	const [newArea, setNewArea] = useState("");
	const [newAddress, setNewAddress] = useState("");

	const resetNewAddress = () => {
		setNewName("");
		setNewMobile("");
		setNewDistrict("");
		setNewArea("");
		setNewAddress("");
	};

	const { data: addressResponse, isLoading: addrLoading, refetch: refetchAddresses } =
		useGetUserAddressesQuery(userId, { skip: !userId });

	const [addAddress, { isLoading: adding }] = useAddAddressMutation();

	const addresses = useMemo(() => {
		const list = addressResponse?.data ?? addressResponse?.data?.data ?? addressResponse;
		return safeArray(list);
	}, [addressResponse]);

	useEffect(() => {
		onAddressesChange?.(addresses);
	}, [addresses, onAddressesChange]);

	useEffect(() => {
		onLoadingChange?.(addrLoading);
	}, [addrLoading, onLoadingChange]);

	useEffect(() => {
		if (!addrLoading && !addrLoadedOnce) setAddrLoadedOnce(true);
	}, [addrLoading, addrLoadedOnce]);

	useEffect(() => {
		if (!userId) return;
		if (!addrLoadedOnce || addrLoading) return;
		if (addresses.length === 0) setOpenAddressModal(true);
	}, [userId, addrLoadedOnce, addrLoading, addresses.length, setOpenAddressModal]);

	useEffect(() => {
		if (addresses.length === 0 || !onSelectAddress) return;
		const exists =
			selectedAddress && addresses.some((a) => String(a.id) === String(selectedAddress));
		const next = exists ? selectedAddress : String(addresses[0].id);
		if (next !== selectedAddress) onSelectAddress(next);
	}, [addresses, onSelectAddress, selectedAddress]);

	const handleAddAddress = async () => {
		if (!userId) {
			setMsg?.("Please login to add an address.");
			return;
		}
		if (!newName || !newMobile || !newAddress) {
			setMsg?.("Please fill name, mobile and address");
			return;
		}

		try {
			const res = await addAddress({
				user_id: userId,
				name: newName,
				mobile: newMobile,
				district: newDistrict,
				area: newArea,
				address: newAddress,
			});

			if (res?.data?.status === "success" || res?.status === "success" || res?.status === 200) {
				setMsg?.("Address added");
				resetNewAddress();
				await refetchAddresses();
				setOpenAddressModal(false);
			} else {
				setMsg?.(res?.data?.message || res?.message || "Failed to add address");
			}
		} catch (e) {
			console.error("Add address error", e);
			setMsg?.("Error adding address");
		}
	};

	const AddressCard = ({ a, selected }) => {
		const labelLine = `${a.address}${a.area ? `, ${a.area}` : ""}${
			a.district ? `, ${a.district}` : ""
		}`;

		return (
			<Box
				sx={{
					p: 1.4,
					borderRadius: 3,
					border: `1px solid ${selected ? "transparent" : divider}`,
					background: selected ? theme.palette.primary.light : surface,
					boxShadow: "none",
					transition: "transform 140ms ease, box-shadow 200ms ease, filter 200ms ease",
					color: selected ? theme.palette.getContrastText(theme.palette.primary.main) : ink,
					"&:hover": { transform: "translateY(-1px)" },
				}}
			>
				<Stack direction="row" spacing={1} alignItems="flex-start">
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: 2,
							display: "grid",
							placeItems: "center",
							background: selected ? theme.palette.primary.light : surface2,
							border: `1px solid ${selected ? theme.palette.primary.light : divider}`,
							flexShrink: 0,
						}}
					>
						<PlaceIcon fontSize="small" />
					</Box>

					<Box sx={{ minWidth: 0 }}>
						<Typography sx={{ fontWeight: 950, lineHeight: 1.1 }}>
							{a.name}{" "}
							<Box component="span" sx={{ fontWeight: 800, opacity: 0.85 }}>
								{a.mobile}
							</Box>
						</Typography>
						<Typography
							variant="body2"
							sx={{ mt: 0.4, fontWeight: 700, opacity: selected ? 0.9 : 0.78 }}
						>
							{labelLine}
						</Typography>
					</Box>

					<Box sx={{ ml: "auto" }}>
						<Chip
							size="small"
							label={selected ? "Selected" : "Use"}
							sx={{
								borderRadius: 999,
								fontWeight: 950,
								background: selected ? theme.palette.primary.light : surface2,
								border: `1px solid ${selected ? theme.palette.primary.light : divider}`,
								color: selected
									? theme.palette.getContrastText(theme.palette.primary.light)
									: ink,
							}}
						/>
					</Box>
				</Stack>
			</Box>
		);
	};

	return (
		<>
			<Paper
				sx={{
					p: 2,
					borderRadius: 4,
					border: `1px solid ${divider}`,
					background: surface,
				}}
			>
				<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
					<Box
						sx={{
							width: 38,
							height: 38,
							borderRadius: 3,
							display: "grid",
							placeItems: "center",
							background: surface2,
							border: `1px solid ${divider}`,
						}}
					>
						<PlaceIcon fontSize="small" />
					</Box>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 950, color: ink }}>
							Shipping Address
						</Typography>
						<Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
							Choose a saved address.
						</Typography>
					</Box>
				</Stack>

				<Divider sx={{ my: 1.5, opacity: 0.12 }} />

				{addrLoading ? (
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 3 }}>
						<CircularProgress size={18} />
						<Typography sx={{ color: subInk, fontWeight: 800 }}>
							Loading addresses...
						</Typography>
					</Box>
				) : addresses.length === 0 ? (
					<Paper
						sx={{
							p: 2,
							borderRadius: 4,
							border: `1px dashed ${divider}`,
							background: surface2,
						}}
					>
						<Typography sx={{ fontWeight: 950, color: ink }}>No saved addresses</Typography>
						<Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.4 }}>
							Add one to continue checkout.
						</Typography>
					</Paper>
				) : (
					<RadioGroup
						value={selectedAddress || ""}
						onChange={(e) => onSelectAddress?.(e.target.value)}
					>
						<List sx={{ p: 0, display: "grid", gap: 1.2 }}>
							{addresses.map((a) => {
								const isSelected = String(selectedAddress) === String(a.id);
								return (
									<ListItem key={a.id} sx={{ p: 0, borderRadius: 3 }}>
										<FormControlLabel
											value={String(a.id)}
											control={<Radio sx={{ ml: 1.2 }} />}
											sx={{ m: 0, width: "100%" }}
											label={
												<Box sx={{ width: "100%", pr: 1.2 }}>
													<AddressCard a={a} selected={isSelected} />
												</Box>
											}
										/>
									</ListItem>
								);
							})}
						</List>
					</RadioGroup>
				)}
			</Paper>

			<Dialog
				open={openAddressModal}
				onClose={() => {
					if (adding) return;
					if (addresses.length === 0) return;
					setOpenAddressModal(false);
				}}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: 4,
						border: `1px solid ${divider}`,
						background: surface,
						overflow: "hidden",
					},
				}}
			>
				<DialogTitle
					sx={{
						fontWeight: 950,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
					}}
				>
					<Box sx={{ color: theme.palette.primary.main }}>Add new address</Box>

					<Tooltip title={addresses.length === 0 ? "Add an address to continue" : "Close"}>
						<span>
							<IconButton
								disabled={addresses.length === 0}
								onClick={() => setOpenAddressModal(false)}
								sx={{ borderRadius: 3, border: `1px solid ${divider}`, background: surface }}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</span>
					</Tooltip>
				</DialogTitle>

				<DialogContent>
					<Box sx={{ display: "grid", gap: 1.2, mt: 1 }}>
						<TextField
							label="Name"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							size="small"
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: 3,
									background: surface,
									border: `1px solid ${divider}`,
									"& fieldset": { borderColor: "transparent" },
								},
							}}
						/>
						<TextField
							label="Mobile"
							value={newMobile}
							onChange={(e) => setNewMobile(e.target.value)}
							size="small"
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: 3,
									background: surface,
									border: `1px solid ${divider}`,
									"& fieldset": { borderColor: "transparent" },
								},
							}}
						/>

						<Grid container spacing={1.2}>
							<Grid item xs={12} sm={6}>
								<TextField
									label="District"
									value={newDistrict}
									onChange={(e) => setNewDistrict(e.target.value)}
									size="small"
									fullWidth
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: 3,
											background: surface,
											border: `1px solid ${divider}`,
											"& fieldset": { borderColor: "transparent" },
										},
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									label="Area"
									value={newArea}
									onChange={(e) => setNewArea(e.target.value)}
									size="small"
									fullWidth
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: 3,
											background: surface,
											border: `1px solid ${divider}`,
											"& fieldset": { borderColor: "transparent" },
										},
									}}
								/>
							</Grid>
						</Grid>

						<TextField
							label="Address"
							value={newAddress}
							onChange={(e) => setNewAddress(e.target.value)}
							size="small"
							multiline
							minRows={3}
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: 3,
									background: surface,
									border: `1px solid ${divider}`,
									"& fieldset": { borderColor: "transparent" },
								},
							}}
						/>
					</Box>
				</DialogContent>

				<DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
					<Button
						variant="outlined"
						onClick={resetNewAddress}
						disabled={adding}
						sx={{
							borderRadius: 999,
							textTransform: "none",
							fontWeight: 900,
							borderColor: divider,
							background: surface,
							"&:hover": { background: surface2 },
						}}
					>
						Clear
					</Button>

					<Button
						variant="contained"
						onClick={handleAddAddress}
						disabled={adding}
						startIcon={adding ? null : <AddIcon />}
						sx={{
							ml: "auto",
							borderRadius: 999,
							textTransform: "none",
							fontWeight: 950,
							px: 2.4,
							background: theme.palette.primary.main,
							color: theme.palette.getContrastText(theme.palette.primary.main),
							boxShadow: "none",
							"&:hover": { opacity: 0.92, boxShadow: "none" },
							"&.Mui-disabled": { opacity: 0.55 },
						}}
					>
						{adding ? <CircularProgress size={18} /> : "Save address"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default CustomerAddress;

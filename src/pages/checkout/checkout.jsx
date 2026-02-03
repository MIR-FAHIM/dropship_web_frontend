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
	Snackbar,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import {
	Add as AddIcon,
	AddCircleOutline as AddCircleOutlineIcon,
	ArrowBack as ArrowBackIcon,
	Close as CloseIcon,
	DeleteOutline as DeleteOutlineIcon,
	LocalShipping as LocalShippingIcon,
	Lock as LockIcon,
	Notes as NotesIcon,
	Place as PlaceIcon,
	RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCheckoutOrderMutation } from "../../redux/features/order";
import {
	useGetCartQuery,
	useUpdateCartMutation,
	useDeleteCartMutation,
} from "../../redux/features/cart";
import {
	useGetUserAddressesQuery,
	useAddAddressMutation,
} from "../../redux/features/address";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const CheckoutPage = () => {
	const theme = useTheme();
	const navigate = useNavigate();

	const divider = theme.palette.divider;
	const surface = theme.palette.background.paper;
	const surface2 = theme.palette.action.hover;
	const ink = theme.palette.text.primary;
	const subInk = theme.palette.text.secondary;

	const userId = useMemo(() => {
		const id = localStorage.getItem("userId");
		return id ? String(id) : null;
	}, []);

	const money = (n) =>
		new Intl.NumberFormat("en-BD", {
			style: "currency",
			currency: "BDT",
		}).format(Number(n || 0));

	const [selectedAddress, setSelectedAddress] = useState(null);
	const [note, setNote] = useState("");
	const [processing, setProcessing] = useState({});
	const [openAddressModal, setOpenAddressModal] = useState(false);
	const [addrLoadedOnce, setAddrLoadedOnce] = useState(false);
	const [msg, setMsg] = useState("");

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

	const {
		data: addressResponse,
		isLoading: addrLoading,
		refetch: refetchAddresses,
	} = useGetUserAddressesQuery(userId, { skip: !userId });

	const [addAddress, { isLoading: adding }] = useAddAddressMutation();

	const addresses = useMemo(() => {
		const list = addressResponse?.data ?? addressResponse?.data?.data ?? addressResponse;
		return safeArray(list);
	}, [addressResponse]);

	useEffect(() => {
		if (!addrLoading && !addrLoadedOnce) setAddrLoadedOnce(true);
	}, [addrLoading, addrLoadedOnce]);

	useEffect(() => {
		if (!userId) return;
		if (!addrLoadedOnce || addrLoading) return;
		if (addresses.length === 0) setOpenAddressModal(true);
	}, [userId, addrLoadedOnce, addrLoading, addresses.length]);

	useEffect(() => {
		if (addresses.length === 0) return;
		setSelectedAddress((prev) => {
			const exists = prev && addresses.some((a) => String(a.id) === String(prev));
			return exists ? prev : String(addresses[0].id);
		});
	}, [addresses]);

	const {
		data: cartResponse,
		isLoading: cartLoading,
		refetch: refetchCart,
	} = useGetCartQuery(userId, { skip: !userId });

	const cart = useMemo(() => {
		return cartResponse?.data ?? cartResponse?.data?.data ?? cartResponse;
	}, [cartResponse]);

	const cartItems = safeArray(cart?.items ?? cart?.data?.items ?? []);
	const subtotal = cart?.subtotal ?? cart?.sub_total ?? 0;

	useEffect(() => {
		const total = cart?.total_items ?? cartItems.length;
		localStorage.setItem("cart", JSON.stringify(Number(total || 0)));
		window.dispatchEvent(new Event("cart-updated"));
	}, [cart?.total_items, cartItems.length]);

	const [updateCart] = useUpdateCartMutation();
	const [deleteCart] = useDeleteCartMutation();
	const [checkoutOrder, { isLoading: loadingCheckout }] = useCheckoutOrderMutation();

	const handleAddAddress = async () => {
		if (!userId) {
			setMsg("Please login to add an address.");
			return;
		}
		if (!newName || !newMobile || !newAddress) {
			setMsg("Please fill name, mobile and address");
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
				setMsg("Address added");
				resetNewAddress();
				await refetchAddresses();
				setOpenAddressModal(false);
			} else {
				setMsg(res?.data?.message || res?.message || "Failed to add address");
			}
		} catch (e) {
			console.error("Add address error", e);
			setMsg("Error adding address");
		}
	};

	const handleUpdateQty = async (item, newQty) => {
		if (newQty < 1) return;
		setProcessing((prev) => ({ ...prev, [item.id]: true }));
		try {
			const res = await updateCart({ itemId: item.id, qty: newQty });
			if (res?.data?.status === "success" || res?.status === "success" || res?.status === 200) {
				setMsg(res?.data?.message || res?.message || "Updated quantity");
				await refetchCart();
			} else {
				setMsg(res?.data?.message || res?.message || "Failed to update quantity");
			}
		} catch (e) {
			console.error("Update qty error", e);
			setMsg("Error updating quantity");
		} finally {
			setProcessing((prev) => ({ ...prev, [item.id]: false }));
		}
	};

	const handleDeleteItem = async (item) => {
		if (!window.confirm("Remove this item from cart?")) return;
		setProcessing((prev) => ({ ...prev, [item.id]: true }));
		try {
			const res = await deleteCart(item.id);
			if (res?.data?.status === "success" || res?.status === "success" || res?.status === 200) {
				setMsg(res?.data?.message || res?.message || "Item removed");
				await refetchCart();
			} else {
				setMsg(res?.data?.message || res?.message || "Failed to remove item");
			}
		} catch (e) {
			console.error("Delete item error", e);
			setMsg("Error removing item");
		} finally {
			setProcessing((prev) => ({ ...prev, [item.id]: false }));
		}
	};

	const handleCheckout = async () => {
		if (!userId) {
			setMsg("Please login to place an order.");
			return;
		}
		if (!cartItems.length) {
			setMsg("Cart is empty");
			return;
		}

		const addrObj = selectedAddress
			? addresses.find((a) => String(a.id) === String(selectedAddress))
			: null;

		if (!addrObj) {
			setMsg("Select or add a shipping address");
			return;
		}

		try {
			const payload = {
				user_id: userId,
				customer_name: addrObj.name || "",
				customer_phone: addrObj.mobile || "",
				shipping_address: `${addrObj.address}${addrObj.area ? `, ${addrObj.area}` : ""}${
					addrObj.district ? `, ${addrObj.district}` : ""
				}`,
				zone: addrObj.district || "",
				note: note || "",
			};

			const res = await checkoutOrder(payload);
			const ok = res?.data?.status === "success" || res?.status === "success" || res?.status === 200;

			if (ok) {
				setMsg(res?.data?.message || "Order placed");
				localStorage.setItem("cart", JSON.stringify(0));
				window.dispatchEvent(new Event("cart-updated"));
				setTimeout(() => navigate("/"), 900);
			} else {
				setMsg(res?.data?.message || "Failed to place order");
			}
		} catch (e) {
			console.error("Checkout error", e);
			setMsg("Error placing order");
		}
	};

	const AddressCard = ({ a, selected }) => {
		const labelLine = `${a.address}${a.area ? `, ${a.area}` : ""}${a.district ? `, ${a.district}` : ""}`;

		return (
			<Box
				sx={{
					p: 1.4,
					borderRadius: 3,
					border: `1px solid ${selected ? "transparent" : divider}`,
					background: selected ? theme.palette.secondary.main : surface,
					boxShadow: "none",
					transition: "transform 140ms ease, box-shadow 200ms ease, filter 200ms ease",
					color: selected ? theme.palette.getContrastText(theme.palette.secondary.main) : ink,
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
							background: selected ? theme.palette.secondary.light : surface2,
							border: `1px solid ${selected ? theme.palette.secondary.light : divider}`,
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
								background: selected ? theme.palette.secondary.light : surface2,
								border: `1px solid ${selected ? theme.palette.secondary.light : divider}`,
								color: selected
									? theme.palette.getContrastText(theme.palette.secondary.light)
									: ink,
							}}
						/>
					</Box>
				</Stack>
			</Box>
		);
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: theme.palette.background.default,
				p: { xs: 1.5, md: 2 },
			}}
		>
			<Box
				sx={{
					mb: 2,
					p: 2,
					borderRadius: 4,
					border: `1px solid ${divider}`,
					background: surface,
					display: "flex",
					alignItems: { xs: "flex-start", md: "center" },
					justifyContent: "space-between",
					gap: 2,
					flexWrap: "wrap",
				}}
			>
				<Stack direction="row" spacing={1.2} alignItems="center">
					<IconButton
						onClick={() => navigate(-1)}
						sx={{
							borderRadius: 3,
							border: `1px solid ${divider}`,
							background: surface,
							"&:hover": { background: surface2 },
						}}
					>
						<ArrowBackIcon />
					</IconButton>

					<Box>
						<Typography
							variant="h4"
							sx={{
								fontWeight: 950,
								letterSpacing: -0.7,
								color: theme.palette.secondary.main,
								lineHeight: 1.05,
							}}
						>
							Checkout
						</Typography>
						<Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.5 }}>
							Select address and confirm order.
						</Typography>
					</Box>
				</Stack>

				<Stack direction="row" spacing={1} alignItems="center">
					<Chip
						icon={<LocalShippingIcon />}
						label={
							addrLoading
								? "Loading addresses..."
								: addresses.length
								? `${addresses.length} address${addresses.length > 1 ? "es" : ""}`
								: "No address"
						}
						sx={{
							borderRadius: 999,
							fontWeight: 900,
							background: surface2,
							border: `1px solid ${divider}`,
							color: ink,
						}}
					/>

					<Button
						onClick={() => setOpenAddressModal(true)}
						startIcon={<AddIcon />}
						variant="contained"
						sx={{
							borderRadius: 999,
							textTransform: "none",
							fontWeight: 950,
							px: 2,
							background: theme.palette.secondary.main,
							color: theme.palette.getContrastText(theme.palette.secondary.main),
							boxShadow: "none",
							"&:hover": { opacity: 0.92, boxShadow: "none" },
						}}
					>
						Add new address
					</Button>
				</Stack>
			</Box>

			<Grid container spacing={2}>
				<Grid item xs={12} md={7}>
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
							<RadioGroup value={selectedAddress || ""} onChange={(e) => setSelectedAddress(e.target.value)}>
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
				</Grid>

				<Grid item xs={12} md={5}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 4,
							border: `1px solid ${divider}`,
							background: surface,
							position: { md: "sticky" },
							top: { md: 86 },
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
								<LockIcon fontSize="small" />
							</Box>
							<Box>
								<Typography variant="h6" sx={{ fontWeight: 950, color: ink }}>
									Order Summary
								</Typography>
								<Typography variant="body2" sx={{ color: subInk, fontWeight: 700 }}>
									Review items and place order.
								</Typography>
							</Box>
						</Stack>

						<Divider sx={{ my: 1.5, opacity: 0.12 }} />

						{!userId ? (
							<Typography sx={{ mt: 1, fontWeight: 800, color: subInk }}>
								Please login to checkout.
							</Typography>
						) : cartLoading ? (
							<Typography sx={{ mt: 1, fontWeight: 800, color: subInk }}>
								Loading cart...
							</Typography>
						) : cartItems.length === 0 ? (
							<Typography sx={{ mt: 1, fontWeight: 800, color: subInk }}>
								Your cart is empty.
							</Typography>
						) : (
							<Box>
								<Stack spacing={1.2}>
									{cartItems.map((it) => {
										const lineTotal =
											it?.line_total ??
											it?.total ??
											(it?.qty || 1) *
												(Number(it?.product?.unit_price ?? it?.product?.price ?? 0) || 0);
										return (
											<Box
												key={it.id}
												sx={{
													p: 1.2,
													borderRadius: 3,
													border: `1px solid ${divider}`,
													background: surface2,
												}}
											>
												<Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
													<Box sx={{ minWidth: 0 }}>
														<Typography sx={{ fontWeight: 950, color: ink, lineHeight: 1.2 }}>
															{it.product?.name || "Item"}
														</Typography>
														<Typography variant="caption" sx={{ color: subInk, fontWeight: 800 }}>
															Line: {money(lineTotal)}
														</Typography>
													</Box>

													<Stack direction="row" spacing={0.5} alignItems="center">
														<Tooltip title="Decrease">
															<span>
																<IconButton
																	size="small"
																	onClick={() => handleUpdateQty(it, (it.qty || 1) - 1)}
																	disabled={processing[it.id] || (it.qty || 1) <= 1}
																	sx={{
																		borderRadius: 2,
																		border: `1px solid ${divider}`,
																		background: surface,
																		"&:hover": { background: surface2 },
																	}}
																>
																	<RemoveCircleOutlineIcon fontSize="small" />
																</IconButton>
															</span>
														</Tooltip>

														<Chip
															label={it.qty}
															sx={{
																borderRadius: 999,
																fontWeight: 950,
																background: surface,
																border: `1px solid ${divider}`,
																color: ink,
																minWidth: 44,
															}}
														/>

														<Tooltip title="Increase">
															<span>
																<IconButton
																	size="small"
																	onClick={() => handleUpdateQty(it, (it.qty || 1) + 1)}
																	disabled={processing[it.id]}
																	sx={{
																		borderRadius: 2,
																		border: `1px solid ${divider}`,
																		background: surface,
																		"&:hover": { background: surface2 },
																	}}
																>
																	<AddCircleOutlineIcon fontSize="small" />
																</IconButton>
															</span>
														</Tooltip>

														<Tooltip title="Remove item">
															<span>
																<IconButton
																	size="small"
																	onClick={() => handleDeleteItem(it)}
																	disabled={processing[it.id]}
																	sx={{
																		borderRadius: 2,
																		border: `1px solid ${divider}`,
																		background:
																		theme.palette.mode === "dark"
																			? "rgba(250,92,92,0.12)"
																			: "rgba(250,92,92,0.10)",
																		"&:hover": {
																			background:
																				theme.palette.mode === "dark"
																					? "rgba(250,92,92,0.16)"
																					: "rgba(250,92,92,0.14)",
																			},
																		}}
																>
																	<DeleteOutlineIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
																</IconButton>
															</span>
														</Tooltip>
													</Stack>
												</Stack>
											</Box>
										);
									})}
								</Stack>

								<Divider sx={{ my: 1.5, opacity: 0.12 }} />

								<Stack direction="row" justifyContent="space-between" alignItems="center">
									<Typography variant="subtitle2" sx={{ fontWeight: 900, color: subInk }}>
										Subtotal
									</Typography>
									<Typography
										variant="subtitle1"
										sx={{ fontWeight: 950, color: theme.palette.secondary.main }}
									>
										{money(subtotal)}
									</Typography>
								</Stack>

								<TextField
									label="Note (optional)"
									value={note}
									onChange={(e) => setNote(e.target.value)}
									size="small"
									fullWidth
									sx={{
										mt: 2,
										"& .MuiOutlinedInput-root": {
											borderRadius: 3,
											background: surface,
											border: `1px solid ${divider}`,
											"& fieldset": { borderColor: "transparent" },
										},
									}}
									InputProps={{
										startAdornment: (
											<Box sx={{ mr: 1, display: "grid", placeItems: "center", color: subInk }}>
												<NotesIcon fontSize="small" />
											</Box>
										),
									}}
								/>

								<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
									<Button
										variant="outlined"
										onClick={() => navigate(-1)}
										startIcon={<ArrowBackIcon />}
										sx={{
											borderRadius: 999,
											textTransform: "none",
											fontWeight: 900,
											borderColor: divider,
											background: surface,
											"&:hover": { background: surface2, borderColor: theme.palette.primary.main },
										}}
									>
										Back
									</Button>

									<Button
										variant="contained"
										onClick={handleCheckout}
										disabled={loadingCheckout}
										startIcon={loadingCheckout ? null : <LockIcon />}
										sx={{
											ml: "auto",
											borderRadius: 999,
											textTransform: "none",
											fontWeight: 950,
											px: 2.6,
											background: theme.palette.secondary.main,
											color: theme.palette.getContrastText(theme.palette.secondary.main),
											boxShadow: "none",
											"&:hover": { opacity: 0.92, boxShadow: "none" },
											"&.Mui-disabled": { opacity: 0.55 },
										}}
									>
										{loadingCheckout ? <CircularProgress size={18} /> : "Place Order"}
									</Button>
								</Stack>
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>

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
					<Box sx={{ color: theme.palette.secondary.main }}>Add new address</Box>

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
							background: theme.palette.secondary.main,
							color: theme.palette.getContrastText(theme.palette.secondary.main),
							boxShadow: "none",
							"&:hover": { opacity: 0.92, boxShadow: "none" },
							"&.Mui-disabled": { opacity: 0.55 },
						}}
					>
						{adding ? <CircularProgress size={18} /> : "Save address"}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar open={!!msg} autoHideDuration={3000} onClose={() => setMsg("")} message={msg} />
		</Box>
	);
};

export default CheckoutPage;

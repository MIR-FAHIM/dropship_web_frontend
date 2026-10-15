import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, Check, CheckCheck, Copy, Hourglass, Loader2, MapPin, PackageSearch, RefreshCw, Search, Truck, User, Users } from "lucide-react";
import { toast } from "sonner";
import { useLazyGetCarryBeeTrackingQuery } from "../../../redux/features/delivery_company/carrybeeStoreApi";
import { formatTrackingDate, getTrackingView, isValidConsignmentId, normalizeConsignmentId } from "../../../utils/deliveryTracking.utils";
import "./OrderTracking.css";

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = normalizeConsignmentId(searchParams.get("consignment_id"));
  const [input, setInput] = useState(queryId);
  const [validation, setValidation] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef();
  const [trackOrder, { currentData, originalArgs, isFetching, error }] = useLazyGetCarryBeeTrackingQuery();
  const isCurrentRequest = Boolean(queryId && originalArgs === queryId);
  const loading = isCurrentRequest && isFetching;
  const tracking = isCurrentRequest ? getTrackingView(currentData) : null;
  const errorMessage = isCurrentRequest && error ? error?.data?.message || "Unable to load tracking details. Please try again." : "";
  const emptyResult = isCurrentRequest && currentData && !tracking;

  useEffect(() => {
    setInput(queryId);
    setCopied(false);
    setValidation("");
    if (!queryId) return;
    if (!isValidConsignmentId(queryId)) {
      setValidation("Use only letters, numbers, hyphens or underscores in the Consignment ID.");
      return;
    }
    trackOrder(queryId);
  }, [queryId, trackOrder]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const id = normalizeConsignmentId(input);
    if (!isValidConsignmentId(id)) {
      setValidation(id ? "Enter a valid Consignment ID using letters, numbers, hyphens or underscores." : "Enter a Consignment ID to track your order.");
      return;
    }
    setValidation("");
    setCopied(false);
    if (id === queryId) trackOrder(id);
    else setSearchParams({ consignment_id: id });
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(tracking.consignmentId);
      setCopied(true);
      toast.success("Consignment ID copied");
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy. Please select and copy the Consignment ID.");
    }
  };

  const status = tracking?.status.toLowerCase() || "";
  const statusTone = /cancel|return|fail|reject/.test(status) ? "negative" : /^(delivered|completed)$/.test(status) ? "delivered" : "active";

  return (
    <div className="order-tracking">
      <header className="tracking-header">
        <div className="tracking-heading-icon"><Truck size={23} aria-hidden="true" /></div>
        <h1>Track Your Order</h1>
        <p>Enter your Consignment ID to check the latest delivery status.</p>
        <form className="tracking-search" onSubmit={handleSubmit} aria-label="Track a shipment" noValidate>
          <div className="tracking-search-input">
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="consignment-id">Consignment ID</label>
            <input id="consignment-id" name="consignment_id" value={input} onChange={(event) => { setInput(event.target.value); setValidation(""); }} placeholder="Enter Consignment ID" autoComplete="off" spellCheck={false} maxLength={100} required aria-describedby={validation ? "tracking-validation" : undefined} aria-invalid={Boolean(validation)} />
          </div>
          <button className="tracking-submit" type="submit" disabled={loading}>
            {loading && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
            <span>{loading ? "Tracking..." : "Track Now"}</span>
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>
        {validation && <p id="tracking-validation" className="tracking-validation" role="alert">{validation}</p>}
      </header>

      <div className="tracking-content" aria-busy={loading}>
        {loading ? (
          <div className="tracking-loading" role="status">
            <div className="tracking-summary-grid" aria-hidden="true">{[1, 2, 3].map((item) => <div key={item} className="tracking-skeleton" />)}</div>
            <div className="tracking-loading-label"><Loader2 size={19} className="animate-spin" /> Finding your shipment...</div>
          </div>
        ) : errorMessage || emptyResult ? (
          <div className="tracking-empty tracking-error" role="alert">
            <AlertCircle size={32} aria-hidden="true" />
            <h2>{error?.status === 404 || emptyResult ? "Shipment not found" : "Unable to track shipment"}</h2>
            <p>{emptyResult ? "No tracking details were found. Check the Consignment ID and try again." : errorMessage}</p>
            <button className="tracking-secondary-button" type="button" onClick={() => trackOrder(queryId)}><RefreshCw size={16} /> Try Again</button>
          </div>
        ) : tracking ? (
          <div className="tracking-results" aria-live="polite">
            <div className="tracking-result-toolbar">
              <span><CheckCheck size={16} aria-hidden="true" /> Shipment found</span>
              <button className="tracking-refresh" type="button" onClick={() => trackOrder(queryId)}><RefreshCw size={14} aria-hidden="true" /> Refresh</button>
            </div>
            <div className="tracking-summary-grid">
              <article className="tracking-summary-item">
                <h2><span><Hourglass size={18} aria-hidden="true" /></span> Est. Delivery</h2>
                <p>{formatTrackingDate(tracking.estimatedDelivery, false)}</p>
              </article>
              <article className={`tracking-summary-item tracking-status tracking-status-${statusTone}`}>
                <h2><span><Truck size={18} aria-hidden="true" /></span> Current Status</h2>
                <p>{tracking.status}</p>
              </article>
              <article className="tracking-summary-item">
                <h2><span><MapPin size={18} aria-hidden="true" /></span> Destination</h2>
                <p className="tracking-address">{tracking.destination || "Not available"}</p>
              </article>
            </div>

            <div className="tracking-consignment-bar">
              <div><span className="tracking-label">Consignment ID:</span><span className="tracking-id">#{tracking.consignmentId}</span><button type="button" className="tracking-copy" onClick={copyId} title={copied ? "Copied" : "Copy Consignment ID"} aria-label={copied ? "Copied" : "Copy Consignment ID"}>{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
              {tracking.amount != null && Number.isFinite(Number(tracking.amount)) && <p>Price: <strong>{"\u09F3"}{Number(tracking.amount).toLocaleString("en-BD", { maximumFractionDigits: 2 })}</strong></p>}
            </div>

            <section className="tracking-parties" aria-label="Shipment contacts">
              <div className="tracking-party">
                <h2><Users size={18} aria-hidden="true" /> Sender Details</h2>
                <dl>
                  {tracking.senderName && <div><dt>Name</dt><dd>{tracking.senderName}</dd></div>}
                  {tracking.senderPhone && <div><dt>Phone Number</dt><dd>{tracking.senderPhone}</dd></div>}
                  {tracking.storeId && <div><dt>Store ID</dt><dd>{tracking.storeId}</dd></div>}
                  {tracking.orderNumber && <div><dt>Order Number</dt><dd>{tracking.orderNumber}</dd></div>}
                </dl>
              </div>
              <div className="tracking-party">
                <h2><User size={18} aria-hidden="true" /> Receiver Details</h2>
                <dl><div><dt>Name</dt><dd>{tracking.receiverName || "Not available"}</dd></div><div><dt>Address</dt><dd>{tracking.destination || "Not available"}</dd></div></dl>
              </div>
            </section>

            <section className="tracking-journey" aria-labelledby="shipment-journey">
              <div className="tracking-journey-heading"><h2 id="shipment-journey">Shipment Journey</h2>{tracking.updatedAt && <span>Updated {formatTrackingDate(tracking.updatedAt)}</span>}</div>
              {tracking.events.length ? (
                <ol className={`tracking-timeline tracking-timeline-${statusTone}`}>
                  {tracking.events.map((event, index) => {
                    const latest = index === tracking.events.length - 1;
                    return <li key={event.id} className={latest ? "is-latest" : ""} aria-current={latest ? "step" : undefined}>
                      <span className="tracking-timeline-dot" aria-hidden="true" />
                      <div className="tracking-event"><div className="tracking-event-heading"><h3>{event.title}</h3>{event.date && <time dateTime={event.date}>{formatTrackingDate(event.date)}</time>}</div>{event.description && <p>{event.description}</p>}{event.location && <span className="tracking-event-location"><MapPin size={13} aria-hidden="true" />{event.location}</span>}</div>
                    </li>;
                  })}
                </ol>
              ) : <p className="tracking-no-history">Shipment history is not available yet.</p>}
            </section>
          </div>
        ) : (
          <div className="tracking-empty">
            <PackageSearch size={40} strokeWidth={1.5} aria-hidden="true" />
            <h2>Find your shipment</h2>
            <p>Your delivery details and shipment journey will appear here.</p>
            <Link className="tracking-orders-link" to="/app/order">My Orders<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        )}
        {isCurrentRequest && <p className="tracking-footer">Delivery updates are provided by CarryBee.</p>}
      </div>
    </div>
  );
};

export default OrderTracking;

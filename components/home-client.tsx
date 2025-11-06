'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./home-client.module.css";
import type { Artist } from "@/data/artists";

type HomeClientProps = {
  initialArtists: Artist[];
};

type BookingFormState = {
  plannerName: string;
  plannerEmail: string;
  eventDetails: string;
};

const eventTypes = [
  "Corporate Gala",
  "Private Celebration",
  "Wedding",
  "Brand Activation",
  "Festival Stage",
  "Hospitality Lounge"
];

export default function HomeClient({ initialArtists }: HomeClientProps) {
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const maxRate = useMemo(
    () =>
      initialArtists.reduce(
        (currentMax, artist) => Math.max(currentMax, artist.rate),
        initialArtists[0]?.rate ?? 0
      ),
    [initialArtists]
  );
  const minRate = useMemo(
    () =>
      initialArtists.reduce(
        (currentMin, artist) => Math.min(currentMin, artist.rate),
        initialArtists[0]?.rate ?? 0
      ),
    [initialArtists]
  );
  const resolvedMinRate = Number.isFinite(minRate) ? minRate : 0;
  const resolvedMaxRate = Math.max(resolvedMinRate, maxRate);
  const [budget, setBudget] = useState<number>(resolvedMaxRate);
  const [eventType, setEventType] = useState<string>(eventTypes[0]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>(
    initialArtists[0]?.id ?? ""
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string>("");
  const [formState, setFormState] = useState<BookingFormState>({
    plannerName: "",
    plannerEmail: "",
    eventDetails: ""
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const bookingPanelRef = useRef<HTMLDivElement | null>(null);

  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    initialArtists.forEach((artist) => {
      artist.genres.forEach((genre) => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [initialArtists]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(initialArtists.map((artist) => artist.location));
    return Array.from(locations).sort();
  }, [initialArtists]);

  const filteredArtists = useMemo(() => {
    return initialArtists.filter((artist) => {
      const matchesGenre =
        genreFilter === "All" || artist.genres.some((genre) => genre === genreFilter);
      const matchesLocation = locationFilter === "All" || artist.location === locationFilter;
      const matchesBudget = artist.rate <= budget;
      return matchesGenre && matchesLocation && matchesBudget;
    });
  }, [initialArtists, genreFilter, locationFilter, budget]);

  useEffect(() => {
    if (filteredArtists.length === 0) {
      setSelectedArtistId("");
      setSelectedAvailability("");
      return;
    }

    const stillVisible = filteredArtists.some((artist) => artist.id === selectedArtistId);
    if (!stillVisible) {
      setSelectedArtistId(filteredArtists[0].id);
      setSelectedAvailability("");
    }
  }, [filteredArtists, selectedArtistId]);

  const selectedArtist = useMemo(
    () => filteredArtists.find((artist) => artist.id === selectedArtistId) ?? null,
    [filteredArtists, selectedArtistId]
  );

  const totalShowcases = useMemo(() => {
    return initialArtists.reduce((count, artist) => count + artist.showcases.length, 0);
  }, [initialArtists]);

  const averageRating = useMemo(() => {
    if (initialArtists.length === 0) {
      return 0;
    }
    const sum = initialArtists.reduce((acc, artist) => acc + artist.rating, 0);
    return Math.round((sum / initialArtists.length) * 10) / 10;
  }, [initialArtists]);

  const handleBookClick = (artistId: string) => {
    setSelectedArtistId(artistId);
    setSelectedAvailability("");
    setSuccessMessage(null);
    requestAnimationFrame(() => {
      bookingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleAvailabilityClick = (slot: string) => {
    setSelectedAvailability((current) => (current === slot ? "" : slot));
  };

  const handleFormChange = (field: keyof BookingFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedArtist || !selectedAvailability) {
      setSuccessMessage("Select an artist and availability to confirm a request.");
      return;
    }
    if (!formState.plannerName || !formState.plannerEmail) {
      setSuccessMessage("Please include your name and email so we can follow up.");
      return;
    }

    setSuccessMessage(
      `Booking inquiry sent for ${selectedArtist.name} on ${selectedAvailability}. Expect a response within 24 hours.`
    );
    setFormState({
      plannerName: "",
      plannerEmail: "",
      eventDetails: ""
    });
    setSelectedAvailability("");
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Curate exceptional music moments.</h1>
          <p>
            Encore connects event producers with touring-ready artists, tailored for luxury
            celebrations, branded experiences, and hospitality venues. Explore availability,
            rates, and showcases in real time.
          </p>
          <div className={styles.heroHighlights}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightLabel}>Verified Artists</div>
              <div className={styles.highlightValue}>{initialArtists.length}</div>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightLabel}>Average Rating</div>
              <div className={styles.highlightValue}>{averageRating.toFixed(1)}</div>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightLabel}>Upcoming Showcases</div>
              <div className={styles.highlightValue}>{totalShowcases}</div>
            </div>
          </div>
        </div>
        <div>
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              borderRadius: "28px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              boxShadow: "0 25px 80px rgba(15, 23, 42, 0.45)"
            }}
          >
            <source src="https://res.cloudinary.com/dqse2txyi/video/upload/v1715617810/encore-stage-loop.mp4" />
          </video>
        </div>
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.filtersCard}>
          <div className={styles.fieldset}>
            <label>Genre</label>
            <div className={styles.pillRow}>
              <button
                className={`${styles.pill} ${genreFilter === "All" ? styles.pillActive : ""}`}
                onClick={() => setGenreFilter("All")}
                type="button"
              >
                All
              </button>
              {uniqueGenres.map((genre) => (
                <button
                  key={genre}
                  className={`${styles.pill} ${genreFilter === genre ? styles.pillActive : ""}`}
                  onClick={() => setGenreFilter(genre)}
                  type="button"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldset}>
            <label>Home Base</label>
            <div className={styles.pillRow}>
              <button
                className={`${styles.pill} ${
                  locationFilter === "All" ? styles.pillActive : ""
                }`}
                onClick={() => setLocationFilter("All")}
                type="button"
              >
                All Locations
              </button>
              {uniqueLocations.map((location) => (
                <button
                  key={location}
                  className={`${styles.pill} ${
                    locationFilter === location ? styles.pillActive : ""
                  }`}
                  onClick={() => setLocationFilter(location)}
                  type="button"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldset}>
            <label>Budget</label>
            <div className={styles.budgetRange}>
              <input
                className={styles.rangeInput}
                type="range"
                min={resolvedMinRate}
                max={resolvedMaxRate}
                step={100}
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
              />
              <span style={{ color: "#cbd5f5" }}>
                Up to ${budget.toLocaleString()} per performance
              </span>
            </div>
          </div>

          <div className={styles.fieldset}>
            <label>Event Format</label>
            <select
              className={styles.select}
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
            >
              {eventTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.contentSplit}>
          <div>
            <div className={styles.resultsHeader}>
              <h2>Available Talent</h2>
              <span className={styles.resultsMeta}>
                {filteredArtists.length} {filteredArtists.length === 1 ? "artist" : "artists"} •{" "}
                {eventType}
              </span>
            </div>
            {filteredArtists.length === 0 ? (
              <div className={styles.emptyState}>
                No artists align with the current filters. Adjust your location or budget to see
                more talent.
              </div>
            ) : (
              <div className={styles.artistGrid}>
                {filteredArtists.map((artist) => (
                  <article key={artist.id} className={styles.artistCard}>
                    <div className={styles.coverWrapper}>
                      <Image
                        src={artist.coverImage}
                        alt={artist.name}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={artist.id === filteredArtists[0].id}
                      />
                    </div>
                    <div className={styles.artistBody}>
                      <header>
                        <h3 style={{ margin: "0 0 4px" }}>{artist.name}</h3>
                        <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                          {artist.location} • {artist.rating.toFixed(1)}★
                        </div>
                      </header>
                      <p style={{ color: "#cbd5f5", margin: 0 }}>{artist.description}</p>
                      <div className={styles.genreList}>
                        {artist.genres.map((genre) => (
                          <span key={genre}>#{genre}</span>
                        ))}
                      </div>
                      <div className={styles.rateRow}>
                        <span>from ${artist.rate.toLocaleString()}</span>
                        <button
                          className={styles.bookButton}
                          type="button"
                          onClick={() => handleBookClick(artist.id)}
                        >
                          Request
                        </button>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#64748b"
                          }}
                        >
                          Upcoming Availability
                        </div>
                        <div className={styles.availability}>
                          {artist.availability.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                handleBookClick(artist.id);
                                handleAvailabilityClick(slot);
                              }}
                              className={`${styles.pill} ${
                                selectedArtistId === artist.id && selectedAvailability === slot
                                  ? styles.pillActive
                                  : ""
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside id="booking-panel" ref={bookingPanelRef} className={styles.bookingPanel}>
            <div className={styles.panelHeader}>
              <span>Booking Inquiry</span>
              <h3 style={{ margin: 0 }}>
                {selectedArtist ? selectedArtist.name : "Select an artist"}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
                Lock in performance details and receive a tailored proposal.
              </p>
            </div>

            {selectedArtist ? (
              <>
                <div className={styles.showcases}>
                  {selectedArtist.showcases.map((showcase) => (
                    <div key={`${showcase.venue}-${showcase.date}`} className={styles.showcaseItem}>
                      <strong>{showcase.venue}</strong> · {showcase.city} · {showcase.date}
                    </div>
                  ))}
                </div>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <label htmlFor="availability">Preferred Showcase</label>
                    <div className={styles.pillRow}>
                      {selectedArtist.availability.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`${styles.pill} ${
                            selectedAvailability === slot ? styles.pillActive : ""
                          }`}
                          onClick={() => handleAvailabilityClick(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <label htmlFor="eventType">Event Format</label>
                    <input
                      id="eventType"
                      className={styles.input}
                      value={eventType}
                      onChange={(event) => setEventType(event.target.value)}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label htmlFor="plannerName">Your Name</label>
                    <input
                      id="plannerName"
                      className={styles.input}
                      value={formState.plannerName}
                      onChange={(event) => handleFormChange("plannerName", event.target.value)}
                      placeholder="Jordan Lee"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label htmlFor="plannerEmail">Email</label>
                    <input
                      id="plannerEmail"
                      className={styles.input}
                      type="email"
                      value={formState.plannerEmail}
                      onChange={(event) => handleFormChange("plannerEmail", event.target.value)}
                      placeholder="you@brand.com"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label htmlFor="eventDetails">Event Snapshot</label>
                    <textarea
                      id="eventDetails"
                      className={styles.textarea}
                      value={formState.eventDetails}
                      onChange={(event) => handleFormChange("eventDetails", event.target.value)}
                      placeholder="Venue, audience profile, production details..."
                    />
                  </div>
                  {successMessage && <div className={styles.successBanner}>{successMessage}</div>}
                  <button className={styles.submitButton} type="submit">
                    Send Booking Request
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.emptyState}>
                Filter the roster and select an artist to craft a performance proposal.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

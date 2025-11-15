# WiFiFly Application - Complete Data Collection Inventory

## Overview
This document outlines **every piece of data** currently collected and potentially collectable throughout the WiFiFly speed test application, organized by source and data category.

---

## 📊 PART 1: CURRENTLY COLLECTED DATA

### A. User Setup Information (From `/setup` page)
**Storage:** Zustand store (`useSetupStore`)  
**Persistence:** Session (in-memory) + Optional localStorage

#### A1. ISP Information
- **Field:** ISP Name/Provider
- **Type:** String
- **Current Collection:** `isp`
- **Example:** "Vodafone NZ", "Spark NZ", "2degrees"
- **Use Case:** Correlate speeds with specific ISP networks
- **Data Risk:** Low (anonymous)

#### A2. Download Speed (Plan Information)
- **Field:** Advertised Download Speed
- **Type:** Number (Mbps)
- **Current Collection:** `downloadSpeed`
- **Range:** Typical 10-1000 Mbps
- **Use Case:** Calculate % of plan achieved, anomaly detection
- **Data Risk:** Low (public plan info)

#### A3. Monthly Cost
- **Field:** Internet Bill Amount
- **Type:** Number (NZ$)
- **Current Collection:** `cost`
- **Range:** $20-$200/month
- **Use Case:** Calculate value for money, ROI analysis
- **Data Risk:** Medium (indicates income level, household budget)

#### A4. Modem Location (Primary)
- **Field:** Room where modem/router is located
- **Type:** String (selected from list)
- **Current Collection:** `modemRoom`
- **Options:** "Living Room", "Kitchen", "Bedroom", "Home Office", "Lounge"
- **Use Case:** Correlate distance from modem with speed degradation
- **Data Risk:** Low (doesn't identify specific home)

#### A5. Additional Rooms Tested
- **Field:** All rooms where speed was tested
- **Type:** Array of Strings
- **Current Collection:** `additionalRooms`
- **Example:** ["Bedroom", "Kitchen", "Garage"]
- **Use Case:** Map WiFi coverage, identify dead zones
- **Data Risk:** Low (indicates house size indirectly)

---

### B. Speed Test Results (From `/test` page)
**Source:** LibreSpeed backend + Browser Worker  
**Storage:** Zustand store (`testResults` array)

#### B1. Download Speed Results
- **Field:** Measured download speed per room
- **Type:** Number (Mbps)
- **Current Collection:** `dl` (in RoomTestResult)
- **Range:** 0-10,000+ Mbps (should cap at 1,000)
- **Precision:** Decimal (e.g., 87.45 Mbps)
- **Per:** Each room tested
- **Use Case:** Primary performance metric, primary KPI
- **Data Risk:** Low (performance metric)

#### B2. Upload Speed Results
- **Field:** Measured upload speed per room
- **Type:** Number (Mbps)
- **Current Collection:** `ul` (in RoomTestResult)
- **Range:** 0-1,000+ Mbps
- **Precision:** Decimal
- **Per:** Each room tested
- **Use Case:** Secondary performance metric, user bandwidth needs
- **Data Risk:** Low (performance metric)

#### B3. Ping/Latency
- **Field:** Round-trip time to test server
- **Type:** Number (milliseconds)
- **Current Collection:** `ping` (in RoomTestResult)
- **Range:** 5-500ms typical
- **Per:** Each room tested
- **Use Case:** Gaming/video conference quality, network responsiveness
- **Data Risk:** Low (performance metric)

#### B4. Jitter
- **Field:** Variation in ping/latency (consistency)
- **Type:** Number (milliseconds)
- **Current Collection:** `jitter` (in RoomTestResult)
- **Range:** 0-100ms typical
- **Per:** Each room tested
- **Use Case:** Connection stability indicator
- **Data Risk:** Low (performance metric)

#### B5. Test Timestamp
- **Field:** When the test was conducted
- **Type:** Unix timestamp (milliseconds)
- **Current Collection:** `timestamp` (in RoomTestResult)
- **Precision:** Millisecond
- **Per:** Each room tested
- **Use Case:** Temporal analysis, trend detection
- **Data Risk:** Medium (combined with other data)

#### B6. Client IP Address
- **Field:** User's public IP (what internet sees)
- **Type:** String (IPv4 or IPv6)
- **Current Collection:** `clientIp` (from LibreSpeedData)
- **Example:** "203.0.113.42"
- **Source:** Backend `/getIP.php` endpoint
- **Use Case:** Geolocation, ISP identification, duplicate detection
- **Data Risk:** HIGH (Can be used to identify location, ISP)

#### B7. Test Server Information
- **Field:** Which server the speed test connected to
- **Type:** Object (server metadata)
- **Current Collection:** Partial (via LibreSpeed)
- **Fields Within:**
  - `server`: Server identifier
  - `name`: Server display name
  - `dist`: Distance to server (km)
  - `dlURL`: Download test URL
  - `ulURL`: Upload test URL
  - `pingURL`: Ping test URL
- **Use Case:** Identify network path, CDN routing
- **Data Risk:** Medium (reveals network routing)

#### B8. Test Progress Metrics
- **Field:** Progress percentages during test
- **Type:** Numbers (0-1 or 0-100%)
- **Current Collection:**
  - `dlProgress`: Download test progress
  - `ulProgress`: Upload test progress
  - `pingProgress`: Ping test progress
- **Per:** Measured throughout test
- **Use Case:** Frontend UI updates, diagnostic timing
- **Data Risk:** Low (timing data only)

#### B9. Test State/Status
- **Field:** Current phase of test
- **Type:** Enum/Number
- **Current Collection:** `testState` (LibreSpeedData)
- **States:**
  - `-1` = Not started
  - `0` = Starting
  - `1` = Download phase
  - `2` = Ping+Jitter phase
  - `3` = Upload phase
  - `4` = Finished
  - `5` = Aborted
- **Use Case:** Test flow tracking, error detection
- **Data Risk:** Low (state transitions only)

#### B10. Test Abort Information
- **Field:** Whether test was manually stopped
- **Type:** Boolean
- **Tracked via:** `testState === 5` or `aborted` flag
- **Per:** Each test run
- **Use Case:** Quality metrics (completed vs. incomplete tests)
- **Data Risk:** Low (behavioral metric)

---

### C. Form Submission Data (From `/analysis` page - Optional)
**Source:** User-submitted lead capture form  
**Endpoints:** `/api/wifi-analysis` (not yet implemented)

#### C1. Full Name
- **Field:** User's full name
- **Type:** String
- **Current Collection:** Yes (formData.name)
- **Privacy:** Personal identifier
- **Use Case:** Lead database, follow-up contact
- **Data Risk:** HIGH (PII - Personally Identifiable Information)

#### C2. Email Address
- **Field:** User's email
- **Type:** String (email format)
- **Current Collection:** Yes (formData.email)
- **Validation:** Required to include `@`
- **Privacy:** Personal identifier
- **Use Case:** Lead database, marketing email list, contact
- **Data Risk:** HIGH (PII, direct marketing vector)

#### C3. Modem Model
- **Field:** WiFi router/modem brand and model
- **Type:** String
- **Current Collection:** Yes (formData.modemModel)
- **Example:** "TP-Link Archer AX12", "Netgear Nighthawk"
- **Use Case:** Hardware analysis, troubleshooting
- **Data Risk:** Low (hardware specification)

#### C4. Home Type
- **Field:** Type of residence
- **Type:** Enum/String
- **Current Collection:** Yes (formData.homeType)
- **Options:** "Apartment", "House", "Office"
- **Use Case:** Environmental factor analysis
- **Data Risk:** Low (property type classification)

#### C5. Additional Notes
- **Field:** Free-text user notes
- **Type:** String (text area)
- **Current Collection:** Yes (formData.notes)
- **Length:** Potentially unlimited
- **Use Case:** User feedback, custom context
- **Data Risk:** HIGH (Unstructured text - could contain sensitive info)

#### C6. Photo/Screenshot
- **Field:** Optional photo upload (modem, router location, etc.)
- **Type:** Binary file (image)
- **Current Collection:** Yes (formData.photoFile)
- **Format:** JPG, PNG (typical)
- **Size:** Typically 1-5MB
- **Use Case:** Visual context, setup documentation
- **Data Risk:** HIGH (Could reveal home interior, identifying info)

---

## 📊 PART 2: POTENTIALLY COLLECTABLE DATA (Not Yet Implemented)

### D. Device Information
**Source:** Browser JavaScript API  
**Implementation Location:** Could be added to test/analysis pages

#### D1. Device Type
- **Field:** What device user is testing from
- **Type:** String (device classifier)
- **Potential Values:** "Desktop", "Tablet", "Mobile Phone", "Smart TV"
- **Source:** User Agent parsing or screen size
- **Use Case:** Device-specific performance analysis
- **Data Risk:** Low (device classification)
- **Why Important:** WiFi performance varies by device hardware

#### D2. Operating System
- **Field:** Device OS
- **Type:** String
- **Potential Values:** "Windows 11", "macOS 14", "iOS 17", "Android 13", "Linux"
- **Source:** User Agent
- **Use Case:** OS-specific performance patterns
- **Data Risk:** Low (OS identification)

#### D3. Browser Type & Version
- **Field:** Which browser used for test
- **Type:** String
- **Potential Values:** "Chrome 120", "Safari 17", "Firefox 121", "Edge 121"
- **Source:** User Agent
- **Use Case:** Browser-specific test accuracy, API support
- **Data Risk:** Low (software version info)

#### D4. Screen Resolution
- **Field:** User's device screen dimensions
- **Type:** Object {width, height}
- **Potential Values:** "1920x1080", "2560x1600", "390x844"
- **Source:** `window.innerWidth`, `window.innerHeight`
- **Use Case:** Mobile vs. desktop distinction
- **Data Risk:** Low (screen specification)

#### D5. Network Type
- **Field:** Connection type to router
- **Type:** String/Enum
- **Potential Values:** "WiFi 5GHz", "WiFi 2.4GHz", "Ethernet", "4G/LTE", "5G"
- **Source:** Navigator APIs (if available) or inference from IP
- **Use Case:** Identify WiFi band, WiFi vs. wired
- **Data Risk:** Low (network classification)
- **Challenge:** Not standardized across browsers; may need user selection

#### D6. WiFi Signal Strength (RSSI)
- **Field:** Received Signal Strength Indicator
- **Type:** Number (dBm)
- **Potential Range:** -20 to -100 dBm
- **Source:** iOS WiFi APIs (limited availability)
- **Use Case:** Correlate signal strength with measured speed
- **Data Risk:** Low (signal metric)
- **Challenge:** Not available in most browsers; would need native app

#### D7. WiFi Band
- **Field:** Which WiFi frequency band
- **Type:** String
- **Potential Values:** "2.4 GHz", "5 GHz", "6 GHz", "Mixed"
- **Source:** User selection or API detection
- **Use Case:** Band-specific performance analysis
- **Data Risk:** Low (frequency band info)

---

### E. Network Quality Metrics (Advanced)
**Source:** Extended LibreSpeed instrumentation  
**Implementation:** Requires backend modifications

#### E1. Packet Loss Rate
- **Field:** % of packets lost during test
- **Type:** Number (percentage)
- **Potential Range:** 0-100%
- **Use Case:** Network reliability indicator
- **Data Risk:** Low (network metric)
- **Implementation:** HTTP request failures, ICMP (if available)

#### E2. Bandwidth Utilization During Test
- **Field:** How much of available bandwidth was used
- **Type:** Number (percentage or Mbps)
- **Potential Range:** 0-100%
- **Use Case:** Determine if connection is throttled
- **Data Risk:** Low (performance metric)

#### E3. Buffer Bloat Measurement
- **Field:** Latency increase during data transfer
- **Type:** Number (milliseconds)
- **Use Case:** Detect buffering issues
- **Data Risk:** Low (network diagnostic)
- **Tool:** Would need DSLReports algorithm or similar

#### E4. TCP Window Scale
- **Field:** Negotiated TCP window size
- **Type:** Number (bytes)
- **Use Case:** Identify network misconfigurations
- **Data Risk:** Low (protocol diagnostic)

#### E5. MTU (Maximum Transmission Unit)
- **Field:** Maximum packet size for connection
- **Type:** Number (bytes)
- **Typical:** 1500 bytes (Ethernet standard)
- **Use Case:** Identify fragmentation issues
- **Data Risk:** Low (protocol diagnostic)

#### E6. DNS Resolution Time
- **Field:** Time to resolve test server domain
- **Type:** Number (milliseconds)
- **Use Case:** DNS quality measurement
- **Data Risk:** Low (performance metric)

#### E7. SSL/TLS Handshake Time
- **Field:** Time to establish encrypted connection
- **Type:** Number (milliseconds)
- **Use Case:** Identify crypto/certificate issues
- **Data Risk:** Low (performance metric)

---

### F. Environmental Data
**Source:** User input or system sensors  
**Requires:** New form fields or device permissions

#### F1. Time of Day Test Was Run
- **Field:** Hour when test executed
- **Type:** Number (0-23) or timestamp
- **Current Partial:** Timestamp exists, but not extracted
- **Use Case:** Detect peak usage times
- **Data Risk:** Low (time classification)
- **Recommendation:** Extract and analyze hour patterns

#### F2. Day of Week
- **Field:** Which day test was run
- **Type:** String or Enum (1-7)
- **Use Case:** Weekday vs. weekend patterns
- **Data Risk:** Low (day classification)

#### F3. Weather Conditions
- **Field:** Current weather at user location
- **Type:** String
- **Potential Values:** "Sunny", "Rainy", "Snowy", "Cloudy"
- **Source:** Would need geolocation + weather API
- **Use Case:** Correlate weather with WiFi issues
- **Data Risk:** Medium (combined with location)
- **Challenge:** Requires external API, user privacy concern

#### F4. Ambient Temperature
- **Field:** Room temperature during test
- **Type:** Number (°C or °F)
- **Source:** Device sensors (not available in browsers)
- **Use Case:** Correlate heat with router/modem issues
- **Data Risk:** Low (environmental reading)
- **Challenge:** Not accessible from browser

#### F5. Time Since Last Reboot
- **Field:** How long device has been running
- **Type:** Number (hours/days)
- **Use Case:** Correlate uptime with performance degradation
- **Data Risk:** Low (uptime metric)

#### F6. Network Congestion Indicator
- **Field:** User's perception of congestion
- **Type:** String or rating
- **Potential Values:** "Light", "Moderate", "Heavy"
- **Source:** User self-report
- **Use Case:** Correlate user perception with measured performance
- **Data Risk:** Low (user feedback)

---

### G. Geolocation Data
**Source:** IP geolocation or GPS  
**Privacy Considerations:** HIGH

#### G1. Country
- **Field:** User's country
- **Type:** String (ISO 3166-1 code or name)
- **Example:** "NZ", "AU", "US"
- **Source:** IP geolocation database
- **Use Case:** Regional ISP analysis, compliance requirements
- **Data Risk:** MEDIUM (Can identify location roughly)
- **Already Available:** Via IP geolocation

#### G2. City
- **Field:** User's city
- **Type:** String
- **Example:** "Auckland", "Wellington", "Christchurch"
- **Source:** IP geolocation database
- **Accuracy:** ±50km typical
- **Use Case:** Regional performance trends
- **Data Risk:** HIGH (Identifies approximate location)
- **Already Available:** Via IP geolocation

#### G3. ISP Network AS (Autonomous System)
- **Field:** Internet backbone network operator
- **Type:** String (AS number)
- **Example:** "AS1221 Telstra", "AS4766 Vodafone NZ"
- **Source:** IP geolocation / WHOIS databases
- **Use Case:** Backbone network analysis, routing patterns
- **Data Risk:** Medium (identifies ISP infrastructure)
- **Already Available:** Via IP geolocation

#### G4. Precise GPS Coordinates
- **Field:** Exact latitude/longitude
- **Type:** Object {latitude, longitude, accuracy}
- **Example:** {lat: -37.7749, lng: 174.8860}
- **Source:** Would require browser Geolocation API
- **Requires:** User permission
- **Use Case:** Extremely detailed location analysis
- **Data Risk:** EXTREMELY HIGH (Identifies exact home)
- **Recommendation:** DO NOT COLLECT - Privacy violation

---

### H. Behavioral Data
**Source:** Client-side tracking  
**Privacy Considerations:** Medium

#### H1. Session Duration
- **Field:** How long user spent on the app
- **Type:** Number (milliseconds or seconds)
- **Use Case:** Engagement measurement
- **Data Risk:** Low (time duration only)

#### H2. Pages Visited
- **Field:** Which pages in app were accessed
- **Type:** Array of strings
- **Potential Values:** ["/", "/struggle", "/setup", "/test", "/analysis"]
- **Use Case:** User journey mapping
- **Data Risk:** Low (navigation data)

#### H3. Time on Each Page
- **Field:** Duration spent on each page
- **Type:** Object {pageName: milliseconds}
- **Use Case:** Engagement by page
- **Data Risk:** Low (time tracking)

#### H4. Form Abandonment
- **Field:** Which form fields user filled vs. skipped
- **Type:** Object {fieldName: boolean}
- **Use Case:** UX friction identification
- **Data Risk:** Low (field interaction tracking)

#### H5. Form Submission Attempts
- **Field:** Number of times user tried to submit form
- **Type:** Number
- **Use Case:** Error rate measurement
- **Data Risk:** Low (attempt counting)

#### H6. Button Click Tracking
- **Field:** Which buttons/CTAs user clicked
- **Type:** Array of {button: name, timestamp}
- **Use Case:** Call-to-action effectiveness
- **Data Risk:** Low (interaction tracking)

#### H7. Error Messages Encountered
- **Field:** Which errors user faced
- **Type:** Array of {errorCode, errorMessage, timestamp}
- **Use Case:** Bug identification, support triage
- **Data Risk:** Low (error logging)

#### H8. Number of Test Runs
- **Field:** How many times user ran speed test
- **Type:** Number
- **Use Case:** User engagement depth
- **Data Risk:** Low (count only)

#### H9. Test Abort Rate
- **Field:** % of started tests that were not completed
- **Type:** Number (percentage)
- **Use Case:** Test reliability measurement
- **Data Risk:** Low (completion metric)

#### H10. Scroll Depth
- **Field:** How far down pages user scrolled
- **Type:** Number (percentage) or Object (per page)
- **Use Case:** Content engagement, above-the-fold effectiveness
- **Data Risk:** Low (scroll tracking)

#### H11. External Links Clicked
- **Field:** Whether user clicked to external sites
- **Type:** Array of {url, timestamp}
- **Use Case:** Outbound traffic measurement
- **Data Risk:** Low (link clicking)

#### H12. Copy/Paste Events
- **Field:** When user copies or pastes data
- **Type:** Boolean flags or counts
- **Use Case:** Data sharing measurement
- **Data Risk:** Low (interaction event)

---

### I. Comparison Data
**Source:** Aggregated user data  
**Privacy Considerations:** Medium (when aggregated)

#### I1. How User Compares to ISP Average
- **Field:** User's speed vs. others on same ISP
- **Type:** Object {percentile, avgSpeed, userSpeed}
- **Use Case:** Benchmarking, personalization
- **Data Risk:** Low (aggregated comparison)
- **Requires:** Historical database of test results

#### I2. How User Compares to Region Average
- **Field:** User's speed vs. regional average
- **Type:** Object {percentile, avgSpeed, userSpeed}
- **Use Case:** Regional benchmarking
- **Data Risk:** Low (aggregated comparison)

#### I3. How User Compares to Room Type Average
- **Field:** User's speeds vs. users in same room
- **Type:** Object {roomType, avgDL, avgUL, userDL, userUL}
- **Use Case:** Room-specific benchmarking
- **Data Risk:** Low (aggregated comparison)

#### I4. Speed Trend Over Time
- **Field:** How user's speed has changed
- **Type:** Array of {date, avgSpeed}
- **Use Case:** Performance degradation detection
- **Data Risk:** Low (trend analysis)

---

### J. Third-Party Data
**Source:** External services  
**Privacy Considerations:** HIGH

#### J1. Payment Information
- **Field:** Credit card or payment method
- **Type:** PCI-DSS restricted data
- **Use Case:** Premium tier payment
- **Data Risk:** EXTREMELY HIGH (Financial PII)
- **Recommendation:** Use payment gateway (Stripe, etc.) - never store directly
- **Current Status:** NOT IMPLEMENTED

#### J2. Google Analytics
- **Field:** If Google Analytics implemented
- **Type:** Multiple behavioral metrics
- **Use Case:** Web analytics
- **Data Risk:** HIGH (Third-party tracking)
- **Current Status:** NOT IMPLEMENTED

#### J3. Sentry Error Tracking
- **Field:** Application errors and exceptions
- **Type:** Stack traces, browser info, user data
- **Use Case:** Error monitoring
- **Data Risk:** MEDIUM (Error context)
- **Current Status:** NOT IMPLEMENTED

#### J4. PostHog Product Analytics
- **Field:** Detailed product usage tracking
- **Type:** Event-based analytics
- **Use Case:** Product metrics
- **Data Risk:** MEDIUM (Behavioral tracking)
- **Current Status:** NOT IMPLEMENTED

---

### K. Derived/Calculated Data
**Source:** Computations from raw data  
**Privacy Considerations:** Low (mostly aggregated)

#### K1. Speed Category
- **Field:** Classification of speed tier
- **Type:** String
- **Potential Values:** "Excellent", "Good", "Fair", "Poor", "Very Poor"
- **Based On:** Download speed ranges
- **Use Case:** User communication, recommendations
- **Data Risk:** Low (derived classification)

#### K2. % of Plan Achievement
- **Field:** Actual speed / Advertised speed
- **Type:** Number (percentage)
- **Formula:** (measured_speed / advertised_speed) * 100
- **Use Case:** Key performance metric, value assessment
- **Data Risk:** Low (derived metric)

#### K3. Value for Money Score
- **Field:** Rating of plan quality vs. cost
- **Type:** Number (0-100 or 1-5)
- **Formula:** (speed_percentage / cost_factor) * multiplier
- **Use Case:** Personalized recommendations
- **Data Risk:** Low (derived metric)

#### K4. Room Comparison Index
- **Field:** Relative performance of each room
- **Type:** Object {roomName: speedRating}
- **Use Case:** Identify weak coverage areas
- **Data Risk:** Low (relative comparison)

#### K5. Anomaly Score
- **Field:** Likelihood that test was invalid
- **Type:** Number (0-1 or percentage)
- **Based On:**
  - Speed impossibly high (>1000 Mbps)
  - Speed impossibly low (<0 Mbps)
  - Jitter extremely high (>200ms)
  - Test aborted
  - Speed fluctuations extreme
- **Use Case:** Data quality filtering
- **Data Risk:** Low (quality metric)

#### K6. Consistency Score
- **Field:** How stable speeds were across rooms
- **Type:** Number (0-100)
- **Formula:** 100 - (std_deviation / mean) * 100
- **Use Case:** Network stability indicator
- **Data Risk:** Low (stability metric)

#### K7. Recommendation List
- **Field:** Personalized suggestions for improvement
- **Type:** Array of strings
- **Example:** ["Move router to center of home", "Switch to 5GHz band", "Upgrade plan"]
- **Based On:** Test results + home type + device
- **Use Case:** User guidance, upsell opportunities
- **Data Risk:** Low (recommendations only)

---

## 📊 PART 3: DATA COLLECTION MATRIX

### Collection Status Legend
- ✅ **Currently Collected**
- 🟡 **Partial** (some aspects collected)
- ❌ **Not Implemented**

### By Page

| Data Category | Setup Page | Test Page | Analysis Page | Comment |
|---|:---:|:---:|:---:|---|
| User ISP | ✅ | - | 🟡 | Store | 
| Plan Speed | ✅ | - | 🟡 | Store |
| Monthly Cost | ✅ | - | 🟡 | Store |
| Modem Location | ✅ | - | 🟡 | Store |
| Additional Rooms | ✅ | - | 🟡 | Store |
| Download Speed Results | - | 🟡 | ✅ | Per room |
| Upload Speed Results | - | 🟡 | ✅ | Per room |
| Ping/Latency | - | 🟡 | ✅ | Per room |
| Jitter | - | 🟡 | ✅ | Per room |
| Test Timestamp | - | 🟡 | ✅ | Stored |
| Client IP | - | 🟡 | - | From backend |
| Test Server Info | - | 🟡 | - | LibreSpeed |
| Form Data (Name/Email) | - | - | ❌ | Form created, not submitted |
| Form Data (Photo) | - | - | ❌ | Photo picker exists, not collected |
| Device Type | ❌ | ❌ | ❌ | Could be inferred |
| Browser Type | ❌ | ❌ | ❌ | Could be captured |
| OS Type | ❌ | ❌ | ❌ | Could be captured |
| Geolocation (Country) | ❌ | ❌ | ❌ | Could derive from IP |
| Geolocation (City) | ❌ | ❌ | ❌ | Could derive from IP |
| WiFi Band | ❌ | ❌ | ❌ | Would need selection |
| Signal Strength | ❌ | ❌ | ❌ | Not available in browser |
| Behavioral Tracking | ❌ | ❌ | ❌ | Could be added |
| Geolocation (GPS) | ❌ | ❌ | ❌ | Not recommended (privacy) |

---

## 🔐 PART 4: PRIVACY & COMPLIANCE ASSESSMENT

### Data Classification by Risk

#### 🟢 LOW RISK (Safe to Collect & Store)
- Download/upload/ping/jitter speeds
- Test timestamps
- Modem location (room name)
- Device type classification
- Browser version
- Operating system type
- Test progress metrics
- Session duration
- Page visits
- Error messages
- Derived metrics (% of plan, anomaly scores)

#### 🟡 MEDIUM RISK (Requires User Consent & Privacy Policy)
- ISP provider name
- Monthly cost amount
- IP address (reveals ISP + rough location)
- Public user name/email (only if form submitted)
- Geolocation by IP (country/city level)
- Modem model (brand/model could identify location by bundle)
- Behavioral tracking (engagement metrics)
- Weather data (combined with location)
- Time of day patterns (repeated collection)

#### 🔴 HIGH RISK (Requires Explicit Consent, GDPR/NZ Privacy Act Compliance)
- User's full name (PII)
- User's email address (PII, marketing vector)
- User-submitted notes (unstructured text could contain sensitive info)
- Photos/screenshots (could reveal interior details, IP addresses on modems, etc.)
- Precise GPS coordinates (DO NOT COLLECT - extreme privacy violation)
- Credit card information (never store - use payment gateway)
- Browser history access
- Camera/microphone access

### GDPR Compliance Implications
- ✅ **Currently Compliant:** Speed test data (impersonal metrics)
- ⚠️ **Requires Consent:** User name, email, IP address
- ❌ **Not Compliant:** Precise GPS, persistent tracking without consent

### NZ Privacy Act Compliance
- ✅ **Aligned:** Speed metrics, anonymized aggregated data
- ⚠️ **Requires Transparency:** Collection of PII, IP addresses
- ❌ **Prohibited:** Sensitive personal information, excessive retention

---

## 📊 PART 5: BACKEND DATA COLLECTION OPPORTUNITIES

### A. Database Schema Recommendations

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  isp VARCHAR(100),
  modem_room VARCHAR(50),
  home_type VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Speed Tests Table
CREATE TABLE speed_tests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  room VARCHAR(50),
  download_mbps DECIMAL(8,2),
  upload_mbps DECIMAL(8,2),
  ping_ms DECIMAL(6,2),
  jitter_ms DECIMAL(6,2),
  client_ip VARCHAR(45),
  server_id VARCHAR(100),
  test_state INT,
  aborted BOOLEAN,
  timestamp TIMESTAMP,
  created_at TIMESTAMP
);

-- User Preferences Table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_speed_mbps INT,
  monthly_cost_nz DECIMAL(6,2),
  notification_enabled BOOLEAN,
  data_sharing_consent BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Form Submissions Table (Lead Capture)
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  email VARCHAR(255),
  modem_model VARCHAR(255),
  home_type VARCHAR(50),
  notes TEXT,
  photo_url VARCHAR(500),
  submitted_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Behavioral Events Table
CREATE TABLE behavioral_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  session_id UUID,
  event_type VARCHAR(50), -- page_view, button_click, form_input, error, etc.
  event_data JSON,
  timestamp TIMESTAMP
);

-- Geolocation Cache Table
CREATE TABLE geolocation_cache (
  ip_address VARCHAR(45) PRIMARY KEY,
  country VARCHAR(2),
  city VARCHAR(100),
  latitude DECIMAL(8,6),
  longitude DECIMAL(9,6),
  isp VARCHAR(100),
  cached_at TIMESTAMP
);
```

### B. Analytics Queries Enabled by Data

**1. Performance by ISP:**
```sql
SELECT isp, 
  AVG(download_mbps) as avg_dl,
  STDDEV(download_mbps) as dl_variance,
  COUNT(*) as test_count
FROM speed_tests
JOIN users ON speed_tests.user_id = users.id
GROUP BY isp
ORDER BY avg_dl DESC;
```

**2. Coverage Heatmap by Room:**
```sql
SELECT room,
  AVG(download_mbps) as avg_speed,
  COUNT(*) as test_count
FROM speed_tests
GROUP BY room
ORDER BY avg_speed DESC;
```

**3. Time-of-Day Performance:**
```sql
SELECT EXTRACT(HOUR FROM timestamp) as hour,
  AVG(download_mbps) as avg_speed,
  COUNT(*) as test_count
FROM speed_tests
GROUP BY hour
ORDER BY hour;
```

**4. User Retention by Week:**
```sql
SELECT DATE_TRUNC('week', created_at) as week,
  COUNT(DISTINCT user_id) as new_users,
  COUNT(DISTINCT CASE WHEN timestamp > DATE_TRUNC('week', created_at) + INTERVAL '7 days' THEN user_id END) as retained
FROM speed_tests
GROUP BY week;
```

**5. Anomaly Detection:**
```sql
SELECT id, download_mbps, upload_mbps
FROM speed_tests
WHERE download_mbps > 1000 OR download_mbps < 0
  OR jitter_ms > 200;
```

---

## 📊 PART 6: RECOMMENDED DATA COLLECTION ROADMAP

### Phase 1: Current State (Already Implemented)
✅ User setup data (ISP, plan, cost, rooms)  
✅ Speed test results (DL, UL, ping, jitter per room)  
✅ Test timestamps and client IP  
✅ Basic form structure  

### Phase 2: Immediate Next Steps (Low Risk, High Value)
- [ ] Time-of-day analysis (extract hour from timestamp)
- [ ] Device type detection (screen size + user agent)
- [ ] Browser type detection (user agent parsing)
- [ ] Session duration tracking
- [ ] Anomaly score calculation (speeds > 1000 Mbps flagged)
- [ ] % of plan calculation (already in UI, store in DB)
- [ ] Geographic aggregation (country/city from IP via GeoIP2)

### Phase 3: Medium Term (Requires Consent)
- [ ] Email opt-in for lead capture (form backend)
- [ ] Privacy policy & consent banner
- [ ] Optional behavioral tracking (Google Analytics)
- [ ] Optional error tracking (Sentry)
- [ ] Modem model collection (from form)

### Phase 4: Advanced Features (High Value, Planning Intensive)
- [ ] Repeat test detection (same user, different devices)
- [ ] Speed trend analysis (degradation over time)
- [ ] Recommendation engine (based on aggregated data)
- [ ] Premium tier upsell (triggered by test results)
- [ ] A/B testing framework (for UX optimization)

### Phase 5: Future Enhancements (Requires Architecture Changes)
- [ ] Real-time dashboard (aggregated global stats)
- [ ] Comparative benchmarking tool
- [ ] ISP performance transparency reports
- [ ] Network optimization consulting
- [ ] API for third-party integrations

---

## 💾 PART 7: DATA RETENTION & ARCHIVAL POLICY

### Recommendation Matrix

| Data Category | Duration | Justification |
|---|---|---|
| Test Results (raw) | 24 months | Historical trends, legal hold |
| User Profile | Until deletion request | Core to user experience |
| Form Submissions | 12 months | Lead conversion tracking |
| IP Addresses | 90 days | Privacy minimization, fraud detection |
| Geolocation Cache | 30 days | Reduces API calls |
| Behavioral Events | 90 days | Session analysis only |
| Error Logs | 30 days | Debugging and support |
| Payment Data | Per PCI-DSS | Use payment gateway (never store) |
| Photos/Files | User-initiated deletion | Storage cost, privacy |

---

## 🛠️ PART 8: IMPLEMENTATION CHECKLIST

### Frontend (Already Partially Done)
- [x] Setup form (ISP, speed, cost, rooms)
- [x] Speed test execution
- [x] Results display
- [x] Form UI structure
- [ ] Device type detection
- [ ] Browser detection
- [ ] Behavioral event tracking
- [ ] Session tracking
- [ ] Error event capture

### Backend (Needs Implementation)
- [ ] `/api/speed-tests` - POST to save test results
- [ ] `/api/users` - POST to create user
- [ ] `/api/form-submissions` - POST to save lead data
- [ ] `/api/analytics` - GET aggregated analytics
- [ ] User authentication/session management
- [ ] Data validation & sanitization
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Error handling

### Database
- [ ] PostgreSQL schema creation
- [ ] Indexes for common queries
- [ ] Backup strategy
- [ ] Data retention policies

### Compliance & Privacy
- [ ] Privacy policy (GDPR/NZ Privacy Act)
- [ ] Consent banner
- [ ] Data export functionality (user right)
- [ ] Data deletion functionality (user right)
- [ ] IP anonymization (after 90 days)
- [ ] Cookie consent (if using GA)

### Analytics & Monitoring
- [ ] Dashboard for key metrics
- [ ] Alert thresholds (anomaly detection)
- [ ] Data quality monitoring
- [ ] Query performance monitoring

---

## 📋 SUMMARY

**Currently Collecting:** 14 data points per test + user setup info  
**Potentially Collectable:** 80+ additional data points  
**Privacy Risk Level:** LOW (current), MEDIUM (with consent), HIGH (if misused)  
**GDPR Compliance:** Yes (with proper consent & privacy policy)  
**Monetization Ready:** Partial (need historical data for benchmarking)  

**Next Priority:** Implement form backend, add device detection, set up analytics database

---

**Document Version:** 1.0  
**Last Updated:** November 14, 2025  
**Status:** Ready for Implementation  

# A Server-Side Web Framework for Smartphone-Based Traffic Sign Detection, Geospatial De-duplication, and Inventory Management

**Abdullah Salih Oner**
Department of Computer Science, Aalborg University, Aalborg, Denmark
Email: [to be added]

> Code-aligned revision. This draft was revised to match the verified implementation. Changes vs. the original: the multi-factor matching Equation (1) is presented as a proposed extension rather than an implemented method; the "change layer" is described as a review-state workflow on a single inventory table; administrative actions are limited to the implemented set; device GPS is described as an observation-location proxy; permanent frame deletion and its audit/reference-safety are described; the FastAPI/Triton two-stage prototype and 400-class mapping are added; PostGIS is retained only as a future path (removed from Index Terms); and result counts are updated. See `docs/paper-review/PAPER_CODE_CONSISTENCY_AUDIT.md`.

---

## Abstract

Traffic-sign inventories are important for road safety, navigation, municipal road-asset management, and intelligent transportation applications. Existing object-detection models can produce per-frame traffic-sign detections, but raw detections are not directly usable as an inventory because repeated observations, GPS noise, uncertain image evidence, and administrative validation must be handled. This paper presents a server-side web framework that connects a mobile browser-based data-collection workflow to a traffic-sign detection API and converts the resulting detections into geospatial, de-duplicated, reviewable inventory records. The framework stores raw observations, validates model responses, refines sign locations using confidence- and accuracy-weighted device-GPS observations, groups repeated detections of the same physical sign by sign type and spatial proximity, and exposes review-state inventory records through an administrative dashboard. The implemented application uses Next.js 14, TypeScript, Tailwind CSS, Supabase Authentication, PostgreSQL, private object storage, row-level security, signed media access, and Playwright-based end-to-end validation across desktop and mobile (WebKit) browsers. The evaluated prototype connects the framework to a two-stage, Triton-served detection/classification pipeline through a FastAPI adapter, with a 400-class traffic-sign label mapping. The contribution is not a new detector or dataset; it is the web, geospatial, security, and inventory-management layer that turns detection outputs into operational, auditable traffic-sign records.

**Index Terms**—traffic sign detection, traffic-sign inventory, road asset management, geospatial data fusion, de-duplication, web mapping, Supabase, row-level security, human-in-the-loop review.

---

## I. Introduction

Traffic signs are among the most important physical elements of a road environment. They communicate regulatory, warning, and guidance information to drivers, cyclists, pedestrians, road authorities, and increasingly to digital navigation and intelligent-transportation systems. Road safety remains a global public-health priority [18], and an inventory of signs is therefore not only a visual record; it is an operational road-asset layer that supports maintenance, compliance, and planning.

Manual traffic-sign inventory creation is time-consuming and difficult to keep current. Specialized mobile mapping systems, LiDAR platforms, and calibrated multi-camera vehicles can achieve strong localization quality, but their cost, setup, and operational requirements limit frequent deployment. At the same time, consumer smartphones and web applications are broadly available and can capture imagery, GPS coordinates, heading when available, and timestamps with low deployment cost.

However, a traffic-sign detector alone does not solve the inventory problem. A detector produces class labels, bounding boxes, and confidence values for an image or frame. An inventory system must additionally determine whether a detection is new or already known, estimate a stable location for the physical sign from repeated evidence, preserve image evidence, group repeated observations, track review status, and expose the result to an administrator. This gap between detection and inventory management is the focus of this paper.

The proposed framework uses a mobile web client as a lightweight data-collection interface and executes detection integration, geospatial processing, grouping, storage, and review workflows on the server. The implemented application follows a production-shaped architecture: browser-based capture, server-side route handlers, private storage, signed media delivery, row-level security, audit logging, analytics, administrative review, and end-to-end tests against a Supabase-backed environment.

The remainder of this paper is organized as follows. Section II reviews related work. Section III defines the problem and system requirements. Section IV presents the server-side web framework. Section V describes the methodology for candidate generation, matching, and fusion, distinguishing the implemented rule from a proposed multi-factor extension. Section VI presents the implementation design, including the evaluated detector prototype. Section VII describes the evaluation protocol. Section VIII reports the current system-validation results. Sections IX–XI discuss implications, limitations, future work, and conclusions.

## II. Related Work

### A. Traffic Sign Detection and Mobile Mapping

Traffic-sign recognition and detection have been widely studied with benchmark datasets and modern object detectors. Traffic-sign recognition benchmarks such as GTSRB and detection benchmarks such as GTSDB provide structured evaluation settings for classifying and localizing signs in images [1], [2]. General-purpose detectors such as YOLO, Faster R-CNN, and SSD have also shaped object-detection pipelines used in traffic-sign applications [3]–[5].

Existing detection research establishes that traffic signs can be found and classified in imagery, but the output of a detector remains an image-level result. For road-asset use, these detections must be transformed into stable geospatial records. Mobile mapping studies address this need by combining imagery with vehicle position, calibrated sensors, and sometimes point clouds. Soilán et al. used mobile mapping data and point clouds for road-sign inventory [6], while Balado et al. combined image-based deep learning with mobile-mapping geometry to detect, classify, and locate signs [7].

Low-cost and open-source mobile mapping approaches are also relevant. Gaspari et al. showed that open-source mobile GIS tools can support public-administration road cadastre workflows and improve data collection quality compared with field-paper processes [8]. This paper builds on that operational view but focuses on a web platform that receives detector outputs and manages geospatial inventory updates.

### B. Traffic Sign Geolocation, Fusion, and Inventory Updating

Geolocation is the step that turns a detected sign into a map object. Pedersen and Torp investigated geolocating traffic signs from large imagery datasets and emphasized that both position and direction are important when transforming road imagery into traffic-sign map records [9]. Their crowd-sourced imagery work also illustrates the need to cluster repeated observations before creating final sign records [10].

More geometry-intensive localization methods use multi-view reconstruction, calibrated cameras, or structure-from-motion. These approaches can improve localization but also increase implementation complexity and data requirements. For a web-based system intended for practical deployment, the framework should support repeated observations and confidence-based fusion while remaining compatible with ordinary browser-based data collection.

Incremental map updating and change-layer concepts are especially relevant. Hu et al. proposed an incremental crowd-source update method for HD-map traffic-sign layers in which detections are matched against existing signs, fused across trajectories, and placed into a traffic-sign change layer before updating the authoritative layer [11]. This *design principle* — that uncertain observations should be reviewed before they modify a trusted inventory — is adopted here through a review-state workflow, rather than through a separate authoritative/change-layer database.

### C. Road Cadastre, Security, and Dashboard-Based Management

Road authorities require more than detection accuracy; they need a maintainable inventory model. Gaspari et al. modeled traffic-sign information through a relationship between sign holders and traffic signs, reflecting the practical case where several sign panels can be attached to the same support [8]. The implementation in this paper separates raw observations (detection events) from fused inventory records and from the observation links that connect them, and it attaches an explicit review status to each inventory record.

Web mapping and storage infrastructure are central to an operational dashboard. The implemented application uses Leaflet with OpenStreetMap tiles for map visualization [12], [13]. Supabase provides authentication, PostgreSQL, private object storage, and row-level-security support [14], [15]. Spatial database extensions such as PostGIS [16] are a recognized scalability path for server-side spatial indexing and operations, but are not required by the current application and are discussed only as future work (Section X). Human-in-the-loop review is also relevant because administrative validation can improve the operational quality of machine-learning outputs before they are trusted as inventory records [17].

## III. Problem Definition and System Requirements

The problem addressed in this paper is the transformation of raw traffic-sign detections into a reliable, de-duplicated, location-refined, and reviewable traffic-sign inventory. The input is a stream of web-collected observations. Each observation contains an image or frame, GPS coordinates, timestamp, optional heading and speed, and the response of a detection API. Each detection contains a predicted class, confidence score, and bounding box.

The output is a set of inventory records, each maintained with a review status rather than a separate candidate/validated entity. Each inventory record includes sign type, a representative location, a confidence score, an observation count, image evidence, a review status, and an audit trail through system logs. Raw detection history is retained by default so that administrative decisions can be inspected later; authorized administrators may, when necessary, permanently remove an erroneous captured frame and its dependent records, in which case an audit entry is written and storage deletion is reference-safe (Section VI.C).

The functional requirements include user authentication, role-based administration, device registration, web-based image capture, detection API integration, persistence of raw observations, duplicate grouping, location refinement, private media delivery, map visualization, administrative review, analytics, and demo/testing support. Non-functional requirements include secure server-side secret handling, row-level security, signed media URLs, response validation, bounded external API calls (timeouts and capped retries), maintainable migrations, and reproducible end-to-end tests.

**Table I. System inputs and outputs (see also Table II for concrete schema entities).**

| Category | Content | Purpose |
|----------|---------|---------|
| Web observation | Image/frame, GPS, timestamp, optional heading/speed | Provides raw evidence and geospatial context |
| Detection API output | Bounding box, class, confidence | Provides image-level traffic-sign detection |
| Inventory record (review state) | Class, representative location, confidence, evidence, review status | A reviewable, de-duplicated sign record on a single inventory table |
| Verified inventory record | Fused location, observations, `manually_verified` status, audit trail | The operational inventory record after human review |

## IV. Proposed Web-Based Server-Side Inventory Framework

### A. Mobile Web Collection and Detection API Workflow

The mobile web client is the entry point of the system. A field user captures a road-scene image through the browser and attaches available GPS metadata. To remain robust during long field sessions, the client uses a single-flight capture loop: at most one frame request is in flight at a time, and overlapping interval ticks are skipped rather than queued. The client sends the image and metadata to the backend. The backend stores the media object in a private bucket, creates a short-lived signed URL for server-side inference, invokes the detection API, validates the response, and persists one detection-event row per returned detection.

The detector is exposed through a canonical API contract. The framework supports a real external detector and a deterministic mock detector for development, demonstration, and automated tests. In both cases, the rest of the platform receives the same normalized structure: class label, confidence, bounding box, raw response, and source observation metadata. The concrete evaluated detector prototype is described in Section VI.

### B. Geospatial Processing and De-duplication

After the detection response is normalized, the backend groups each detection into the inventory. A detection is enriched with sign class, detector confidence, timestamp, image evidence, and the device capture coordinate. It is then compared against existing inventory records to determine whether it represents a new physical sign or an additional observation of an existing one.

De-duplication is essential because the same sign may be detected across multiple frames, sessions, devices, or trips. The implemented comparison uses **sign-type equality and spatial proximity**: an incoming detection is attached to the nearest existing inventory record of the same sign type within a configured radius (25 m by default). If such a record is found, the detection is attached as an observation and the representative location is recalculated; otherwise a new inventory record is created. A richer multi-factor matching score is discussed as a proposed extension in Section V.B.

### C. Review-State Workflow and Administrative Dashboard

Following the change-layer principle of [11], uncertain updates are not treated as immediate changes to trusted inventory. Instead, each inventory record carries a review status — `pending`, `auto_verified`, `manually_verified`, `rejected`, `duplicate`, or `low_confidence` — so that a single uncertain detection does not directly overwrite an operational record. This review-state workflow is implemented on the single inventory table rather than as a separate authoritative/change-layer database.

The administrative dashboard exposes this workflow through a map, record lists, detail panels, image evidence, filters, review actions, analytics, AI integration checks, and storage governance tools. The implemented review actions are: **verify** (set `manually_verified`), **reject**, **mark duplicate**, **reset to pending**, and **permanently delete an erroneous captured frame** (an admin-only, audited, reference-safe operation). Every action is recorded as an administrative event in the system log so that the inventory lifecycle remains auditable.

*Fig. 1. Traffic-sign inventory map with selected sign detail panel from the implemented web dashboard.*

## V. Methodology

### A. Detection Processing and Candidate Generation

Let an observation *O* consist of image *I*, position *p*, timestamp *t*, and optional heading *h*. The detection API returns a set of detections *D* = {*d₁, …, dₙ*}. Each detection *dᵢ* contains a bounding box *bᵢ*, predicted class *cᵢ*, and confidence score *sᵢ*. For each detection, the backend creates a detection-event record that links the source image, observation metadata, and normalized detection fields. Detection is deliberately separated from inventory grouping so that the framework remains compatible with different detector backends as long as they respect the same API contract.

### B. Matching, Location Refinement, and Fusion

**Implemented matching.** A detection is associated with an existing inventory record if and only if the record has the **same sign type** and lies within a configured spatial radius *r* (default 25 m), choosing the nearest such record. Spatial distance uses the great-circle (haversine) formula. When the number of observations of a record reaches three and their average confidence exceeds 0.75, the record is promoted from `pending` to `auto_verified`; this promotion never overrides a human decision.

**Proposed multi-factor extension (future work, not implemented).** A more expressive matching score could combine spatial, semantic, directional, road-context, and temporal evidence:

> *S*_match = *w₁·S*_spatial + *w₂·S*_semantic + *w₃·S*_direction + *w₄·S*_road + *w₅·S*_temporal.   (1)

Here the semantic term would compare broader sign categories, the directional term would use heading (currently stored but unused in matching), the road-context term would use road-network geometry, and the temporal term would help distinguish repeated observations from long-term inventory changes. Equation (1) is presented as a design target; the current system implements only the same-type, spatial-proximity rule above.

**Location refinement (implemented).** The representative position of an inventory record is refined by fusing its observations with confidence- and accuracy-weighted averaging of the **device capture coordinates**:

> weight = confidence / max(gps_accuracy, 1),   (2)
> refined_location = Σ(weight · position) / Σ(weight).   (3)

Latitude and longitude are fused independently. When an observation lacks a confidence value it defaults to 0.5, and when it lacks a GPS-accuracy value the denominator defaults to 1; if no usable weights are present the record falls back to a simple mean. This formulation reduces the influence of low-confidence detections and imprecise GPS readings while preserving all raw observations, so that a fused record remains traceable. The same weighting is re-applied to recompute a record's aggregates after an observation is deleted.

**Localization scope.** The system does not perform camera-calibration, bounding-box-geometry, depth, or triangulation-based localization. The device GPS coordinate is used as an **observation-location proxy**, and the representative coordinate is a weighted centroid of repeated device positions — not a geometrically reconstructed roadside sign position. The framework therefore targets map-object-level inventory placement rather than centimetre-level localization.

### C. Human Validation Workflow

Human validation is required because detector confidence and geospatial consistency do not guarantee correctness in every case. The dashboard gives administrators access to the original image evidence, detection metadata, record context, and current inventory status before verifying, rejecting, marking as duplicate, resetting, or (in the case of clearly erroneous frames) permanently deleting a captured frame and its dependent records.

## VI. Implementation Design

### A. Backend, API, and Database Design

The implemented system uses Next.js 14 with the App Router, TypeScript, and Tailwind CSS. Server Components and Route Handlers execute trusted operations on the server, while client components handle interactive camera, map, table, and form behavior. Supabase provides authentication, PostgreSQL, private object storage, and row-level security.

The database schema is organized through ordered migrations 0001–0006, covering core tables, secure image object paths, legacy path backfill, analytics RPC functions, storage quarantine governance, and daily metrics snapshots. The design uses UUID primary keys, timestamp fields, and JSON fields for raw model responses and metadata. Table II lists the core data entities.

**Table II. Core data entities.**

| Entity | Purpose |
|--------|---------|
| profiles | Authenticated user profile and role (`user`/`admin`) |
| devices | Registered field devices and operational status (admin-controlled) |
| detection_sessions | Observations collected during a field session |
| detection_events | Normalized detection results and raw model responses |
| traffic_signs | Fused inventory records and representative locations (with review status) |
| traffic_sign_observations | Links inventory records to their supporting detections |
| device_location_logs | Per-frame device positions for the device map |
| system_logs | Operational events and safe audit metadata |
| daily_metrics_snapshots | Durable dashboard metrics for trend analysis |
| storage_quarantine_candidates / storage_reconciliation_runs | Storage-orphan governance (reference-safe cleanup) |

The AI integration layer supports mock, external, and automatic modes. A request carries a short-lived signed image URL and observation metadata. Responses are validated before any write: detections must be an array, confidence values must lie in [0,1], class names must be non-empty, and bounding boxes must be well-formed. External calls use timeouts and bounded retry behavior for transient failures.

The evaluated detector prototype connects this contract to a two-stage pipeline through a FastAPI adapter. The adapter exposes a `/health` endpoint and a `/detect` endpoint and forwards inference to an NVIDIA Triton Inference Server hosting two models: an `e2e` detection stage (1280×1280 input) and a `sign-mid` classification stage (128×128 input). The adapter applies non-maximum suppression to the detection stage, crops detected regions, classifies each crop, and reports a combined confidence (detection × classification) clamped to [0,1]. Class indices are mapped to human-readable labels through a committed 400-class mapping generated from a canonical label file; an unknown index falls back to `Sign {id}`. The adapter authenticates requests with a bearer token and never logs signed URLs or secrets. The rest of the platform is independent of this specific backend because it consumes only the normalized contract.

### B. Dashboard and User Interaction Design

The dashboard is organized around inventory operation. It includes an inventory map, sign detail panels, detection review tables, device views, analytics, presentation mode, AI integration health checks, and storage governance screens. Maps are loaded dynamically on the client to avoid server-rendering issues and use OpenStreetMap tiles through Leaflet, with marker, grid-clustered, and density view modes.

Image delivery is designed around private storage. The database stores object paths rather than permanent public URLs. When a user is authorized to view an image, the server creates a short-lived signed URL. CSV exports include storage object references and availability status rather than reusable signed URLs.

*Fig. 2. Implemented dashboard overview showing sign, device, detection, and verification summaries.*

*Fig. 3. Administrative per-detection review table used for inspection and validation of model outputs.*

*Fig. 4. Analytics screen with durable daily metrics, trends, and verification statistics.*

### C. Data Lifecycle and Deletion

Raw detection history is retained by default. For clearly erroneous frames, an administrator can permanently delete a captured frame: the operation resolves the full group of detection events sharing the same stored object path, removes their observation links, deletes the events, deletes any inventory record left with no remaining observations (recomputing aggregates otherwise), and deletes the storage object only when no remaining database record references it. The operation is admin-only, writes a secret-free audit record, and is safe to retry.

## VII. Evaluation Protocol

### A. Web/API Performance

The first evaluation dimension concerns observable behavior of the web/API workflow. Relevant metrics are capture-to-upload time, upload latency, detection API response time, end-to-end processing time, dashboard update delay, average request payload size, failed upload rate, successful detection response rate, and browser compatibility. End-to-end time is measured from the moment an observation is submitted by the web client to the moment the corresponding record becomes visible in the dashboard. The platform stores a per-detection AI response time to support this measurement; the present paper defines the protocol and does not report measured values.

### B. Geolocation, De-duplication, and Inventory Update

The second evaluation dimension concerns the quality of inventory transformation. Relevant metrics include raw detection count, grouped inventory-record count, duplicate reduction ratio, observation count per record, confidence distribution, verified/rejected/pending counts, and review-status distribution. If labelled ground-truth sign positions are available, localization quality can be evaluated through mean error, median error, and the percentage of records below fixed thresholds such as 5 m and 10 m. Without labelled ground truth, the system can still be evaluated for workflow correctness, de-duplication behavior, review traceability, and implementation validation.

**Table III. Evaluation metrics.**

| Area | Metric | Purpose |
|------|--------|---------|
| Web/API | Upload latency, API response time, end-to-end time | Responsiveness of the web workflow |
| Reliability | Failed upload rate, successful detection response rate | Request robustness |
| Inventory | Raw detections, grouped inventory records | Transformation from detections to inventory |
| Fusion | Duplicate reduction ratio, observations per record | Consolidation of repeated observations |
| Review | Verified, rejected, pending, low-confidence records | Administrative workflow output |
| Localization | Mean/median error when ground truth exists | Geospatial quality (future field trial) |

## VIII. Results and Analysis

The current implementation was validated as a working web platform rather than as a detector benchmark. The application was tested against a real Supabase backend with migrations 0001–0006 applied, the expected tables and analytics functions present, a private storage bucket configured, an administrator account available, and demo data seeded for presentation and testing.

A representative seeded run contains 4 devices, 6 sessions, 120 detection events, 35 inventory records, and 7 daily metric snapshots. These counts demonstrate data-flow coverage and dashboard population; they are seeded values, not detection-performance measurements. The end-to-end Playwright suite (10 spec files across Chromium and a WebKit/iPhone project) passes 88 cases with 2 credential-gated demo-seed cases skipped, and the project completes linting, type checking, and a production build with 62 application routes.

Beyond seeded data, the end-to-end path was exercised as implementation validation: authenticated mobile capture, camera/GPS metadata reaching the backend, private frame storage with server-generated signed URLs, contract-validated detection responses persisted as detection events, grouping of observations into inventory records, interactive map rendering, and administrative review actions. Field-lifecycle behavior was also validated: stopping a detection session ends the session without deactivating the device (device status is admin-only), a subsequent session starts without administrator intervention, the mobile live-results view updates under a single-flight capture loop, and admin-only permanent frame deletion removes an erroneous frame with its dependent records and reference-safe storage cleanup.

The results indicate that the proposed architecture is technically feasible for transforming detection outputs into a web-managed inventory workflow. The next experimental step is to collect field data with labelled reference signs and compute localization and de-duplication metrics using the protocol in Section VII.

**Table IV. Implementation validation summary.**

| Validation item | Observed result |
|-----------------|-----------------|
| Database migrations | Migrations 0001–0006 applied |
| Storage configuration | Private bucket with server-side signed-URL delivery |
| Demo dataset | Representative seeded run: 4 devices, 6 sessions, 120 detections, 35 inventory records, 7 snapshots |
| Automated E2E tests | Playwright suite: 88 passed, 2 skipped (credential-gated demo-seed) across Chromium + WebKit |
| Build status | Clean lint, type-check, and production build; 62 application routes built |
| Detector benchmark | To be evaluated separately using labelled reference data |

## IX. Discussion

The main observation from the implementation is that inventory management requires a broader pipeline than image detection. Even when a detection API returns useful sign classes and confidence values, the system must still manage location uncertainty, repeated observations, duplicate grouping, evidence storage, user roles, administrative validation, analytics, and data-lifecycle governance.

The server-side web architecture is suitable for this type of system because it centralizes security-sensitive operations. Object storage remains private, secrets stay on the server, model responses are validated before persistence, and administrative operations are role-gated. The web client remains a deployable interface for data collection and dashboard interaction, while the backend controls the inventory workflow.

The review-state workflow is also important for trust. A single observation should not immediately modify an operational traffic-sign inventory. Instead, uncertain records are held in reviewable states that can be verified, rejected, or marked as duplicate. This design is consistent with the uncertainty of crowd-sourced or mobile observations and with practical public-administration workflows, and it operationalizes the change-layer principle of [11] without requiring a separate authoritative-layer database.

## X. Limitations and Future Work

The current implementation uses same-type, spatial-proximity matching and application-level grouping; it does not implement the multi-factor score of Equation (1), road-network matching, or directional/temporal scoring, and heading and speed are stored but unused in matching. Larger inventories would benefit from spatial indexing and server-side spatial clustering, for example through PostGIS [16]. The map currently loads bounded data volumes; larger deployments should introduce server-side tiling or aggregation. Localization uses the device GPS coordinate as an observation proxy; geometry-based localization (calibration, bounding-box geometry, multi-view triangulation) is future work. Demo detections may not include real image evidence in every case, so field-data evaluation should use real captured images and reference signs.

The detector is used through an API contract, and this paper evaluates the surrounding inventory-management framework rather than detector accuracy. A separate labelled evaluation should measure model accuracy, sign localization error, duplicate reduction, false-merge and false-split rates, and review outcomes under real field conditions. Future administrative capabilities could include merge, split, class correction, relocation, and damage reporting, which are not implemented in the current system. Future work should also support model versioning, multiple detector backends, and active learning from low-confidence cases.

## XI. Conclusion

This paper presented a server-side web framework for converting traffic-sign detection outputs into a geospatial, de-duplicated, reviewable, and dashboard-managed inventory. The framework uses a mobile browser-based collection workflow, a contract-based detection API (evaluated with a Triton-served two-stage prototype and a 400-class label mapping), secure media handling, sign-type-and-proximity grouping, confidence- and accuracy-weighted location refinement, a review-state administrative workflow, auditable data-lifecycle operations including reference-safe permanent deletion, and analytics. The implementation demonstrates that traffic-sign detection can be operationalized as an inventory system when combined with storage security, backend validation, map visualization, review-state management, and human-in-the-loop review. The resulting contribution is a practical system layer around traffic-sign detection: it transforms image-level predictions into auditable road-asset records and prepares the foundation for future field evaluation using measured web/API response, localization, and inventory-update metrics.

## References

[1] J. Stallkamp, M. Schlipsing, J. Salmen, and C. Igel, "Man vs. computer: Benchmarking machine learning algorithms for traffic sign recognition," *Neural Networks*, vol. 32, pp. 323–332, 2012.

[2] S. Houben, J. Stallkamp, J. Salmen, M. Schlipsing, and C. Igel, "Detection of traffic signs in real-world images: The German Traffic Sign Detection Benchmark," in *Proc. IEEE Int. Joint Conf. Neural Networks*, 2013.

[3] J. Redmon, S. Divvala, R. Girshick, and A. Farhadi, "You Only Look Once: Unified, Real-Time Object Detection," in *Proc. IEEE Conf. Computer Vision and Pattern Recognition*, 2016, pp. 779–788.

[4] S. Ren, K. He, R. Girshick, and J. Sun, "Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks," in *Advances in Neural Information Processing Systems*, 2015.

[5] W. Liu et al., "SSD: Single Shot MultiBox Detector," in *Proc. European Conf. Computer Vision*, 2016, pp. 21–37.

[6] M. Soilán, B. Riveiro, J. Martínez-Sánchez, and P. Arias, "Automatic road sign inventory using mobile mapping systems," *Int. Arch. Photogramm. Remote Sens. Spatial Inf. Sci.*, vol. XLI-B3, 2016.

[7] J. Balado, M. Díaz-Vilariño, L. Meijers, and P. Arias, "Automatic traffic signs inventory using a mobile mapping system," *Remote Sensing*, vol. 12, no. 3, 2020.

[8] F. Gaspari et al., "Mobile mapping solutions for the update and management of traffic signs in a road cadastre free open-source GIS architecture," *Int. Arch. Photogramm. Remote Sens. Spatial Inf. Sci.*, vol. XLVIII-4/W7-2023, pp. 61–66, 2023.

[9] C. M. Pedersen and K. Torp, "Geolocating traffic signs using large imagery datasets," in *Proc. ACM SIGSPATIAL Int. Conf. Advances in Geographic Information Systems*, 2021.

[10] C. M. Pedersen and K. Torp, "Geolocating traffic signs using crowd-sourced imagery," in *Proc. ACM SIGSPATIAL*, 2020.

[11] H. Hu, H. Wu, S. Huang, W. Huang, and C. Liu, "Incremental crowd-source data fusion and map update method based on driving data for traffic signs," *Int. Arch. Photogramm. Remote Sens. Spatial Inf. Sci.*, vol. XLVIII-G-2025, pp. 641–647, 2025.

[12] Leaflet, "Leaflet Documentation." [Online]. Available: https://leafletjs.com (accessed: Jul. 2026).

[13] OpenStreetMap Foundation, "OpenStreetMap." [Online]. Available: https://www.openstreetmap.org (accessed: Jul. 2026).

[14] Supabase, "Supabase Documentation." [Online]. Available: https://supabase.com/docs (accessed: Jul. 2026).

[15] PostgreSQL Global Development Group, "Row Security Policies," *PostgreSQL Documentation.* [Online]. Available: https://www.postgresql.org/docs/current/ddl-rowsecurity.html (accessed: Jul. 2026).

[16] PostGIS Project, "PostGIS Documentation." [Online]. Available: https://postgis.net/documentation/ (accessed: Jul. 2026).

[17] X. Wu, L. Xiao, Y. Sun, J. Zhang, T. Ma, and L. He, "A survey of human-in-the-loop for machine learning," *Future Generation Computer Systems*, vol. 135, pp. 364–381, 2022.

[18] World Health Organization, *Global Status Report on Road Safety 2023.* Geneva, Switzerland: WHO, 2023.

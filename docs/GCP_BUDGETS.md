# Billing budgets and monitoring

## Activate budget alerts (Console)

1. Open **Google Cloud Console → Billing → Budgets & alerts** for the billing account linked to the Firebase / GCP project.
2. Click **Create budget** (or edit an existing budget scoped to this project).
3. Set the **budget amount** (monthly or other period) aligned with credits or forecast spend.
4. Under **Alert thresholds**, add **email notifications** at **50%** and **90%** (and optionally 100% / forecasted spend).
5. Add at least one **email recipient** (billing admin or ops distribution list).
6. Save the budget. Confirm test messages arrive (GCP may send a “budget created” confirmation).

## Ongoing monitoring

- Enable **Cloud Monitoring** dashboards for Hosting latency, Cloud Function errors, and Firestore quota metrics.
- Review **Billing export** to BigQuery after the first week of meaningful traffic.
- Revisit thresholds after launches or traffic spikes.

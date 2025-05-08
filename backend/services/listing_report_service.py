# Service for handling listing reports
from database import get_db_root
import datetime

def report_listing(marketplace_id, listing_id, user_id, reason, description):
    # Save a new report to the database under /listing_reports
    now = datetime.datetime.utcnow().isoformat()  # Store the current time
    ref = get_db_root()  # Get the root reference to the Firebase DB
    report_data = {
        'marketplace_id': marketplace_id,
        'listing_id': listing_id,
        'user_id': user_id,
        'reason': reason,
        'description': description,
        'created_at': now
    }
    # Actually add the report to the database
    ref.child('listing_reports').push(report_data)


def get_all_reports():
    # Grab all listing reports from the database
    ref = get_db_root().child('listing_reports')
    reports = ref.get() or {}
    # Return a list of reports, each with its report_id (the Firebase key)
    return [dict(report_id=k, **v) for k, v in reports.items()]


def delete_report_and_listing(report_id, listing_id):
    # Remove both the report itself and the associated listing from the database
    db_root = get_db_root()
    db_root.child('listing_reports').child(report_id).delete()  # Remove the report
    db_root.child('Listings').child(listing_id).delete()  # Remove the listing

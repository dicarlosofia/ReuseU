# Service for handling listing reports
from database import db
import datetime

def report_listing(marketplace_id, listing_id, user_id, reason, description):
    now = datetime.datetime.utcnow()
    db.execute(
        'INSERT INTO listing_reports (marketplace_id, listing_id, user_id, reason, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        (marketplace_id, listing_id, user_id, reason, description, now)
    )
    db.commit()

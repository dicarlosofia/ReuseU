from flask import Blueprint, request, jsonify, g  # Flask imports for routing, responses, and user context
from services.listing_report_service import get_all_reports, delete_report_and_listing
from services.jwt_middleware import jwt_required

admin_report_bp = Blueprint('admin_report_bp', __name__, url_prefix='/api/admin/report')

# List of user IDs that are allowed to access admin endpoints
ADMIN_UIDS = [
    'opi5w0xrS7gQAMDrXwxEacf9Lkc2'
]

# Get all reports
@admin_report_bp.route('/all', methods=['GET'])
@jwt_required
def get_reports():
    # Only allow access if the user is in the admin list
    user_id = getattr(g, 'user_id', None)
    if user_id not in ADMIN_UIDS:
        return jsonify({'error': 'Admin access only'}), 403
    reports = get_all_reports()  # Grab all reports from the database
    return jsonify(reports), 200

# Delete a reported listing and its report
@admin_report_bp.route('/delete', methods=['POST'])
@jwt_required
def delete_listing_and_report():
    # Only allow access if the user is in the admin list
    user_id = getattr(g, 'user_id', None)
    if user_id not in ADMIN_UIDS:
        return jsonify({'error': 'Admin access only'}), 403
    data = request.json or {}
    report_id = data.get('report_id')
    listing_id = data.get('listing_id')
    if not report_id or not listing_id:
        return jsonify({'error': 'Missing report_id or listing_id'}), 400
    try:
        # Remove both the report and the listing itself
        delete_report_and_listing(report_id, listing_id)
        return jsonify({'message': 'Report and listing deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

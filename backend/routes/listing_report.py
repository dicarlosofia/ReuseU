from flask import Blueprint, request, jsonify, g
from services import listing_service
from services.jwt_middleware import jwt_required
import logging

report_bp = Blueprint('report_bp', __name__, url_prefix='/api/report')
logger = logging.getLogger(__name__)

@report_bp.route('/listing/<string:listing_id>', methods=['POST'])
@jwt_required
def report_listing(listing_id):
    marketplace_id = g.marketplace_id
    user_id = g.user_id
    data = request.json or {}
    reason = data.get('reason', '').strip()
    description = data.get('description', '').strip()
    if not reason:
        return jsonify({'error': 'Reason is required'}), 400
    # Save report (implement actual DB logic in listing_service)
    try:
        listing_service.report_listing(marketplace_id, listing_id, user_id, reason, description)
        return jsonify({'message': 'Report submitted'}), 201
    except Exception as e:
        logger.error(f"Error reporting listing {listing_id}: {e}", exc_info=True)
        return jsonify({'error': 'Failed to submit report'}), 500

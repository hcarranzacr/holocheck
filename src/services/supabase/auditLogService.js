import { supabase } from './supabaseClient.js';
import { checkPermission, PERMISSION_LEVELS } from './authService.js';

/**
 * Audit Log Service
 * HIPAA-compliant audit logging for all data access and modifications
 */

// Log audit event
export const logAuditEvent = async (eventData) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: eventData.eventType || 'data_access',
        table_name: eventData.tableName,
        record_id: eventData.recordId,
        user_id: eventData.userId,
        user_pillar_type: eventData.userPillarType,
        action_performed: eventData.action,
        data_accessed: eventData.dataAccessed || {},
        access_reason: eventData.accessReason,
        ip_address: eventData.ipAddress,
        user_agent: eventData.userAgent || navigator.userAgent,
        session_id: eventData.sessionId,
        phi_accessed: eventData.phiAccessed || false,
        minimum_necessary_standard: eventData.minimumNecessary !== false,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Audit log error:', error);
    }
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// Get audit logs for user (own logs only)
export const getUserAuditLogs = async (userId, options = {}) => {
  try {
    // Validate user permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.READ_OWN, 'audit_logs');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to read audit logs');
    }

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.startDate) {
      query = query.gte('timestamp', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('timestamp', options.endDate);
    }

    if (options.eventType) {
      query = query.eq('event_type', options.eventType);
    }

    if (options.tableName) {
      query = query.eq('table_name', options.tableName);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Get user audit logs error:', error);
    throw error;
  }
};

// Get audit summary for user
export const getAuditSummary = async (userId, timeRange = '30d') => {
  try {
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    // Calculate summary statistics
    const summary = {
      totalEvents: data.length,
      eventsByType: {},
      phiAccessCount: data.filter(log => log.phi_accessed).length,
      tableAccess: {},
      recentActivity: data.slice(0, 10),
      timeRange: timeRange
    };

    // Count events by type
    data.forEach(log => {
      summary.eventsByType[log.event_type] = (summary.eventsByType[log.event_type] || 0) + 1;
      summary.tableAccess[log.table_name] = (summary.tableAccess[log.table_name] || 0) + 1;
    });

    return summary;
  } catch (error) {
    console.error('Get audit summary error:', error);
    throw error;
  }
};

// Get company audit logs (aggregated, no PHI)
export const getCompanyAuditSummary = async (userId, companyId) => {
  try {
    // Validate company permissions
    const hasPermission = await checkPermission(userId, PERMISSION_LEVELS.READ_AGGREGATED, 'audit_logs');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to read company audit logs');
    }

    // Get aggregated audit statistics (no individual user data)
    const { data, error } = await supabase
      .rpc('get_company_audit_summary', {
        company_id: companyId,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get company audit summary error:', error);
    throw error;
  }
};

// Export audit logs (for compliance reporting)
export const exportAuditLogs = async (userId, options = {}) => {
  try {
    const auditLogs = await getUserAuditLogs(userId, {
      ...options,
      limit: 10000 // Large limit for export
    });

    // Format for export
    const exportData = auditLogs.map(log => ({
      timestamp: log.timestamp,
      event_type: log.event_type,
      action: log.action_performed,
      table: log.table_name,
      phi_accessed: log.phi_accessed,
      ip_address: log.ip_address,
      user_agent: log.user_agent
    }));

    // Log the export action
    await logAuditEvent({
      userId: userId,
      eventType: 'export',
      action: 'EXPORT_AUDIT_LOGS',
      dataAccessed: { records_exported: exportData.length },
      accessReason: 'User requested audit log export'
    });

    return {
      data: exportData,
      exportedAt: new Date().toISOString(),
      recordCount: exportData.length
    };
  } catch (error) {
    console.error('Export audit logs error:', error);
    throw error;
  }
};

export default {
  logAuditEvent,
  getUserAuditLogs,
  getAuditSummary,
  getCompanyAuditSummary,
  exportAuditLogs
};
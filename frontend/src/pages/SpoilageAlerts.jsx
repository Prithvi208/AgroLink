import React from 'react';
import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, RefreshCw, RotateCcw, Trash2, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';

const severityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
};

const severityIcons = {
  low: AlertTriangle,
  medium: AlertTriangle,
  high: AlertCircle,
  critical: AlertCircle
};

const severityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

export default function SpoilageAlerts() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/spoilage/farmer');
      setAlerts(data);
    } catch (err) {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await api.post('/spoilage/check');
      setResult(res);
      loadAlerts();
    } catch (err) {
      alert(t('spoilage.checkFailed') || 'Unable to check alerts right now. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put('/spoilage/' + id + '/resolve');
      loadAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this alert?')) return;
    // Note: No delete endpoint yet, just resolve for now
    await handleResolve(id);
  };

  if (loading) return React.createElement('div', {className: "flex items-center justify-center h-64"}, React.createElement('div', {className: "animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"}));

  return React.createElement('div', {className: "max-w-7xl mx-auto px-4 py-8"},
    React.createElement('div', {className: "flex items-center justify-between mb-8"},
      React.createElement('div', null,
        React.createElement('h1', {className: "text-3xl font-bold text-gray-900 flex items-center gap-3"},
          React.createElement(AlertTriangle, {className: "h-8 w-8 text-orange-600"}), ' ', t('spoilage.title') || 'Post-Harvest Alerts'
        ),
        React.createElement('p', {className: "text-gray-600 mt-1"}, t('spoilage.subtitle') || 'Monitor crops nearing spoilage risk')
      ),
      React.createElement('div', {className: "flex gap-2"},
        React.createElement('button', {
          onClick: handleCheck, disabled: checking,
          className: "flex items-center gap-2 px-4 py-2 border-2 border-agro-600 text-agro-700 rounded-xl text-sm font-semibold hover:bg-agro-50 transition disabled:opacity-50"
        },
        React.createElement(RotateCcw, {className: checking ? 'animate-spin h-4 w-4' : 'h-4 w-4'}),
        ' ', checking ? '...' : (t('spoilage.checkNow') || 'Check Now')
        )
      )
    ),

    result && React.createElement('div', {
      className: 'mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ' +
        (result.newAlerts?.length ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600')
    },
    React.createElement(CheckCircle2, {className: "h-5 w-5"}),
    ' ',
    result.newAlerts?.length
      ? result.newAlerts.length + ' ' + (t('spoilage.newAlerts') || 'new alert(s) generated')
      : (t('spoilage.noNewAlerts') || 'No new alerts - all crops within safe window')
    ),

    loading ? React.createElement('div', {className: "flex items-center justify-center h-64"},
      React.createElement('div', {className: "animate-spin rounded-full h-12 w-12 border-4 border-agro-500 border-t-transparent"})
    ) : alerts.length === 0 ? React.createElement('div', {className: "text-center py-16"},
      React.createElement(AlertTriangle, {className: "h-16 w-16 mx-auto mb-4 text-gray-300"}),
      React.createElement('h3', {className: "text-xl font-bold text-gray-900 mb-2"}, t('spoilage.noAlerts') || 'No spoilage alerts'),
      React.createElement('p', {className: "text-gray-500"}, t('spoilage.noAlertsHint') || 'All crops are within safe storage windows')
    ) : React.createElement('div', {className: "space-y-4"},
      alerts.map(function(alert) {
        const SeverityIcon = severityIcons[alert.severity];
        return React.createElement('div', {
          key: alert.id,
          className: 'bg-white rounded-2xl shadow-sm border p-5 flex items-center gap-4 ' +
            (alert.severity === 'critical' ? 'border-red-200 bg-red-50/50' :
             alert.severity === 'high' ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100')
        },
          React.createElement('div', {
            className: 'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ' +
              (severityColors[alert.severity] || 'bg-gray-100 text-gray-600')
          },
            React.createElement(SeverityIcon, {className: "h-6 w-6"})
          ),
          React.createElement('div', {className: "flex-1 min-w-0"},
            React.createElement('div', {className: "flex items-center gap-2"},
              React.createElement('h3', {className: "font-bold text-gray-900"}, alert.crop_name),
              React.createElement('span', {
                className: 'text-xs font-medium px-2 py-0.5 rounded-full capitalize ' +
                  (severityColors[alert.severity] || 'bg-gray-100 text-gray-700')
              },
              t('spoilage.severity.' + alert.severity) || severityLabels[alert.severity]
              )
            ),
            React.createElement('p', {className: "text-sm text-gray-600 mt-1"}, alert.message),
            alert.suggested_action && React.createElement('div', {className: "mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl"},
              React.createElement('p', {className: "text-sm font-medium text-amber-800 mb-1"},
                t('spoilage.suggestedAction') || 'Suggested Action:'
              ),
              React.createElement('p', {className: "text-sm text-amber-700"}, alert.suggested_action),
              alert.discount_suggested && React.createElement('p', {className: "text-sm text-amber-600 mt-1"},
                (t('spoilage.discountSuggested') || 'Suggested discount') + ': ' + alert.discount_suggested + '%'
              )
            ),
            React.createElement('div', {className: "flex items-center gap-2 text-sm text-gray-500 mt-2"},
              React.createElement(Package, {className: "h-4 w-4"}),
              ' ', alert.quantity, ' ', alert.unit,
              alert.harvest_date && React.createElement('span', null, '\u2022 Harvested: ', new Date(alert.harvest_date).toLocaleDateString())
            )
          ),
          React.createElement('div', {className: "flex items-center gap-2"},
            alert.status === 'active' && React.createElement('button', {
              onClick: function() { return handleResolve(alert.id); },
              className: "flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
            },
              React.createElement(CheckCircle2, {className: "h-4 w-4"}),
              ' ', t('spoilage.resolve') || 'Resolve'
            ),
            React.createElement('button', {
              onClick: function() { return handleDelete(alert.id); },
              className: "p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
            },
              React.createElement(Trash2, {className: "h-4 w-4"})
            )
          )
        )
      }))
    )
  }
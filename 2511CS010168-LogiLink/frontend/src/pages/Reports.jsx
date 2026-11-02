import { Download, FileSpreadsheet, FileText, PlayCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { reportService } from '../services/reportService.js';

export default function Reports() {
  const { notify } = useApp();
  const { data, loading } = useAsyncData(() => reportService.categories(), []);

  const categories = Array.isArray(data) ? data : (data?.categories || [
    'Fleet Report',
    'Shipment Report',
    'Delivery Performance',
    'Inventory Report',
    'Warehouse Report',
    'Route Efficiency Report',
    'Order Report',
    'Driver Report',
  ]);

  const rawRegions = Array.isArray(data?.regions) ? data.regions : [];
  const regions = ['All regions', ...rawRegions.filter((r) => r !== 'All regions')];

  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('All regions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  if (loading) return <LoadingState title="Loading report tools" />;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await reportService.preview({
        category: category || categories[0],
        region,
        startDate,
        endDate,
      });
      setReportData(res);
      notify('Report generated successfully.');
    } catch (err) {
      notify('Failed to generate report: ' + (err.message || 'Server error'));
    } finally {
      setGenerating(false);
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await reportService.exportCsv({
        category: category || categories[0],
        region,
        startDate,
        endDate,
      });
      const slug = (category || 'report').toLowerCase().replace(/\s+/g, '-');
      downloadFile(blob, `logilink-${slug}.csv`);
      notify('Report exported to Excel/CSV.');
    } catch (err) {
      notify('Failed to export CSV: ' + (err.message || 'Server error'));
    }
  };

  const handleExportPdf = () => {
    if (!reportData) {
      notify('Please generate a report first before exporting to PDF.');
      return;
    }
    notify('Opening print preview for PDF export...');
    window.print();
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate operational report previews with export actions for fleet, shipments, warehouse, inventory, and route performance."
      />
      <div className="grid cols-2">
        <Card title="Report Builder">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Report category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="Warehouse or region">
              <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                {regions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="Start date">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
          <div className="filters" style={{ marginTop: 16 }}>
            <Button onClick={handleGenerate} disabled={generating}>
              <PlayCircle size={16} /> {generating ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button variant="secondary" onClick={handleExportPdf}>
              <FileText size={16} /> Export PDF
            </Button>
            <Button variant="secondary" onClick={handleExportCsv}>
              <FileSpreadsheet size={16} /> Export Excel
            </Button>
          </div>
        </Card>
        <Card
          title="Preview Area"
          subtitle={
            reportData
              ? `${reportData.category} (${reportData.region || 'All regions'} • ${reportData.dateRange || 'All time'})`
              : 'Choose filters and generate a preview'
          }
        >
          {reportData ? (
            <div className="detail-list">
              {reportData.metrics && reportData.metrics.length > 0 ? (
                reportData.metrics.map((m) => (
                  <div className="detail-row" key={m.label}>
                    <span>{m.label}</span>
                    <strong>{m.value}</strong>
                  </div>
                ))
              ) : (
                <p style={{ padding: '12px 0', color: '#6b7280', fontSize: '13px' }}>
                  No operational records found for the selected criteria.
                </p>
              )}
              {reportData.totalRecords > 0 && (
                <div className="detail-row" style={{ borderTop: '1px dashed var(--border-color, #e5e7eb)', paddingTop: 8, marginTop: 4 }}>
                  <span>Total evaluated records</span>
                  <strong>{reportData.totalRecords} records</strong>
                </div>
              )}
              <Button variant="secondary" onClick={handleExportCsv} style={{ marginTop: 12 }}>
                <Download size={16} /> Download preview
              </Button>
            </div>
          ) : (
            <p className="card-subtitle">Report output will appear here before export.</p>
          )}
        </Card>
      </div>
    </>
  );
}
